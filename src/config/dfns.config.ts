export const dfnsConfig = {
  baseUrl:
    process.env.DFNS_BASE_URL ||
    process.env.DFNS_API_URL ||
    'https://api.dfns.io',
  orgId: process.env.DFNS_ORG_ID,
  authToken: process.env.DFNS_AUTH_TOKEN,
  credId: process.env.DFNS_CRED_ID,
  privateKey: process.env.DFNS_PRIVATE_KEY,
};

export const validateDfnsConfig = () => {
  const requiredEnvVars = [
    'DFNS_ORG_ID',
    'DFNS_AUTH_TOKEN',
    'DFNS_CRED_ID',
    'DFNS_PRIVATE_KEY',
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please set these variables in your .env file or environment.',
    );
  }
};
