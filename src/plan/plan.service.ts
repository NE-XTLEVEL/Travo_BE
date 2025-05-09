import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PlanRepository } from "./plan.repository";
import { RecommendationResponseDto } from "src/location/dto/response/recommendation.response.dto";
import { DataSource } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { Event } from "./entities/event.entity";
import { PlanResponseDto } from "./dto/response/plan.response.dto";

@Injectable()
export class PlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 계획 저장
   * @param {number} user_id 사용자 id
   * @param {RecommendationResponseDto} recommendationResponseDto 추천 장소 리스트
   * @param {string} plan_name 계획 이름
   */
  async createPlan(
    user_id: number,
    recommendationResponseDto: RecommendationResponseDto,
    plan_name: string,
  ) {
    const { data } = recommendationResponseDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const plan: Plan = await queryRunner.manager.save(Plan, {
        user: { id: user_id },
        name: plan_name,
      });
      for (let i = 1; i <= Object.keys(data).length; i++) {
        for (const location of data[`day${i}`]) {
          await queryRunner.manager.save(Event, {
            plan: { id: plan.id },
            location: { id: location.kakao_id },
            day: i,
            local_id: location.local_id,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error("Error creating plan:", error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Database error");
    } finally {
      await queryRunner.release();
    }
  }

  async getPlans(user_id: number, cursor: number): Promise<PlanResponseDto[]> {
    const result = await this.planRepository.getPlans(user_id, cursor);

    if (!result) {
      throw new NotFoundException("Plan not found");
    }

    return result.map((plan) => {
      return PlanResponseDto.of(plan);
    });
  }

  /**
   * 계획 조회
   * @param {number} user_id 사용자 id
   * @returns {Plan[]} 계획 리스트
   */
  async getPlan(
    user_id: number,
    plan_id: number,
  ): Promise<RecommendationResponseDto> {
    const result = await this.planRepository.getPlan(user_id, plan_id);

    if (!result) {
      throw new NotFoundException("Plan not found");
    }

    return RecommendationResponseDto.of(result.events);
  }
}
