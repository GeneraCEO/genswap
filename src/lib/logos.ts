// TrustWallet CDN for real token logos
const TRUSTWALLET_ASSETS = 'https://assets-cdn.trustwallet.com/blockchains';

// Map chain IDs to their logo URLs (TrustWallet CDN + reliable fallbacks)
export const CHAIN_LOGOS: Record<string, string> = {
  ethereum: `${TRUSTWALLET_ASSETS}/ethereum/info/logo.png`,
  bnb: `${TRUSTWALLET_ASSETS}/binance/info/logo.png`,
  arbitrum: `${TRUSTWALLET_ASSETS}/arbitrum/info/logo.png`,
  optimism: `${TRUSTWALLET_ASSETS}/optimism/info/logo.png`,
  polygon: `${TRUSTWALLET_ASSETS}/polygon/info/logo.png`,
  avalanche: `${TRUSTWALLET_ASSETS}/avalanchec/info/logo.png`,
  solana: `${TRUSTWALLET_ASSETS}/solana/info/logo.png`,
  base: `${TRUSTWALLET_ASSETS}/base/info/logo.png`,
  sui: `${TRUSTWALLET_ASSETS}/sui/info/logo.png`,
  ton: `${TRUSTWALLET_ASSETS}/ton/info/logo.png`,
  polkadot: `${TRUSTWALLET_ASSETS}/polkadot/info/logo.png`,
  ripple: `${TRUSTWALLET_ASSETS}/xrp/info/logo.png`,
  tron: `${TRUSTWALLET_ASSETS}/tron/info/logo.png`,
  hyperevm: 'https://s2.coinmarketcap.com/static/img/coins/64x64/30323.png',
  monero: `${TRUSTWALLET_ASSETS}/monero/info/logo.png`,
  zcash: `${TRUSTWALLET_ASSETS}/zcash/info/logo.png`,
  ton_crystal: `${TRUSTWALLET_ASSETS}/ton/info/logo.png`,
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
