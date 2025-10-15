import { Controller, Get } from '@nestjs/common';
import { PingService } from '../services/ping.service';
import { PingResponseDto } from '../dto/ping.dto';

@Controller('ping')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get()
  ping(): PingResponseDto {
    return this.pingService.ping();
  }
}
