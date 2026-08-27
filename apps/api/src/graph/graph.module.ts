import { Global, Module } from "@nestjs/common";
import { GraphService } from "./graph.service";

/** Global so every feature module can inject GraphService without re-importing it. */
@Global()
@Module({
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
