import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    const client = new DfnsApiClient({
      baseUrl: this.config.baseUrl,
      orgId: this.config.orgId,
      authToken: temporaryAuthenticationToken,
    });

    // Complete the registration
    const registration = await client.auth.registerEndUser({
      body: {
        ...signedChallenge,
        wallets: [{ network: 'EthereumSepolia' }], // TODO: remove, for debug
      },
    });

    await this.fintecaService.registerWalletUser(
      registration.user.username,
      registration.user.id,
    );

    return registration as CompleteRegistrationResponseDto;
  }
}
