# Query profiler for Apollo Server 2
[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core)

[Apollo Server](https://www.apollographql.com) is a community-maintained open-source GraphQL server. This Query Profiler projects try to make super easy to control how many outgoing request are executed when an incoming request arrives to the server.

## Principles

ApolloQProf is built with the following principle in mind:

- **Simplicity**: By keeping things simple. Easy to install, easier to use, even easier to analyse results.

## Getting started

Is super easy to set up. Just `npm install apollo-query-profiler`, and replace your `new ApolloServer(...)` using `new ApolloQProf(...)`. That's it!

## Structure of JSON file

```
[
  {
    "outgoingRequests": [
      {
        "args": "[ 'parameter1',... ,'paramenterN' ]",
        "execution-time": "time in ms",
        "method": "",
        "dataSource": ""
      },
      ...
    ],
    "request": {
      "operationName": "",
      "variables": {},
      "query": "{...}"
    },
    "response": {
      "execution-time": "time in ms"
    }
  },
]
```