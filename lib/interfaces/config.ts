type CustomOrigin = (
  requestOrigin: string,
  callback: (err: Error | null, allow?: boolean) => void
) => void;

interface CorsOptions {
  origin?: boolean | string | RegExp | (string | RegExp)[] | CustomOrigin;
  methods?: string | string[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

interface ApolloConfig {
  cors?: CorsOptions | boolean;
}