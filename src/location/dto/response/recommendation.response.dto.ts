import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { LocationResponseDto } from "./location.response.dto";

@ApiExtraModels(LocationResponseDto)
export class RecommendationResponseDto {
  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "array",
      items: { $ref: getSchemaPath(LocationResponseDto) },
    },
    example: {
      day1: [
        {
          kakao_id: 12156,
          local_id: 1,
          name: "인천공항",
          x: 126.442056,
          y: 37.458848,
          address: "인천광역시 중구 공항로 272",
          url: "https://naver.com",
          category: "교통",
        },
      ],
      day2: [
        {
          kakao_id: 85765,
          local_id: 16,
          name: "어린이 대공원",
          x: 127.081761,
          y: 37.549567,
          address: "버섯마을,서울특별시 광진구 능동 18",
          url: "",
          category: "명소",
        },
      ],
    },
  })
  @ValidateNested({ each: true })
  @Type(() => LocationResponseDto)
  data: Record<string, LocationResponseDto[]>;
}
