import { Controller, Get } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { ObservabilityLogDto, ObservabilitySummaryDto } from "@agentgraph/graph-schema";
import { GraphService } from "../graph/graph.service";
import { ANALYSIS_QUEUE } from "../jobs/queue.constants";
import { ObservabilityService } from "./observability.service";

/**
 * Read side of the observability system: aggregate stats for a dashboard
 * plus the raw recent-entry log for a "requests"/"queries" table. Depends on
 * GraphService and the BullMQ queue directly (rather than ObservabilityService
 * reaching into them) to avoid a GraphService <-> ObservabilityService cycle —
 * GraphService already depends on ObservabilityService to report query timing.
 */
@Controller("observability")
export class ObservabilityController {
  constructor(
    private readonly observability: ObservabilityService,
    private readonly graph: GraphService,
    @InjectQueue(ANALYSIS_QUEUE) private readonly queue: Queue,
  ) {}

  @Get("summary")
  async summary(): Promise<ObservabilitySummaryDto> {
    const counts = await this.queue.getJobCounts("waiting", "active", "completed", "failed");
    return {
      ...this.observability.summary(),
      graphConnected: this.graph.isConnected(),
      queue: {
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
      },
    };
  }

  @Get("log")
  log(): ObservabilityLogDto {
    return this.observability.log();
  }
}
