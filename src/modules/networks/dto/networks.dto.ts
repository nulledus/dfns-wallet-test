export class TokenDto {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string;
}

export class NetworkDto {
  id: string;
  name: string;
  chainId: number;
  isTestnet: boolean;
  rpcUrl: string;
  explorerUrl: string;
  tokens: TokenDto[];
}

export class NetworksResponseDto {
  networks: NetworkDto[];
}
