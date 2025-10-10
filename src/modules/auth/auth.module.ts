import { Module } from '@nestjs/common';
import { UserActionModule } from './user-action/user-action.module';

@Module({
  imports: [UserActionModule],
  exports: [UserActionModule],
})
export class AuthModule {}
