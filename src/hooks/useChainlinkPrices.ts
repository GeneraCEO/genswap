import { useQuery } from '@tanstack/react-query';

export interface ChainlinkPrice {
  usd: number;
  source: string;
}

export function useChainlinkPrices() {
  return useQuery({
    queryKey: ['chainlink-prices'],
    queryFn: async (): Promise<Record<string, ChainlinkPrice>> => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chainlink-prices`;
      const res = await fetch(url, {
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      if (!res.ok) throw new Error('Failed to fetch Chainlink prices');
      return await res.json();
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}
