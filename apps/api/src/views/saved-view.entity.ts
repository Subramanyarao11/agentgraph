import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { SavedViewType } from "@agentgraph/graph-schema";

@Entity({ name: "saved_views" })
export class SavedViewEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description!: string | null;

  @Column({ type: "varchar", length: 40 })
  type!: SavedViewType;

  @Column({ type: "jsonb" })
  params!: Record<string, unknown>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
