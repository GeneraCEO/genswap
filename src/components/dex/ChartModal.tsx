import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timeframes = ['1H', '4H', '1D', '1W', '1M'] as const;

function generateChartData(points: number, basePrice: number, volatility: number) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * volatility;
    price = Math.max(price * 0.95, price);
    data.push({
      time: new Date(now - (points - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

export function ChartModal({ isOpen, onClose }: ChartModalProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<typeof timeframes[number]>('1D');
  const [data, setData] = useState(() => generateChartData(60, 3450, 15));

  useEffect(() => {
    const pointsMap = { '1H': 60, '4H': 120, '1D': 288, '1W': 168, '1M': 720 };
    setData(generateChartData(pointsMap[activeTimeframe], 3450, 15));
  }, [activeTimeframe]);

  if (!isOpen) return null;

  const currentPrice = data[data.length - 1]?.price ?? 0;
  const startPrice = data[0]?.price ?? 0;
  const change = ((currentPrice - startPrice) / startPrice) * 100;
  const isPositive = change >= 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-card border-2 border-primary rounded-2xl p-6 text-foreground max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">ETH/USD</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-bold">${currentPrice.toLocaleString()}</span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#555" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#555" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0d0d', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#999' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="price" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={2} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTimeframe === tf ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
