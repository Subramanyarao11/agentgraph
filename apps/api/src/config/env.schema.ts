import { z } from "zod";

/**
 * Single source of truth for every environment variable the API reads.
 * Validated once at boot via ConfigModule's `validate` hook — an invalid
 * or missing var fails fast with a clear message instead of surfacing as
 * a confusing runtime error three requests later.
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3001),
  // Render (and most PaaS hosts) inject PORT and expect the app to bind to
  // it, taking precedence over API_PORT when set.
  PORT: z.coerce.number().int().positive().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  GRAPH_URI: z.string().min(1),
  GRAPH_USER: z.string().min(1),
  GRAPH_PASSWORD: z.string().min(1),
  GRAPH_DATABASE: z.string().default("neo4j"),

  POSTGRES_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});
export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
