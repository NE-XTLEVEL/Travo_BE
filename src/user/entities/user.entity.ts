import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Plan } from "src/plan/entities/plan.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ name: "email", type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "password", type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({
    name: "refresh_token",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  refresh_token: string;

  @OneToMany(() => Plan, (plan) => plan.user)
  plans: Plan[];

  @BeforeInsert()
  private async hashPassword() {
    // Hash the password before inserting it into the database
    this.password = await bcrypt.hash(this.password, 10);
  }
}
