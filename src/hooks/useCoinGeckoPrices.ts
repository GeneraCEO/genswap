import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Map token symbols to CoinGecko IDs
const SYMBOL_TO_CG_ID: Record<string, string> = {
  ETH: 'ethereum', BTC: 'bitcoin', WBTC: 'wrapped-bitcoin', USDC: 'usd-coin',
  USDT: 'tether', DAI: 'dai', LINK: 'chainlink', UNI: 'uniswap',
  AAVE: 'aave', MKR: 'maker', COMP: 'compound', SNX: 'havven',
  CRV: 'curve-dao-token', SUSHI: 'sushi', YFI: 'yearn-finance',
  BAL: 'balancer', '1INCH': '1inch', LDO: 'lido-dao',
  MATIC: 'matic-network', ARB: 'arbitrum', OP: 'optimism',
  DOGE: 'dogecoin', SHIB: 'shiba-inu', PEPE: 'pepe',
  SOL: 'solana', APE: 'apecoin', SAND: 'the-sandbox',
  MANA: 'decentraland', GRT: 'the-graph', ENS: 'ethereum-name-service',
  FET: 'fetch-ai', stETH: 'staked-ether', rETH: 'rocket-pool-eth',
  FRAX: 'frax', FLOKI: 'floki', BAT: 'basic-attention-token',
};

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol: number;
  usd_market_cap: number;
}

export function useCoinGeckoPrices() {
  return useQuery({
    queryKey: ['coingecko-prices'],
    queryFn: async () => {
      const ids = Object.values(SYMBOL_TO_CG_ID).join(',');
      const { data, error } = await supabase.functions.invoke('coingecko-prices', {
        body: null,
        method: 'GET',
        headers: {},
      });

      // Fallback: call via URL with query params
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coingecko-prices?ids=${ids}`;
      const res = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch prices');
      const prices = await res.json();

      // Convert CG ID-keyed data to symbol-keyed
      const symbolPrices: Record<string, TokenPrice> = {};
      for (const [symbol, cgId] of Object.entries(SYMBOL_TO_CG_ID)) {
        if (prices[cgId]) {
          symbolPrices[symbol] = {
            usd: prices[cgId].usd,
            usd_24h_change: prices[cgId].usd_24h_change || 0,
            usd_24h_vol: prices[cgId].usd_24h_vol || 0,
            usd_market_cap: prices[cgId].usd_market_cap || 0,
          };
        }
      }
      return symbolPrices;
    },
    refetchInterval: 30000, // Refresh every 30s
    staleTime: 15000,
  });
}

export function getTokenCoinGeckoId(symbol: string): string | undefined {
  return SYMBOL_TO_CG_ID[symbol];
}
