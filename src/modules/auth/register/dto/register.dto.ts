import { IsString, IsEmail } from 'class-validator';

export class RegisterInitDto {
  @IsEmail()
  @IsString()
  username: string;
}

export class RegisterInitResponseDto {
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
