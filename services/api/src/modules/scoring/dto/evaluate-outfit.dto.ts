import { IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserContextDto {
  @ApiPropertyOptional({ description: '体型', example: 'pear' })
  @IsOptional()
  @IsString()
  bodyShape?: string;

  @ApiPropertyOptional({ description: '性别', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: '身高 cm', example: 175 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: '体重 kg', example: 65 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: '场合', example: 'daily_commute' })
  @IsOptional()
  @IsString()
  occasion?: string;
}

export class EvaluateOutfitRequestDto {
  @ApiProperty({ description: '穿搭照片 base64 编码', example: 'data:image/jpeg;base64,...' })
  @IsString()
  imageBase64: string;

  @ApiProperty({ description: '博主 ID', example: 'yuzai-buhetang' })
  @IsString()
  bloggerId: string;

  @ApiPropertyOptional({ description: '用户上下文信息' })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserContextDto)
  userContext?: UserContextDto;
}
