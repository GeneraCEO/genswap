import { useState } from 'react';
import { Token, Chain } from '../../types';
import { Settings, ChevronDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenLogo } from './TokenLogo';
import { useChainlinkPrices } from '@/hooks/useChainlinkPrices';
import { useCoinGeckoPrices } from '@/hooks/useCoinGeckoPrices';

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
  const [activePercent, setActivePercent] = useState<number | null>(null);
  const { data: chainlinkPrices } = useChainlinkPrices();
  const { data: cgPrices } = useCoinGeckoPrices();

  // Prefer Chainlink, fallback to CoinGecko
  const getPrice = (symbol: string): number => {
    if (chainlinkPrices?.[symbol]?.usd) return chainlinkPrices[symbol].usd;
    if (cgPrices?.[symbol]?.usd) return cgPrices[symbol].usd;
    return 0;
  };

  const fromPrice = getPrice(fromToken?.symbol || '');
  const toPrice = getPrice(toToken?.symbol || '');
  const exchangeRate = toPrice > 0 ? fromPrice / toPrice : 0;

  const priceSource = (symbol: string): string => {
    if (chainlinkPrices?.[symbol]?.usd) return 'Chainlink';
    if (cgPrices?.[symbol]?.usd) return 'CoinGecko';
    return '';
  };

  const handlePercentageClick = (percentage: number) => {
    if (fromToken) {
      setActivePercent(activePercent === percentage ? null : percentage);
      const balance = parseFloat(fromToken.balance);
      const amount = ((balance * percentage) / 100).toFixed(6);
      setFromAmount(amount);
      if (toToken && exchangeRate > 0) {
        setToAmount((parseFloat(amount) * exchangeRate).toFixed(6));
      }
    }
  };

  const handleSwapTokens = () => {
    setIsSwapping(true);
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setActivePercent(null);
    setTimeout(() => setIsSwapping(false), 400);
  };

  const handleFromAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      setActivePercent(null);
      if (value && toToken && exchangeRate > 0) {
        setToAmount((parseFloat(value || '0') * exchangeRate).toFixed(6));
      } else {
        setToAmount('');
      }
    }
  };

  const fromUsdValue = fromAmount && fromPrice ? (parseFloat(fromAmount) * fromPrice).toFixed(2) : '';
  const toUsdValue = toAmount && toPrice ? (parseFloat(toAmount) * toPrice).toFixed(2) : '';

  return (
    <div className="w-full max-w-[520px] mx-auto lg:mx-0">
      <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
        <div className="bg-card rounded-[14px] p-5 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-foreground">Swap</h2>
            <div className="flex items-center gap-2">
              {fromToken && priceSource(fromToken.symbol) && (
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${priceSource(fromToken.symbol) === 'Chainlink' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                  {priceSource(fromToken.symbol)}
                </span>
              )}
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground border border-border"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PAY SECTION */}
          <div className="mb-2">
            <div className="rounded-xl bg-background p-4 border border-[hsl(var(--dex-purple)/0.25)] hover:border-[hsl(var(--dex-purple)/0.4)] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Pay</span>
                {fromToken && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Balance:</span>
                    <span className="text-xs font-medium text-foreground">{fromToken.balance}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-1">
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-3xl font-semibold outline-none text-foreground placeholder-muted-foreground/30 min-w-0"
                />
                <button
                  onClick={() => onOpenTokenModal('from')}
                  className="flex items-center gap-2 bg-card hover:bg-secondary px-3 py-2.5 rounded-xl transition-all border border-border shrink-0"
                >
                  {fromToken ? (
                    <>
                      <TokenLogo address={fromToken.address} symbol={fromToken.symbol} size="sm" />
                      <span className="font-medium text-foreground text-sm">{fromToken.symbol}</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground text-sm whitespace-nowrap">Select</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              {fromUsdValue && <div className="text-xs text-muted-foreground">≈ ${fromUsdValue}</div>}

              {/* Percentage Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mt-3">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePercentageClick(pct)}
                    disabled={!fromToken}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                      activePercent === pct
                        ? 'bg-primary/15 text-primary border-primary/40'
                        : 'bg-card hover:bg-secondary text-foreground border-border'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => handlePercentageClick(100)}
                  disabled={!fromToken}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePercent === 100
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* SWAP ARROWS */}
          <div className="flex justify-center -my-3 relative z-10">
            <motion.button
              onClick={handleSwapTokens}
              animate={{ rotate: isSwapping ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-lg bg-card border border-[hsl(var(--dex-purple)/0.3)] shadow-sm cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3v18" /><path d="m3 7 4-4 4 4" />
                <path d="M17 21V3" /><path d="m13 17 4 4 4-4" />
              </svg>
            </motion.button>
          </div>

          {/* RECEIVE SECTION */}
          <div className="mb-4">
            <div className="rounded-xl bg-background p-4 border border-[hsl(var(--dex-purple)/0.25)] hover:border-[hsl(var(--dex-purple)/0.4)] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Receive</span>
                {toToken && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Balance:</span>
                    <span className="text-xs font-medium text-foreground">{toToken.balance}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-3xl font-semibold outline-none text-foreground placeholder-muted-foreground/30 min-w-0"
                />
                <button
                  onClick={() => onOpenTokenModal('to')}
                  className="flex items-center gap-2 bg-card hover:bg-secondary px-3 py-2.5 rounded-xl transition-all border border-border shrink-0"
                >
                  {toToken ? (
                    <>
                      <TokenLogo address={toToken.address} symbol={toToken.symbol} size="sm" />
                      <span className="font-medium text-foreground text-sm">{toToken.symbol}</span>
                    </>
                  ) : (
                    <span className="font-medium text-foreground text-sm whitespace-nowrap">Select</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              {toUsdValue && <div className="text-xs text-muted-foreground mt-1">≈ ${toUsdValue}</div>}
            </div>
          </div>

          {/* Price Info */}
          {fromToken && toToken && exchangeRate > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="text-foreground font-medium">
                  1 {fromToken.symbol} ≈ {exchangeRate.toFixed(exchangeRate > 1 ? 2 : 6)} {toToken.symbol}
                </span>
              </div>
              {fromPrice > 0 && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">{fromToken.symbol} Price</span>
                  <span className="text-foreground font-medium">
                    ${fromPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {priceSource(fromToken.symbol) && (
                      <span className="text-muted-foreground ml-1 text-[10px]">via {priceSource(fromToken.symbol)}</span>
                    )}
                  </span>
                </div>
              )}
              {toPrice > 0 && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground">{toToken.symbol} Price</span>
                  <span className="text-foreground font-medium">
                    ${toPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {priceSource(toToken.symbol) && (
                      <span className="text-muted-foreground ml-1 text-[10px]">via {priceSource(toToken.symbol)}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Swap Button */}
          <button
            disabled={!fromToken || !toToken || !fromAmount}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              !fromToken || !toToken || !fromAmount
                ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20'
            }`}
          >
            {!fromToken || !toToken ? 'Select Tokens' : !fromAmount ? 'Enter Amount' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
