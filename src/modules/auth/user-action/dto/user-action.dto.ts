import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum ServerKind {
  API = 'Api',
  STAFF = 'Staff',
}

export class CreateUserActionSignatureChallengeDto {
  @IsString()
  userActionPayload: string;

  @IsEnum(HttpMethod)
  userActionHttpMethod: HttpMethod;

  @IsString()
  userActionHttpPath: string;

  @IsOptional()
  @IsEnum(ServerKind)
  userActionServerKind?: ServerKind;
}

export class SupportedCredentialKind {
  kind: string;
  factor: string;
  requiresSecondFactor: boolean;
}

export class Credential {
  type: string;
  id: string;
  encryptedPrivateKey?: string;
  transports?: string;
}

export class AllowCredentials {
  key: Credential[];
  passwordProtectedKey: Credential[];
  webauthn: Credential[];
}

export class UserActionSignatureChallengeResponseDto {
  supportedCredentialKinds: SupportedCredentialKind[];
  challenge: string;
  challengeIdentifier: string;
  externalAuthenticationUrl?: string;
  allowCredentials: AllowCredentials;
}

// Placeholder for complete action DTOs
// export class CompleteUserActionSignatureDto {
//   @IsString()
//   challengeIdentifier: string;
//
//   @IsString()
//   signature: string;
//
//   // Add other fields as needed
// }
//
// export class CompleteUserActionSignatureResponseDto {
//   // Define response structure
// }
