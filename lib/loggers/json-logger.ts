import { ILogger } from "../interfaces/logger";
import { writeFile, readFile } from "fs";

class JSONLogger implements ILogger {
  private static _instance: JSONLogger;
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  data: any;

  reset() {
    this.data = {
      outgoingRequests: []
    };
  }

  addKey(key: string, value: any) {
    this.data[key] = value;
  }

  pushIntoKey(key: string, value: any) {
    if (!this.data[key]) {
      this.data[key] = [];
    }
    this.data[key].push(value);
  }

  printOutput() {
    const fileName = `apollo-prof.json`;

    readFile(fileName, "utf8", (err, data) => {
      let newData = [this.data];
      if (!err) {
        newData = [
          ...JSON.parse(data),
          this.data,
        ];
      }

      writeFile(fileName, JSON.stringify(newData), "utf8", err => {
        if (err) {
          console.error("There was an error trying to create the file", err);
        }
        console.log("File saved properly");
      });
    });
  }
}

export default JSONLogger.Instance;
