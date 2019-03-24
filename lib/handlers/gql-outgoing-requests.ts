import { performance } from "perf_hooks";
import jsonLogger from "../loggers/json-logger";
import { inspect } from "util";

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
              args: inspect(args),
              "execution-time": `${t1 - t0}ms`,
              method: name,
              dataSource: target.constructor.name
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
