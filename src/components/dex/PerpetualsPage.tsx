import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useHyperliquidData, useHyperliquidCandles, HyperliquidPerpData } from '@/hooks/useHyperliquidData';

export function PerpetualsPage() {
  const { data: markets, isLoading, error } = useHyperliquidData();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectedMarket = markets?.[selectedIdx];
  const coin = selectedMarket?.symbol.replace('-PERP', '') || 'ETH';
  const { data: candles } = useHyperliquidCandles(coin, '1h');

  const chartData = candles?.map((c: { t: number; o: string; h: string; l: string; c: string; v: string }, i: number) => ({
    time: i.toString(),
    price: parseFloat(c.c),
    volume: parseFloat(c.v),
  })) || [];

  const isPositive = (selectedMarket?.change24h ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-foreground">Perpetuals</h2>
          <p className="text-muted-foreground">Loading live data from Hyperliquid...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-border rounded-2xl p-5 bg-card h-96 animate-pulse" />
          <div className="border border-border rounded-2xl p-4 bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !markets?.length) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-16">
        <h2 className="text-3xl font-bold text-foreground mb-2">Perpetuals</h2>
        <p className="text-destructive">Failed to load Hyperliquid data</p>
        <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-foreground">Perpetuals</h2>
        <p className="text-muted-foreground">Live perpetual futures from Hyperliquid • Up to {selectedMarket?.maxLeverage || 50}x leverage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 border border-border rounded-2xl p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{selectedMarket?.symbol}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  ${selectedMarket?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                  {isPositive ? '+' : ''}{selectedMarket?.change24h}%
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Funding: <span className="text-foreground">{((selectedMarket?.fundingRate || 0) * 100).toFixed(4)}%</span></div>
              <div>OI: <span className="text-foreground">{selectedMarket?.openInterest}</span></div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ time: '0', price: selectedMarket?.price || 0 }]}>
                <defs>
                  <linearGradient id="perpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#perpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-20 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="volume" fill="hsl(var(--primary))" opacity={0.4} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market List */}
        <div className="border border-border rounded-2xl p-4 bg-card overflow-y-auto max-h-[500px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Markets</h3>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          {markets.map((market, idx) => (
            <button
              key={market.symbol}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                selectedIdx === idx ? 'bg-primary/20 border border-primary/40' : 'hover:bg-secondary'
              }`}
            >
              <div>
                <div className="font-bold text-foreground text-sm">{market.symbol}</div>
                <div className="text-xs text-muted-foreground">Vol: {market.volume}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground text-sm">${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div className={`text-xs font-bold ${market.change24h >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
