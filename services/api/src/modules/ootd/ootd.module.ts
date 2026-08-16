import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OotdController } from './ootd.controller';
import { OotdService } from './ootd.service';
import { OotdPost } from './ootd-post.entity';
import { OotdLike } from './ootd-like.entity';
import { OotdComment } from './ootd-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OotdPost, OotdLike, OotdComment])],
  controllers: [OotdController],
  providers: [OotdService],
  exports: [OotdService],
})
export class OotdModule {}
