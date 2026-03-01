import { useAccount, useBalance } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCoinGeckoPrices } from '@/hooks/useCoinGeckoPrices';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

const PORTFOLIO_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$' },
  { symbol: 'USDT', name: 'Tether', icon: '₮' },
  { symbol: 'LINK', name: 'Chainlink', icon: '⬡' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
  { symbol: 'AAVE', name: 'Aave', icon: '👻' },
  { symbol: 'ARB', name: 'Arbitrum', icon: '🔵' },
];

// Simulated positions across protocols
const PERP_POSITIONS = [
  { symbol: 'ETH-PERP', side: 'Long', size: '2.5 ETH', entry: 3420, pnl: 245.50, pnlPct: 2.87, leverage: '10x' },
  { symbol: 'BTC-PERP', side: 'Short', size: '0.1 BTC', entry: 98500, pnl: -120.30, pnlPct: -1.22, leverage: '5x' },
];

const LENDING_POSITIONS = [
  { asset: 'ETH', type: 'Supply', amount: '5.0', apy: 3.2, value: 0 },
  { asset: 'USDC', type: 'Supply', amount: '10,000', apy: 4.8, value: 10000 },
  { asset: 'USDC', type: 'Borrow', amount: '3,000', apy: 5.5, value: 3000 },
];

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: prices } = useCoinGeckoPrices();
  const { data: ethBalance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20">
        <div className="rounded-3xl border-2 border-primary/40 bg-card p-12 shadow-2xl shadow-primary/10">
          <Wallet className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Portfolio</h2>
          <p className="text-muted-foreground mb-8">Connect your wallet to view balances, positions, and P&L</p>
          <button
            onClick={openConnectModal}
            className="px-8 py-4 rounded-2xl font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 border-2 border-primary transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const ethPrice = prices?.ETH?.usd || 0;
  const ethBal = ethBalance ? Number(ethBalance.value) / 10 ** ethBalance.decimals : 0;
  const walletValue = ethBal * ethPrice;

  // Calculate simulated lending values
  const lendingWithValues = LENDING_POSITIONS.map(p => ({
    ...p,
    value: p.asset === 'ETH' ? parseFloat(p.amount) * ethPrice : p.value,
  }));

  const supplyTotal = lendingWithValues.filter(p => p.type === 'Supply').reduce((s, p) => s + p.value, 0);
  const borrowTotal = lendingWithValues.filter(p => p.type === 'Borrow').reduce((s, p) => s + p.value, 0);
  const perpPnl = PERP_POSITIONS.reduce((s, p) => s + p.pnl, 0);
  const totalPortfolioValue = walletValue + supplyTotal - borrowTotal;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Portfolio</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground font-mono">{shortenAddress(address!)}</span>
            <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-all">
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copied && <span className="text-xs text-accent">Copied!</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold text-foreground">${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Wallet</p>
          <p className="text-lg font-bold text-foreground">${walletValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Supplied</p>
          <p className="text-lg font-bold text-foreground">${supplyTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Borrowed</p>
          <p className="text-lg font-bold text-destructive">${borrowTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Perp P&L</p>
          <p className={`text-lg font-bold ${perpPnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {perpPnl >= 0 ? '+' : ''}${perpPnl.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Wallet Balances */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" /> Token Balances
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-4 text-xs text-muted-foreground font-medium px-3 pb-2">
            <span>Asset</span><span className="text-right">Price</span><span className="text-right">24h</span><span className="text-right">Balance</span>
          </div>
          {PORTFOLIO_TOKENS.map((token) => {
            const price = prices?.[token.symbol];
            const usdPrice = price?.usd || 0;
            const change = price?.usd_24h_change || 0;
            const isUp = change >= 0;
            // Show ETH balance from wallet, others as demo
            const balance = token.symbol === 'ETH' ? ethBal.toFixed(4) : '0.0000';
            const balValue = token.symbol === 'ETH' ? walletValue : 0;

            return (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-4 items-center px-3 py-3 rounded-xl hover:bg-secondary/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{token.icon}</span>
                  <div>
                    <span className="font-bold text-foreground text-sm">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground block">{token.name}</span>
                  </div>
                </div>
                <span className="text-right text-sm font-medium text-foreground">
                  ${usdPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className={`text-right text-sm font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-accent' : 'text-destructive'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground block">{balance}</span>
                  {balValue > 0 && <span className="text-xs text-muted-foreground">${balValue.toFixed(2)}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Perpetual Positions */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Perpetual Positions
        </h3>
        {PERP_POSITIONS.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">No open positions</p>
        ) : (
          <div className="space-y-2">
            {PERP_POSITIONS.map((pos, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${pos.side === 'Long' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                    {pos.side}
                  </span>
                  <div>
                    <span className="font-bold text-foreground text-sm">{pos.symbol}</span>
                    <span className="text-xs text-muted-foreground block">{pos.size} @ ${pos.entry.toLocaleString()} • {pos.leverage}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-sm ${pos.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                  </span>
                  <span className={`text-xs block ${pos.pnlPct >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {pos.pnlPct >= 0 ? '+' : ''}{pos.pnlPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lending Positions */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-primary" /> Lending & Borrowing
        </h3>
        <div className="space-y-2">
          {lendingWithValues.map((pos, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${pos.type === 'Supply' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                  {pos.type}
                </span>
                <div>
                  <span className="font-bold text-foreground text-sm">{pos.asset}</span>
                  <span className="text-xs text-muted-foreground block">{pos.amount} {pos.asset}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-foreground text-sm">${pos.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className={`text-xs block ${pos.type === 'Supply' ? 'text-accent' : 'text-primary'}`}>
                  {pos.apy}% APY
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
