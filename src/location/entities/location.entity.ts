import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Point,
  PrimaryColumn,
} from "typeorm";
import { Category } from "./category.entity";

@Entity({ name: "locations" })
export class Location {
  @PrimaryColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "address", type: "varchar", length: 255, nullable: false })
  address: string;

  @Column({ name: "url", type: "varchar", length: 255, nullable: true })
  url: string;

  @Column({ type: "geometry", spatialFeatureType: "Point", srid: 4326 })
  @Index("location_coordinates_idx", { spatial: true })
  coordinates: Point;

  @Column({ name: "review_score", type: "real", nullable: true })
  review_score: number;

  @Column("vector")
  review_vector: number[];

  @ManyToOne(() => Category, (category) => category.locations, {
    nullable: false,
  })
  @JoinColumn({ name: "category_id" })
  category: Category;
}
