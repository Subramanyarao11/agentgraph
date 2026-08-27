import { Controller, Get, HttpStatus, Inject, Res } from "@nestjs/common";
import type { Response } from "express";
import type { Redis } from "ioredis";
import { DataSource } from "typeorm";
import { GraphService } from "../graph/graph.service";
import { REDIS_CLIENT } from "../redis/redis.module";

type ComponentStatus = "up" | "down";

/**
 * Aggregate health of all three backing stores. The frontend polls this to
 * show a clear banner instead of letting individual widgets fail silently
 * when, e.g., the graph database is unreachable.
 */
@Controller("health")
export class HealthController {
  constructor(
    private readonly graph: GraphService,
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check(@Res() res: Response): Promise<void> {
    const [graphUp, postgresUp, redisUp] = await Promise.all([
      this.graph.checkHealth(),
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const components: Record<string, ComponentStatus> = {
      graph: graphUp ? "up" : "down",
      postgres: postgresUp ? "up" : "down",
      redis: redisUp ? "up" : "down",
    };

    const allUp = graphUp && postgresUp && redisUp;
    res.status(allUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      status: allUp ? "up" : "degraded",
      components,
      timestamp: new Date().toISOString(),
    });
  }

  private async checkPostgres(): Promise<boolean> {
    try {
      await this.dataSource.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === "PONG";
    } catch {
      return false;
    }
  }
}
