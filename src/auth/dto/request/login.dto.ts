import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "example@email.com",
    description: "The email of the user",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "123456",
    description: "The password of the user",
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
