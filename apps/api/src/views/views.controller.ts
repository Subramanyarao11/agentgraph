import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UsePipes } from "@nestjs/common";
import { CreateSavedViewDto } from "@agentgraph/graph-schema";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ViewsService } from "./views.service";

@Controller("views")
export class ViewsController {
  constructor(private readonly views: ViewsService) {}

  @Get()
  list() {
    return this.views.list();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSavedViewDto))
  create(@Body() dto: CreateSavedViewDto) {
    return this.views.create(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.views.remove(id);
  }
}
