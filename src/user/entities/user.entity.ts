import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from "bcrypt";

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

  @BeforeInsert()
  private async hashPassword() {
    // Hash the password before inserting it into the database
    this.password = await bcrypt.hash(this.password, 10);
  }
}
