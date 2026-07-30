import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StyleCandidateDto {
  @ApiProperty({ description: '风格 ID', example: 'fr_effortless' })
  @IsString()
  styleId: string;

  @ApiProperty({ description: '风格名称', example: '法式松弛风' })
  @IsString()
  styleName: string;

  @ApiProperty({ description: '风格分类', example: '法式' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '本地规则分数', example: 82 })
  @IsOptional()
  @IsNumber()
  localScore?: number;

  @ApiPropertyOptional({ description: '风格描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '关键单品' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyItems?: string[];

  @ApiPropertyOptional({ description: '推荐理由' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matchReasons?: string[];

  @ApiPropertyOptional({ description: '风格维度' })
  @IsOptional()
  @IsString()
  dimension?: string;

  @ApiPropertyOptional({ description: '风格维度标签（中文）' })
  @IsOptional()
  @IsString()
  dimensionLabel?: string;

  @ApiPropertyOptional({ description: '三支柱分' })
  @IsOptional()
  @IsObject()
  pillars?: Record<string, unknown>;

  @ApiPropertyOptional({ description: '匹配分项明细' })
  @IsOptional()
  @IsObject()
  breakdown?: Record<string, unknown>;

  @ApiPropertyOptional({ description: '风格理念' })
  @IsOptional()
  @IsString()
  philosophy?: string;

  @ApiPropertyOptional({ description: '风格难度' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ description: '廓形' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  silhouette?: string[];

  @ApiPropertyOptional({ description: '配色' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colorPalette?: string[];
}

export class StyleProfileInputDto {
  @ApiPropertyOptional({ description: '性别表达' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: '年龄段' })
  @IsOptional()
  @IsString()
  ageGroup?: string;

  @ApiPropertyOptional({ description: '身高 cm' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: '体重 kg' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: '胸围 cm' })
  @IsOptional()
  @IsNumber()
  bust?: number;

  @ApiPropertyOptional({ description: '腰围 cm' })
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiPropertyOptional({ description: '臀围 cm' })
  @IsOptional()
  @IsNumber()
  hip?: number;

  @ApiPropertyOptional({ description: '本地推导体型' })
  @IsOptional()
  @IsString()
  bodyShape?: string;

  @ApiPropertyOptional({ description: '日常场景/职业' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: '日常穿搭场景（多选，value 数组）' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dailyScenes?: string[];

  @ApiPropertyOptional({ description: '自定义场景补充' })
  @IsOptional()
  @IsString()
  customScene?: string;

  @ApiPropertyOptional({ description: '日常场景标签（中文）' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sceneLabels?: string[];

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '气候' })
  @IsOptional()
  @IsString()
  climate?: string;

  @ApiPropertyOptional({ description: '预算' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ description: '穿衣目标（多选）' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dressingGoals?: string[];

  @ApiPropertyOptional({ description: '穿衣优先级维度排序' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorities?: string[];

  @ApiPropertyOptional({ description: '风格接受度档位 1-5' })
  @IsOptional()
  @IsNumber()
  styleOpenness?: number;

  @ApiPropertyOptional({ description: '偏好风格 ID 列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredStyleIds?: string[];

  @ApiPropertyOptional({ description: '用户自述' })
  @IsOptional()
  @IsString()
  userStatement?: string;

  @ApiPropertyOptional({ description: '是否有正脸照' })
  @IsOptional()
  @IsBoolean()
  hasFacePhoto?: boolean;

  @ApiPropertyOptional({ description: '是否有全身照' })
  @IsOptional()
  @IsBoolean()
  hasFullBodyPhoto?: boolean;

  @ApiPropertyOptional({ description: '本地已提取意图' })
  @IsOptional()
  @IsObject()
  extractedIntent?: Record<string, unknown>;
}

export class AnalyzeStyleProfileRequestDto {
  @ApiProperty({ description: '基础画像、自述和偏好输入' })
  @ValidateNested()
  @Type(() => StyleProfileInputDto)
  profile: StyleProfileInputDto;

  @ApiProperty({ description: '本地规则初筛候选风格', type: [StyleCandidateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StyleCandidateDto)
  candidates: StyleCandidateDto[];

  @ApiPropertyOptional({ description: '正脸照 base64 或 data URI' })
  @IsOptional()
  @IsString()
  faceImageBase64?: string;

  @ApiPropertyOptional({ description: '全身照 base64 或 data URI' })
  @IsOptional()
  @IsString()
  fullBodyImageBase64?: string;

  @ApiPropertyOptional({ description: '博主语言风格 ID（选填，影响分析报告的语言风格）' })
  @IsOptional()
  @IsString()
  bloggerId?: string;
}
