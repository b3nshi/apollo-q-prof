import { ApolloServer } from "apollo-server";
import { gqlOutgoingRequests } from "./handlers/gql-outgoing-requests";
import { performance } from "perf_hooks";
import jsonLogger from "./loggers/json-logger";

export const ApolloQProf  = (apolloConfig: any) => {
  const dataSources = apolloConfig.dataSources();
  const wrappedDataSources = Object.keys(dataSources)
    .reduce((wrap: any, dataSource: any) => {
      if (dataSources.hasOwnProperty(dataSource)) {
        wrap[dataSource] = gqlOutgoingRequests(dataSources[dataSource]);
      } else {
        wrap[dataSource] = dataSources[dataSource];
      }
      return wrap;
    }, {});

  return new ApolloServer({
    ...apolloConfig,
    dataSources: () => wrappedDataSources,
    context: (params: any) => {
      const hrstart = performance.now();
      jsonLogger.reset();
      jsonLogger.addKey("request", {
        ...params.req.body
      });

      return {
        ...apolloConfig.context(params),
        hrstart
      };
    },
    formatError: (error: any) => {
      jsonLogger.addKey("error", error);
      return apolloConfig.formatError ? apolloConfig.formatError(error) : error;
    },
    formatResponse: (response: any, query: any) => {
      const hrend = performance.now();
      jsonLogger.addKey("response", {
        "execution-time": `${hrend - query.context.hrstart}ms`
      });

      jsonLogger.printOutput && jsonLogger.printOutput();

      return apolloConfig.formatResponse ? apolloConfig.formatResponse(response) : response;
    }
  });
};
