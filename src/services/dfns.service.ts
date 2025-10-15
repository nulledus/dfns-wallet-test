import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import {
  RegisterInitResponseDto,
  RegisterCompleteResponseDto,
} from '@/modules/auth/register/dto/register.dto';
import { FintecaService } from './finteca.service';

@Injectable()
export class DfnsService {
  private dfnsClient: DfnsApiClient;
  private readonly baseUrl: string | null | undefined;
  private readonly orgId: string | null | undefined;
  private readonly authToken: string | null | undefined;
  private readonly credId: string | null | undefined;
  private readonly privateKey: string | null | undefined;
  private readonly logger = new Logger(DfnsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly fintecaService: FintecaService,
  ) {
    this.baseUrl = this.configService.get<string>('DFNS_BASE_URL');
    this.orgId = this.configService.get<string>('DFNS_ORG_ID');
    this.authToken = this.configService.get<string>('DFNS_AUTH_TOKEN');
    this.credId = this.configService.get<string>('DFNS_CRED_ID');
    this.privateKey = this.configService.get<string>('DFNS_PRIVATE_KEY');
  }

  async onModuleInit() {
    this.validateConfig();
    await this.initializeDfnsClient();
  }

  private validateConfig(): void {
    if (!this.orgId || !this.authToken || !this.credId || !this.privateKey) {
      const missingVars: string[] = [];
      if (!this.orgId) missingVars.push('DFNS_ORG_ID');
      if (!this.authToken) missingVars.push('DFNS_AUTH_TOKEN');
      if (!this.credId) missingVars.push('DFNS_CRED_ID');
      if (!this.privateKey) missingVars.push('DFNS_PRIVATE_KEY');

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
  }

  private async initializeDfnsClient(): Promise<void> {
    const signer = new AsymmetricKeySigner({
      credId: this.credId!,
      privateKey: this.privateKey!,
    });

    this.dfnsClient = new DfnsApiClient({
      baseUrl: this.baseUrl!,
      orgId: this.orgId!,
      authToken: this.authToken!,
      signer,
    });

    this.logger.log('DfnsService initialized successfully');
  }

  async initRegistration(username: string): Promise<RegisterInitResponseDto> {
    const response =
      await this.dfnsClient.auth.createDelegatedRegistrationChallenge({
        body: { kind: 'EndUser', email: username },
      });

    return response as RegisterInitResponseDto;
  }

  async completeRegistration(
    temporaryAuthenticationToken: string,
    signedChallenge: { firstFactorCredential: any },
  ): Promise<RegisterCompleteResponseDto> {
    // Create a new DFNS client with the temporary authentication token
    const tempClient = new DfnsApiClient({
      baseUrl: this.baseUrl!,
      orgId: this.orgId!,
      authToken: temporaryAuthenticationToken,
    });

    // Complete the registration with wallets
    const registration = await tempClient.auth.registerEndUser({
      body: {
        ...signedChallenge,
        wallets: [{ network: 'EthereumSepolia' }],
      },
    });

    // Extract email from registration.user.name
    // The DFNS API returns name in the user object, but the SDK types don't include it
    // TODO verify
    const email = (registration.user as any).username;

    await this.fintecaService.registerWalletUser(email, registration.user.id);

    // TODO fix
    return {
      ...registration,
      user: {
        ...registration.user,
        name: email,
      },
    } as RegisterCompleteResponseDto;
  }
}
