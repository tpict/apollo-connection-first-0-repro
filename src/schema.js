import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

// Sample data
const peopleData = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sara Smith' },
  { id: 3, name: 'Budd Deey' },
];

// Cursor helpers
function encodeCursor(index) {
  return btoa(index.toString());
}

function decodeCursor(cursor) {
  return parseInt(atob(cursor), 10);
}

// Person type
const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
  },
});

// PageInfo type
const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
  },
});

// Edge type
const PersonEdgeType = new GraphQLObjectType({
  name: 'PersonEdge',
  fields: {
    node: { type: PersonType },
    cursor: { type: new GraphQLNonNull(GraphQLString) },
  },
});

// Connection type
const PersonConnectionType = new GraphQLObjectType({
  name: 'PersonConnection',
  fields: {
    edges: { type: new GraphQLNonNull(new GraphQLList(PersonEdgeType)) },
    pageInfo: { type: new GraphQLNonNull(PageInfoType) },
  },
});

// Query type
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    people: {
      type: PersonConnectionType,
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
      },
      resolve: (_, { first, after }, __, info) => {
        // Check if name field is requested
        const nameFieldRequested = info.fieldNodes[0].selectionSet.selections
          .find(selection => selection.name.value === 'edges')
          ?.selectionSet.selections
          .find(selection => selection.name.value === 'node')
          ?.selectionSet.selections
          .some(selection => selection.name.value === 'name');

        console.log("resolve");

        if (!nameFieldRequested) {
          console.log("empty");
          return {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
          };
        }

        const total = peopleData.length;
        const startIndex = after ? decodeCursor(after) + 1 : 0;

        if (first === 0) {
          return {
            edges: [],
            pageInfo: {
              hasNextPage: startIndex < total ? true : false,
              hasPreviousPage: startIndex > 0 ? true : false,
              startCursor: null,
              endCursor: null,
            },
          };
        }

        const slice = peopleData.slice(startIndex, first ? startIndex + first : undefined);

        const edges = slice.map((person, i) => ({
          node: person,
          cursor: encodeCursor(startIndex + i),
        }));

        const endIndex = startIndex + slice.length;

        return {
          edges,
          pageInfo: {
            hasNextPage: endIndex < total ? true : false,
            hasPreviousPage: startIndex > 0 ? true : false,
            startCursor: edges.length > 0 ? edges[0].cursor : null,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          },
        };
      },
    },
  },
});

export const schema = new GraphQLSchema({ query: QueryType });
