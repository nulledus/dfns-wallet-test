import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NetworksService } from '../services/networks.service';
import { NetworksResponseDto, NetworkDto } from '../dto/networks.dto';

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Get()
  getNetworks(): NetworksResponseDto {
    return this.networksService.getNetworks();
  }

  @Get(':id')
  getNetworkById(@Param('id') id: string): NetworkDto {
    const network = this.networksService.getNetworkById(id);

    if (!network) {
      throw new HttpException(
        {
          message: 'Network not found',
          error: `Network with ID '${id}' does not exist`,
          statusCode: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return network;
  }
}
