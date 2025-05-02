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
   * @returns 추천 랜드마크 리스트
   * */
  async recommendLandmark(embedding_vector: number[], take: number) {
    const embedding_string = `[${embedding_vector.join(",")}]`;

    return this.repository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.category", "category")
      .select([
        "location.id AS kakao_id",
        "location.name AS name",
        "location.address",
        "location.url",
        "ST_X(location.coordinates) AS x",
        "ST_Y(location.coordinates) AS y",
        "category.name AS category",
      ])
      .addSelect(`location.review_vector <-> :embedding`, "distance")
      .setParameter("embedding", embedding_string)
      .where("category.id = :category_id", { category_id: 6 })
      .orderBy("distance", "ASC")
      .take(take)
      .getRawMany();
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {number[]} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {Location} landmark 사용자가 선택한 랜드마크
   * @returns 추천 장소 리스트
   * */
  async recommendOtherCategory(embedding_vector: number[], landmark) {
    const embedding_string = `[${embedding_vector.join(",")}]`;

    const filtering_query = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select([
        "location.id AS id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "location.coordinates AS coordinates",
        "location.review_score AS review_score",
        "location.review_vector AS review_vector",
        "category.id AS category_id",
        "category.name AS category_name",
      ])
      .from("locations", "location")
      .where("ST_X(location.coordinates) BETWEEN :x_min AND :x_max")
      .andWhere("ST_Y(location.coordinates) BETWEEN :y_min AND :y_max")
      .andWhere("location.id != :landmark_id")
      .andWhere("(location.review_score IS NULL OR location.review_score >= 3)")
      .andWhere("location.review_vector IS NOT NULL")
      .leftJoin(Category, "category", "location.category_id = category.id")
      .getQuery();

    const sub_query = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select([
        "fq.id AS id",
        "fq.name AS name",
        "fq.address AS address",
        "fq.url AS url",
        "fq.coordinates AS coordinates",
        "fq.review_score AS review_score",
        "fq.category_id AS category_id",
        "fq.category_name AS category_name",
      ])
      .addSelect(
        `ROW_NUMBER() OVER (
          PARTITION BY 
            CASE
              WHEN fq.category_id = 1 THEN '음식점'
              WHEN fq.category_id = 2 THEN '카페'
              WHEN fq.category_id = 3 THEN '숙박'
              ELSE '관광명소'
            END
          ORDER BY fq.review_vector <-> :embedding
        ) AS rn`,
      )
      .from(`(${filtering_query})`, "fq")
      .getQuery();

    return this.dataSource
      .createQueryBuilder()
      .select([
        "sq.id AS kakao_id",
        "sq.name",
        "sq.address",
        "sq.url",
        "ST_X(sq.coordinates) AS x",
        "ST_Y(sq.coordinates) AS y",
        "sq.category_name AS category",
      ])
      .from(`(${sub_query})`, "sq")
      .setParameter("x_min", landmark.x - 0.015)
      .setParameter("x_max", landmark.x + 0.015)
      .setParameter("y_min", landmark.y - 0.02)
      .setParameter("y_max", landmark.y + 0.02)
      .setParameter("landmark_id", landmark.kakao_id)
      .setParameter("embedding", embedding_string)
      .where("(sq.rn <= :restaurant_limit AND sq.category_id = 1)", {
        restaurant_limit: 2,
      })
      .orWhere("(sq.rn <= :cafe_limit AND sq.category_id = 2)", {
        cafe_limit: 1,
      })
      .orWhere("(sq.rn <= :accommodation_limit AND sq.category_id = 3)", {
        accommodation_limit: 1,
      })
      .orWhere("(sq.rn <= :other_limit AND sq.category_id > 3)", {
        other_limit: 1,
      })
      .orderBy("category_id", "ASC")
      .getRawMany();
  }
}
