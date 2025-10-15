import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DfnsService } from './dfns.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [DfnsService],
  exports: [DfnsService],
})
export class DfnsModule {}
