import { Module } from '@nestjs/common';
import { StyleEngineController } from './style-engine.controller';
import { StyleEngineService } from './style-engine.service';

@Module({
  controllers: [StyleEngineController],
  providers: [StyleEngineService],
  exports: [StyleEngineService],
})
export class StyleEngineModule {}
