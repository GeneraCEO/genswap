import { useState, useMemo } from 'react';
import { useHyperliquidData, useHyperliquidCandles, HyperliquidPerpData } from '@/hooks/useHyperliquidData';
import { TradingViewWidget } from './TradingViewWidget';
import { Search, ChevronDown, Star, TrendingUp, TrendingDown } from 'lucide-react';

const TV_PERP_MAP: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDT', ETH: 'BINANCE:ETHUSDT', SOL: 'BINANCE:SOLUSDT',
  DOGE: 'BINANCE:DOGEUSDT', XRP: 'BINANCE:XRPUSDT', AVAX: 'BINANCE:AVAXUSDT',
  LINK: 'BINANCE:LINKUSDT', SUI: 'BINANCE:SUIUSDT', ARB: 'BINANCE:ARBUSDT',
  OP: 'BINANCE:OPUSDT', BNB: 'BINANCE:BNBUSDT', ADA: 'BINANCE:ADAUSDT',
  DOT: 'BINANCE:DOTUSDT', NEAR: 'BINANCE:NEARUSDT', ATOM: 'BINANCE:ATOMUSDT',
  INJ: 'BINANCE:INJUSDT', TON: 'BINANCE:TONUSDT', TIA: 'BINANCE:TIAUSDT',
  ONDO: 'BINANCE:ONDOUSDT', ENA: 'BINANCE:ENAUSDT',
};

type OrderType = 'limit' | 'market';
type Side = 'long' | 'short';
type SubTab = 'positions' | 'orders' | 'trades';

