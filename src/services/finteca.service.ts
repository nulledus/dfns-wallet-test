import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FintecaService {
  private readonly logger = new Logger(FintecaService.name);
  private readonly fintecaBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.fintecaBaseUrl = this.configService.get<string>(
      'FINTECA_BASE_API_URL',
      '',
    );
  }

  async registerWalletUser(email: string, walletUserId: string): Promise<void> {
    this.logger.log('Registering wallet user in finteca', {
      email,
      walletUserId,
    });

    const url = `${this.fintecaBaseUrl}/wallet/dfns/user-id`;
    const payload = {
      email: email,
      wallet_user_id: walletUserId,
    };

    this.logger.debug('Calling finteca API', { url, payload });

    const response = await firstValueFrom(this.httpService.post(url, payload));

    this.logger.log('Successfully registered wallet user in finteca', {
      status: response.status,
      data: response.data,
    });
  }
}
