import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: string;
  openInterest: string;
  fundingRate: number;
}

const MARKETS: MarketData[] = [
  { symbol: 'BTC-PERP', price: 97450, change24h: 2.34, volume: '$12.4B', openInterest: '$8.2B', fundingRate: 0.0045 },
  { symbol: 'ETH-PERP', price: 3456, change24h: -1.23, volume: '$6.8B', openInterest: '$4.1B', fundingRate: 0.0032 },
  { symbol: 'SOL-PERP', price: 198.5, change24h: 5.67, volume: '$2.1B', openInterest: '$1.3B', fundingRate: 0.0078 },
  { symbol: 'ARB-PERP', price: 1.89, change24h: -0.45, volume: '$340M', openInterest: '$210M', fundingRate: 0.0012 },
  { symbol: 'OP-PERP', price: 3.12, change24h: 1.89, volume: '$280M', openInterest: '$180M', fundingRate: 0.0023 },
  { symbol: 'DOGE-PERP', price: 0.342, change24h: 8.12, volume: '$1.2B', openInterest: '$650M', fundingRate: 0.0089 },
  { symbol: 'AVAX-PERP', price: 42.5, change24h: 3.45, volume: '$450M', openInterest: '$290M', fundingRate: 0.0034 },
  { symbol: 'LINK-PERP', price: 24.8, change24h: -2.1, volume: '$320M', openInterest: '$200M', fundingRate: 0.0018 },
];

function generatePriceData(base: number, points: number = 100) {
  const data = [];
  let price = base;
  let vol = base * 1000;
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * (base * 0.005);
    vol = base * 500 + Math.random() * base * 2000;
    data.push({
      time: i.toString(),
      price: Math.round(price * 100) / 100,
      volume: Math.round(vol),
    });
  }
  return data;
}

export function PerpetualsPage() {
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [chartData, setChartData] = useState(() => generatePriceData(selectedMarket.price));

  useEffect(() => {
    setChartData(generatePriceData(selectedMarket.price));
  }, [selectedMarket]);

  const isPositive = selectedMarket.change24h >= 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-foreground">Perpetuals</h2>
        <p className="text-muted-foreground">Trade perpetual futures with up to 50x leverage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 border border-border rounded-2xl p-5 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{selectedMarket.symbol}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-foreground">${selectedMarket.price.toLocaleString()}</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isPositive ? '+' : ''}{selectedMarket.change24h}%
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Funding: <span className="text-foreground">{(selectedMarket.fundingRate * 100).toFixed(4)}%</span></div>
              <div>OI: <span className="text-foreground">{selectedMarket.openInterest}</span></div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="perpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="price" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={2} fill="url(#perpGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume bars */}
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
          <h3 className="font-bold text-foreground mb-3">Markets</h3>
          {MARKETS.map((market) => (
            <button
              key={market.symbol}
              onClick={() => setSelectedMarket(market)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all mb-1 ${
                selectedMarket.symbol === market.symbol ? 'bg-primary/20 border border-primary/40' : 'hover:bg-secondary'
              }`}
            >
              <div>
                <div className="font-bold text-foreground text-sm">{market.symbol}</div>
                <div className="text-xs text-muted-foreground">Vol: {market.volume}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground text-sm">${market.price.toLocaleString()}</div>
                <div className={`text-xs font-bold ${market.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
