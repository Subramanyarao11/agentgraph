import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { JobStatusDto, SimilarityPairDto } from "@agentgraph/graph-schema";
import { ANALYSIS_QUEUE, SIMILARITY_LEADERBOARD_JOB } from "./queue.constants";

@Injectable()
export class JobsService {
  constructor(@InjectQueue(ANALYSIS_QUEUE) private readonly queue: Queue) {}

  async enqueueSimilarityLeaderboard(): Promise<{ jobId: string }> {
    const job = await this.queue.add(SIMILARITY_LEADERBOARD_JOB, {}, { removeOnComplete: 20, removeOnFail: 20 });
    return { jobId: job.id! };
  }

  async getStatus(jobId: string): Promise<JobStatusDto> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return { jobId, status: "not_found", result: null, failedReason: null };
    }

    const state = await job.getState();
    const status: JobStatusDto["status"] =
      state === "completed" || state === "failed" || state === "active" || state === "waiting"
        ? state
        : "waiting";

    return {
      jobId,
      status,
      result: status === "completed" ? ((job.returnvalue as SimilarityPairDto[]) ?? []) : null,
      failedReason: job.failedReason ?? null,
    };
  }
}
