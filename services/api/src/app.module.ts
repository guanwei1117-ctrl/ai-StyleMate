import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { StyleEngineModule } from './modules/style-engine/style-engine.module';
import { ScoringModule } from './modules/scoring/scoring.module';

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

  dbModules.push(
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'stylemate',
      password: process.env.DB_PASSWORD || 'stylemate',
      database: process.env.DB_NAME || 'stylemate',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UserModule,
    WardrobeModule,
    RecommendationModule,
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    ...dbModules,
    StyleEngineModule,
    ScoringModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
