import { ApolloServer as DefaultServer, Config, CorsOptions } from "apollo-server";
import { gqlOutgoingRequests } from "./handlers/gql-outgoing-requests";
import { performance } from "perf_hooks";
import jsonLogger from "./loggers/json-logger";

interface ConfigProf {
  apolloInstance?: any;
  enabled: boolean;
}

export const ApolloQProf  = (
  apolloConfig: Config & { cors?: CorsOptions | boolean },
  config?: ConfigProf
) => {
  let ApolloServer = DefaultServer;

  if (config && config.apolloInstance) {
    ApolloServer = config.apolloInstance;
  }

  if (config && config.enabled) {
    let wrappedDataSources: any;
    
    if (apolloConfig.dataSources) {
      const dataSources =
        (apolloConfig.dataSources instanceof Function) ?
          apolloConfig.dataSources() :
          apolloConfig.dataSources;
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

    return new ApolloServer({
      ...apolloConfig,
      dataSources: () => wrappedDataSources,
      context: (params: any) => {
        const hrstart = performance.now();
        jsonLogger.reset();
        jsonLogger.addKey("request", {
          ...params.req.body
        });

        const userContext = apolloConfig.context ? apolloConfig.context(params) : {};
        
        return {
          ...userContext,
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
  } else {
    return new ApolloServer(apolloConfig);
  }
};
