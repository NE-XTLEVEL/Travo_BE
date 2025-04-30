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
    const { description, date, days } = recommendationDto;

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

    // const landmarks = await this.locationRepository.recommendLandmark(
    //   embedding_vector,
    //   days,
    // );

    const result =
      await this.locationRepository.recommendOtherCategory(embedding_vector);

    return result;
  }
}
