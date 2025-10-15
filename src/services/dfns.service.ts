import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { DfnsApiClient } from '@dfns/sdk';
import { AsymmetricKeySigner } from '@dfns/sdk-keysigner';
import {
  InitRegistrationResponseDto,
  CompleteRegistrationResponseDto,
} from '@/modules/auth/register/dto/register.dto';
import { FintecaService } from './finteca.service';
import { DfnsConfig } from '@/config/dfns.config';

@Injectable()
export class DfnsService {
  private dfnsClient: DfnsApiClient;
  private readonly config: DfnsConfig;
  private readonly logger = new Logger(DfnsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly fintecaService: FintecaService,
  ) {
    this.config = this.configService.get<DfnsConfig>('dfns')!;
  }

  async onModuleInit() {
    await this.initializeDfnsClient();
  }

  private async initializeDfnsClient(): Promise<void> {
    const signer = new AsymmetricKeySigner({
      credId: this.config.credId,
      privateKey: this.config.privateKey,
    });

    this.dfnsClient = new DfnsApiClient({
      baseUrl: this.config.baseUrl,
      orgId: this.config.orgId,
      authToken: this.config.authToken,
      signer,
    });

    this.logger.log('DfnsService initialized successfully');
  }

  async initRegistration(
    username: string,
  ): Promise<InitRegistrationResponseDto> {
    const response =
      await this.dfnsClient.auth.createDelegatedRegistrationChallenge({
        body: { kind: 'EndUser', email: username },
      });

    return response as InitRegistrationResponseDto;
  }

  async completeRegistration(
    temporaryAuthenticationToken: string,
    signedChallenge: { firstFactorCredential: any },
  ): Promise<CompleteRegistrationResponseDto> {
    // Create a new DFNS client with the temporary authentication token
    const tempClient = new DfnsApiClient({
      baseUrl: this.config.baseUrl,
      orgId: this.config.orgId,
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
    } as CompleteRegistrationResponseDto;
  }
}
