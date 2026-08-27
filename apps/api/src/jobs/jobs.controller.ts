import { Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { JobsService } from "./jobs.service";

@Controller("jobs/similarity-leaderboard")
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  enqueue() {
    return this.jobs.enqueueSimilarityLeaderboard();
  }

  @Get(":jobId")
  status(@Param("jobId") jobId: string) {
    return this.jobs.getStatus(jobId);
  }
}
