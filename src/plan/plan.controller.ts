import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@Controller("plan")
@ApiBearerAuth("token")
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get("all")
  async getPlans(@Req() req) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return await this.planService.getPlans(user.id);
  }

  @Get(":plan_id")
  async getPlan(@Req() req, @Param("plan_id") plan_id: number) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return await this.planService.getPlan(user.id, plan_id);
  }
}
