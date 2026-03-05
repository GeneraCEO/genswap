import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  outcomePrices: string;
  volume: string;
  volume24hr: number;
  liquidity: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  outcomes: string;
  category: string;
}

export interface ParsedMarket {
  id: string;
  question: string;
  description: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  image: string;
  category: string;
}

function parseMarkets(raw: PolymarketMarket[]): ParsedMarket[] {
  return raw
    .filter((m) => m.active && !m.closed)
    .map((m) => {
      let yesPrice = 0.5;
      let noPrice = 0.5;
      try {
        const prices = JSON.parse(m.outcomePrices || '[]');
        yesPrice = parseFloat(prices[0] || '0.5');
        noPrice = parseFloat(prices[1] || '0.5');
      } catch { /* fallback */ }

      return {
        id: m.id,
        question: m.question,
        description: m.description || '',
        yesPrice,
        noPrice,
        volume: parseFloat(m.volume || '0'),
        volume24hr: m.volume24hr || 0,
        liquidity: parseFloat(m.liquidity || '0'),
        endDate: m.endDate,
        image: m.image || m.icon || '',
        category: m.category || 'General',
      };
    });
}

export function usePolymarketData() {
  return useQuery({
    queryKey: ['polymarket-markets'],
    queryFn: async () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/polymarket-data?action=markets`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });

      if (!res.ok) throw new Error('Failed to fetch Polymarket data');
      const raw: PolymarketMarket[] = await res.json();
      return parseMarkets(raw);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

const PAGE_SIZE = 100;

export function usePolymarketInfinite(tag?: string) {
  return useInfiniteQuery({
    queryKey: ['polymarket-infinite', tag || 'all'],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        action: 'markets',
        offset: String(pageParam),
        limit: String(PAGE_SIZE),
      });
      if (tag && tag !== 'all') params.set('tag', tag);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/polymarket-data?${params}`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const raw: PolymarketMarket[] = await res.json();
      return parseMarkets(raw);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
