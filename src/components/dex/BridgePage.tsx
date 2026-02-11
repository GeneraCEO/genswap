import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { ArrowDown, Wallet, Clock, Shield, Zap, DollarSign } from 'lucide-react';
import { ChainLogo } from './ChainLogo';
import { chains } from '@/data/chains';
import { Chain } from '@/types';

const BRIDGE_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
];

const RECENT_TXS = [
  { from: 'Ethereum', to: 'Arbitrum', token: 'ETH', amount: '0.5', status: 'completed', time: '2 min ago' },
  { from: 'Polygon', to: 'Ethereum', token: 'USDC', amount: '1,000', status: 'pending', time: '5 min ago' },
  { from: 'Optimism', to: 'Base', token: 'ETH', amount: '1.2', status: 'completed', time: '12 min ago' },
];

export function BridgePage() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [fromChain, setFromChain] = useState<Chain>(chains[0]);
  const [toChain, setToChain] = useState<Chain>(chains.find(c => c.id === 'arbitrum') || chains[1]);
  const [selectedToken, setSelectedToken] = useState(BRIDGE_TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [showFromChains, setShowFromChains] = useState(false);
  const [showToChains, setShowToChains] = useState(false);

  const handleSwapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const estimatedTime = fromChain.id === toChain.id ? '~1 min' : '~2-15 min';
  const estimatedFee = amount ? `~$${(parseFloat(amount || '0') * 0.001).toFixed(2)}` : '$0.00';

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Bridge</h2>
        </div>
        <p className="text-muted-foreground">Cross-chain transfers powered by Hyperbridge</p>
      </div>

      <div className="rounded-3xl border-2 border-primary/40 bg-background p-1 shadow-2xl shadow-primary/10">
        <div className="bg-background rounded-[22px] p-5 sm:p-6">
          {/* From Chain */}
          <div className="rounded-2xl border-2 border-primary/60 bg-card p-5 mb-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted-foreground">From</span>
              <div className="relative">
                <button
                  onClick={() => setShowFromChains(!showFromChains)}
                  className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/80 transition-all border border-border"
                >
                  <ChainLogo chainId={fromChain.id} fallbackIcon={fromChain.icon} size="sm" />
                  {fromChain.name}
                </button>
                {showFromChains && (
                  <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-xl p-2 z-20 min-w-[180px] shadow-xl">
                    {chains.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setFromChain(c); setShowFromChains(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground transition-all"
                      >
                        <ChainLogo chainId={c.id} fallbackIcon={c.icon} size="sm" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={amount}
                onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-4xl font-bold outline-none text-foreground placeholder-muted-foreground/30 min-w-0"
              />
              <select
                value={selectedToken.symbol}
                onChange={(e) => setSelectedToken(BRIDGE_TOKENS.find(t => t.symbol === e.target.value) || BRIDGE_TOKENS[0])}
                className="bg-secondary px-4 py-3 rounded-2xl font-bold text-foreground border border-border appearance-none cursor-pointer"
              >
                {BRIDGE_TOKENS.map(t => (
                  <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <motion.button
              onClick={handleSwapChains}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-card border-2 border-primary shadow-lg shadow-primary/20 cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 text-primary" />
            </motion.button>
          </div>

          {/* To Chain */}
          <div className="rounded-2xl border-2 border-primary/60 bg-card p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-muted-foreground">To</span>
              <div className="relative">
                <button
                  onClick={() => setShowToChains(!showToChains)}
                  className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/80 transition-all border border-border"
                >
                  <ChainLogo chainId={toChain.id} fallbackIcon={toChain.icon} size="sm" />
                  {toChain.name}
                </button>
                {showToChains && (
                  <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-xl p-2 z-20 min-w-[180px] shadow-xl">
                    {chains.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setToChain(c); setShowToChains(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-foreground transition-all"
                      >
                        <ChainLogo chainId={c.id} fallbackIcon={c.icon} size="sm" />
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="text-4xl font-bold text-foreground/50">
              {amount || '0.0'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{selectedToken.symbol}</div>
          </div>

          {/* Info */}
          {amount && (
            <div className="mb-4 p-3 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Est. Time</span>
                <span className="text-foreground font-medium">{estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Bridge Fee</span>
                <span className="text-foreground font-medium">{estimatedFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Security</span>
                <span className="text-accent font-medium">Hyperbridge Verified</span>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          {isConnected ? (
            <button
              disabled={!amount || parseFloat(amount) <= 0 || fromChain.id === toChain.id}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                !amount || parseFloat(amount) <= 0 || fromChain.id === toChain.id
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 border-2 border-primary'
              }`}
            >
              {fromChain.id === toChain.id ? 'Select Different Chains' : !amount ? 'Enter Amount' : 'Bridge'}
            </button>
          ) : (
            <button
              onClick={openConnectModal}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 border-2 border-primary transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" /> Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-6 border border-border rounded-2xl p-4 bg-card">
        <h3 className="font-bold text-foreground mb-3 text-sm">Recent Bridges</h3>
        {RECENT_TXS.map((tx, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{tx.amount} {tx.token}</span>
              <span className="text-muted-foreground">{tx.from} → {tx.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.status === 'completed' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                {tx.status}
              </span>
              <span className="text-xs text-muted-foreground">{tx.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
