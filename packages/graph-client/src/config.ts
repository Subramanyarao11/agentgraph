import { z } from "zod";

/**
 * Connection config, validated once at boot. CognoDB and Neo4j share the
 * same shape here: a bolt(+s):// URI, a username, and a password. Nothing
 * else needs to change to point this at CognoDB Cloud vs. local Neo4j.
 */
export const GraphConfigSchema = z.object({
  uri: z.string().min(1, "GRAPH_URI is required"),
  user: z.string().min(1, "GRAPH_USER is required"),
  password: z.string().min(1, "GRAPH_PASSWORD is required"),
  database: z.string().default("neo4j"),
});
export type GraphConfig = z.infer<typeof GraphConfigSchema>;

export function loadGraphConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): GraphConfig {
  return GraphConfigSchema.parse({
    uri: env.GRAPH_URI,
    user: env.GRAPH_USER,
    password: env.GRAPH_PASSWORD,
    database: env.GRAPH_DATABASE,
  });
}
