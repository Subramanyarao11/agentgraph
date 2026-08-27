import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SavedViewEntity } from "./saved-view.entity";
import { ViewsController } from "./views.controller";
import { ViewsService } from "./views.service";

@Module({
  imports: [TypeOrmModule.forFeature([SavedViewEntity])],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
