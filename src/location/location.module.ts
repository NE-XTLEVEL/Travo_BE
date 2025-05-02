import { Module } from "@nestjs/common";
import { LocationService } from "./location.service";
import { LocationController } from "./location.controller";
import { LocationRepository } from "./location.repository";
import { HttpModule } from "@nestjs/axios";
import { Location } from "./entities/location.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { PlanModule } from "src/plan/plan.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, Category]),
    HttpModule,
    PlanModule,
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository],
})
export class LocationModule {}
