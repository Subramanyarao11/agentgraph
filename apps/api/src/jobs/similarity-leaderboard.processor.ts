import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import type { SimilarityPairDto } from "@agentgraph/graph-schema";
import { AnalysisService } from "../analysis/analysis.service";
import { ANALYSIS_QUEUE } from "./queue.constants";

/**
 * Computing all-pairs agent similarity is O(agents^2) in the worst case —
 * fine to run inline for one agent (the /analysis/similar-agents endpoint),
 * too expensive to run synchronously on every request for the whole graph.
 * This worker runs that global computation off the request path and caches
 * the result on the BullMQ job itself (`job.returnvalue`), which the
 * frontend polls via GET /jobs/similarity-leaderboard/:id.
 */
@Processor(ANALYSIS_QUEUE)
export class SimilarityLeaderboardProcessor extends WorkerHost {
  private readonly logger = new Logger(SimilarityLeaderboardProcessor.name);

  constructor(private readonly analysis: AnalysisService) {
    super();
  }

  async process(job: Job): Promise<SimilarityPairDto[]> {
    this.logger.log(`Computing similarity leaderboard (job ${job.id})`);
    return this.analysis.similarityLeaderboard();
  }
}
