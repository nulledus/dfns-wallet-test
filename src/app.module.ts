import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WellKnownModule } from './modules/well-known/well-known.module';
import { PingModule } from './modules/ping/ping.module';
import { AuthModule } from './modules/auth/auth.module';
import { NetworksModule } from './modules/networks/networks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WellKnownModule,
    PingModule,
    AuthModule,
    NetworksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
