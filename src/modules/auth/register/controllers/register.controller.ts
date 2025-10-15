import { Controller, Post, Body } from '@nestjs/common';
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
    return await this.dfnsService.initRegistration(registerDto.username);
  }

  @Post('complete')
  async registerComplete(
    @Body() completeDto: RegisterCompleteDto,
  ): Promise<RegisterCompleteResponseDto> {
    return await this.dfnsService.completeRegistration(
      completeDto.temporaryAuthenticationToken,
      completeDto.signedChallenge,
    );
  }
}
