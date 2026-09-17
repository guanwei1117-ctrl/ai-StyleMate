import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { StyleEngineModule } from './modules/style-engine/style-engine.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { ShoppingModule } from './modules/shopping/shopping.module';

// 仅在 PostgreSQL 可用时加载数据库相关模块
// Phase 1 起默认启用数据库持久化（设置环境变量 ENABLE_DB=false 可显式关闭）
const dbEnabled = process.env.ENABLE_DB !== 'false';
const dbModules: any[] = [];
if (dbEnabled) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { UserModule } = require('./modules/user/user.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WardrobeModule } = require('./modules/wardrobe/wardrobe.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { RecommendationModule } = require('./modules/recommendation/recommendation.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { FeedbackModule } = require('./modules/feedback/feedback.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MemoryModule } = require('./modules/memory/memory.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AuthModule } = require('./modules/auth/auth.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SyncModule } = require('./modules/sync/sync.module');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { OotdModule } = require('./modules/ootd/ootd.module');
  const { AdminModule } = require('./modules/admin/admin.module');
  // 用户建议（管理端列表 + 公开提交）：admin/suggestions + /suggestions
  const { SuggestionModule } = require('./modules/suggestion/suggestion.module');
  // RAG 知识库：依赖 TypeOrm（KnowledgeDocument/KnowledgeChunk），仅在 DB 启用时加载
  const { RagModule } = require('./modules/rag/rag.module');

  dbModules.push(
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'stylemate'),
        password: config.get<string>('DB_PASSWORD', 'stylemate'),
        database: config.get<string>('DB_NAME', 'stylemate'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UserModule,
    WardrobeModule,
    RecommendationModule,
    FeedbackModule,
    MemoryModule,
    AuthModule,
    SyncModule,
    OotdModule,
    AdminModule,
    SuggestionModule,
    RagModule,
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ...dbModules,
    StyleEngineModule,
    ScoringModule,
    // �