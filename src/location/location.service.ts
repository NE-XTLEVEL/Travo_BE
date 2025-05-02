import { Injectable } from "@nestjs/common";
import { LocationRepository } from "./location.repository";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, map } from "rxjs";
import { AxiosError } from "axios";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";

/*
SELECT name FROM locations WHERE review_score IS NOT NULL AND review_score >= 3 ORDER BY review_vector <#>
*/
@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly httpService: HttpService,
  ) {}

  async getRecommendationTest(recommendationDto: RecommendationDto) {
    const { description } = recommendationDto;

    const response = await this.httpService
      .post(
        process.env.AI_SERVER + "/embedding",
        { prompt: description },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        },
      )
      .pipe(
        map((response) => response.data.embedding as number[]),
        catchError((error: AxiosError) => {
          console.error("Error fetching embedding:", error);
          throw new Error("Failed to fetch embedding from AI server");
        }),
      );

    const embedding_vector = await firstValueFrom(response);

    return this.locationRepository.recommendLandmark(embedding_vector, 6);
  }

  async getRecommendation(recommendationDto: RecommendationDto) {
    const { description, days } = recommendationDto;

    const response = await this.httpService
      .post(
        process.env.AI_SERVER + "/embedding",
        { prompt: description },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        },
      )
      .pipe(
        map((response) => response.data.embedding as number[]),
        catchError((error: AxiosError) => {
          console.error("Error fetching embedding:", error);
          throw new Error("Failed to fetch embedding from AI server");
        }),
      ); // embedding vector를 가져오는 API 호출

    const embedding_vector = await firstValueFrom(response);

    const landmarks = await this.locationRepository.recommendLandmark(
      embedding_vector,
      days * 2 + 1,
    ); // 랜드마크를 2*days + 1개 추천

    const sequence = [0, 2, -1, 4, 1, 3]; // 랜드마크 순서
    const result = { data: {} };
    let local_id = 1;
    for (let i = 0; i < days; i++) {
      const response = await this.locationRepository.recommendOtherCategory(
        embedding_vector,
        landmarks[i],
      );

      result.data[`day${i + 1}`] = [];

      for (let j = 0; j < sequence.length; j++) {
        if (i == days - 1 && j == 5) {
          break;
        }
        if (sequence[j] === -1) {
          result.data[`day${i + 1}`].push({
            ...landmarks[i],
            local_id,
          });
          local_id++;
        } else {
          result.data[`day${i + 1}`].push({
            ...response[sequence[j]],
            local_id,
          });
          local_id++;
        }
      }
    }
    return result;
  }
}
