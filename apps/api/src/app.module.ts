import { join } from "node:path";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalysisModule } from "./analysis/analysis.module";
import { AppConfigModule } from "./config/app-config.module";
import { validateEnv, type Env } from "./config/env.schema";
import { CatalogModule } from "./catalog/catalog.module";
import { GraphModule } from "./graph/graph.module";
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { RedisModule } from "./redis/redis.module";
import { SearchModule } from "./search/search.module";
import { SavedViewEntity } from "./views/saved-view.entity";
import { ViewsModule } from "./views/views.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      // One .env at the monorepo root, shared by the API and the seed script.
      envFilePath: join(__dirname, "../../../.env"),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: "postgres" as const,
        url: config.get("POSTGRES_URL", { infer: true }),
        entities: [SavedViewEntity],
        // Fine for a take-home / small app; a real deployment would use migrations instead.
        synchronize: true,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        connection: { url: config.get("REDIS_URL", { infer: true }) },
      }),
    }),
    AppConfigModule,
    GraphModule,
    RedisModule,
    HealthModule,
    CatalogModule,
    AnalysisModule,
    JobsModule,
    ViewsModule,
    SearchModule,
  ],
})
export class AppModule {}
