import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { GraphClient } from "@agentgraph/graph-client";
import { AppConfigService } from "../config/app-config.service";

/**
 * Nest-lifecycle-aware holder of the single GraphClient instance for the
 * process. Connectivity is verified on boot but a failure only logs a
 * warning — the API still starts, and individual requests that touch the
 * graph fail with a clear 503 (see GraphExceptionFilter) rather than the
 * whole process refusing to come up because the database was briefly
 * unreachable.
 */
@Injectable()
export class GraphService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GraphService.name);
  readonly client: GraphClient;
  private connected = false;

  constructor(private readonly config: AppConfigService) {
    this.client = new GraphClient(this.config.graph);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.verifyConnectivity();
      this.connected = true;
      this.logger.log(`Connected to graph database at ${this.config.graph.uri}`);
    } catch (err) {
      this.connected = false;
      this.logger.warn(
        `Graph database unreachable at boot (${this.config.graph.uri}). ` +
          `The API will keep running; graph-backed endpoints will return 503 until it recovers. ` +
          `Cause: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  isConnected(): boolean {
    return this.connected;
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.client.verifyConnectivity();
      this.connected = true;
    } catch {
      this.connected = false;
    }
    return this.connected;
  }
}
