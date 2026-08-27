import { describe, expect, it } from "vitest";
import { ObservabilityService } from "./observability.service";

function record(service: ObservabilityService, route: string, durationMs: number, statusCode = 200) {
  service.recordRequest({ id: crypto.randomUUID(), method: "GET", route, statusCode, durationMs });
}

describe("ObservabilityService", () => {
  it("aggregates count, error count, avg, and p95 per route", () => {
    const service = new ObservabilityService();
    record(service, "/catalog/:label", 10);
    record(service, "/catalog/:label", 20);
    record(service, "/catalog/:label", 30, 500);
    record(service, "/health", 5);

    const summary = service.summary();

    expect(summary.requests.total).toBe(4);
    expect(summary.requests.errorCount).toBe(1);

    const catalog = summary.requests.byRoute.find((r) => r.route === "/catalog/:label");
    expect(catalog).toEqual({ route: "/catalog/:label", count: 3, errorCount: 1, avgMs: 20, p95Ms: 30 });
  });

  it("attributes queries to the request that triggered them via requestId", () => {
    const service = new ObservabilityService();
    service.recordQuery({ name: "catalogList", cypher: "MATCH (n) RETURN n", mode: "READ", durationMs: 4, ok: true }, "req-1");
    service.recordQuery({ name: "catalogCount", cypher: "MATCH (n) RETURN count(n)", mode: "READ", durationMs: 2, ok: true }, "req-1");
    service.recordQuery({ name: "catalogList", cypher: "MATCH (n) RETURN n", mode: "READ", durationMs: 6, ok: false }, null);

    const summary = service.summary();
    expect(summary.queries.total).toBe(3);
    expect(summary.queries.errorCount).toBe(1);

    const catalogList = summary.queries.byName.find((q) => q.name === "catalogList");
    expect(catalogList).toEqual({ name: "catalogList", count: 2, errorCount: 1, avgMs: 5, p95Ms: 6 });

    const log = service.log();
    expect(log.queries.filter((q) => q.requestId === "req-1")).toHaveLength(2);
    expect(log.queries.find((q) => q.requestId === null)?.ok).toBe(false);
  });

  it("returns the log most-recent-first", () => {
    const service = new ObservabilityService();
    record(service, "/first", 1);
    record(service, "/second", 1);

    const log = service.log();
    expect(log.requests.map((r) => r.route)).toEqual(["/second", "/first"]);
  });

  it("bounds the rolling window instead of growing unboundedly", () => {
    const service = new ObservabilityService();
    for (let i = 0; i < 600; i++) record(service, `/route-${i}`, 1);

    const log = service.log();
    expect(log.requests.length).toBeLessThanOrEqual(500);
    // The oldest entries (route-0..route-99) should have been evicted, the newest kept.
    expect(log.requests[0]!.route).toBe("/route-599");
    expect(log.requests.some((r) => r.route === "/route-0")).toBe(false);
  });
});
