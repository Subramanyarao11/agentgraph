import { Global, Module } from "@nestjs/common";
import { AppConfigService } from "./app-config.service";

/** Global so GraphModule/RedisModule/etc. can inject AppConfigService without each re-importing it. */
@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
