import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LocationService } from "./location.service";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";

@Controller("location")
@ApiBearerAuth("token")
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post("recommendation/test")
  async getRecommendationTest(@Body() recommendationDto: RecommendationDto) {
    return this.locationService.getRecommendationTest(recommendationDto);
  }

  @Post("recommendation")
  @ApiOperation({ summary: "위치 추천" })
  @ApiResponse({
    status: 200,
    description: "위치 추천 성공",
    type: RecommendationResponseDto,
  })
  async getRecommendation(@Body() recommendationDto: RecommendationDto) {
    return this.locationService.getRecommendation(recommendationDto);
  }
}
