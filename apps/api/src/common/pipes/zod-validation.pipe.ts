import { BadRequestException, PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Validates+coerces a request's query/params/body against a Zod schema.
 * Used per-route as `new ZodValidationPipe(SomeQuery)` so each endpoint's
 * DTO is the single source of truth shared with the frontend via
 * @agentgraph/graph-schema — no duplicated class-validator DTOs.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    return result.data;
  }
}
