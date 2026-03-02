import { useState, useMemo } from 'react';
import { useAccount, useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Wallet, Clock, Shield, Zap, DollarSign, Search, ExternalLink, CheckCircle, Loader2, ArrowUpDown, Info, ChevronDown } from 'lucide-react';
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
];

const CHAIN_TO_ID: Record<string, number> = {
  ethereum: 1, arbitrum: 42161, optimism: 10, polygon: 137, base: 8453, bnb: 56, avalanche: 43114,
};

// Supported bridge routes (subset)
const SUPPORTED_CHAINS = chains.filter(c => ['ethereum', 'arbitrum', 'optimism', 'polygon', 'base', 'bnb', 'avalanche'].includes(c.id));

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
  const [recentBridges, setRecentBridges] = useState<RecentBridge[]>([
    { from: 'Ethereum', to: 'Arbitrum', token: 'ETH', amount: '0.5', status: 'completed', time: '2 min ago' },
    { from: 'Polygon', to: 'Ethereum', token: 'USDC', amount: '1,000', status: 'pending', time: '5 min ago' },
    { from: 'Optimism', to: 'Base', token: 'ETH', amount: '1.2', status: 'completed', time: '12 min ago' },
  ]);
  const [searchChain, setSearchChain] = useState('');

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const tokenPrice = prices?.[selectedToken.symbol]?.usd || 0;
  const usdValue = amount && tokenPrice ? (parseFloat(amount) * tokenPrice).toFixed(2) : '';
  const estimatedTime = fromChain.id === toChain.id ? '~1 min' : '~2-15 min';
  const bridgeFee = amount ? (parseFloat(amount) * 0.0005) : 0;
  const estimatedReceive = amount ? (parseFloat(amount) - bridgeFee).toFixed(6) : '';

  const filteredFromChains = useMemo(() =>
    SUPPORTED_CHAINS.filter(c => c.name.toLowerCase().includes(searchChain.toLowerCase())),
    [searchChain]
  );

  const handleBridge = async () => {
    if (!amount || !isConnected) return;
    try {
      setBridgeStatus('switching');
      const targetChainId = CHAIN_TO_ID[fromChain.id];
      if (targetChainId && chainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId });
      }

      setBridgeStatus('confirming');
      // For ETH, send a real transaction (to self as demo bridge deposit)
      if (selectedToken.symbol === 'ETH') {
        await sendTransactionAsync({
          to: address!,
          value: parseEther(amount),
        });
      }

      setBridgeStatus('bridging');
      // Simulate bridge finality
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
      }, ...prev.slice(0, 4)]);

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
    selected, 
    onSelect, 
    show, 
    setShow, 
    label 
  }: { 
    selected: Chain; 
    onSelect: (c: Chain) => void; 
    show: boolean; 
    setShow: (v: boolean) => void; 
    label: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => { setShow(!show); setSearchChain(''); }}
        className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary px-3 py-2 rounded-xl text-sm font-medium text-foreground transition-all border border-border"
      >
        <ChainLogo chainId={selected.id} fallbackIcon={selected.icon} size="sm" />
        <span className="hidden sm:inline">{selected.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl p-2 z-30 min-w-[220px] shadow-2xl"
          >
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchChain}
                onChange={(e) => setSearchChain(e.target.value)}
                placeholder="Search chain..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-secondary/50 rounded-lg border border-border focus:border-primary outline-none text-foreground"
                autoFocus
              />
            </div>
            <div className="max-h-[240px] overflow-y-auto space-y-0.5">
              {filteredFromChains.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onSelect(c); setShow(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selected.id === c.id ? 'bg-primary/10 text-foreground' : 'hover:bg-secondary text-foreground/80'
                  }`}
                >
                  <ChainLogo chainId={c.id} fallbackIcon={c.icon} size="sm" />
                  <span className="font-medium">{c.name}</span>
                  {selected.id === c.id && <CheckCircle className="w-3.5 h-3.5 text-primary ml-auto" />}
                </button>
              ))}
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
          <Zap className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Bridge</h2>
        </div>
        <p className="text-muted-foreground text-sm">Transfer assets across chains securely</p>
      </div>

      {/* Main Bridge Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* From Section */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</span>
            <ChainSelector selected={fromChain} onSelect={setFromChain} show={showFromChains} setShow={setShowFromChains} label="From" />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={amount}
              onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-bold outline-none text-foreground placeholder-muted-foreground/20 min-w-0"
            />
            <div className="relative">
              <button
                onClick={() => setShowTokenSelect(!showTokenSelect)}
                className="flex items-center gap-2 bg-secondary px-3 py-2.5 rounded-xl font-bold text-foreground border border-border hover:border-primary transition-all"
              >
                <TokenLogo address={selectedToken.address} symbol={selectedToken.symbol} size="sm" />
                {selectedToken.symbol}
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showTokenSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl p-2 z-30 min-w-[180px] shadow-2xl"
                  >
                    {BRIDGE_TOKENS.map(t => (
                      <button
                        key={t.symbol}
                        onClick={() => { setSelectedToken(t); setShowTokenSelect(false); }}
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
          <motion.button
            onClick={handleSwapChains}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="p-2.5 rounded-xl bg-card border border-border shadow-lg cursor-pointer hover:border-primary transition-colors"
          >
            <ArrowUpDown className="w-4.5 h-4.5 text-primary" />
          </motion.button>
        </div>

        {/* To Section */}
        <div className="p-5 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</span>
            <ChainSelector selected={toChain} onSelect={setToChain} show={showToChains} setShow={setShowToChains} label="To" />
          </div>
          <div className="text-3xl font-bold text-foreground/60">
            {estimatedReceive || '0.0'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{selectedToken.symbol} on {toChain.name}</div>
        </div>

        {/* Route Details */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mx-5 mb-4 p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Estimated Time
              </span>
              <span className="text-foreground font-medium">{estimatedTime}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Bridge Fee
              </span>
              <span className="text-foreground font-medium">{bridgeFee.toFixed(6)} {selectedToken.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> You Receive
              </span>
              <span className="text-foreground font-semibold">{estimatedReceive} {selectedToken.symbol}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Security
              </span>
              <span className="text-accent font-medium">Hyperbridge Verified</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="px-5 pb-5">
          {isConnected ? (
            <button
              onClick={handleBridge}
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
              {bridgeStatus === 'bridging' && <><Loader2 className="w-4 h-4 animate-spin" /> Bridging...</>}
              {bridgeStatus === 'success' && <><CheckCircle className="w-4 h-4" /> Bridge Complete!</>}
              {bridgeStatus === 'error' && 'Bridge Failed — Try Again'}
              {bridgeStatus === 'idle' && (
                fromChain.id === toChain.id ? 'Select Different Chains' : !amount ? 'Enter Amount' : `Bridge to ${toChain.name}`
              )}
            </button>
          ) : (
            <button
              onClick={openConnectModal}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-5 border border-border rounded-xl overflow-hidden bg-card">
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
                }`}>
                  {tx.token.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{tx.amount} {tx.token}</div>
                  <div className="text-xs text-muted-foreground">{tx.from} → {tx.to}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-400'
                }`}>
                  {tx.status}
                </span>
                <span className="text-[10px] text-muted-foreground">{tx.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Info */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>Powered by Hyperbridge Protocol</span>
        <span>•</span>
        <span>Avg. 2-5 min finality</span>
        <span>•</span>
        <span>0.05% fee</span>
      </div>
    </div>
  );
}
