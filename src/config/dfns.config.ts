import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const dfnsConfigSchema = z.object({
  baseUrl: z.string().url(),
  orgId: z.string().min(1),
  authToken: z.string().min(1),
  credId: z.string().min(1),
  privateKey: z.string().min(1),
});

export type DfnsConfig = z.infer<typeof dfnsConfigSchema>;

export default registerAs('dfns', () => {
  const config = {
    baseUrl: process.env.DFNS_BASE_URL,
    orgId: process.env.DFNS_ORG_ID,
    authToken: process.env.DFNS_AUTH_TOKEN,
    credId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
  };

  return dfnsConfigSchema.parse(config);
});
