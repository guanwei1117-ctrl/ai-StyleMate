import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('用户管理')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  create(@Body() body: { id?: string; nickname?: string; phone?: string }) {
    return this.userService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户信息' })
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: '获取用户完整画像' })
  getProfile(@Param('id') id: string) {
    return this.userService.getUserProfile(id);
  }

  @Put(':id/body-profile')
  @ApiOperation({ summary: '更新体型数据' })
  updateBodyProfile(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.userService.updateBodyProfile(id, body);
  }

  @Put(':id/style-preferences')
  @ApiOperation({ summary: '更新风格偏好' })
  updateStylePreferences(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.userService.updateStylePreferences(id, body);
  }
}
