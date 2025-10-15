import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DfnsService } from '@/services/dfns.service';
import {
  CreateUserActionSignatureChallengeDto,
  UserActionSignatureChallengeResponseDto,
} from '../dto/user-action.dto';

@Controller('auth/action')
export class UserActionController {
  constructor(private readonly dfnsService: DfnsService) {}

  @Post('init')
  async createUserActionSignatureChallenge(
    @Body() challengeDto: CreateUserActionSignatureChallengeDto,
  ): Promise<UserActionSignatureChallengeResponseDto> {
    try {
      return await this.dfnsService.createUserActionSignatureChallenge(
        challengeDto,
      );
    } catch (error) {
      // Re-throw HttpException from DfnsService
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle unexpected errors
      throw new HttpException(
        {
          message: 'Internal server error',
          error: 'An unexpected error occurred while processing the request',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Placeholder for the complete endpoint
  // @Post('complete')
  // async completeUserActionSignature(
  //   @Body() completeDto: CompleteUserActionSignatureDto,
  // ): Promise<CompleteUserActionSignatureResponseDto> {
  //   // Implementation will be added later
  // }
}
