import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCoinGeckoPrices } from '@/hooks/useCoinGeckoPrices';
import { useChainlinkPrices } from '@/hooks/useChainlinkPrices';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, ExternalLink, Copy, RefreshCw, Coins, LayoutDashboard } from 'lucide-react';
import { useState, useMemo } from 'react';
import { formatUnits } from 'viem';
import { TokenLogo } from './TokenLogo';

const ERC20_BALANCE_ABI = [{
  name: 'balanceOf', type: 'function', stateMutability: 'view',
  inputs: [{ name: 'account', type: 'address' }],
  outputs: [{ name: '', type: 'uint256' }],
}] as const;

const PORTFOLIO_TOKENS = [
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
];

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatUsd(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
}

export function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: cgPrices, isRefetching: pricesRefetching } = useCoinGeckoPrices();
  const { data: chainlinkPrices } = useChainlinkPrices();
  const { data: ethBalance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'tokens' | 'defi'>('tokens');

  // Read ERC20 balances
  const erc20Tokens = PORTFOLIO_TOKENS.filter(t => !t.isNative);
  const { data: tokenBalances } = useReadContracts({
    contracts: erc20Tokens.map(t => ({
      address: t.address as `0x${string}`,
      abi: ERC20_BALANCE_ABI,
      functionName: 'balanceOf',
      args: [address!],
    })),
    query: { enabled: !!address, refetchInterval: 30000 },
  });

  const getPrice = (symbol: string): number => {
    // Map WBTC to BTC for Chainlink
    const clSymbol = symbol === 'WBTC' ? 'BTC' : symbol;
    if (chainlinkPrices?.[clSymbol]?.usd) return chainlinkPrices[clSymbol].usd;
    if (cgPrices?.[symbol]?.usd) return cgPrices[symbol].usd;
    return 0;
  };

  const getChange = (symbol: string): number => {
    return cgPrices?.[symbol]?.usd_24h_change || 0;
  };

  const tokenData = useMemo(() => {
    return PORTFOLIO_TOKENS.map((token, i) => {
      let balance = 0;
      if (token.isNative) {
        balance = ethBalance ? Number(ethBalance.value) / 10 ** ethBalance.decimals : 0;
      } else {
        const idx = erc20Tokens.indexOf(token);
        if (idx >= 0 && tokenBalances?.[idx]?.result !== undefined) {
          balance = Number(formatUnits(tokenBalances[idx].result as bigint, token.decimals));
        }
      }
      const price = getPrice(token.symbol);
      const value = balance * price;
      const change = getChange(token.symbol);
      return { ...token, balance, price, value, change };
    }).sort((a, b) => b.value - a.value);
  }, [ethBalance, tokenBalances, cgPrices, chainlinkPrices]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-16">
        <div className="rounded-2xl border border-border bg-card p-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <LayoutDashboard className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Portfolio Dashboard</h2>
          <p className="text-muted-foreground text-sm mb-6">Connect your wallet to view live balances, positions, and performance across all protocols.</p>
          <button
            onClick={openConnectModal}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-all"
          >
            <Wallet className="w-4 h-4 inline mr-2" />
            Connect Wallet
          </button>
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
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tokens Held</p>
          <p className="text-xl font-bold text-foreground">{tokensWithBalance.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ETH Balance</p>
          <p className="text-xl font-bold text-foreground">{(ethBalance ? Number(ethBalance.value) / 1e18 : 0).toFixed(4)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Network</p>
          <p className="text-xl font-bold text-foreground">Ethereum</p>
        </motion.div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 w-fit">
        <button onClick={() => setActiveView('tokens')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${activeView === 'tokens' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <PieChart className="w-3.5 h-3.5 inline mr-1.5" />Tokens
        </button>
        <button onClick={() => setActiveView('defi')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${activeView === 'defi' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Coins className="w-3.5 h-3.5 inline mr-1.5" />DeFi
        </button>
      </div>

      {activeView === 'tokens' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 text-[10px] text-muted-foreground font-medium px-4 py-2.5 border-b border-border uppercase tracking-wider">
            <span>Asset</span><span className="text-right">Price</span><span className="text-right">24h</span><span className="text-right">Balance</span><span className="text-right">Value</span>
          </div>
          <div className="divide-y divide-border/50">
            {tokenData.map((token) => {
              const isUp = token.change >= 0;
              return (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-5 items-center px-4 py-3 hover:bg-secondary/30 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <TokenLogo address={token.address} symbol={token.symbol} size="sm" />
                    <div>
                      <span className="font-semibold text-foreground text-sm">{token.symbol}</span>
                      <span className="text-[10px] text-muted-foreground block leading-tight">{token.name}</span>
                    </div>
                  </div>
                  <span className="text-right text-xs font-medium text-foreground">
                    ${token.price < 1 ? token.price.toFixed(4) : token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
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

      {activeView === 'defi' && (
        <div className="space-y-4">
          {/* Perpetual Positions Placeholder */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" /> Perpetual Positions
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No open positions on Hyperliquid</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Place a trade on the Perps tab to see positions here</p>
            </div>
          </div>

          {/* Lending Positions Placeholder */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-primary" /> Aave V3 Positions
            </h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No active supply or borrow positions</p>
              <p className="text-muted-foreground/50 text-[10px] mt-1">Supply or borrow on the Lend tab to track positions here</p>
            </div>
          </div>

          {/* Bridge History */}
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