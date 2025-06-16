/*** APP ***/
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
} from "@apollo/client";

import { link } from "./link.js";
import { Subscriptions } from "./subscriptions.jsx";
import { Layout } from "./layout.jsx";
import "./index.css";
import { relayStylePagination } from "@apollo/client/utilities";

const ZERO_PEOPLE = gql`
  query ZeroPeople {
    people(first: 3) @connection(key:"empty") {
          pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
        }
      }
    }
  }
`;

const SOME_PEOPLE = gql`
  query SomePeople {
    people(first: 3) @connection(key:"Good") {
      pageInfo {  
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

function Inner() {
  const { loading, data, error, networkStatus } = useQuery(SOME_PEOPLE)
  const [hasHitNetwork, setHasHitNetwork] = useState(false);
  useEffect(() => {
    if (networkStatus !== 7) {
      setHasHitNetwork(true)
    }
  }, [networkStatus])
  if (!data) {
    return JSON.stringify(error);
  };
  const results = <pre>{JSON.stringify(data.people.edges)}</pre>;

  if (hasHitNetwork) {
    return <>Hit the network for 3 people: {results}</>
  }

  return <>Didn't hit the network for 3 people!: {results}</>
}

function App() {
  const { loading, data } = useQuery(ZERO_PEOPLE);
  if (loading) {
    return "Loading...";
  }

  return <>Loaded zero people: <pre>{JSON.stringify(data.people.edges)}</pre>
  <Inner />
  </>
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          people: relayStylePagination()
        }
      }
    }
  }),
  link,
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="subscriptions-wslink" element={<Subscriptions />} />
        </Route>
      </Routes>
    </Router>
  </ApolloProvider> 
);
