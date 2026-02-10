// TrustWallet CDN for real token logos
const TRUSTWALLET_CDN = 'https://raw.githubusercontent.com/nichanank/trust-assets/master/blockchains';
const TRUSTWALLET_ASSETS = 'https://assets-cdn.trustwallet.com/blockchains';

// Map chain IDs to their logo URLs
export const CHAIN_LOGOS: Record<string, string> = {
  ethereum: 'https://assets-cdn.trustwallet.com/blockchains/ethereum/info/logo.png',
  bnb: 'https://assets-cdn.trustwallet.com/blockchains/binance/info/logo.png',
  arbitrum: 'https://assets-cdn.trustwallet.com/blockchains/arbitrum/info/logo.png',
  optimism: 'https://assets-cdn.trustwallet.com/blockchains/optimism/info/logo.png',
  polygon: 'https://assets-cdn.trustwallet.com/blockchains/polygon/info/logo.png',
  avalanche: 'https://assets-cdn.trustwallet.com/blockchains/avalanchec/info/logo.png',
  solana: 'https://assets-cdn.trustwallet.com/blockchains/solana/info/logo.png',
  base: 'https://assets-cdn.trustwallet.com/blockchains/base/info/logo.png',
  sui: 'https://assets-cdn.trustwallet.com/blockchains/sui/info/logo.png',
  ton: 'https://assets-cdn.trustwallet.com/blockchains/ton/info/logo.png',
  polkadot: 'https://assets-cdn.trustwallet.com/blockchains/polkadot/info/logo.png',
  ripple: 'https://assets-cdn.trustwallet.com/blockchains/xrp/info/logo.png',
  tron: 'https://assets-cdn.trustwallet.com/blockchains/tron/info/logo.png',
  monero: 'https://cryptologos.cc/logos/monero-xmr-logo.png',
  zcash: 'https://cryptologos.cc/logos/zcash-zec-logo.png',
  hyperevm: 'https://cryptologos.cc/logos/hyperliquid-hype-logo.png',
  ton_crystal: 'https://assets-cdn.trustwallet.com/blockchains/ton/info/logo.png',
};

// Get token logo from TrustWallet CDN using contract address
export function getTokenLogo(address: string, chainId: string = 'ethereum'): string {
  if (address === '0x0000000000000000000000000000000000000000') {
    return CHAIN_LOGOS[chainId] || CHAIN_LOGOS.ethereum;
  }
  
  const chainMap: Record<string, string> = {
    ethereum: 'ethereum',
    bnb: 'smartchain',
    arbitrum: 'arbitrum',
    optimism: 'optimism',
    polygon: 'polygon',
    base: 'base',
    avalanche: 'avalanchec',
    solana: 'solana',
  };
  
  const twChain = chainMap[chainId] || 'ethereum';
  return `${TRUSTWALLET_ASSETS}/${twChain}/assets/${address}/logo.png`;
}

// Fallback emoji for when image fails to load
export function getTokenFallback(symbol: string): string {
  const fallbacks: Record<string, string> = {
    ETH: '⟠', USDC: '💵', USDT: '₮', DAI: '◈', WBTC: '₿', BNB: '💛',
    UNI: '🦄', LINK: '⬡', AAVE: '👻', SOL: '◎', MATIC: '⬡',
  };
  return fallbacks[symbol] || '🪙';
}
