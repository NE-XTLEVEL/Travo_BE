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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { PlanResponseDto } from "./dto/response/plan.response.dto";
import { RecommendationResponseDto } from "src/location/dto/response/recommendation.response.dto";

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
  @ApiResponse({
    status: 200,
    description: "List of plans",
    type: [PlanResponseDto],
  })
  async getPlans(
    @Req() req,
    @Query("cursor") cursor?: number,
  ): Promise<PlanResponseDto[]> {
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
  @ApiResponse({
    status: 200,
    description: "Plan details",
    type: RecommendationResponseDto,
  })
  async getPlan(
    @Req() req,
    @Param("plan_id") plan_id: number,
  ): Promise<RecommendationResponseDto> {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return await this.planService.getPlan(user.id, plan_id);
  }
}
