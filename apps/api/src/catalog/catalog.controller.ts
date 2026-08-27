import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { CatalogListQuery, NodeLabelSchema, type NodeLabel } from "@agentgraph/graph-schema";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get(":label")
  list(
    @Param("label", new ZodValidationPipe(NodeLabelSchema)) label: NodeLabel,
    @Query(new ZodValidationPipe(CatalogListQuery)) query: CatalogListQuery,
  ) {
    return this.catalog.list(label, query);
  }

  @Get(":label/:id")
  async getById(
    @Param("label", new ZodValidationPipe(NodeLabelSchema)) label: NodeLabel,
    @Param("id") id: string,
  ) {
    const result = await this.catalog.getById(label, id);
    if (!result) throw new NotFoundException(`${label} ${id} not found`);
    return result;
  }
}
