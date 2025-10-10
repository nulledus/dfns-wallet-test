import { Module } from '@nestjs/common';
import { UserActionModule } from './user-action/user-action.module';
import { RegisterModule } from './register/register.module';

@Module({
  imports: [UserActionModule, RegisterModule],
  exports: [UserActionModule, RegisterModule],
})
export class AuthModule {}
