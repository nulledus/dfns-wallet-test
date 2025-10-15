import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';

@Module({
  imports: [RegisterModule],
  exports: [RegisterModule],
})
export class AuthModule {}
