import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DfnsModule } from './services/dfns.module';
import { FintecaModule } from './services/finteca.module';
import { WellKnownModule } from './modules/well-known/well-known.module';
import { PingModule } from './modules/ping/ping.module';
import { AuthModule } from './modules/auth/auth.module';
import { NetworksModule } from './modules/networks/networks.module';
import dfnsConfig from './config/dfns.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dfnsConfig],
    }),
    FintecaModule,
    DfnsModule,
    WellKnownModule,
    PingModule,
    AuthModule,
    NetworksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
