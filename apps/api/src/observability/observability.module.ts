import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ANALYSIS_QUEUE } from "../jobs/queue.constants";
import { RequestTracingInterceptor } from "../common/interceptors/request-tracing.interceptor";
import { ObservabilityController } from "./observability.controller";
import { ObservabilityService } from "./observability.service";

/**
 * Global so GraphService (in the separately-global GraphModule) can inject
 * ObservabilityService without a module import cycle — see
 * ObservabilityController's docstring for why the queue-counts and
 * graph-connectivity reads live on the controller instead of here.
 */
@Global()
@Module({
  imports: [BullModule.registerQueue({ name: ANALYSIS_QUEUE })],
  controllers: [ObservabilityController],
  providers: [ObservabilityService, { provide: APP_INTERCEPTOR, useClass: RequestTracingInterceptor }],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
