import { Module } from '@nestjs/common';
import { RegisterController } from './controllers/register.controller';
import { DfnsService } from '../../../services/dfns.service';

@Module({
  controllers: [RegisterController],
  providers: [DfnsService],
})
export class RegisterModule {}
