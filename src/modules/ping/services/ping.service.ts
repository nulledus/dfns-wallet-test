import { Injectable } from '@nestjs/common';
import { PingResponseDto } from '../dto/ping.dto';

@Injectable()
export class PingService {
  ping(): PingResponseDto {
    return {
      message: 'pong',
      time: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
