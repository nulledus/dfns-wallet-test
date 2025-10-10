import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import {
  CreateUserActionSignatureChallengeDto,
  UserActionSignatureChallengeResponseDto,
} from '../modules/auth/user-action/dto/user-action.dto';

@Injectable()
export class DfnsService {
  private readonly dfnsClient: DfnsApiClient;
  private readonly logger = new Logger(DfnsService.name);

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.get<string>(
      'DFNS_BASE_URL',
      this.configService.get<string>('DFNS_API_URL', 'https://api.dfns.ninja'),
    );
    const orgId = this.configService.get<string>('DFNS_ORG_ID');
    const authToken = this.configService.get<string>('DFNS_AUTH_TOKEN');
    const credId = this.configService.get<string>('DFNS_CRED_ID');
    const privateKey = this.configService.get<string>('DFNS_PRIVATE_KEY');

    // Debug logging to help troubleshoot environment variables
    this.logger.debug('DFNS Configuration loaded:', {
      baseUrl,
      orgId: orgId ? `${orgId.substring(0, 10)}...` : 'NOT_SET',
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'NOT_SET',
      credId: credId ? `${credId.substring(0, 10)}...` : 'NOT_SET',
      privateKey: privateKey ? 'SET' : 'NOT_SET',
    });

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

  async createUserActionSignatureChallenge(
    challengeDto: CreateUserActionSignatureChallengeDto,
  ): Promise<UserActionSignatureChallengeResponseDto> {
    this.logger.log('Creating user action signature challenge', {
      challengeDto,
    });

    try {
      // Use the DfnsApiClient to create user action signature challenge
      const response =
        await this.dfnsClient.auth.createUserActionSignatureChallenge({
          body: challengeDto,
        });

      this.logger.log('Successfully created user action signature challenge');

      // Transform the response to match our DTO structure
      return {
        supportedCredentialKinds: response.supportedCredentialKinds || [],
        challenge: response.challenge,
        challengeIdentifier: response.challengeIdentifier,
        externalAuthenticationUrl: response.externalAuthenticationUrl,
        allowCredentials: {
          key: response.allowCredentials?.key || [],
          passwordProtectedKey:
            response.allowCredentials?.passwordProtectedKey || [],
          webauthn: response.allowCredentials?.webauthn || [],
        },
      };
    } catch (error) {
      this.logger.error(
        'Error creating user action signature challenge:',
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
}
