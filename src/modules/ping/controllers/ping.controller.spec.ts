import { Test, TestingModule } from '@nestjs/testing';
import { PingController } from './ping.controller';
import { PingService } from '../services/ping.service';
import { PingResponseDto } from '../dto/ping.dto';

describe('PingController', () => {
  let controller: PingController;
  let service: PingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [PingService],
    }).compile();

    controller = module.get<PingController>(PingController);
    service = module.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ping', () => {
    it('should return pong message, server time, and environment', () => {
      const result: PingResponseDto = controller.ping();

      expect(result).toBeDefined();
      expect(result.message).toBe('pong');
      expect(result.time).toBeDefined();
      expect(result.environment).toBeDefined();
      expect(typeof result.time).toBe('string');
      expect(typeof result.environment).toBe('string');
    });

    it('should return a valid ISO date string for time', () => {
      const result: PingResponseDto = controller.ping();
      const date = new Date(result.time);

      expect(date.toISOString()).toBe(result.time);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it('should call pingService.ping', () => {
      const pingServiceSpy = jest.spyOn(service, 'ping');

      controller.ping();

      expect(pingServiceSpy).toHaveBeenCalled();
    });

    it('should return environment as development when NODE_ENV is not set', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const result: PingResponseDto = controller.ping();

      expect(result.environment).toBe('development');

      // Restore original environment
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
