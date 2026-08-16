import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { GarmentRecognitionSkill } from './garment-recognition/garment-recognition.skill';
import { StructuredOutfitSkill } from './structured-outfit/structured-outfit.skill';
import { OutfitRecommendationSkill } from './outfit-recommendation/outfit-recommendation.skill';
import { PurchaseEvaluationSkill } from './purchase-evaluation/purchase-evaluation.skill';
import { ItemStylingSkill } from './item-styling/item-styling.skill';
import { WardrobeGapSkill } from './wardrobe-gap/wardrobe-gap.skill';
import { StyleChatSkill } from './style-chat/style-chat.skill';

/**
 * AI Skills 共享模块
 *
 * 汇总所有独立 AI 能力 skill，供 scoring / wardrobe / recommendation 等业务模块复用。
 * 每个 skill 只负责调用 LLM 并解析结果，不涉及数据库持久化。
 */
@Module({
  imports: [LlmModule],
  providers: [
    GarmentRecognitionSkill,
    StructuredOutfitSkill,
    OutfitRecommendationSkill,
    PurchaseEvaluationSkill,
    ItemStylingSkill,
    WardrobeGapSkill,
    StyleChatSkill,
  ],
  exports: [
    GarmentRecognitionSkill,
    StructuredOutfitSkill,
    OutfitRecommendationSkill,
    PurchaseEvaluationSkill,
    ItemStylingSkill,
    WardrobeGapSkill,
    StyleChatSkill,
  ],
})
export class AiSkillsModule {}