export function PerpetualsPage() {
  const { data: markets, isLoading, error } = useHyperliquidData();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [orderSize, setOrderSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [subTab, setSubTab] = useState<SubTab>('positions');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC-PERP', 'ETH-PERP', 'SOL-PERP']));

  const selectedMarket = markets?.[selectedIdx];
  const coin = selectedMarket?.symbol.replace('-PERP', '') || 'BTC';
  const tvSymbol = TV_PERP_MAP[coin] || 'BINANCE:BTCUSDT';

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    if (!searchQuery) return markets;
    return markets.filter(m =>
      m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markets, searchQuery]);

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  };

  const isPositive = (selectedMarket?.change24h ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-0 lg:gap-px bg-border/50 rounded-xl overflow-hidden">
          <div className="bg-card p-4 h-[700px] animate-pulse" />
          <div className="bg-card p-4 h-[700px] animate-pulse" />
          <div className="bg-card p-4 h-[700px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !markets?.length) {
    return (
      <div className="w-full max-w-6xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Perpetual Futures</h2>
        <p className="text-destructive">Failed to load market data</p>
        <p className="text-muted-foreground text-sm mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto -mt-4">
      {/* Top Market Bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card border-b border-border overflow-x-auto scrollbar-hide rounded-t-xl">
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => toggleFavorite(selectedMarket?.symbol || '')} className="text-muted-foreground hover:text-yellow-400 transition-colors">
            <Star className={`w-4 h-4 ${favorites.has(selectedMarket?.symbol || '') ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>
          <span className="text-lg font-bold text-foreground">{selectedMarket?.symbol}</span>
          <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            ${selectedMarket?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
            {isPositive ? '+' : ''}{selectedMarket?.change24h}%
          </span>
        </div>
        <div className="h-5 w-px bg-border shrink-0" />
        <div className="flex items-center gap-5 text-xs text-muted-foreground shrink-0">
          <div>
            <span className="text-muted-foreground/60 mr-1">24h Vol</span>
            <span className="text-foreground font-medium">{selectedMarket?.volume}</span>
          </div>
          <div>
            <span className="text-muted-foreground/60 mr-1">OI</span>
            <span className="text-foreground font-medium">{selectedMarket?.openInterest}</span>
          </div>
          <div>
            <span className="text-muted-foreground/60 mr-1">Funding</span>
            <span className={`font-medium ${(selectedMarket?.fundingRate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {((selectedMarket?.fundingRate || 0) * 100).toFixed(4)}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground/60 mr-1">Max Leverage</span>
            <span className="text-foreground font-medium">{selectedMarket?.maxLeverage}x</span>
          </div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-px bg-border/30">
        {/* Left: Market List */}
        <div className="bg-card flex flex-col max-h-[calc(100vh-200px)] lg:max-h-[700px]">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search markets..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 text-[10px] text-muted-foreground/60 font-medium px-3 py-1.5 border-b border-border/50 uppercase tracking-wider">
            <span>Market</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMarkets.map((market, idx) => {
              const origIdx = markets.indexOf(market);
              const isSelected = selectedIdx === origIdx;
              return (
                <button
                  key={market.symbol}
                  onClick={() => setSelectedIdx(origIdx)}
                  className={`w-full grid grid-cols-3 items-center px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border-l-2 border-l-primary'
                      : 'hover:bg-secondary/30 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol); }}
                      className="text-muted-foreground/40 hover:text-yellow-400"
                    >
                      <Star className={`w-3 h-3 ${favorites.has(market.symbol) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    <span className="font-semibold text-foreground">{market.symbol.replace('-PERP', '')}</span>
                    <span className="text-muted-foreground/40 text-[9px]">PERP</span>
                  </div>
                  <span className="text-right font-medium text-foreground">
                    ${market.price < 1 ? market.price.toFixed(4) : market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-right font-semibold ${market.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Chart + Bottom Panels */}
        <div className="bg-card flex flex-col">
          {/* TradingView Chart */}
          <div className="flex-1 min-h-[400px]">
            <TradingViewWidget symbol={tvSymbol} height={450} />
          </div>

          {/* Bottom Tabs: Positions / Orders / Trades */}
          <div className="border-t border-border">
            <div className="flex items-center gap-0 border-b border-border">
              {(['positions', 'orders', 'trades'] as SubTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${
                    subTab === tab
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-4 min-h-[120px]">
              {subTab === 'positions' && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No open positions</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">Connect wallet and place a trade to get started</p>
                </div>
              )}
              {subTab === 'orders' && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No open orders</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">Your limit orders will appear here</p>
                </div>
              )}
              {subTab === 'trades' && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No recent trades</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">Your trade history will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Entry */}
        <div className="bg-card flex flex-col border-l border-border">
          {/* Order Type Tabs */}
          <div className="flex border-b border-border">
            {(['market', 'limit'] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                  orderType === type
                    ? 'text-foreground border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Buy/Sell Toggle */}
          <div className="p-3">
            <div className="grid grid-cols-2 gap-1 bg-secondary/30 rounded-lg p-0.5">
              <button
                onClick={() => setSide('long')}
                className={`py-2.5 rounded-md text-xs font-bold transition-all ${
                  side === 'long'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                Long
              </button>
              <button
                onClick={() => setSide('short')}
                className={`py-2.5 rounded-md text-xs font-bold transition-all ${
                  side === 'short'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 inline mr-1" />
                Short
              </button>
            </div>
          </div>

          {/* Leverage Slider */}
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Leverage</span>
              <span className="text-xs font-bold text-foreground bg-secondary px-2 py-0.5 rounded">{leverage}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={selectedMarket?.maxLeverage || 50}
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/50">
              <span>1x</span>
              <span>{Math.floor((selectedMarket?.maxLeverage || 50) / 4)}x</span>
              <span>{Math.floor((selectedMarket?.maxLeverage || 50) / 2)}x</span>
              <span>{selectedMarket?.maxLeverage || 50}x</span>
            </div>
          </div>

          {/* Price Input (Limit only) */}
          {orderType === 'limit' && (
            <div className="px-3 pb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Limit Price</label>
              <div className="relative">
                <input
                  type="text"
                  value={limitPrice}
                  onChange={(e) => {
                    if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setLimitPrice(e.target.value);
                  }}
                  placeholder={selectedMarket?.price.toFixed(2)}
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/40 font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
              </div>
            </div>
          )}

          {/* Size Input */}
          <div className="px-3 pb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Size</label>
            <div className="relative">
              <input
                type="text"
                value={orderSize}
                onChange={(e) => {
                  if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setOrderSize(e.target.value);
                }}
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/40 font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mt-2">
              {[10, 25, 50, 100].map(pct => (
                <button
                  key={pct}
                  className="py-1.5 text-[10px] font-medium rounded bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-3 pb-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="text-foreground font-medium">
                {orderType === 'limit' && limitPrice ? `$${limitPrice}` : `$${selectedMarket?.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Notional</span>
              <span className="text-foreground font-medium">
                {orderSize ? `$${(parseFloat(orderSize) * leverage).toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Funding Rate</span>
              <span className={`font-medium ${(selectedMarket?.fundingRate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {((selectedMarket?.fundingRate || 0) * 100).toFixed(4)}%
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-3 pb-4 mt-auto">
            <button
              disabled={!orderSize}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                side === 'long'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/30 disabled:text-emerald-500/50'
                  : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30 disabled:text-red-500/50'
              } disabled:cursor-not-allowed`}
            >
              {side === 'long' ? 'Long' : 'Short'} {coin} {orderType === 'market' ? '@ Market' : '@ Limit'}
            </button>
          </div>

          {/* Market Stats */}
          <div className="border-t border-border px-3 py-3 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Info</h4>
            {[
              { label: '24h Volume', value: selectedMarket?.volume },
              { label: 'Open Interest', value: selectedMarket?.openInterest },
              { label: 'Max Leverage', value: `${selectedMarket?.maxLeverage}x` },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-foreground font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
