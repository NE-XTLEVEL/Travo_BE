import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import { ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@Controller("plan")
@ApiBearerAuth("token")
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get("all")
  @ApiOperation({
    summary: "Get all plans",
    description: "Get all plans for the user",
  })
  @ApiQuery({
    name: "cursor",
    required: false,
    description: "Cursor for pagination",
    type: Number,
  })
  async getPlans(@Req() req, @Query("cursor") cursor?: number) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return await this.planService.getPlans(user.id, cursor);
  }

  @Get(":plan_id")
  @ApiOperation({
    summary: "Get plan by ID",
    description: "Get a specific plan by its ID",
  })
  async getPlan(@Req() req, @Param("plan_id") plan_id: number) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return await this.planService.getPlan(user.id, plan_id);
  }
}
