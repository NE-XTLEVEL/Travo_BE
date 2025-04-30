import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Location } from "./entities/location.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";

@Injectable()
export class LocationRepository extends Repository<Location> {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
    private readonly dataSource: DataSource,
  ) {
    super(repository.target, repository.manager);
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {number[]} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {number} take 추천할 장소 개수
   * @returns 추천 장소 리스트
   * */
  async recommendLandmark(
    embedding_vector: number[],
    take: number,
  ): Promise<Location[]> {
    const embedding_string = `[${embedding_vector.join(",")}]`;

    return this.repository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.category", "category")
      .select([
        "location.id",
        "location.name",
        "location.address",
        "location.url",
        "location.coordinates",
        "location.review_score",
        "category.id",
        "category.name",
      ])
      .addSelect(`location.review_vector <-> :embedding`, "distance")
      .setParameter("embedding", embedding_string)
      .where("category.id = :category_id", { category_id: 6 })
      .orderBy("distance", "ASC")
      .take(take)
      .getMany();
  }

  async recommendOtherCategory(embedding_vector: number[]) {
    const embedding_string = `[${embedding_vector.join(",")}]`;

    const sub_query = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select([
        "location.id AS id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "location.coordinates AS coordinates",
        "location.review_score AS review_score",
        "category.id AS category_id",
        "category.name AS category_name",
      ])
      .addSelect(
        `ROW_NUMBER() OVER (
          PARTITION BY 
            CASE
              WHEN category.id = 1 THEN '음식점'
              WHEN category.id = 2 THEN '카페'
              WHEN category.id = 3 THEN '숙박'
              ELSE '관광명소'
            END
          ORDER BY location.review_vector <-> :embedding
        ) AS rn`,
      )
      .from("locations", "location")
      .leftJoin(Category, "category", "location.category_id = category.id")
      .getQuery();

    return this.dataSource
      .createQueryBuilder()
      .select([
        "sq.id",
        "sq.name",
        "sq.address",
        "sq.url",
        "sq.coordinates",
        "sq.review_score",
        "sq.category_id",
        "sq.category_name",
      ])
      .from(`(${sub_query})`, "sq")
      .setParameter("embedding", embedding_string)
      .where("sq.rn <= :limit", { limit: 3 })
      .getRawMany();
  }
}
