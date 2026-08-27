import { describe, expect, it, vi } from "vitest";
import type { GraphClient } from "./client";
import { applyGraphSchema } from "./schema";

function fakeClient(shouldFail: (statement: string) => boolean) {
  const writeQuery = vi.fn(async (statement: string) => {
    if (shouldFail(statement)) throw new Error("Unsupported syntax");
    return {} as never;
  });
  return { client: { writeQuery } as unknown as GraphClient, writeQuery };
}

describe("applyGraphSchema", () => {
  it("applies every statement when the backend accepts all of them", async () => {
    const { client } = fakeClient(() => false);
    const result = await applyGraphSchema(client);

    expect(result.failed).toEqual([]);
    expect(result.applied.length).toBeGreaterThan(0);
  });

  it("keeps applying remaining statements after one fails, instead of throwing", async () => {
    const { client } = fakeClient((statement) => statement.includes("CREATE CONSTRAINT person_id"));
    const result = await applyGraphSchema(client);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.statement).toContain("person_id");
    expect(result.failed[0]?.message).toBe("Unsupported syntax");
    // everything else still applied — a rejected statement never short-circuits the rest
    expect(result.applied.length).toBeGreaterThan(0);
  });

  it("reports every statement as failed without throwing if the backend rejects all DDL", async () => {
    const { client } = fakeClient(() => true);
    const result = await applyGraphSchema(client);

    expect(result.applied).toEqual([]);
    expect(result.failed.length).toBeGreaterThan(0);
  });
});
