import { Module } from '@nestjs/common';
import { UserActionController } from './controllers/user-action.controller';
import { DfnsService } from '../../../services/dfns.service';

@Module({
  controllers: [UserActionController],
  providers: [DfnsService],
  exports: [DfnsService], // Export if other modules need it
})
export class UserActionModule {}
