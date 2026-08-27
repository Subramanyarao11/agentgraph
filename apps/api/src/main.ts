import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app-config.service";
import { GraphExceptionFilter } from "./common/filters/graph-exception.filter";
import { applyGraphSchema } from "@agentgraph/graph-client";
import { GraphService } from "./graph/graph.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const config = app.get(AppConfigService);
  app.enableCors({ origin: config.corsOrigin, credentials: true });
  app.useGlobalFilters(new GraphExceptionFilter());

  const graph = app.get(GraphService);
  if (graph.isConnected()) {
    try {
      await applyGraphSchema(graph.client);
      logger.log("Graph constraints/indexes ensured");
    } catch (err) {
      logger.warn(`Could not apply graph constraints (continuing): ${err instanceof Error ? err.message : err}`);
    }
  }

  await app.listen(config.port);
  logger.log(`AgentGraph API listening on :${config.port}`);
}

bootstrap();
