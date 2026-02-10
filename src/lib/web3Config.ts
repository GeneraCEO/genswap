import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, bsc, arbitrum, optimism, polygon, base, avalanche } from 'wagmi/chains';

// WalletConnect project ID - users should replace with their own
// Get one free at https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = '2f5e3b7c8a1d4e6f9b0c2a3d5e7f8a1b';

export const config = getDefaultConfig({
  appName: 'GZ DEX',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, arbitrum, optimism, polygon, base, bsc, avalanche],
});
