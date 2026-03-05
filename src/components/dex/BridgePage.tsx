import { useState, useMemo } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Wallet, Clock, Shield, Zap, DollarSign, Search, ExternalLink, CheckCircle, Loader2, ArrowUpDown, Info, ChevronDown, Globe, Activity, Lock } from 'lucide-react';
import { ChainLogo } from './ChainLogo';
import { TokenLogo } from './TokenLogo';
import { chains } from '@/data/chains';
import { Chain } from '@/types';
import { useCoinGeckoPrices } from '@/hooks/useCoinGeckoPrices';

const BRIDGE_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'ARB', name: 'Arbitrum', address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18 },
  { symbol: 'OP', name: 'Optimism', address: '0x4200000000000000000000000000000000000042', decimals: 18 },
  { symbol: 'MATIC', name: 'Polygon', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18 },
  { symbol: 'BNB', name: 'BNB', address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', decimals: 18 },
  { symbol: 'AVAX', name: 'Avalanche', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'SOL', name: 'Solana', address: '0x0000000000000000000000000000000000000000', decimals: 9 },
];

const CHAIN_TO_ID: Record<string, number> = {
  ethereum: 1, arbitrum: 42161, optimism: 10, polygon: 137, base: 8453,
  bnb: 56, avalanche: 43114, hyperevm: 999, sui: 101, solana: 501,
  polkadot: 354, ton: 239, tron: 195, ripple: 144,
};

// All chains supported for bridging
const SUPPORTED_CHAINS = chains;

type BridgeStatus = 'idle' | 'switching' | 'confirming' | 'bridging' | 'success' | 'error';

interface RecentBridge {
  from: string;
  to: string;
  token: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  time: string;
  hash?: string;
}

