import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserBodyProfile } from './entities/user-body-profile.entity';
import { UserStylePreference } from './entities/user-style-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserBodyProfile, UserStylePreference])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
