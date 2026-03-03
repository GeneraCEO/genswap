import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { usePolymarketInfinite, ParsedMarket } from '@/hooks/usePolymarketData';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, Search, Flame, Wallet, X, Minus, Plus, Loader2 } from 'lucide-react';

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(0)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatDate(d: string): string {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Ending soon';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `${days}d left`;
  if (days <= 30) return `${Math.ceil(days / 7)}w left`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type SortBy = 'volume' | 'newest' | 'ending';
type Category = 'all' | 'politics' | 'crypto' | 'sports' | 'pop_culture' | 'business' | 'science';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'politics', label: 'Politics' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'sports', label: 'Sports' },
  { id: 'pop_culture', label: 'Culture' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science' },
];

interface BetModalProps {
  market: ParsedMarket;
  side: 'yes' | 'no';
  onClose: () => void;
}

function BetModal({ market, side, onClose }: BetModalProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [amount, setAmount] = useState('10');
  const price = side === 'yes' ? market.yesPrice : market.noPrice;
  const shares = amount ? (parseFloat(amount) / price).toFixed(2) : '0';
  const potentialReturn = amount ? (parseFloat(amount) / price).toFixed(2) : '0';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[400px] bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-start justify-between">
          <p className="text-sm font-semibold text-foreground line-clamp-2 flex-1 pr-4">{market.question}</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-1 bg-secondary/30 rounded-lg p-0.5 mb-4">
            <button className={`py-2 rounded-md text-xs font-semibold transition-all ${side === 'yes' ? 'bg-emerald-500 text-white' : 'text-muted-foreground'}`}>
              Yes {Math.round(market.yesPrice * 100)}¢
            </button>
            <button className={`py-2 rounded-md text-xs font-semibold transition-all ${side === 'no' ? 'bg-red-500 text-white' : 'text-muted-foreground'}`}>
              No {Math.round(market.noPrice * 100)}¢
            </button>
          </div>

          <label className="text-xs text-muted-foreground mb-1.5 block">Amount (USDC)</label>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setAmount(String(Math.max(1, parseFloat(amount || '0') - 5)))}
              className="p-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
            >
              <Minus className="w-3.5 h-3.5 text-foreground" />
            </button>
            <input
              type="text"
              value={amount}
              onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
              className="flex-1 text-center text-xl font-semibold bg-secondary/50 rounded-lg border border-border py-2.5 outline-none text-foreground focus:border-primary"
            />
            <button
              onClick={() => setAmount(String(parseFloat(amount || '0') + 5))}
              className="p-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
            >
              <Plus className="w-3.5 h-3.5 text-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {[5, 10, 25, 100].map(v => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  amount === String(v) ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                ${v}
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-4 p-3 rounded-xl bg-secondary/20 border border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg Price</span>
              <span className="text-foreground font-medium">{Math.round(price * 100)}¢</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Shares</span>
              <span className="text-foreground font-medium">{shares}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Potential Return</span>
              <span className="text-emerald-500 font-semibold">${potentialReturn} ({amount ? ((1/price - 1) * 100).toFixed(0) : 0}%)</span>
            </div>
          </div>

          {isConnected ? (
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                side === 'yes'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/30'
                  : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30'
              } disabled:cursor-not-allowed`}
            >
              Buy {side === 'yes' ? 'Yes' : 'No'}
            </button>
          ) : (
            <button
              onClick={openConnectModal}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MarketCard({ market, onBet }: { market: ParsedMarket; onBet: (side: 'yes' | 'no') => void }) {
  const yesPercent = Math.round(market.yesPrice * 100);
  const noPercent = Math.round(market.noPrice * 100);
  const isHot = market.volume24hr > 50000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-xl p-4 bg-card hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {market.question}
            </h3>
            {isHot && (
              <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                <Flame className="w-3 h-3" /> Hot
              </span>
            )}
          </div>

          <div className="relative mb-2.5">
            <div className="flex rounded-full h-1.5 overflow-hidden bg-red-500/20">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-emerald-500">Yes {yesPercent}¢</span>
              <span className="font-semibold text-red-500">No {noPercent}¢</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <DollarSign className="w-3 h-3" />
                {formatVolume(market.volume)}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {formatDate(market.endDate)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBet('yes')}
              className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold text-xs hover:bg-emerald-500/20 transition-all border border-emerald-500/20 hover:border-emerald-500/40"
            >
              Buy Yes {yesPercent}¢
            </button>
            <button
              onClick={() => onBet('no')}
              className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 font-semibold text-xs hover:bg-red-500/20 transition-all border border-red-500/20 hover:border-red-500/40"
            >
              Buy No {noPercent}¢
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PredictionsPage() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = usePolymarketInfinite();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('volume');
  const [category, setCategory] = useState<Category>('all');
  const [betModal, setBetModal] = useState<{ market: ParsedMarket; side: 'yes' | 'no' } | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const markets = useMemo(() => data?.pages.flat() || [], [data]);

  const filtered = useMemo(() => {
    let result = [...markets];

    if (searchQuery) {
      result = result.filter(m => m.question.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (category !== 'all') {
      result = result.filter(m => m.category?.toLowerCase().includes(category.replace('_', ' ')));
    }

    switch (sortBy) {
      case 'volume': result.sort((a, b) => b.volume - a.volume); break;
      case 'newest': result.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()); break;
      case 'ending': result.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()); break;
    }

    return result;
  }, [markets, searchQuery, sortBy, category]);

  const totalVolume = markets.reduce((sum, m) => sum + m.volume, 0);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Predictions</h2>
          </div>
          <p className="text-muted-foreground text-sm">Live prediction markets from Polymarket</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <span>{markets.length} Markets</span>
          <span>Vol: {formatVolume(totalVolume)}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-card rounded-xl border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-card text-foreground text-xs font-medium px-3 py-2.5 rounded-xl border border-border appearance-none cursor-pointer focus:border-primary outline-none"
        >
          <option value="volume">🔥 Top Volume</option>
          <option value="ending">⏰ Ending Soon</option>
          <option value="newest">🆕 Newest</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-4 bg-card animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-secondary rounded-xl shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-1.5 bg-secondary rounded-full w-full mb-3" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-secondary rounded-lg" />
                    <div className="flex-1 h-8 bg-secondary rounded-lg" />
                  </div>
                </div>
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

      {/* Markets Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onBet={(side) => setBetModal({ market, side })}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="py-6 flex justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more markets...
          </div>
        )}
        {!hasNextPage && markets.length > 0 && (
          <p className="text-muted-foreground text-xs">All markets loaded</p>
        )}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No markets found</p>
        </div>
      )}

      {/* Bet Modal */}
      <AnimatePresence>
        {betModal && (
          <BetModal
            market={betModal.market}
            side={betModal.side}
            onClose={() => setBetModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
