import { Controller, Get } from '@nestjs/common';
import { WellKnownService } from '../services/well-known.service';

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly wellKnownService: WellKnownService) {}

  @Get('apple-app-site-association')
  getAppleAppSiteAssociation() {
    return this.wellKnownService.getAppleAppSiteAssociation();
  }
}
