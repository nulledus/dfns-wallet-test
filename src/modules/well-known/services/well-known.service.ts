import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WellKnownService {
  constructor(private readonly configService: ConfigService) {}

  getAppleAppSiteAssociation() {
    const appleAppId = this.configService.get<string>('APPLE_APP_ID');

    if (!appleAppId) {
      throw new Error('APPLE_APP_ID environment variable is not set');
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
