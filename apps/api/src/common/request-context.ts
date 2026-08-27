import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Carries the current HTTP request's correlation ID through whatever async
 * work that request triggers — in particular, into GraphService's onQuery
 * hook, so a slow Cypher query in the observability log can be traced back
 * to the request that ran it (see RequestTracingInterceptor for how the
 * context is entered).
 */
const storage = new AsyncLocalStorage<string>();

export const RequestContext = {
  run<T>(requestId: string, fn: () => T): T {
    return storage.run(requestId, fn);
  },
  currentId(): string | null {
    return storage.getStore() ?? null;
  },
};
