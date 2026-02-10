import { useState } from 'react';
import { TokenLogo } from './TokenLogo';

interface LendingPool {
  symbol: string;
  name: string;
  address: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: string;
  totalBorrow: string;
  available: string;
}

const AAVE_POOLS: LendingPool[] = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', supplyAPY: 2.14, borrowAPY: 3.45, totalSupply: '$4.2B', totalBorrow: '$2.1B', available: '$2.1B' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', supplyAPY: 4.82, borrowAPY: 5.67, totalSupply: '$3.1B', totalBorrow: '$2.8B', available: '$300M' },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', supplyAPY: 4.56, borrowAPY: 5.89, totalSupply: '$1.8B', totalBorrow: '$1.5B', available: '$300M' },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', supplyAPY: 0.12, borrowAPY: 0.89, totalSupply: '$2.5B', totalBorrow: '$500M', available: '$2.0B' },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', supplyAPY: 5.12, borrowAPY: 6.34, totalSupply: '$900M', totalBorrow: '$700M', available: '$200M' },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', supplyAPY: 0.05, borrowAPY: 0.45, totalSupply: '$450M', totalBorrow: '$50M', available: '$400M' },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', supplyAPY: 0.02, borrowAPY: 0.34, totalSupply: '$280M', totalBorrow: '$20M', available: '$260M' },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', supplyAPY: 0.03, borrowAPY: 0.56, totalSupply: '$190M', totalBorrow: '$15M', available: '$175M' },
];

type LendTab = 'supply' | 'borrow';

export function LendingPage() {
  const [activeTab, setActiveTab] = useState<LendTab>('supply');

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Aave Lending</h2>
        <p className="text-muted-foreground">Supply assets to earn interest or borrow against your collateral</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 max-w-xs mx-auto mb-8">
        {(['supply', 'borrow'] as LendTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all capitalize ${
              activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pool Table */}
      <div className="border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-secondary/50 text-sm font-bold text-muted-foreground">
          <span>Asset</span>
          <span className="text-right">{activeTab === 'supply' ? 'Supply APY' : 'Borrow APY'}</span>
          <span className="text-right">Total {activeTab === 'supply' ? 'Supply' : 'Borrow'}</span>
          <span className="text-right">Available</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        {AAVE_POOLS.map((pool) => (
          <div key={pool.symbol} className="grid grid-cols-5 gap-4 px-6 py-4 border-t border-border hover:bg-secondary/30 transition-colors items-center">
            <div className="flex items-center gap-3">
              <TokenLogo address={pool.address} symbol={pool.symbol} size="md" />
              <div>
                <div className="font-bold text-foreground">{pool.symbol}</div>
                <div className="text-xs text-muted-foreground">{pool.name}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-400">
                {(activeTab === 'supply' ? pool.supplyAPY : pool.borrowAPY).toFixed(2)}%
              </span>
            </div>
            <div className="text-right text-foreground font-medium">
              {activeTab === 'supply' ? pool.totalSupply : pool.totalBorrow}
            </div>
            <div className="text-right text-foreground font-medium">{pool.available}</div>
            <div className="text-right">
              <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all capitalize">
                {activeTab}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Info */}
      <div className="mt-6 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Protocol</span>
          <span className="text-foreground font-medium">Aave V3 • Ethereum Mainnet</span>
        </div>
      </div>
    </div>
  );
}
