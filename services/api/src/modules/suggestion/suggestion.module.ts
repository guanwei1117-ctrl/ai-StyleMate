import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suggestion } from './suggestion.entity';
import { SuggestionService } from './suggestion.service';
import { SuggestionController } from './suggestion.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Suggestion]), AuthModule],
  controllers: [SuggestionController],
  providers: [SuggestionService],
  exports: [SuggestionService],
})
export class SuggestionModule {}
