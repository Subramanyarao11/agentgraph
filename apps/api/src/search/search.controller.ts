import { Controller, Get, Query } from "@nestjs/common";
import { SearchQuery } from "@agentgraph/graph-schema";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  find(@Query(new ZodValidationPipe(SearchQuery)) query: SearchQuery) {
    return this.search.search(query.q);
  }
}
