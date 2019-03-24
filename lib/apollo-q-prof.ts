import { ApolloServer } from "apollo-server";
import { gqlOutgoingRequests } from "./handlers/gql-outgoing-requests";
import { performance } from "perf_hooks";
import jsonLogger from "./loggers/json-logger";
import { ILogger } from "./interfaces/logger";

export class ApolloQProf {
  private apollo: ApolloServer;
  private logger: ILogger = {} as any;

  constructor(apolloConfig: any) {
    const dataSources = apolloConfig.dataSources();

    const wrappedDataSources = Object.keys(dataSources).reduce((wrap: any, dataSource: any) => {
      if (dataSources.hasOwnProperty(dataSource)) {
        wrap[dataSource] = gqlOutgoingRequests(dataSources[dataSource]);
      } else {
        wrap[dataSource] = dataSources[dataSource];
      }
      return wrap;
    }, {});

    this.logger = jsonLogger;

    this.apollo = new ApolloServer({
      ...apolloConfig,
      dataSources: () => wrappedDataSources,
      context: (params: any) => {
        const hrstart = performance.now();
        this.logger.reset();
        this.logger.addKey("request", {
          ...params.req.body
        });

        return {
          ...apolloConfig.context(params),
          hrstart
        };
      },
      formatError: (error: any) => {
        this.logger.addKey("error", error);
        return apolloConfig.formatError ? apolloConfig.formatError(error) : error;
      },
      formatResponse: (response: any, query: any) => {
        const hrend = performance.now();
        this.logger.addKey("response", {
          "execution-time": `${hrend - query.context.hrstart}ms`
        });

        this.logger.printOutput && this.logger.printOutput();

        return apolloConfig.formatResponse ? apolloConfig.formatResponse(response) : response;
      }
    });
  }

  listen(port: string | 8080) {
    return this.apollo.listen(port);
  }

  stop() {
    return this.apollo.stop();
  }
}
