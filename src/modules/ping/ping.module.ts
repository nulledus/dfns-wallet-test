import { Module } from '@nestjs/common';
import { PingController } from './controllers/ping.controller';
import { PingService } from './services/ping.service';

@Module({
  controllers: [PingController],
  providers: [PingService],
})
export class PingModule {}
