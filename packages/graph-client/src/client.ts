import neo4j, {
  type Driver,
  type ManagedTransaction,
  type QueryResult,
  type RecordShape,
  type Session,
} from "neo4j-driver";
import type { GraphConfig } from "./config";
import { GraphConnectionError, GraphQueryError } from "./errors";

export type CypherParams = Record<string, unknown>;

/** Emitted after every Cypher execution, success or failure — the hook for backend observability. */
export interface QueryMetricEvent {
  /** Short, caller-supplied label (e.g. "catalogList", "impactPaths") — never the raw Cypher text. */
  name: string;
  cypher: string;
  mode: "READ" | "WRITE";
  durationMs: number;
  ok: boolean;
}
export type QueryObserver = (event: QueryMetricEvent) => void;

/**
 * Thin wrapper around the official neo4j-driver. Every query goes through
 * `readQuery`/`writeQuery` with parameterized Cypher — callers never
 * string-concatenate values into a query. This is the only place in the
 * codebase that imports `neo4j-driver` directly; everything else (Nest
 * services, the seed script) goes through this class.
 */
export class GraphClient {
  private readonly driver: Driver;
  private readonly database: string;

  /**
   * `onQuery` is optional and fire-and-forget — the seed script and tests
   * construct a GraphClient without one. Nest wires it to ObservabilityService
   * (apps/api) so every query this class ever runs is timed in one place,
   * rather than sprinkling timing calls through catalog/analysis/search services.
   */
  constructor(
    config: GraphConfig,
    private readonly onQuery?: QueryObserver,
  ) {
    this.database = config.database;
    this.driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 10_000,
      maxTransactionRetryTime: 15_000,
    });
  }

  async verifyConnectivity(): Promise<void> {
    try {
      await this.driver.verifyConnectivity({ database: this.database });
    } catch (cause) {
      throw new GraphConnectionError(cause);
    }
  }

  private session(mode: "READ" | "WRITE"): Session {
    return this.driver.session({ database: this.database, defaultAccessMode: mode });
  }

  /** Run a read-only, parameterized Cypher query. `name` is a short label for observability (e.g. "catalogList"). */
  async readQuery<R extends RecordShape = RecordShape>(
    cypher: string,
    params: CypherParams = {},
    name = "unnamed",
  ): Promise<QueryResult<R>> {
    return this.instrumented("READ", name, cypher, async () => {
      const session = this.session("READ");
      try {
        return await session.executeRead((tx: ManagedTransaction) => tx.run<R>(cypher, params));
      } finally {
        await session.close();
      }
    });
  }

  /** Run a write, parameterized Cypher query inside a managed transaction. `name` is a short label for observability. */
  async writeQuery<R extends RecordShape = RecordShape>(
    cypher: string,
    params: CypherParams = {},
    name = "unnamed",
  ): Promise<QueryResult<R>> {
    return this.instrumented("WRITE", name, cypher, async () => {
      const session = this.session("WRITE");
      try {
        return await session.executeWrite((tx: ManagedTransaction) => tx.run<R>(cypher, params));
      } finally {
        await session.close();
      }
    });
  }

  private async instrumented<R>(mode: "READ" | "WRITE", name: string, cypher: string, run: () => Promise<R>): Promise<R> {
    const start = performance.now();
    try {
      const result = await run();
      this.onQuery?.({ name, cypher, mode, durationMs: performance.now() - start, ok: true });
      return result;
    } catch (cause) {
      this.onQuery?.({ name, cypher, mode, durationMs: performance.now() - start, ok: false });
      throw new GraphQueryError(cypher, cause);
    }
  }

  /** Run several statements in one write transaction (used by the seed script for batched UNWIND writes). */
  async writeTransaction<T>(work: (tx: ManagedTransaction) => Promise<T>): Promise<T> {
    const session = this.session("WRITE");
    try {
      return await session.executeWrite(work);
    } catch (cause) {
      throw new GraphQueryError("<transaction>", cause);
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
