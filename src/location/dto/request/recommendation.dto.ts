import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class RecommendationDto {
  @ApiProperty({
    description: "The description of the recommendation",
    example: "산뜻한 여행을 가고 싶어요",
  })
  @IsString({ message: "description must be a string" })
  @MinLength(1, { message: "description must be at least 1 character long" })
  description: string;

  @ApiProperty({
    description: "The date of the recommendation",
    example: "2023-10-01",
  })
  @IsString({ message: "date must be a string" })
  @MinLength(1, { message: "date must be at least 1 character long" })
  date: Date;
}
