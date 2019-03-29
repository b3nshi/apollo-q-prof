import { performance } from "perf_hooks";
import jsonLogger from "../loggers/json-logger";
import { inspect } from "util";
import {
  EXECUTION_TIME,
  PARAMETERS,
  METHOD_NAME,
  DATA_SOURCE,
  START_TIMESTAMP,
  ENDS_TIMESTAMP
} from "../constants";

export const gqlOutgoingRequests = (obj: any) => {
  const handler = {
    get: (target: any, name: any, receiver: any) => {
      if (name in target.__proto__) {
        return function(...args: any[]) {
          const origMethod = target[name];
          const t0 = performance.now();
          const result = origMethod.apply(this, args);
          const t1 = performance.now();
          if (name !== "initialize") {
            jsonLogger.pushIntoKey("outgoingRequests", {
              [START_TIMESTAMP]: t0,
              [ENDS_TIMESTAMP]: t1,
              [PARAMETERS]: inspect(args),
              [EXECUTION_TIME]: `${t1 - t0}`,
              [METHOD_NAME]: name,
              [DATA_SOURCE]: target.constructor.name
            });
          }
          return result;
        };
      }
      return Reflect.get(target, name, receiver);
    }
  };

  return new Proxy(obj, handler);
};
