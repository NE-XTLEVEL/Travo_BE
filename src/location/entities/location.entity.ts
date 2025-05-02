import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { Event } from "src/plan/entities/event.entity";

@Entity({ name: "locations" })
export class Location {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "address", type: "varchar", length: 255, nullable: false })
  address: string;

  @Column({ name: "url", type: "varchar", length: 255, nullable: true })
  url: string;

  // @Column({ name: "is_hotspot", type: "boolean", default: false })
  // is_hotspot: boolean;

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

  @OneToMany(() => Event, (event) => event.location, {
    nullable: false,
  })
  events: Event[];
}
