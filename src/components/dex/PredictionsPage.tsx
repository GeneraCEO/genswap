import { usePolymarketData, ParsedMarket } from '@/hooks/usePolymarketData';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, BarChart3 } from 'lucide-react';

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

function MarketCard({ market }: { market: ParsedMarket }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="border border-border rounded-2xl p-5 bg-card hover:border-primary/40 transition-all"
    >
      <div className="flex items-start gap-4">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="w-12 h-12 rounded-xl object-cover shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm leading-tight mb-2 line-clamp-2">
            {market.question}
          </h3>

          {/* Probability bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-green-400">
                Yes {yesPercent}¢
              </span>
              <span className="flex items-center gap-1 font-bold text-red-400">
                No {noPercent}¢
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatVolume(market.volume)}
              </span>
              {market.endDate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(market.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trade buttons */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm hover:bg-green-500/30 transition-all border border-green-500/30">
          Buy Yes {yesPercent}¢
        </button>
        <button className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all border border-red-500/30">
          Buy No {noPercent}¢
        </button>
      </div>
    </motion.div>
  );
}

export function PredictionsPage() {
  const { data: markets, isLoading, error } = usePolymarketData();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Predictions</h2>
        </div>
        <p className="text-muted-foreground">Live prediction markets powered by Polymarket</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border border-border rounded-2xl p-5 bg-card animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
              <div className="h-3 bg-secondary rounded-full w-full mb-3" />
              <div className="flex gap-2">
                <div className="flex-1 h-10 bg-secondary rounded-xl" />
                <div className="flex-1 h-10 bg-secondary rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">Failed to load markets</p>
          <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
        </div>
      )}

      {markets && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              {markets.length} active markets
            </span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
