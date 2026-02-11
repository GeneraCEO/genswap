import { useQuery } from '@tanstack/react-query';

export interface HyperliquidMarket {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

export interface HyperliquidAssetCtx {
  dayNtlVlm: string;
  funding: string;
  openInterest: string;
  prevDayPx: string;
  markPx: string;
  midPx: string;
  impactPxs: string[];
}

export interface HyperliquidPerpData {
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
  openInterest: string;
  fundingRate: number;
  maxLeverage: number;
}

export function useHyperliquidData() {
  return useQuery({
    queryKey: ['hyperliquid-meta'],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyperliquid-data?action=meta`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });

      if (!res.ok) throw new Error('Failed to fetch Hyperliquid data');
      const raw = await res.json();

      // raw is [meta, assetCtxs] from metaAndAssetCtxs
      if (!Array.isArray(raw) || raw.length < 2) {
        throw new Error('Unexpected Hyperliquid response format');
      }

      const meta = raw[0];
      const ctxs = raw[1] as HyperliquidAssetCtx[];
      const universe = meta.universe || [];

      const markets: HyperliquidPerpData[] = universe
        .filter((m: HyperliquidMarket & { isDelisted?: boolean }) => !m.isDelisted)
        .map((m: HyperliquidMarket, i: number) => {
        const ctx = ctxs[i];
        const markPx = parseFloat(ctx?.markPx || '0');
        const prevPx = parseFloat(ctx?.prevDayPx || '0');
        const change = prevPx > 0 ? ((markPx - prevPx) / prevPx) * 100 : 0;
        const vol = parseFloat(ctx?.dayNtlVlm || '0');
        const oi = parseFloat(ctx?.openInterest || '0');
        const funding = parseFloat(ctx?.funding || '0');

        return {
          symbol: `${m.name}-PERP`,
          price: markPx,
          change24h: Math.round(change * 100) / 100,
          volume: vol > 1e9 ? `$${(vol / 1e9).toFixed(1)}B` : vol > 1e6 ? `$${(vol / 1e6).toFixed(0)}M` : `$${vol.toFixed(0)}`,
          openInterest: oi > 1e9 ? `$${(oi / 1e9).toFixed(1)}B` : oi > 1e6 ? `$${(oi / 1e6).toFixed(0)}M` : `$${oi.toFixed(0)}`,
          fundingRate: funding,
          maxLeverage: m.maxLeverage || 50,
        };
      });

      // Sort by volume descending, take top 20
      markets.sort((a, b) => {
        const parseVol = (v: string) => {
          const n = parseFloat(v.replace('$', '').replace('B', '').replace('M', ''));
          return v.includes('B') ? n * 1e9 : v.includes('M') ? n * 1e6 : n;
        };
        return parseVol(b.volume) - parseVol(a.volume);
      });

      return markets.slice(0, 20);
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useHyperliquidCandles(coin: string, interval = '1h') {
  return useQuery({
    queryKey: ['hyperliquid-candles', coin, interval],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyperliquid-data?action=candleSnapshot&coin=${coin}&interval=${interval}`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      if (!res.ok) throw new Error('Failed to fetch candles');
      return await res.json();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}
