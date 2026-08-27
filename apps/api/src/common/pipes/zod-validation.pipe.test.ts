import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BadRequestException } from "@nestjs/common";
import { ZodValidationPipe } from "./zod-validation.pipe";

const Schema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().trim().min(1).optional(),
});

describe("ZodValidationPipe", () => {
  it("parses and coerces valid input", () => {
    const pipe = new ZodValidationPipe(Schema);
    expect(pipe.transform({ limit: "25" })).toEqual({ limit: 25 });
  });

  it("applies schema defaults for omitted fields", () => {
    const pipe = new ZodValidationPipe(Schema);
    expect(pipe.transform({})).toEqual({ limit: 50 });
  });

  it("throws BadRequestException with issue details on invalid input", () => {
    const pipe = new ZodValidationPipe(Schema);
    try {
      pipe.transform({ limit: "not-a-number" });
      expect.unreachable("transform should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      const response = (err as BadRequestException).getResponse() as { issues: Array<{ path: string }> };
      expect(response.issues[0]?.path).toBe("limit");
    }
  });

  it("rejects a value outside the validated range instead of silently clamping it", () => {
    const pipe = new ZodValidationPipe(Schema);
    expect(() => pipe.transform({ limit: "999" })).toThrow(BadRequestException);
  });
});
