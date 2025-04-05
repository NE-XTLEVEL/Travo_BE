import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "src/user/user.repository";
import { SignUpDto } from "./dto/request/signup.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "./dto/request/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const { email } = signUpDto;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("이미 존재하는 이메일입니다.");
    }

    const newUser = await this.userRepository.save(signUpDto);

    return newUser;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);

    if (!user || user.password !== password) {
      throw new ConflictException("이메일 또는 비밀번호가 잘못되었습니다.");
    }

    const access_token = await this.generateAccessToken(user.id);
    const refresh_token = await this.updateRefreshToken(user.id);

    return { access_token, refresh_token };
  }

  async refresh(refresh_token: string) {
    let payload;
    try {
      payload = this.jwtService.verify(refresh_token);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.userRepository.findById(payload.id);

    if (!user || user.refresh_token !== refresh_token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const access_token = await this.generateAccessToken(user.id);
    const new_refresh_token = await this.updateRefreshToken(user.id);

    return { access_token, refresh_token: new_refresh_token };
  }

  private async updateRefreshToken(id: number): Promise<string> {
    // payload에 user id와 type을 담아 refresh token 생성
    const payload = { id, type: "refresh" };

    // refresh token 생성
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRATION"),
    });

    await this.userRepository.update(id, { refresh_token });

    return refresh_token;
  }

  private async generateAccessToken(id: number): Promise<string> {
    const payload = { id, type: "access" };

    // access token 생성
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get("ACCESS_TOKEN_EXPIRATION"),
    });

    return access_token;
  }
}
