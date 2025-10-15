import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DfnsService } from './dfns.service';
import { FintecaModule } from './finteca.module';

@Global()
@Module({
  imports: [HttpModule, FintecaModule],
  providers: [DfnsService],
  exports: [DfnsService],
})
export class DfnsModule {}
