import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Location } from "./entities/location.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LocationRepository extends Repository<Location> {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {
    super(repository.target, repository.manager);
  }

  async recommendPlace(embedding_vector: number[]): Promise<Location[]> {
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
      .orderBy("distance", "ASC")
      .take(20)
      .getMany();
  }
}
