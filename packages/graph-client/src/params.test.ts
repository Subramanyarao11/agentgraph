import { describe, expect, it } from "vitest";
import neo4j from "neo4j-driver";
import { cypherInt } from "./params";

describe("cypherInt", () => {
  it("wraps a plain number as a Bolt Integer, not a Float", () => {
    const value = cypherInt(25);
    expect(neo4j.isInt(value)).toBe(true);
    expect(value.toNumber()).toBe(25);
  });

  it("round-trips zero and negative values", () => {
    expect(cypherInt(0).toNumber()).toBe(0);
    expect(cypherInt(-5).toNumber()).toBe(-5);
  });
});
