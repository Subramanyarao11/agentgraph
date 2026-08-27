import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { AppConfigService } from "../config/app-config.service";

export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        new Redis(config.redisUrl, { maxRetriesPerRequest: 3, lazyConnect: false }),
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
