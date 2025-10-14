import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('.well-known')
export class WellKnownController {
  @Get('apple-app-site-association')
  getAppleAppSiteAssociation(@Res() res: Response) {
    const filePath = join(
      process.cwd(),
      'public',
      '.well-known',
      'apple-app-site-association',
    );
    const fileContent = readFileSync(filePath, 'utf-8');

    res.setHeader('Content-Type', 'application/json');
    res.send(fileContent);
  }
}
