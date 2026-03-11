import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCoinGeckoPrices } from '@/hooks/useCoinGeckoPrices';
import { useChainlinkPrices } from '@/hooks/useChainlinkPrices';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, ExternalLink, Copy, RefreshCw, Coins, LayoutDashboard, Star, Bell, BellRing, Plus, X, ChevronUp, ChevronDown, Trash2, Check } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { formatUnits } from 'viem';
import { TokenLogo } from './TokenLogo';
import { toast } from 'sonner';

const ERC20_BALANCE_ABI = [{
  name: 'balanceOf', type: 'function', stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}] as const;

const ALL_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, isNative: true },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
  { symbol: 'MKR', name: 'Maker', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18 },
  { symbol: 'CRV', name: 'Curve DAO', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18 },
  { symbol: 'LDO', name: 'Lido DAO', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18 },
  { symbol: 'ARB', name: 'Arbitrum', address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18 },
  { symbol: 'COMP', name: 'Compound', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', decimals: 18 },
  { symbol: 'SNX', name: 'Synthetix', address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', decimals: 18 },
  { symbol: 'SUSHI', name: 'SushiSwap', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', decimals: 18 },
  { symbol: 'SOL', name: 'Solana', address: '0x0000000000000000000000000000000000000000', decimals: 9 },
  { symbol: 'DOGE', name: 'Dogecoin', address: '0x0000000000000000000000000000000000000000', decimals: 8 },
  { symbol: 'PEPE', name: 'Pepe', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18 },
  { symbol: 'SHIB', name: 'Shiba Inu', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18 },
];

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatUsd(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

// Persist watchlist and alerts in localStorage
function loadWatchlist(): Set<string> {
  try {
    const saved = localStorage.getItem('portfolio-watchlist');
    return saved ? new Set(JSON.parse(saved)) : new Set(['ETH', 'BTC', 'SOL', 'LINK']);
  } catch { return new Set(['ETH', 'BTC', 'SOL', 'LINK']); }
}

function saveWatchlist(set: Set<string>) {
  localStorage.setItem('portfolio-watchlist', JSON.stringify([...set]));
}

function loadAlerts(): PriceAlert[] {
  try {
    const saved = localStorage.getItem('portfolio-alerts');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem('portfolio-alerts', JSON.stringify(alerts));
}

type ActiveView = 'tokens' | 'watchlist' | 'alerts' | 'defi';

export function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: cgPrices, isRefetching: pricesRefetching } = useCoinGeckoPrices();
  const { data: chainlinkPrices } = useChainlinkPrices();
  const { data: ethBalance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('tokens');
  const [watchlist, setWatchlist] = useState<Set<string>>(loadWatchlist);
  const [alerts, setAlerts] = useState<PriceAlert[]>(loadAlerts);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertSymbol, setAlertSymbol] = useState('ETH');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const prevPricesRef = useRef<Record<string, number>>({});

  // Read ERC20 balances
  const erc20Tokens = ALL_TOKENS.filter(t => !t.isNative && t.address !== '0x0000000000000000000000000000000000000000');
  const { data: tokenBalances } = useReadContracts({
    contracts: erc20Tokens.map(t => ({
      address: t.address as `0x${string}`,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [address!],
    })),
    query: { enabled: !!address, refetchInterval: 30000 },
  });

  const getPrice = useCallback((symbol: string): number => {
    const clSymbol = symbol === 'WBTC' ? 'BTC' : symbol;
    if (chainlinkPrices?.[clSymbol]?.usd) return chainlinkPrices[clSymbol].usd;
    if (cgPrices?.[symbol]?.usd) return cgPrices[symbol].usd;
    return 0;
  }, [chainlinkPrices, cgPrices]);

  const getChange = (symbol: string): number => {
    return cgPrices?.[symbol]?.usd_24h_change || 0;
  };

  // Check alerts against current prices
  useEffect(() => {
    if (!cgPrices && !chainlinkPrices) return;

    const updatedAlerts = alerts.map(alert => {
      if (alert.triggered) return alert;
      const price = getPrice(alert.symbol);
      if (price <= 0) return alert;

      const shouldTrigger = alert.direction === 'above'
        ? price >= alert.targetPrice
        : price <= alert.targetPrice;

      if (shouldTrigger) {
        toast.success(`🔔 Price Alert: ${alert.symbol}`, {
          description: `${alert.symbol} is now $${formatPrice(price)} (target: ${alert.direction} $${formatPrice(alert.targetPrice)})`,
          duration: 10000,
        });
        return { ...alert, triggered: true };
      }
      return alert;
    });

    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      setAlerts(updatedAlerts);
      saveAlerts(updatedAlerts);
    }
  }, [cgPrices, chainlinkPrices, getPrice]);

  const tokenData = useMemo(() => {
    return ALL_TOKENS.map((token) => {
      let balance = 0;
      if (token.isNative) {
        balance = ethBalance ? Number(ethBalance.value) / 10 ** ethBalance.decimals : 0;
      } else if (token.address !== '0x0000000000000000000000000000000000000000') {
        const idx = erc20Tokens.findIndex(t => t.address === token.address);
        if (idx >= 0 && tokenBalances?.[idx]?.result !== undefined) {
          balance = Number(formatUnits(tokenBalances[idx].result as bigint, token.decimals));
        }
      }
      const price = getPrice(token.symbol);
      const value = balance * price;
      const change = getChange(token.symbol);
      return { ...token, balance, price, value, change };
    }).sort((a, b) => b.value - a.value);
  }, [ethBalance, tokenBalances, cgPrices, chainlinkPrices, getPrice]);

  const watchlistData = useMemo(() => {
    return tokenData.filter(t => watchlist.has(t.symbol));
  }, [tokenData, watchlist]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      saveWatchlist(next);
      return next;
    });
  };

  const addAlert = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;
    const newAlert: PriceAlert = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      symbol: alertSymbol,
      targetPrice: parseFloat(alertPrice),
      direction: alertDirection,
      triggered: false,
      createdAt: Date.now(),
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    saveAlerts(updated);
    setShowAlertForm(false);
    setAlertPrice('');
    toast.success(`Alert set: ${alertSymbol} ${alertDirection} $${alertPrice}`);
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const clearTriggered = () => {
    const updated = alerts.filter(a => !a.triggered);
    setAlerts(updated);
    saveAlerts(updated);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeAlertCount = alerts.filter(a => !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;

  // Not connected state
  if (!isConnected) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-16">
        <div className="rounded-2xl border border-border bg-card p-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LayoutDashboard className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Portfolio Dashboard</h2>
          <p className="text-muted-foreground text-sm mb-6">Connect your wallet to view live balances, watchlist, price alerts, and DeFi positions.</p>
          <button onClick={openConnectModal}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all">
            <Wallet className="w-4 h-4 inline mr-2" />Connect Wallet
          </button>
          {/* Watchlist works without wallet too */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Or browse watchlist & alerts without connecting</p>
            <button onClick={() => {}} className="text-xs text-primary hover:underline">
              View Market Prices →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalWalletValue = tokenData.reduce((s, t) => s + t.value, 0);
  const tokensWithBalance = tokenData.filter(t => t.balance > 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Portfolio</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded-md">{shortenAddress(address!)}</span>
            <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-all">
              <Copy className="w-3 h-3" />
            </button>
            {copied && <span className="text-[10px] text-primary font-medium">Copied!</span>}
            <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Net Worth</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground">{formatUsd(totalWalletValue)}</p>
            {pricesRefetching && <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tokens</p>
          <p className="text-lg font-bold text-foreground">{tokensWithBalance.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ETH</p>
          <p className="text-lg font-bold text-foreground">{(ethBalance ? Number(ethBalance.value) / 1e18 : 0).toFixed(4)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Watchlist</p>
          <p className="text-lg font-bold text-foreground">{watchlist.size}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Alerts</p>
          <div className="flex items-center gap-1.5">
            <p className="text-lg font-bold text-foreground">{activeAlertCount}</p>
            {triggeredCount > 0 && (
              <span className="text-[10px] bg-emerald-400/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">{triggeredCount} triggered</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 w-fit overflow-x-auto">
        {[
          { id: 'tokens' as ActiveView, label: 'Tokens', icon: <PieChart className="w-3.5 h-3.5" /> },
          { id: 'watchlist' as ActiveView, label: 'Watchlist', icon: <Star className="w-3.5 h-3.5" /> },
          { id: 'alerts' as ActiveView, label: 'Alerts', icon: <Bell className="w-3.5 h-3.5" />, badge: activeAlertCount },
          { id: 'defi' as ActiveView, label: 'DeFi', icon: <Coins className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeView === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab.icon}{tab.label}
            {tab.badge ? <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{tab.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* TOKENS VIEW */}
      {activeView === 'tokens' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-6 text-[10px] text-muted-foreground font-medium px-4 py-2.5 border-b border-border uppercase tracking-wider">
            <span className="col-span-2">Asset</span><span className="text-right">Price</span><span className="text-right">24h</span><span className="text-right">Balance</span><span className="text-right">Value</span>
          </div>
          <div className="divide-y divide-border/50">
            {tokenData.map((token) => {
              const isUp = token.change >= 0;
              const isWatched = watchlist.has(token.symbol);
              return (
                <motion.div key={token.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="grid grid-cols-6 items-center px-4 py-2.5 hover:bg-secondary/30 transition-all">
                  <div className="col-span-2 flex items-center gap-2">
                    <button onClick={() => toggleWatchlist(token.symbol)}
                      className="text-muted-foreground/40 hover:text-yellow-400 transition-colors shrink-0">
                      <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                    <TokenLogo address={token.address} symbol={token.symbol} size="sm" />
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground text-sm">{token.symbol}</span>
                      <span className="text-[10px] text-muted-foreground block leading-tight truncate">{token.name}</span>
                    </div>
                  </div>
                  <span className="text-right text-xs font-medium text-foreground">${formatPrice(token.price)}</span>
                  <span className={`text-right text-xs font-semibold flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(token.change).toFixed(1)}%
                  </span>
                  <span className="text-right text-xs font-medium text-foreground">
                    {token.balance > 0 ? (token.balance < 0.0001 ? token.balance.toExponential(2) : token.balance.toFixed(4)) : '0'}
                  </span>
                  <span className="text-right text-xs font-medium text-foreground">
                    {token.value > 0.01 ? formatUsd(token.value) : '-'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* WATCHLIST VIEW */}
      {activeView === 'watchlist' && (
        <div className="space-y-3">
          {watchlistData.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Your watchlist is empty</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Star tokens in the Tokens tab to add them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {watchlistData.map(token => {
                const isUp = token.change >= 0;
                return (
                  <motion.div key={token.symbol} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <TokenLogo address={token.address} symbol={token.symbol} size="sm" />
                        <div>
                          <span className="font-bold text-foreground text-sm">{token.symbol}</span>
                          <span className="text-[10px] text-muted-foreground block">{token.name}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleWatchlist(token.symbol)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-bold text-foreground">${formatPrice(token.price)}</p>
                        {token.balance > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{token.balance.toFixed(4)} = {formatUsd(token.value)}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-0.5 text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {Math.abs(token.change).toFixed(2)}%
                      </div>
                    </div>
                    {/* Quick alert button */}
                    <button onClick={() => { setAlertSymbol(token.symbol); setActiveView('alerts'); setShowAlertForm(true); }}
                      className="mt-3 w-full py-1.5 rounded-lg border border-border text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all flex items-center justify-center gap-1">
                      <Bell className="w-3 h-3" /> Set Alert
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ALERTS VIEW */}
      {activeView === 'alerts' && (
        <div className="space-y-3">
          {/* Add Alert Button / Form */}
          <AnimatePresence mode="wait">
            {showAlertForm ? (
              <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-primary/30 bg-card p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary" /> New Price Alert
                  </h4>
                  <button onClick={() => setShowAlertForm(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Token Select */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Token</label>
                    <select value={alertSymbol} onChange={e => setAlertSymbol(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
                      {ALL_TOKENS.map(t => (
                        <option key={t.symbol} value={t.symbol}>{t.symbol} — {t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Direction */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Condition</label>
                    <div className="grid grid-cols-2 gap-1 bg-secondary/30 rounded-lg p-0.5">
                      <button onClick={() => setAlertDirection('above')}
                        className={`py-2 rounded-md text-xs font-medium transition-all ${alertDirection === 'above' ? 'bg-emerald-500/15 text-emerald-400 shadow-sm' : 'text-muted-foreground'}`}>
                        <ChevronUp className="w-3.5 h-3.5 inline mr-0.5" />Above
                      </button>
                      <button onClick={() => setAlertDirection('below')}
                        className={`py-2 rounded-md text-xs font-medium transition-all ${alertDirection === 'below' ? 'bg-red-400/15 text-red-400 shadow-sm' : 'text-muted-foreground'}`}>
                        <ChevronDown className="w-3.5 h-3.5 inline mr-0.5" />Below
                      </button>
                    </div>
                  </div>

                  {/* Target Price */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Target Price
                      {getPrice(alertSymbol) > 0 && (
                        <span className="text-muted-foreground/60 ml-1">(now: ${formatPrice(getPrice(alertSymbol))})</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input type="text" value={alertPrice} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setAlertPrice(e.target.value)}
                        placeholder="0.00" className="w-full bg-secondary/50 border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                <button onClick={addAlert} disabled={!alertPrice || parseFloat(alertPrice) <= 0}
                  className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Create Alert
                </button>
              </motion.div>
            ) : (
              <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setShowAlertForm(true)}
                className="w-full py-3 rounded-xl border border-dashed border-border hover:border-primary/40 bg-card text-muted-foreground hover:text-foreground text-sm font-medium transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Price Alert
              </motion.button>
            )}
          </AnimatePresence>

          {/* Alert List */}
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No price alerts set</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Get notified when tokens hit your target price</p>
            </div>
          ) : (
            <div className="space-y-2">
              {triggeredCount > 0 && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">{triggeredCount} triggered alert{triggeredCount > 1 ? 's' : ''}</span>
                  <button onClick={clearTriggered} className="text-[10px] text-primary hover:underline">Clear triggered</button>
                </div>
              )}
              {alerts.map(alert => {
                const currentPrice = getPrice(alert.symbol);
                const tokenInfo = ALL_TOKENS.find(t => t.symbol === alert.symbol);
                const progress = currentPrice > 0 ? (
                  alert.direction === 'above'
                    ? Math.min((currentPrice / alert.targetPrice) * 100, 100)
                    : Math.min((alert.targetPrice / currentPrice) * 100, 100)
                ) : 0;

                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`rounded-xl border bg-card p-4 transition-all ${
                      alert.triggered ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-border'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <TokenLogo address={tokenInfo?.address || ''} symbol={alert.symbol} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground text-sm">{alert.symbol}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              alert.direction === 'above' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                            }`}>
                              {alert.direction === 'above' ? '↑' : '↓'} {alert.direction}
                            </span>
                            {alert.triggered && (
                              <span className="text-[10px] font-bold bg-emerald-400/15 text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Triggered
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              Target: ${formatPrice(alert.targetPrice)}
                            </span>
                            {currentPrice > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                • Now: ${formatPrice(currentPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeAlert(alert.id)}
                        className="text-muted-foreground/40 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Progress bar */}
                    {!alert.triggered && currentPrice > 0 && (
                      <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full rounded-full ${alert.direction === 'above' ? 'bg-emerald-400' : 'bg-red-400'}`}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DEFI VIEW */}
      {activeView === 'defi' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" /> Perpetual Positions
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No open positions on Hyperliquid</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Place a trade on the Perps tab to see positions here</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-primary" /> Aave V3 Positions
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No active supply or borrow positions</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Supply or borrow on the Lend tab to track positions here</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-primary" /> Bridge History
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No recent bridge transactions</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Bridge assets to see transaction history here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}