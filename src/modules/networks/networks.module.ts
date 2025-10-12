import { Module } from '@nestjs/common';
import { NetworksController } from './controllers/networks.controller';
import { NetworksService } from './services/networks.service';

@Module({
  controllers: [NetworksController],
  providers: [NetworksService],
  exports: [NetworksService], // Export in case other modules need to use it
})
export class NetworksModule {}
