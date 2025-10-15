import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FintecaService } from './finteca.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [FintecaService],
  exports: [FintecaService],
})
export class FintecaModule {}