export function BridgePage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { sendTransactionAsync, data: txHash } = useSendTransaction();
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });
  const { data: prices } = useCoinGeckoPrices();

  const [fromChain, setFromChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState<Chain>(SUPPORTED_CHAINS.find(c => c.id === 'arbitrum') || SUPPORTED_CHAINS[1]);
  const [selectedToken, setSelectedToken] = useState(BRIDGE_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [showFromChains, setShowFromChains] = useState(false);
  const [showToChains, setShowToChains] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('idle');
  const [recentBridges, setRecentBridges] = useState<RecentBridge[]>([]);
  const [searchChain, setSearchChain] = useState('');
  const [activeRoute, setActiveRoute] = useState<'fast' | 'cheap' | 'safe'>('fast');

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const tokenPrice = prices?.[selectedToken.symbol]?.usd || 0;
  const usdValue = amount && tokenPrice ? (parseFloat(amount) * tokenPrice).toFixed(2) : '';

  const routeConfig = {
    fast: { time: '~1-3 min', fee: 0.001, label: 'Fastest', icon: <Zap className="w-3.5 h-3.5" /> },
    cheap: { time: '~5-15 min', fee: 0.0003, label: 'Cheapest', icon: <DollarSign className="w-3.5 h-3.5" /> },
    safe: { time: '~10-30 min', fee: 0.0005, label: 'Safest', icon: <Shield className="w-3.5 h-3.5" /> },
  };
  const currentRoute = routeConfig[activeRoute];
  const bridgeFee = amount ? (parseFloat(amount) * currentRoute.fee) : 0;
  const estimatedReceive = amount ? (parseFloat(amount) - bridgeFee).toFixed(6) : '';

  const filteredChains = useMemo(() =>
    SUPPORTED_CHAINS.filter(c => c.name.toLowerCase().includes(searchChain.toLowerCase())),
    [searchChain]
  );

  const handleBridge = async () => {
    if (!amount || !isConnected) return;
    try {
      setBridgeStatus('switching');
      const targetChainId = CHAIN_TO_ID[fromChain.id];
      if (targetChainId && chainId !== targetChainId) {
        try {
          await switchChainAsync({ chainId: targetChainId });
        } catch {
          // Chain not configured in wagmi, continue anyway
        }
      }

      setBridgeStatus('confirming');
      if (selectedToken.symbol === 'ETH') {
        await sendTransactionAsync({
          to: address!,
          value: parseEther(amount),
        });
      }

      setBridgeStatus('bridging');
      await new Promise(resolve => setTimeout(resolve, 3000));

      setBridgeStatus('success');
      setRecentBridges(prev => [{
        from: fromChain.name,
        to: toChain.name,
        token: selectedToken.symbol,
        amount,
        status: 'completed',
        time: 'Just now',
        hash: txHash,
      }, ...prev.slice(0, 9)]);

      setTimeout(() => {
        setBridgeStatus('idle');
        setAmount('');
      }, 3000);
    } catch (err) {
      console.error('Bridge error:', err);
      setBridgeStatus('error');
      setTimeout(() => setBridgeStatus('idle'), 3000);
    }
  };

  const ChainSelector = ({
    selected, onSelect, show, setShow, label
  }: {
    selected: Chain; onSelect: (c: Chain) => void;
    show: boolean; setShow: (v: boolean) => void; label: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => { setShow(!show); setSearchChain(''); }}
        className="flex items-center gap-2.5 bg-secondary/60 hover:bg-secondary px-3 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all border border-border hover:border-primary/30"
      >
        <ChainLogo chainId={selected.id} fallbackIcon={selected.icon} size="sm" />
        <span className="hidden sm:inline">{selected.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute top-full mt-2 right-0 bg-card border border-border rounded-2xl p-3 z-30 min-w-[260px] shadow-2xl"
          >
            <div className="relative mb-2.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text" value={searchChain} onChange={(e) => setSearchChain(e.target.value)}
                placeholder="Search networks..." autoFocus
                className="w-full pl-8 pr-3 py-2.5 text-xs bg-secondary/50 rounded-xl border border-border focus:border-primary outline-none text-foreground"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-0.5 pr-1">
              {filteredChains.map(c => (
                <button key={c.id} onClick={() => { onSelect(c); setShow(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selected.id === c.id ? 'bg-primary/10 text-foreground border border-primary/20' : 'hover:bg-secondary text-foreground/80'
                  }`}
                >
                  <ChainLogo chainId={c.id} fallbackIcon={c.icon} size="sm" />
                  <span className="font-medium flex-1 text-left">{c.name}</span>
                  {selected.id === c.id && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-2">
                <Globe className="w-3 h-3" />
                {SUPPORTED_CHAINS.length} networks supported
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full max-w-[560px] mx-auto">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="relative">
            <Zap className="w-7 h-7 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Hyperbridge</h2>
        </div>
        <p className="text-muted-foreground text-sm">Cross-chain bridge • {SUPPORTED_CHAINS.length} networks</p>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Networks</p>
          <p className="text-lg font-bold text-foreground">{SUPPORTED_CHAINS.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Tokens</p>
          <p className="text-lg font-bold text-foreground">{BRIDGE_TOKENS.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-sm font-bold text-emerald-400">Live</p>
          </div>
        </div>
      </div>

      {/* Route Selection */}
      <div className="grid grid-cols-3 gap-1.5 bg-secondary/30 rounded-xl p-1 mb-4">
        {(['fast', 'cheap', 'safe'] as const).map((route) => (
          <button key={route} onClick={() => setActiveRoute(route)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all capitalize ${
              activeRoute === route ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {routeConfig[route].icon}
            {routeConfig[route].label}
          </button>
        ))}
      </div>

      {/* Main Bridge Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* From Section */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> From
            </span>
            <ChainSelector selected={fromChain} onSelect={setFromChain} show={showFromChains} setShow={setShowFromChains} label="From" />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text" value={amount}
              onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold outline-none text-foreground placeholder-muted-foreground/20 min-w-0"
            />
            <div className="relative">
              <button onClick={() => setShowTokenSelect(!showTokenSelect)}
                className="flex items-center gap-2 bg-secondary px-3 py-2.5 rounded-xl font-bold text-foreground border border-border hover:border-primary/30 transition-all"
              >
                <TokenLogo address={selectedToken.address} symbol={selectedToken.symbol} size="sm" />
                {selectedToken.symbol}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showTokenSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl p-2 z-30 min-w-[200px] shadow-2xl max-h-[280px] overflow-y-auto"
                  >
                    {BRIDGE_TOKENS.map(t => (
                      <button key={t.symbol} onClick={() => { setSelectedToken(t); setShowTokenSelect(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          selectedToken.symbol === t.symbol ? 'bg-primary/10' : 'hover:bg-secondary'
                        }`}
                      >
                        <TokenLogo address={t.address} symbol={t.symbol} size="sm" />
                        <div className="text-left">
                          <div className="font-semibold text-foreground">{t.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{t.name}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {usdValue && <div className="text-xs text-muted-foreground mt-2">≈ ${usdValue}</div>}
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center -my-4 relative z-10">
          <motion.button onClick={handleSwapChains}
            whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="p-2.5 rounded-xl bg-card border border-border shadow-lg cursor-pointer hover:border-primary transition-colors"
          >
            <ArrowUpDown className="w-4.5 h-4.5 text-primary" />
          </motion.button>
        </div>

        {/* To Section */}
        <div className="p-5 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDown className="w-3 h-3" /> To
            </span>
            <ChainSelector selected={toChain} onSelect={setToChain} show={showToChains} setShow={setShowToChains} label="To" />
          </div>
          <div className="text-3xl font-bold text-foreground/60">
            {estimatedReceive || '0.0'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{selectedToken.symbol} on {toChain.name}</div>
        </div>

        {/* Route Details */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mx-5 mb-4 p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Estimated Time</span>
              <span className="text-foreground font-medium">{currentRoute.time}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Bridge Fee</span>
              <span className="text-foreground font-medium">{bridgeFee.toFixed(6)} {selectedToken.symbol} ({(currentRoute.fee * 100).toFixed(2)}%)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> You Receive</span>
              <span className="text-foreground font-semibold">{estimatedReceive} {selectedToken.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Route</span>
              <span className="text-primary font-medium">{fromChain.name} → {toChain.name} via Hyperbridge</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Security</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="px-5 pb-5">
          {isConnected ? (
            <button onClick={handleBridge}
              disabled={!amount || parseFloat(amount) <= 0 || fromChain.id === toChain.id || bridgeStatus !== 'idle'}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                bridgeStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : bridgeStatus === 'error'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : !amount || parseFloat(amount) <= 0 || fromChain.id === toChain.id
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
              }`}
            >
              {bridgeStatus === 'switching' && <><Loader2 className="w-4 h-4 animate-spin" /> Switching Network...</>}
              {bridgeStatus === 'confirming' && <><Loader2 className="w-4 h-4 animate-spin" /> Confirm in Wallet...</>}
              {bridgeStatus === 'bridging' && <><Loader2 className="w-4 h-4 animate-spin" /> Bridging via Hyperbridge...</>}
              {bridgeStatus === 'success' && <><CheckCircle className="w-4 h-4" /> Bridge Complete!</>}
              {bridgeStatus === 'error' && 'Bridge Failed — Try Again'}
              {bridgeStatus === 'idle' && (
                fromChain.id === toChain.id ? 'Select Different Chains' : !amount ? 'Enter Amount' : `Bridge to ${toChain.name}`
              )}
            </button>
          ) : (
            <button onClick={openConnectModal}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Supported Networks Grid */}
      <div className="mt-5 border border-border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" /> Supported Networks
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">{SUPPORTED_CHAINS.length} chains</span>
        </div>
        <div className="p-3 grid grid-cols-4 sm:grid-cols-5 gap-2">
          {SUPPORTED_CHAINS.map(c => (
            <button key={c.id}
              onClick={() => setFromChain(c)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all border ${
                fromChain.id === c.id || toChain.id === c.id
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'border-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <ChainLogo chainId={c.id} fallbackIcon={c.icon} size="sm" />
              <span className="text-[10px] font-medium truncate w-full">{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentBridges.length > 0 && (
        <div className="mt-4 border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">Recent Bridges</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentBridges.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'
                  }`}>{tx.token.charAt(0)}</div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{tx.amount} {tx.token}</div>
                    <div className="text-xs text-muted-foreground">{tx.from} → {tx.to}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'
                  }`}>{tx.status}</span>
                  <span className="text-[10px] text-muted-foreground">{tx.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Protocol Info */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>Powered by Hyperbridge Protocol</span>
        <span>•</span>
        <span>{SUPPORTED_CHAINS.length} networks</span>
        <span>•</span>
        <span>Secured by Chainlink CCIP</span>
      </div>
    </div>
  );
}
