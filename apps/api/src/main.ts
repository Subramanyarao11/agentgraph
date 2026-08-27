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

  // Module lifecycle hooks (GraphService.onModuleInit, which sets up the
  // connectivity flag applyGraphSchema depends on below) don't actually run
  // until init() — NestFactory.create() alone doesn't trigger them. Without
  // this, isConnected() below always reads its pre-init default and every
  // schema-application attempt silently no-ops.
  await app.init();

  const graph = app.get(GraphService);
  if (graph.isConnected()) {
    const { applied, failed } = await applyGraphSchema(graph.client);
    logger.log(`Graph constraints/indexes: ${applied.length} applied, ${failed.length} failed`);
    for (const f of failed) logger.warn(`Skipped (unsupported?): ${f.statement} — ${f.message}`);
  }

  await app.listen(config.port);
  logger.log(`AgentGraph API listening on :${config.port}`);
}

bootstrap();
