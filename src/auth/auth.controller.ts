import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/request/signup.dto";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guard/jwt.guard";
import { Request, Response } from "express";
import { LoginDto } from "./dto/request/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "회원가입" })
  signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post("login")
  @ApiOperation({ summary: "로그인" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.login(loginDto);

    console.log("access_token", access_token);
    // res.cookie("refresh_token", refresh_token);

    return { access_token };
  }

  @Post("logout")
  @ApiOperation({
    summary: "로그아웃",
    description: "access token, refresh token 삭제",
  })
  @ApiBearerAuth("token")
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    // refresh token 쿠키 삭제
    res.clearCookie("refresh_token", { domain: "localhost" });
    return { message: "logout success" };
  }

  @Post("refresh")
  @ApiOperation({
    summary: "access token 재발급",
    description: "refresh token으로 access token 재발급",
  })
  @ApiBearerAuth("token")
  @UseGuards(JwtAuthGuard)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.refresh(
      req.cookies["refresh_token"],
    );

    res.cookie("refresh_token", refresh_token);

    return { access_token };
  }
}
