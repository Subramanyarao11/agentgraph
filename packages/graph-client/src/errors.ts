export class GraphConnectionError extends Error {
  constructor(cause: unknown) {
    super(
      `Could not reach the graph database. Check GRAPH_URI/GRAPH_USER/GRAPH_PASSWORD and that the instance is running. Cause: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = "GraphConnectionError";
    this.cause = cause;
  }
}

export class GraphQueryError extends Error {
  constructor(
    public readonly cypher: string,
    cause: unknown,
  ) {
    super(
      `Graph query failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = "GraphQueryError";
    this.cause = cause;
  }
}
