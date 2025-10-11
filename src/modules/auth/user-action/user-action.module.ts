import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserActionController } from './controllers/user-action.controller';
import { DfnsService } from '../../../services/dfns.service';

@Module({
  imports: [HttpModule],
  controllers: [UserActionController],
  providers: [DfnsService],
  exports: [DfnsService], // Export if other modules need it
})
export class UserActionModule {}
