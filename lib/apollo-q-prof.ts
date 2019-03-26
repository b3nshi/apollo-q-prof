import { ApolloServer as DefaultServer, Config, CorsOptions } from "apollo-server";
import { gqlOutgoingRequests } from "./handlers/gql-outgoing-requests";
import { performance } from "perf_hooks";
import jsonLogger from "./loggers/json-logger";

interface ConfigProf {
  ApolloInstance?: any;
}

export const ApolloQProf  = (
  apolloConfig: Config & { cors?: CorsOptions | boolean },
  config?: ConfigProf
) => {
  let wrappedDataSources: any;
  
  if (apolloConfig.dataSources) {
    const dataSources = apolloConfig.dataSources();
    wrappedDataSources = Object.keys(dataSources)
      .reduce((wrap, dataSource) => {
        if (dataSources.hasOwnProperty(dataSource)) {
          wrap[dataSource] = gqlOutgoingRequests(dataSources[dataSource]);
        } else {
          wrap[dataSource] = dataSources[dataSource];
        }
        return wrap;
      }, {});
  }

  let ApolloServer = DefaultServer;

  if (config && config.ApolloInstance) {
    ApolloServer = config.ApolloInstance;
  }

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
