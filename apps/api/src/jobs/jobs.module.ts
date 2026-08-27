import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { AnalysisModule } from "../analysis/analysis.module";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { SimilarityLeaderboardProcessor } from "./similarity-leaderboard.processor";
import { ANALYSIS_QUEUE } from "./queue.constants";

@Module({
  imports: [BullModule.registerQueue({ name: ANALYSIS_QUEUE }), AnalysisModule],
  controllers: [JobsController],
  providers: [JobsService, SimilarityLeaderboardProcessor],
})
export class JobsModule {}
