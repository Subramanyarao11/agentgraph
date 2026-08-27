import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { GraphClient, applyGraphSchema, loadGraphConfigFromEnv } from "@agentgraph/graph-client";
import { generateSeedData } from "./generators";
import { loadSeedData, resetGraph } from "./loader";

// Shared root .env, same file the API reads.
loadDotenv({ path: resolve(__dirname, "../../../../.env") });

async function main() {
  const shouldReset = process.argv.includes("--reset");
  const config = loadGraphConfigFromEnv();
  const client = new GraphClient(config);

  console.log(`Connecting to graph database at ${config.uri} ...`);
  await client.verifyConnectivity();
  console.log("Connected.");

  await applyGraphSchema(client);
  console.log("Constraints/indexes ensured.");

  if (shouldReset) {
    console.log("Resetting graph (--reset passed) ...");
    await resetGraph(client);
    console.log("Graph cleared.");
  }

  console.log("Generating seed data ...");
  const data = generateSeedData();

  console.log("Loading into graph ...");
  await loadSeedData(client, data);

  console.log("\nSeed complete:");
  console.log(`  People:      ${data.people.length}`);
  console.log(`  Agents:      ${data.agents.length}`);
  console.log(`  Tools:       ${data.tools.length}`);
  console.log(`  Workflows:   ${data.workflows.length}`);
  console.log(`  Steps:       ${data.steps.length}`);
  console.log(`  Datasets:    ${data.datasets.length}`);
  console.log(`  Executions:  ${data.executions.length}`);

  await client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
