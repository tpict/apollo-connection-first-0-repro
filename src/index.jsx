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

const PEOPLE_DOCUMENT = gql`
  query People($search: String!) {
    people(search: $search)  {
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


function App() {
  const { loading, data, refetch, variables, } = useQuery(PEOPLE_DOCUMENT, {
    // notifyOnNetworkStatusChange: true,
    variables: {
      search: "smith"
    }
  });
  if (loading) {
    return "Loading...";
  }

  return <>
    <p>Results:
  <code>{JSON.stringify(data)}</code>
    </p>

    <p>
    <code>variables</code> says you searched for {variables.search}
  </p>

    <button onClick={() => refetch({ search: "smith" })}>{`Search "smith"`}</button>
    <button onClick={() => refetch({ search: "budd" })}>{`Search "budd"`}</button>
    <button onClick={() => refetch({ search: "jones" })}>{`Search "jones"`}</button>
    <button onClick={() => refetch({ search: "jefferson" })}>{`Search "jefferson"`}</button>

    <p>
    To reproduce the issue, click between the {`"jones"`} and {`"jefferson"`} buttons
  </p>
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
