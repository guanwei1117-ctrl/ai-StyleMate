import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { WardrobeModule } from './modules/wardrobe/wardrobe.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { StyleEngineModule } from './modules/style-engine/style-engine.module';
import { ScoringModule } from './modules/scoring/scoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    StyleEngineModule,
    ScoringModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
