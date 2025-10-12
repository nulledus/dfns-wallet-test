import { Injectable } from '@nestjs/common';
import { NetworkDto, TokenDto, NetworksResponseDto } from '../dto/networks.dto';

@Injectable()
export class NetworksService {
  /**
   * Returns a list of supported networks with their tokens
   * TODO: Replace with database retrieval
   */
  getNetworks(): NetworksResponseDto {
    const networks: NetworkDto[] = [
      {
        id: 'ethereum',
        name: 'Ethereum',
        chainId: 1,
        isTestnet: false,
        rpcUrl: 'https://eth.llamarpc.com',
        explorerUrl: 'https://etherscan.io',
        tokens: [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
          },
          {
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          },
        ],
      },
      {
        id: 'polygon',
        name: 'Polygon',
        chainId: 137,
        isTestnet: false,
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        tokens: [
          {
            symbol: 'MATIC',
            name: 'Polygon',
            decimals: 18,
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          },
        ],
      },
    ];

    return {
      networks,
    };
  }

  /**
   * Returns a specific network by ID
   * TODO: Replace with database retrieval
   */
  getNetworkById(networkId: string): NetworkDto | null {
    const { networks } = this.getNetworks();
    return networks.find((network) => network.id === networkId) || null;
  }
}
