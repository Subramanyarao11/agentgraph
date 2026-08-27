import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ExposureQuery, ImpactAnalysisQuery, LineageQuery, SimilarAgentsQuery } from "@agentgraph/graph-schema";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { AnalysisService } from "./analysis.service";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}

  @Get("impact")
  impact(@Query(new ZodValidationPipe(ImpactAnalysisQuery)) query: ImpactAnalysisQuery) {
    return this.analysis.impact(query.nodeId, query.maxHops);
  }

  @Get("lineage")
  lineage(@Query(new ZodValidationPipe(LineageQuery)) query: LineageQuery) {
    return this.analysis.lineage(query.datasetId);
  }

  @Get("similar-agents")
  similarAgents(@Query(new ZodValidationPipe(SimilarAgentsQuery)) query: SimilarAgentsQuery) {
    return this.analysis.similarAgents(query.agentId, query.limit);
  }

  @Get("exposure")
  exposure(@Query(new ZodValidationPipe(ExposureQuery)) query: ExposureQuery) {
    return this.analysis.exposure(query.sensitivity, 6);
  }

  @Get("executions/:id/trace")
  async trace(@Param("id") id: string) {
    const trace = await this.analysis.executionTrace(id);
    if (!trace) throw new NotFoundException(`Execution ${id} not found`);
    return trace;
  }
}
