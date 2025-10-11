import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RegisterController } from './controllers/register.controller';
import { DfnsService } from '../../../services/dfns.service';

@Module({
  imports: [HttpModule],
  controllers: [RegisterController],
  providers: [DfnsService],
})
export class RegisterModule {}
