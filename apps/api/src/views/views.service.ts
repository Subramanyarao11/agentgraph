import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { CreateSavedViewDto, SavedViewDto } from "@agentgraph/graph-schema";
import { SavedViewEntity } from "./saved-view.entity";

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(SavedViewEntity)
    private readonly repo: Repository<SavedViewEntity>,
  ) {}

  async list(): Promise<SavedViewDto[]> {
    const rows = await this.repo.find({ order: { createdAt: "DESC" } });
    return rows.map(toDto);
  }

  async create(dto: CreateSavedViewDto): Promise<SavedViewDto> {
    const entity = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      params: dto.params,
    });
    const saved = await this.repo.save(entity);
    return toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Saved view ${id} not found`);
    }
  }
}

function toDto(entity: SavedViewEntity): SavedViewDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description ?? undefined,
    type: entity.type as SavedViewDto["type"],
    params: entity.params,
    createdAt: entity.createdAt.toISOString(),
  };
}
