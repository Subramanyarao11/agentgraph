import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { ObservabilityLogDto, ObservabilitySummaryDto, QueryStatDto, RouteStatDto } from "@agentgraph/graph-schema";
import type { QueryMetricEvent } from "@agentgraph/graph-client";

interface RequestEntry {
  id: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

interface QueryEntry {
  id: string;
  requestId: string | null;
  name: string;
  mode: "READ" | "WRITE";
  durationMs: number;
  ok: boolean;
  timestamp: number;
}

/** Rolling window size per log — bounded so a long-lived process can't leak memory. Process-local, not persisted. */
const MAX_ENTRIES = 500;

function push<T>(buffer: T[], entry: T): void {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.shift();
}

function avg(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function p95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1);
  return sorted[Math.max(0, index)]!;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * In-process observability store: a bounded rolling log of HTTP requests and
 * Cypher queries, plus the aggregates the frontend renders. Deliberately not
 * backed by Redis/Postgres/an external collector — this is meant to be the
 * lightweight, zero-extra-infra version (see README), scoped to one process's
 * uptime. A multi-instance deployment would need a shared store instead.
 */
@Injectable()
export class ObservabilityService {
  private readonly startedAt = Date.now();
  private readonly requests: RequestEntry[] = [];
  private readonly queries: QueryEntry[] = [];

  recordRequest(entry: { id: string; method: string; route: string; statusCode: number; durationMs: number }): void {
    push(this.requests, { ...entry, timestamp: Date.now() });
  }

  recordQuery(event: QueryMetricEvent, requestId: string | null): void {
    push(this.queries, {
      id: randomUUID(),
      requestId,
      name: event.name,
      mode: event.mode,
      durationMs: event.durationMs,
      ok: event.ok,
      timestamp: Date.now(),
    });
  }

  uptimeSeconds(): number {
    return Math.floor((Date.now() - this.startedAt) / 1000);
  }

  log(): ObservabilityLogDto {
    return {
      requests: [...this.requests].reverse().map((r) => ({ ...r, timestamp: new Date(r.timestamp).toISOString() })),
      queries: [...this.queries].reverse().map((q) => ({ ...q, timestamp: new Date(q.timestamp).toISOString() })),
    };
  }

  summary(): Omit<ObservabilitySummaryDto, "graphConnected" | "queue"> {
    const requestDurations = this.requests.map((r) => r.durationMs);
    const queryDurations = this.queries.map((q) => q.durationMs);

    return {
      uptimeSeconds: this.uptimeSeconds(),
      requests: {
        total: this.requests.length,
        errorCount: this.requests.filter((r) => r.statusCode >= 400).length,
        avgMs: round(avg(requestDurations)),
        p95Ms: round(p95(requestDurations)),
        byRoute: groupStats(this.requests, (r) => r.route, (r) => r.statusCode >= 400).map(
          ([route, stat]): RouteStatDto => ({ route, ...stat }),
        ),
      },
      queries: {
        total: this.queries.length,
        errorCount: this.queries.filter((q) => !q.ok).length,
        avgMs: round(avg(queryDurations)),
        p95Ms: round(p95(queryDurations)),
        byName: groupStats(this.queries, (q) => q.name, (q) => !q.ok).map(
          ([name, stat]): QueryStatDto => ({ name, ...stat }),
        ),
      },
    };
  }
}

function groupStats<T extends { durationMs: number }>(
  entries: T[],
  keyOf: (entry: T) => string,
  isError: (entry: T) => boolean,
): Array<[string, { count: number; errorCount: number; avgMs: number; p95Ms: number }]> {
  const byKey = new Map<string, T[]>();
  for (const entry of entries) {
    const key = keyOf(entry);
    const group = byKey.get(key);
    if (group) group.push(entry);
    else byKey.set(key, [entry]);
  }

  return [...byKey.entries()]
    .map(([key, group]): [string, { count: number; errorCount: number; avgMs: number; p95Ms: number }] => {
      const durations = group.map((e) => e.durationMs);
      return [
        key,
        {
          count: group.length,
          errorCount: group.filter(isError).length,
          avgMs: round(avg(durations)),
          p95Ms: round(p95(durations)),
        },
      ];
    })
    .sort((a, b) => b[1].count - a[1].count);
}
