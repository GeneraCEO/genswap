import { useState, useMemo } from 'react';
import { useHyperliquidData, HyperliquidPerpData } from '@/hooks/useHyperliquidData';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TradingViewWidget } from './TradingViewWidget';
import { Search, Star, TrendingUp, TrendingDown, Wallet, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
type OrderStatus = 'idle' | 'signing' | 'submitting' | 'success' | 'error';

interface PlacedOrder {
  id: string;
  coin: string;
  side: Side;
  size: string;
  price: string;
  type: OrderType;
  leverage: number;
  time: string;
  status: 'filled' | 'open' | 'cancelled';
}

export function PerpetualsPage() {
  const { data: markets, isLoading, error } = useHyperliquidData();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [orderSize, setOrderSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [subTab, setSubTab] = useState<SubTab>('positions');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC-PERP', 'ETH-PERP', 'SOL-PERP']));
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);

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

  const entryPrice = orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : (selectedMarket?.price || 0);
  const notional = orderSize ? parseFloat(orderSize) * leverage : 0;
  const coinQty = entryPrice > 0 ? notional / entryPrice : 0;

  const handlePlaceOrder = () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (!orderSize || parseFloat(orderSize) <= 0) return;
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    setShowConfirmModal(false);
    setOrderStatus('signing');

    try {
      // Call Hyperliquid order placement via edge function
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyperliquid-data?action=placeOrder`;
      
      setOrderStatus('submitting');
      
      const orderPayload = {
        coin,
        isBuy: side === 'long',
        sz: coinQty.toFixed(6),
        limitPx: entryPrice.toFixed(2),
        orderType: orderType === 'market' ? { market: {} } : { limit: { tif: 'Gtc' } },
        reduceOnly: false,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Order submission failed');

      // Add to local orders
      const newOrder: PlacedOrder = {
        id: `${Date.now()}`,
        coin,
        side,
        size: orderSize,
        price: entryPrice.toFixed(2),
        type: orderType,
        leverage,
        time: new Date().toLocaleTimeString(),
        status: orderType === 'market' ? 'filled' : 'open',
      };
      setPlacedOrders(prev => [newOrder, ...prev]);

      setOrderStatus('success');
      toast.success(`${side === 'long' ? 'Long' : 'Short'} ${coin} order placed`, {
        description: `${orderSize} USD @ ${entryPrice.toFixed(2)} with ${leverage}x leverage`,
      });

      setTimeout(() => {
        setOrderStatus('idle');
        setOrderSize('');
        setLimitPrice('');
      }, 2000);
    } catch (err) {
      console.error('Order error:', err);
      setOrderStatus('error');
      toast.error('Order failed', { description: 'Please try again' });
      setTimeout(() => setOrderStatus('idle'), 3000);
    }
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
          <div><span className="text-muted-foreground/60 mr-1">24h Vol</span><span className="text-foreground font-medium">{selectedMarket?.volume}</span></div>
          <div><span className="text-muted-foreground/60 mr-1">OI</span><span className="text-foreground font-medium">{selectedMarket?.openInterest}</span></div>
          <div><span className="text-muted-foreground/60 mr-1">Funding</span>
            <span className={`font-medium ${(selectedMarket?.fundingRate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {((selectedMarket?.fundingRate || 0) * 100).toFixed(4)}%
            </span>
          </div>
          <div><span className="text-muted-foreground/60 mr-1">Max Lev</span><span className="text-foreground font-medium">{selectedMarket?.maxLeverage}x</span></div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-px bg-border/30">
        {/* Left: Market List */}
        <div className="bg-card flex flex-col max-h-[calc(100vh-200px)] lg:max-h-[700px]">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search markets..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50" />
            </div>
          </div>
          <div className="grid grid-cols-3 text-[10px] text-muted-foreground/60 font-medium px-3 py-1.5 border-b border-border/50 uppercase tracking-wider">
            <span>Market</span><span className="text-right">Price</span><span className="text-right">24h</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMarkets.map((market) => {
              const origIdx = markets.indexOf(market);
              const isSelected = selectedIdx === origIdx;
              return (
                <button key={market.symbol} onClick={() => setSelectedIdx(origIdx)}
                  className={`w-full grid grid-cols-3 items-center px-3 py-2 text-xs transition-colors ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-secondary/30 border-l-2 border-l-transparent'}`}>
                  <div className="flex items-center gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol); }} className="text-muted-foreground/40 hover:text-yellow-400">
                      <Star className={`w-3 h-3 ${favorites.has(market.symbol) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    <span className="font-semibold text-foreground">{market.symbol.replace('-PERP', '')}</span>
                    <span className="text-muted-foreground/40 text-[9px]">PERP</span>
                  </div>
                  <span className="text-right font-medium text-foreground">${market.price < 1 ? market.price.toFixed(4) : market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className={`text-right font-semibold ${market.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{market.change24h >= 0 ? '+' : ''}{market.change24h}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Chart + Bottom Panels */}
        <div className="bg-card flex flex-col">
          <div className="flex-1 min-h-[400px]">
            <TradingViewWidget symbol={tvSymbol} height={450} />
          </div>
          <div className="border-t border-border">
            <div className="flex items-center gap-0 border-b border-border">
              {(['positions', 'orders', 'trades'] as SubTab[]).map(tab => (
                <button key={tab} onClick={() => setSubTab(tab)}
                  className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${subTab === tab ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab} {tab === 'orders' && placedOrders.filter(o => o.status === 'open').length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-[10px]">{placedOrders.filter(o => o.status === 'open').length}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 min-h-[120px]">
              {subTab === 'positions' && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No open positions</p>
                  <p className="text-muted-foreground/50 text-xs mt-1">{isConnected ? 'Place a trade to get started' : 'Connect wallet to start trading'}</p>
                </div>
              )}
              {subTab === 'orders' && (
                placedOrders.length > 0 ? (
                  <div className="space-y-1">
                    {placedOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between text-xs px-2 py-2 rounded-lg hover:bg-secondary/20">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${o.side === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{o.side.toUpperCase()}</span>
                          <span className="text-foreground font-medium">{o.coin}</span>
                          <span className="text-muted-foreground">{o.leverage}x</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">${o.size} @ ${o.price}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${o.status === 'filled' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-primary/10 text-primary'}`}>{o.status}</span>
                          <span className="text-muted-foreground">{o.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6"><p className="text-muted-foreground text-sm">No orders</p></div>
                )
              )}
              {subTab === 'trades' && (
                placedOrders.filter(o => o.status === 'filled').length > 0 ? (
                  <div className="space-y-1">
                    {placedOrders.filter(o => o.status === 'filled').map(o => (
                      <div key={o.id} className="flex items-center justify-between text-xs px-2 py-2 rounded-lg hover:bg-secondary/20">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${o.side === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{o.side.toUpperCase()}</span>
                          <span className="text-foreground font-medium">{o.coin}</span>
                        </div>
                        <span className="text-foreground">${o.size} @ ${o.price}</span>
                        <span className="text-muted-foreground">{o.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6"><p className="text-muted-foreground text-sm">No recent trades</p></div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Entry */}
        <div className="bg-card flex flex-col border-l border-border">
          <div className="flex border-b border-border">
            {(['market', 'limit'] as OrderType[]).map(type => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${orderType === type ? 'text-foreground border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="p-3">
            <div className="grid grid-cols-2 gap-1 bg-secondary/30 rounded-lg p-0.5">
              <button onClick={() => setSide('long')}
                className={`py-2.5 rounded-md text-xs font-bold transition-all ${side === 'long' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <TrendingUp className="w-3.5 h-3.5 inline mr-1" />Long
              </button>
              <button onClick={() => setSide('short')}
                className={`py-2.5 rounded-md text-xs font-bold transition-all ${side === 'short' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <TrendingDown className="w-3.5 h-3.5 inline mr-1" />Short
              </button>
            </div>
          </div>

          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Leverage</span>
              <span className="text-xs font-bold text-foreground bg-secondary px-2 py-0.5 rounded">{leverage}x</span>
            </div>
            <input type="range" min={1} max={selectedMarket?.maxLeverage || 50} value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/50">
              <span>1x</span><span>{Math.floor((selectedMarket?.maxLeverage || 50) / 4)}x</span><span>{Math.floor((selectedMarket?.maxLeverage || 50) / 2)}x</span><span>{selectedMarket?.maxLeverage || 50}x</span>
            </div>
          </div>

          {orderType === 'limit' && (
            <div className="px-3 pb-3">
              <label className="text-xs text-muted-foreground mb-1.5 block">Limit Price</label>
              <div className="relative">
                <input type="text" value={limitPrice} onChange={(e) => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setLimitPrice(e.target.value); }}
                  placeholder={selectedMarket?.price.toFixed(2)}
                  className="w-full px-3 py-2.5 text-sm bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/40 font-medium" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
              </div>
            </div>
          )}

          <div className="px-3 pb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Size (USD)</label>
            <div className="relative">
              <input type="text" value={orderSize} onChange={(e) => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setOrderSize(e.target.value); }}
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/40 font-medium" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USD</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mt-2">
              {[10, 25, 50, 100].map(pct => (
                <button key={pct} className="py-1.5 text-[10px] font-medium rounded bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50">
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pb-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="text-foreground font-medium">${entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Notional</span>
              <span className="text-foreground font-medium">{notional > 0 ? `$${notional.toLocaleString()}` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Size ({coin})</span>
              <span className="text-foreground font-medium">{coinQty > 0 ? coinQty.toFixed(4) : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Funding Rate</span>
              <span className={`font-medium ${(selectedMarket?.fundingRate || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {((selectedMarket?.fundingRate || 0) * 100).toFixed(4)}%
              </span>
            </div>
          </div>

          <div className="px-3 pb-4 mt-auto">
            {isConnected ? (
              <button onClick={handlePlaceOrder} disabled={!orderSize || orderStatus !== 'idle'}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  orderStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  orderStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                  side === 'long'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/30 disabled:text-emerald-500/50'
                    : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/30 disabled:text-red-500/50'
                } disabled:cursor-not-allowed`}>
                {orderStatus === 'signing' && <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>}
                {orderStatus === 'submitting' && <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>}
                {orderStatus === 'success' && <><CheckCircle className="w-4 h-4" /> Order Placed!</>}
                {orderStatus === 'error' && <><AlertTriangle className="w-4 h-4" /> Failed</>}
                {orderStatus === 'idle' && <>{side === 'long' ? 'Long' : 'Short'} {coin} {orderType === 'market' ? '@ Market' : '@ Limit'}</>}
              </button>
            ) : (
              <button onClick={openConnectModal}
                className="w-full py-3 rounded-lg font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            )}
          </div>

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

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowConfirmModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[380px] bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground text-lg">Confirm Order</h3>
              </div>
              <div className="space-y-2 mb-5 p-3 rounded-xl bg-secondary/20 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Direction</span>
                  <span className={`font-bold ${side === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{side.toUpperCase()} {coin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Type</span>
                  <span className="text-foreground font-medium capitalize">{orderType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size</span>
                  <span className="text-foreground font-medium">${orderSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Leverage</span>
                  <span className="text-foreground font-medium">{leverage}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entry Price</span>
                  <span className="text-foreground font-medium">${entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notional</span>
                  <span className="text-foreground font-bold">${notional.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">By confirming, you will sign this order via your connected wallet and submit it to Hyperliquid.</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowConfirmModal(false)} className="py-2.5 rounded-lg font-medium text-sm border border-border text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={confirmOrder}
                  className={`py-2.5 rounded-lg font-bold text-sm text-white transition-all ${side === 'long' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  Confirm {side === 'long' ? 'Long' : 'Short'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
