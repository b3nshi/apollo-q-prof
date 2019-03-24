export interface ILogger {
  data: any;
  reset: () => void;
  addKey: (key: string, value: any) => void;
  pushIntoKey?: (key: string, value: any) => void;
  print?: (data: string) => void;
  printOutput?: () => void;
}
