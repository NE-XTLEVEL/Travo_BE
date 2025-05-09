import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { LocationService } from "./location.service";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";
import { OptionalGuard } from "src/auth/guard/optional.guard";
import { RecommendationOneDto } from "./dto/request/recommendation.one.dto";
import { LocationResponseDto } from "./dto/response/location.response.dto";

@Controller("location")
@ApiBearerAuth("token")
@UseGuards(OptionalGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post("recommendation/test")
  // eslint-disable-next-line
  async getRecommendationTest(@Body() recommendationDto: RecommendationDto) {
    return {
      data: {
        day1: [
          {
            kakao_id: 2091449297,
            name: "깜닭치킨 하계점",
            address: "서울 노원구 한글비석로1길 59",
            url: null,
            x: 127.07053504746554,
            y: 37.640358290236115,
            category: "음식점",
            local_id: 1,
          },
          {
            kakao_id: 1275682622,
            name: "우아즈",
            address: "서울 노원구 공릉로27길 72-3",
            url: null,
            x: 127.07793053854739,
            y: 37.6243422208485,
            category: "카페",
            local_id: 2,
          },
          {
            location_address: "",
            location_url: null,
            kakao_id: 1003027186,
            name: "경춘선숲길",
            x: 127.078706040469,
            y: 37.620691807133,
            category: "핫플레이스",
            distance: 10.441705096499595,
            local_id: 3,
          },
          {
            kakao_id: 11062391,
            name: "봉화산",
            address: "",
            url: null,
            x: 127.08709217385757,
            y: 37.60857753365413,
            category: "관광 명소",
            local_id: 4,
          },
          {
            kakao_id: 656826836,
            name: "윤생술집",
            address: "서울 중랑구 동일로149길 15",
            url: null,
            x: 127.07761056604,
            y: 37.6063965475217,
            category: "음식점",
            local_id: 5,
          },
          {
            kakao_id: 16081921,
            name: "M호텔",
            address: "서울 노원구 화랑로 413",
            url: null,
            x: 127.073455795349,
            y: 37.6171561123395,
            category: "숙소",
            local_id: 6,
          },
        ],
        day2: [
          {
            kakao_id: 363445435,
            name: "형민참치",
            address: "서울 송파구 강동대로9길 17",
            url: null,
            x: 127.116476039742,
            y: 37.5280023192217,
            category: "음식점",
            local_id: 7,
          },
          {
            kakao_id: 195696981,
            name: "아지트 방이점",
            address: "서울 송파구 오금로11길 7-12",
            url: null,
            x: 127.107727879998,
            y: 37.5148523833966,
            category: "카페",
            local_id: 8,
          },
          {
            location_address: "서울 송파구 올림픽로 300",
            location_url: null,
            kakao_id: 680691609,
            name: "서울스카이",
            x: 127.10254645284908,
            y: 37.5125423170714,
            category: "핫플레이스",
            distance: 10.798324907168762,
            local_id: 9,
          },
          {
            kakao_id: 540607897,
            name: "송리단길",
            address: "",
            url: null,
            x: 127.110416326514,
            y: 37.5093249452576,
            category: "핫플레이스",
            local_id: 10,
          },
          {
            kakao_id: 694224418,
            name: "오십오 브런치&와인카페",
            address: "서울 송파구 송파대로36가길 14",
            url: null,
            x: 127.11521597864466,
            y: 37.50019047833571,
            category: "음식점",
            local_id: 11,
          },
          {
            kakao_id: 884676592,
            name: "오로시에호텔",
            address: "서울 송파구 오금로11길 21-19",
            url: null,
            x: 127.109154381585,
            y: 37.5157385620547,
            category: "숙소",
            local_id: 12,
          },
        ],
        day3: [
          {
            kakao_id: 2032609878,
            name: "시즈널리티",
            address: "서울 영등포구 국제금융로7길 22",
            url: null,
            x: 126.933075433431,
            y: 37.5232438585254,
            category: "음식점",
            local_id: 13,
          },
          {
            kakao_id: 26507544,
            name: "공차 노량진학원가점",
            address: "서울 동작구 노량진로16길 16",
            url: null,
            x: 126.94356316271416,
            y: 37.51280941094916,
            category: "카페",
            local_id: 14,
          },
          {
            location_address: "",
            location_url: null,
            kakao_id: 13121007,
            name: "한강",
            x: 126.947545050571,
            y: 37.5250892160129,
            category: "핫플레이스",
            distance: 11.545109388015776,
            local_id: 15,
          },
          {
            kakao_id: 7970106,
            name: "63전망대",
            address: "서울 영등포구 63로 50",
            url: null,
            x: 126.940254741239,
            y: 37.5198851663406,
            category: "관광 명소",
            local_id: 16,
          },
          {
            kakao_id: 1304008092,
            name: "서울드래곤시티 알라메종와인&다인",
            address: "서울 용산구 청파로20길 95",
            url: null,
            x: 126.96088700115804,
            y: 37.53217085535749,
            category: "음식점",
            local_id: 17,
          },
        ],
      },
    };
  }

  @Post("recommendation")
  @ApiOperation({ summary: "위치 추천" })
  @ApiResponse({
    status: 200,
    description: "위치 추천 성공",
    type: RecommendationResponseDto,
  })
  async getRecommendation(
    @Req() req,
    @Body() recommendationDto: RecommendationDto,
  ): Promise<RecommendationResponseDto> {
    const user = req.user;

    return this.locationService.getRecommendation(user, recommendationDto);
  }

  @Post("recommendation/one")
  @ApiOperation({ summary: "장소 하나에 대한 위치 추천" })
  @ApiResponse({
    status: 201,
    description: "장소 하나에 대한 위치 추천 성공",
    type: LocationResponseDto,
  })
  async getRecommendationOne(
    @Body() recommendationOneDto: RecommendationOneDto,
  ): Promise<LocationResponseDto[]> {
    return this.locationService.getRecommendationOne(recommendationOneDto);
  }
}
