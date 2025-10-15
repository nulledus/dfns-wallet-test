import { IsString, IsEmail, IsObject, IsOptional } from 'class-validator';

export class RegisterInitDto {
  @IsEmail()
  @IsString()
  username: string;
}

export class InitRegistrationResponseDto {
  temporaryAuthenticationToken: string;
  challenge: string;
  rp?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams?: Array<{
    alg: number;
    type: string;
  }>;
  excludeCredentials?: any[];
  authenticatorSelection?: {
    residentKey: string;
    userVerification: string;
    requireResidentKey: boolean;
  };
}

export class RegisterCompleteDto {
  @IsObject()
  signedChallenge: {
    firstFactorCredential: any;
  };

  @IsString()
  temporaryAuthenticationToken: string;
}

export class WalletDto {
  id: string;
  network: string;
  status: string;
  name?: string;
  address?: string;
  dateCreated: string;
  imported?: boolean;
  exported?: boolean;
  dateExported?: string;
  externalId?: string;
  tags?: string[];
  custodial?: boolean;
}

export class RegisterCompleteResponseDto {
  user: {
    id: string;
    username: string;
    name?: string;
    orgId: string;
    permissions?: any[];
  };
  wallets?: WalletDto[];
}
