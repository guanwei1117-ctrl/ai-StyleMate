import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from './roles.guard';
import { User } from '../user/entities/user.entity';
import { Feedback } from '../feedback/feedback.entity';
import { Suggestion } from '../suggestion/suggestion.entity';
import { LlmCallLog } from '../llm/entities/llm-call-log.entity';
import { AuthModule } from '../auth/auth.module';
import { OotdModule } from '../ootd/ootd.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Feedback, Suggestion, LlmCallLog]),
    AuthModule,
    OotdModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
  exports: [AdminService, RolesGuard],
})
export class AdminModule {}
