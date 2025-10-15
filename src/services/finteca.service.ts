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

    if (!this.fintecaBaseUrl) {
      this.logger.warn(
        'FINTECA_BASE_API_URL not configured. Finteca integration will be disabled.',
      );
    } else {
      this.logger.log('FintecaService initialized successfully');
    }
  }

  async registerWalletUser(email: string, walletUserId: string): Promise<void> {
    this.logger.log('Registering wallet user in FINTECA', {
      email,
      walletUserId,
    });

    if (!this.fintecaBaseUrl) {
      this.logger.warn(
        'FINTECA_BASE_API_URL not configured, skipping FINTECA registration',
      );
      return;
    }

    try {
      const url = `${this.fintecaBaseUrl}/wallet/dfns/user-id`;
      const payload = {
        email: email,
        wallet_user_id: walletUserId,
      };

      this.logger.debug('Calling FINTECA API', { url, payload });

      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );

      this.logger.log('Successfully registered wallet user in FINTECA', {
        status: response.status,
        data: response.data,
      });
    } catch (error) {
      this.logger.error('Error registering wallet user in FINTECA:', error);

      // Log the error but don't throw it - we don't want FINTECA failures to break registration
      if (error.response) {
        this.logger.error('FINTECA API error response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      // Throw error if FINTECA registration fails
      throw new HttpException(
        {
          message: 'Failed to register wallet user in FINTECA',
          error:
            error.response?.data || error.message || 'Unknown error occurred',
          statusCode:
            error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if Finteca integration is enabled
   */
  isEnabled(): boolean {
    return !!this.fintecaBaseUrl;
  }
}
