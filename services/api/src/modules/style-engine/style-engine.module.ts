import { Module, forwardRef } from '@nestjs/common';
import { StyleEngineController } from './style-engine.controller';
import { StyleEngineService } from './style-engine.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [forwardRef(() => MemoryModule)],
  controllers: [StyleEngineController],
  providers: [StyleEngineService],
  exports: [StyleEngineService],
})
export class StyleEngineModule {}
