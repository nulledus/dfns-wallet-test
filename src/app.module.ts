import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { NetworksModule } from './modules/networks/networks.module';
import { PingModule } from './modules/ping/ping.module';
import { WellKnownModule } from './modules/well-known/well-known.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    NetworksModule,
    PingModule,
    WellKnownModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
