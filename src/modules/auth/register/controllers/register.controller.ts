import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DfnsService } from '@/services/dfns.service';
import {
  RegisterInitDto,
  RegisterInitResponseDto,
  RegisterCompleteDto,
  RegisterCompleteResponseDto,
} from '../dto/register.dto';

@Controller('auth/register')
export class RegisterController {
  constructor(private readonly dfnsService: DfnsService) {}

  @Post('init')
  async registerInit(
    @Body() registerDto: RegisterInitDto,
  ): Promise<RegisterInitResponseDto> {
    try {
      return await this.dfnsService.createDelegatedRegistrationChallenge(
        registerDto.username,
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

  @Post('complete')
  async registerComplete(
    @Body() completeDto: RegisterCompleteDto,
  ): Promise<RegisterCompleteResponseDto> {
    try {
      return await this.dfnsService.completeRegistration(
        completeDto.temporaryAuthenticationToken,
        completeDto.signedChallenge,
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
}
