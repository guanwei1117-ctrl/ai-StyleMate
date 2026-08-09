import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '手机号注册' })
  @ApiResponse({ status: 201, description: '返回 JWT token 和 userId' })
  async register(
    @Body() body: { phone: string; password: string; nickname?: string; legacyUserId?: string },
  ) {
    return this.authService.register(body.phone, body.password, body.nickname, body.legacyUserId);
  }

  @Post('login')
  @ApiOperation({ summary: '手机号登录' })
  @ApiResponse({ status: 200, description: '返回 JWT token 和 userId' })
  async login(
    @Body() body: { phone: string; password: string; legacyUserId?: string },
  ) {
    return this.authService.login(body.phone, body.password, body.legacyUserId);
  }
}
