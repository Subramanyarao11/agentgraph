import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GraphConfig } from "@agentgraph/graph-client";
import type { Env } from "./env.schema";

/**
 * Typed façade over Nest's ConfigService. Everything downstream (GraphModule,
 * jobs, TypeORM setup) reads config through this instead of poking at
 * `process.env` directly, so there's exactly one place that knows the env
 * variable names.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get port(): number {
    return this.config.get("API_PORT", { infer: true });
  }

  get corsOrigin(): string {
    return this.config.get("CORS_ORIGIN", { infer: true });
  }

  get isProduction(): boolean {
    return this.config.get("NODE_ENV", { infer: true }) === "production";
  }

  get graph(): GraphConfig {
    return {
      uri: this.config.get("GRAPH_URI", { infer: true }),
      user: this.config.get("GRAPH_USER", { infer: true }),
      password: this.config.get("GRAPH_PASSWORD", { infer: true }),
      database: this.config.get("GRAPH_DATABASE", { infer: true }),
    };
  }

  get postgresUrl(): string {
    return this.config.get("POSTGRES_URL", { infer: true });
  }

  get redisUrl(): string {
    return this.config.get("REDIS_URL", { infer: true });
  }
}
