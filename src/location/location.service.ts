import { Injectable } from "@nestjs/common";
import { LocationRepository } from "./location.repository";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, map } from "rxjs";
import { AxiosError } from "axios";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";
import { User } from "src/user/entities/user.entity";
import { PlanService } from "src/plan/plan.service";
import { RecommendationOneDto } from "./dto/request/recommendation.one.dto";
import { LocationResponseDto } from "./dto/response/location.response.dto";

/*
SELECT name FROM locations WHERE review_score IS NOT NULL AND review_score >= 3 ORDER BY review_vector <#>
*/
@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly httpService: HttpService,
    private readonly planService: PlanService,
  ) {}

  async getRecommendation(
    user: User,
    recommendationDto: RecommendationDto,
  ): Promise<RecommendationResponseDto> {
    const { description, date, days, plan_name } = recommendationDto;

    const embedding_vector: string = await this.getEmbeddingVector(description); // description을 embedding vector로 변환

    const landmarks = await this.locationRepository.recommendLandmark(
      embedding_vector,
      days,
    ); // 랜드마크를 days개 추천

    const day = date.getDay();
    const result = { data: {}, max_id: 0 };
    let local_id = 1;
    for (let i = 0; i < days; i++) {
      const response = await this.locationRepository.recommendOtherCategory(
        embedding_vector,
        landmarks[i],
        (day + i) % 7,
      );

      result.data[`day${i + 1}`] = [];

      for (let j = 0; j < 6; j++) {
        if (i == days - 1 && j == 5) {
          break;
        }
        if (j === 3) {
          result.data[`day${i + 1}`].push({
            ...landmarks[i],
            local_id,
          });
        } else if (j < 3) {
          result.data[`day${i + 1}`].push({
            ...response[j],
            local_id,
          });
        } else {
          result.data[`day${i + 1}`].push({
            ...response[j - 1],
            local_id,
          });
        }
        local_id++;
      }
    }

    result.max_id = local_id - 1;

    if (user) {
      await this.planService.createPlan(user.id, result, plan_name); // 계획 저장
    }
    return result;
  }

  async getRecommendationOne(
    recommendationOneDto: RecommendationOneDto,
  ): Promise<LocationResponseDto[]> {
    const {
      description,
      day,
      category,
      is_lunch,
      x,
      y,
      high_review,
      local_id,
    } = recommendationOneDto;

    const embedding_vector = await this.getEmbeddingVector(description); // description을 embedding vector로 변환

    const locations = await this.locationRepository.recommendOne(
      embedding_vector,
      category,
      day,
      is_lunch,
      x,
      y,
      high_review,
    ); // 장소 추천

    return locations.map((location) =>
      LocationResponseDto.of({
        ...location,
        local_id,
      }),
    );
  }

  private async getEmbeddingVector(description: string): Promise<string> {
    const response = await this.httpService
      .post(
        process.env.AI_SERVER + "/embedding",
        { prompt: description },
        {
          headers: {
            "Content-Type": "application/json" /* eslint-disable-line */,
            accept: "application/json",
          },
        },
      )
      .pipe(
        map((response) => response.data.embedding as number[]),
        catchError((error: AxiosError) => {
          throw new Error("Failed to fetch embedding from AI server " + error);
        }),
      );

    const embedding_vector = await firstValueFrom(response);

    const embedding_string = `[${embedding_vector.join(",")}]`;
    return embedding_string;
  }
}
