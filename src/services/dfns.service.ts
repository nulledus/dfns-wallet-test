import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import { firstValueFrom } from 'rxjs';
import {
  RegisterInitResponseDto,
  RegisterCompleteResponseDto,
} from '@/modules/auth/register/dto/register.dto';

@Injectable()
export class DfnsService {
  private readonly dfnsClient: DfnsApiClient;
  private readonly logger = new Logger(DfnsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const baseUrl = this.configService.get<string>(
      'DFNS_BASE_URL',
      'https://api.dfns.io',
    );
    const orgId = this.configService.get<string>('DFNS_ORG_ID');
    const authToken = this.configService.get<string>('DFNS_AUTH_TOKEN');
    const credId = this.configService.get<string>('DFNS_CRED_ID');
    const privateKey = this.configService.get<string>('DFNS_PRIVATE_KEY');

    // Validate required configuration
    if (!orgId || !authToken || !credId || !privateKey) {
      const missingVars: string[] = [];
      if (!orgId) missingVars.push('DFNS_ORG_ID');
      if (!authToken) missingVars.push('DFNS_AUTH_TOKEN');
      if (!credId) missingVars.push('DFNS_CRED_ID');
      if (!privateKey) missingVars.push('DFNS_PRIVATE_KEY');

      const errorMessage = `Missing required Dfns configuration: ${missingVars.join(', ')}. Please set these environment variables.`;
      this.logger.error(errorMessage);
      throw new HttpException(
        {
          message: 'Configuration error',
          error: errorMessage,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Initialize the credential signer
    const signer = new AsymmetricKeySigner({
      credId,
      privateKey,
    });

    // Initialize the Dfns API client
    try {
      this.dfnsClient = new DfnsApiClient({
        baseUrl,
        orgId,
        authToken,
        signer,
      });
      this.logger.log('DfnsService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize DfnsService:', error);
      throw new HttpException(
        {
          message: 'Service initialization error',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initialize Dfns client',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createDelegatedRegistrationChallenge(
    username: string,
  ): Promise<RegisterInitResponseDto> {
    this.logger.log('Creating delegated registration challenge', {
      username,
    });

    try {
      // Use the DfnsApiClient to create delegated registration challenge
      const response =
        await this.dfnsClient.auth.createDelegatedRegistrationChallenge({
          body: { kind: 'EndUser', email: username },
        });

      this.logger.log('Successfully created delegated registration challenge');

      // Return the response
      return response as RegisterInitResponseDto;
    } catch (error) {
      this.logger.error(
        'Error creating delegated registration challenge:',
        error,
      );

      // Handle Dfns API errors
      if (error.response) {
        this.logger.error('Dfns API error response:', {
          status: error.response.status,
          data: error.response.data,
        });
        throw new HttpException(
          {
            message: 'Dfns API error',
            error: error.response.data || error.message,
            statusCode: error.response.status,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Network error
        this.logger.error(
          'Network error when calling Dfns API:',
          error.message,
        );
        throw new HttpException(
          {
            message: 'Network error when calling Dfns API',
            error: error.message || 'Unable to reach Dfns API',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Other error
        this.logger.error('Unexpected error:', error);
        throw new HttpException(
          {
            message: 'Internal server error',
            error:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async completeRegistration(
    temporaryAuthenticationToken: string,
    signedChallenge: { firstFactorCredential: any },
  ): Promise<RegisterCompleteResponseDto> {
    this.logger.log('Completing delegated registration');

    try {
      const baseUrl = this.configService.get<string>(
        'DFNS_BASE_URL',
        this.configService.get<string>(
          'DFNS_API_URL',
          'https://api.dfns.ninja',
        ),
      );
      const orgId = this.configService.get<string>('DFNS_ORG_ID');

      // Create a new DFNS client with the temporary authentication token
      const tempClient = new DfnsApiClient({
        baseUrl,
        orgId,
        authToken: temporaryAuthenticationToken,
      });

      // Complete the registration with wallets
      const registration = await tempClient.auth.registerEndUser({
        body: {
          ...signedChallenge,
          wallets: [{ network: 'EthereumSepolia' }],
        },
      });

      this.logger.log('Successfully completed delegated registration');

      // Extract email from registration.user.name
      // The DFNS API returns name in the user object, but the SDK types don't include it
      const email = (registration.user as any).username;

      if (!email) {
        this.logger.warn('No email found in registration.user.name');
      } else {
        // Call FINTECA API to register the wallet user with extracted email
        await this.registerWalletUserInFinteca(email, registration.user.id);
      }

      // Return the response with the name property included
      return {
        ...registration,
        user: {
          ...registration.user,
          name: email,
        },
      } as RegisterCompleteResponseDto;
    } catch (error) {
      this.logger.error('Error completing delegated registration:', error);

      // Handle Dfns API errors
      if (error.response) {
        this.logger.error('Dfns API error response:', {
          status: error.response.status,
          data: error.response.data,
        });
        throw new HttpException(
          {
            message: 'Dfns API error',
            error: error.response.data || error.message,
            statusCode: error.response.status,
          },
          error.response.status,
        );
      } else if (error.request) {
        // Network error
        this.logger.error(
          'Network error when calling Dfns API:',
          error.message,
        );
        throw new HttpException(
          {
            message: 'Network error when calling Dfns API',
            error: error.message || 'Unable to reach Dfns API',
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Other error
        this.logger.error('Unexpected error:', error);
        throw new HttpException(
          {
            message: 'Internal server error',
            error:
              error instanceof Error
                ? error.message
                : 'An unexpected error occurred',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private async registerWalletUserInFinteca(
    email: string,
    walletUserId: string,
  ): Promise<void> {
    this.logger.log('Registering wallet user in FINTECA', {
      email,
      walletUserId,
    });

    try {
      const fintecaBaseUrl = this.configService.get<string>(
        'FINTECA_BASE_API_URL',
      );

      if (!fintecaBaseUrl) {
        this.logger.warn(
          'FINTECA_BASE_API_URL not configured, skipping FINTECA registration',
        );
        return;
      }

      const url = `${fintecaBaseUrl}/wallet/dfns/user-id`;
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

      // Optionally, you can choose to throw if FINTECA registration is critical
      // For now, we'll just log and continue
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
}
