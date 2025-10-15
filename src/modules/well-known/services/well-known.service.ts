import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WellKnownService {
  constructor(private readonly configService: ConfigService) {}

  getAppleAppSiteAssociation() {
    const appleAppId = this.configService.get<string>('APPLE_APP_ID');

    if (!appleAppId) {
      throw new HttpException(
        'APPLE_APP_ID environment variable is not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      webcredentials: {
        apps: [appleAppId],
      },
      applinks: {
        apps: [],
        details: [
          {
            appID: appleAppId,
            paths: ['*'],
          },
        ],
      },
    };
  }
}
