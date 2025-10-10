import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserActionSigningController } from './controllers/user-action-signing.controller';
import { DfnsService } from './services/dfns.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, UserActionSigningController],
  providers: [AppService, DfnsService],
})
export class AppModule {}
