import { useState } from 'react';
import { Token, Chain } from '../../types';
import { Settings, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenLogo } from './TokenLogo';

interface CompleteSwapInterfaceProps {
  tokens: Token[];
  onOpenTokenModal: (field: 'from' | 'to') => void;
  fromToken: Token | null;
  toToken: Token | null;
  onOpenSettings: () => void;
  fromChain: Chain;
  toChain: Chain;
  onFromChainChange: (chain: Chain) => void;
  onToChainChange: (chain: Chain) => void;
}

export function CompleteSwapInterface({
  onOpenTokenModal,
  fromToken,
  toToken,
  onOpenSettings,
}: CompleteSwapInterfaceProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);

  const handlePercentageClick = (percentage: number) => {
    if (fromToken) {
      const balance = parseFloat(fromToken.balance);
      const amount = ((balance * percentage) / 100).toFixed(6);
      setFromAmount(amount);
      if (toToken) {
        setToAmount((parseFloat(amount) * 1500).toFixed(2));
      }
    }
  };

  const handleSwapTokens = () => {
    setIsSwapping(true);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setTimeout(() => setIsSwapping(false), 400);
  };

  const handleFromAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      if (value && toToken) {
        setToAmount((parseFloat(value || '0') * 1500).toFixed(2));
      } else {
        setToAmount('');
      }
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <div className="rounded-3xl border-2 border-primary/40 bg-background p-1 shadow-2xl shadow-primary/10">
        <div className="bg-background rounded-[22px] p-5 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-foreground">Swap</h2>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl hover:bg-secondary transition-all text-muted-foreground hover:text-foreground border border-border hover:border-primary"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* PAY SECTION */}
          <div className="mb-2">
            <div className="rounded-2xl border-2 border-primary/60 bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Pay</span>
                {fromToken && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Balance:</span>
                    <span className="text-sm font-bold text-foreground">{fromToken.balance}</span>
                  </div>
                )}
              </div>

              {/* Amount + Token Select Row */}
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-4xl font-bold outline-none text-foreground placeholder-muted-foreground/30 min-w-0"
                />
                <button
                  onClick={() => onOpenTokenModal('from')}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-2xl transition-all border border-border hover:border-primary shrink-0"
                >
                  {fromToken ? (
                    <>
                      <TokenLogo address={fromToken.address} symbol={fromToken.symbol} size="md" />
                      <span className="font-bold text-foreground text-base">{fromToken.symbol}</span>
                    </>
                  ) : (
                    <span className="font-bold text-foreground whitespace-nowrap">Select</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentageClick(pct)}
                    disabled={!fromToken}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => handlePercentageClick(100)}
                  disabled={!fromToken}
                  className="px-3 py-2 rounded-lg text-xs font-bold bg-accent text-accent-foreground transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* SWAP ARROWS - animated */}
          <div className="flex justify-center -my-3 relative z-10">
            <motion.button
              onClick={handleSwapTokens}
              animate={{ rotate: isSwapping ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-card border-2 border-primary shadow-lg shadow-primary/20 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--dex-cyan))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3v18" /><path d="m3 7 4-4 4 4" />
                <path d="M17 21V3" /><path d="m13 17 4 4 4-4" />
              </svg>
            </motion.button>
          </div>

          {/* RECEIVE SECTION */}
          <div className="mb-5">
            <div className="rounded-2xl border-2 border-primary/60 bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">Receive</span>
                {toToken && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Balance:</span>
                    <span className="text-sm font-bold text-foreground">{toToken.balance}</span>
                  </div>
                )}
              </div>

              {/* Amount + Token Select Row */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-4xl font-bold outline-none text-foreground placeholder-muted-foreground/30 min-w-0"
                />
                <button
                  onClick={() => onOpenTokenModal('to')}
                  className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-3 rounded-2xl transition-all border border-border hover:border-primary shrink-0"
                >
                  {toToken ? (
                    <>
                      <TokenLogo address={toToken.address} symbol={toToken.symbol} size="md" />
                      <span className="font-bold text-foreground text-base">{toToken.symbol}</span>
                    </>
                  ) : (
                    <span className="font-bold text-foreground whitespace-nowrap">Select</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Price Info */}
          {fromToken && toToken && fromAmount && (
            <div className="mb-4 p-3 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="text-foreground font-medium">
                  1 {fromToken.symbol} ≈ 1,500 {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            disabled={!fromToken || !toToken || !fromAmount}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              !fromToken || !toToken || !fromAmount
                ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 border-2 border-primary'
            }`}
          >
            {!fromToken || !toToken ? 'Select Tokens' : !fromAmount ? 'Enter Amount' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
