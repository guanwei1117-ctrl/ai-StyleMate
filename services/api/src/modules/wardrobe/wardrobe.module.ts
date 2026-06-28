import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WardrobeController } from './wardrobe.controller';
import { WardrobeService } from './wardrobe.service';
import { WardrobeItem } from './entities/wardrobe-item.entity';
import { Outfit } from './entities/outfit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WardrobeItem, Outfit])],
  controllers: [WardrobeController],
  providers: [WardrobeService],
  exports: [WardrobeService],
})
export class WardrobeModule {}
