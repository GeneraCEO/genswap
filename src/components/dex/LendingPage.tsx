import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenLogo } from './TokenLogo';
import { Wallet, TrendingUp, TrendingDown, Info, X, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Aave V3 Pool Data Provider on Ethereum mainnet
const AAVE_POOL_DATA_PROVIDER = '0x7B4EB56E7CD4b454BA8ff71E4518426c65'+'48ed00'; // PoolDataProviderV3 proxy (checksummed below)
const AAVE_UI_POOL_DATA_PROVIDER = '0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d';

// ABI for getReservesData on UI Pool Data Provider
const UI_POOL_DATA_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'provider', type: 'address' }],
    name: 'getReservesData',
    outputs: [
      {
        components: [
          { name: 'underlyingAsset', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'decimals', type: 'uint256' },
          { name: 'baseLTVasCollateral', type: 'uint256' },
          { name: 'reserveLiquidationThreshold', type: 'uint256' },
          { name: 'reserveLiquidationBonus', type: 'uint256' },
          { name: 'reserveFactor', type: 'uint256' },
          { name: 'usageAsCollateralEnabled', type: 'bool' },
          { name: 'borrowingEnabled', type: 'bool' },
          { name: 'stableBorrowRateEnabled', type: 'bool' },
          { name: 'isActive', type: 'bool' },
          { name: 'isFrozen', type: 'bool' },
          { name: 'liquidityIndex', type: 'uint256' },
          { name: 'variableBorrowIndex', type: 'uint256' },
          { name: 'liquidityRate', type: 'uint256' },
          { name: 'variableBorrowRate', type: 'uint256' },
          { name: 'stableBorrowRate', type: 'uint256' },
          { name: 'lastUpdateTimestamp', type: 'uint40' },
          { name: 'aTokenAddress', type: 'address' },
          { name: 'stableDebtTokenAddress', type: 'address' },
          { name: 'variableDebtTokenAddress', type: 'address' },
          { name: 'interestRateStrategyAddress', type: 'address' },
          { name: 'availableLiquidity', type: 'uint256' },
          { name: 'totalPrincipalStableDebt', type: 'uint256' },
          { name: 'averageStableRate', type: 'uint256' },
          { name: 'stableDebtLastUpdateTimestamp', type: 'uint256' },
          { name: 'totalScaledVariableDebt', type: 'uint256' },
          { name: 'priceInMarketReferenceCurrency', type: 'uint256' },
          { name: 'priceOracle', type: 'address' },
          { name: 'variableRateSlope1', type: 'uint256' },
          { name: 'variableRateSlope2', type: 'uint256' },
          { name: 'stableRateSlope1', type: 'uint256' },
          { name: 'stableRateSlope2', type: 'uint256' },
          { name: 'baseStableBorrowRate', type: 'uint256' },
          { name: 'baseVariableBorrowRate', type: 'uint256' },
          { name: 'optimalUsageRatio', type: 'uint256' },
          { name: 'isPaused', type: 'bool' },
          { name: 'isSiloedBorrowing', type: 'bool' },
          { name: 'accruedToTreasury', type: 'uint128' },
          { name: 'unbacked', type: 'uint128' },
          { name: 'isolationModeTotalDebt', type: 'uint128' },
          { name: 'flashLoanEnabled', type: 'bool' },
          { name: 'debtCeiling', type: 'uint256' },
          { name: 'debtCeilingDecimals', type: 'uint256' },
          { name: 'eModeCategoryId', type: 'uint8' },
          { name: 'borrowCap', type: 'uint256' },
          { name: 'supplyCap', type: 'uint256' },
          { name: 'eModeLtv', type: 'uint16' },
          { name: 'eModeLiquidationThreshold', type: 'uint16' },
          { name: 'eModeLiquidationBonus', type: 'uint16' },
          { name: 'eModePriceSource', type: 'address' },
          { name: 'eModeLabel', type: 'string' },
          { name: 'borrowableInIsolation', type: 'bool' },
        ],
        internalType: 'struct IUiPoolDataProviderV3.AggregatedReserveData[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          { name: 'marketReferenceCurrencyUnit', type: 'uint256' },
          { name: 'marketReferenceCurrencyPriceInUsd', type: 'int256' },
          { name: 'networkBaseTokenPriceInUsd', type: 'int256' },
          { name: 'networkBaseTokenPriceDecimals', type: 'uint8' },
        ],
        internalType: 'struct IUiPoolDataProviderV3.BaseCurrencyInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const AAVE_POOL_ADDRESSES_PROVIDER = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';

const RAY = 10n ** 27n;

// Tokens we care about displaying
const DISPLAY_TOKENS = new Set(['WETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'LINK', 'AAVE', 'UNI', 'wstETH', 'rETH', 'cbETH', 'GHO', 'CRV', 'MKR', 'SNX', 'LDO', 'RPL', 'BAL', 'FRAX', 'LUSD']);

const SYMBOL_OVERRIDES: Record<string, string> = { WETH: 'ETH' };

interface AaveReserve {
  symbol: string;
  displaySymbol: string;
  address: string;
  decimals: number;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: number;
  totalBorrow: number;
  available: number;
  priceUsd: number;
  ltv: number;
  liquidationThreshold: number;
  isActive: boolean;
  isFrozen: boolean;
  borrowingEnabled: boolean;
}

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
});

function useAaveReserves() {
  return useQuery({
    queryKey: ['aave-reserves-live'],
    queryFn: async (): Promise<AaveReserve[]> => {
      const result = await publicClient.readContract({
        address: AAVE_UI_POOL_DATA_PROVIDER as `0x${string}`,
        abi: UI_POOL_DATA_ABI,
        functionName: 'getReservesData',
        args: [AAVE_POOL_ADDRESSES_PROVIDER as `0x${string}`],
      } as any);

      const [reserves, baseCurrencyInfo] = result as [any[], any];
      const ethPriceUsd = Number(baseCurrencyInfo.networkBaseTokenPriceInUsd) / (10 ** Number(baseCurrencyInfo.networkBaseTokenPriceDecimals));
      const refUnit = Number(baseCurrencyInfo.marketReferenceCurrencyUnit);

      return reserves
        .filter((r: any) => r.isActive && DISPLAY_TOKENS.has(r.symbol))
        .map((r: any) => {
          const decimals = Number(r.decimals);
          const priceInRef = Number(r.priceInMarketReferenceCurrency) / refUnit;
          const priceUsd = priceInRef * ethPriceUsd;

          const supplyRate = Number(r.liquidityRate);
          const borrowRate = Number(r.variableBorrowRate);
          const supplyAPY = (supplyRate / 1e27) * 100;
          const borrowAPY = (borrowRate / 1e27) * 100;

          const availableLiquidity = Number(formatUnits(r.availableLiquidity, decimals));
          const totalScaledDebt = Number(formatUnits(r.totalScaledVariableDebt, decimals));
          const totalSupply = availableLiquidity + totalScaledDebt;

          return {
            symbol: r.symbol,
            displaySymbol: SYMBOL_OVERRIDES[r.symbol] || r.symbol,
            address: r.underlyingAsset,
            decimals,
            supplyAPY,
            borrowAPY,
            totalSupply: totalSupply * priceUsd,
            totalBorrow: totalScaledDebt * priceUsd,
            available: availableLiquidity * priceUsd,
            priceUsd,
            ltv: Number(r.baseLTVasCollateral) / 100,
            liquidationThreshold: Number(r.reserveLiquidationThreshold) / 100,
            isActive: r.isActive,
            isFrozen: r.isFrozen,
            borrowingEnabled: r.borrowingEnabled,
          };
        })
        .sort((a: AaveReserve, b: AaveReserve) => b.totalSupply - a.totalSupply);
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

function formatUsd(val: number): string {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

type LendTab = 'supply' | 'borrow';

interface ActionModalProps {
  reserve: AaveReserve;
  action: LendTab;
  onClose: () => void;
}

function ActionModal({ reserve, action, onClose }: ActionModalProps) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [amount, setAmount] = useState('');
  const usdValue = amount ? (parseFloat(amount) * reserve.priceUsd).toFixed(2) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[420px] bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TokenLogo address={reserve.address} symbol={reserve.displaySymbol} size="md" />
            <div>
              <h3 className="font-bold text-foreground">{action === 'supply' ? 'Supply' : 'Borrow'} {reserve.displaySymbol}</h3>
              <p className="text-xs text-muted-foreground">Aave V3 • Ethereum</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Amount</label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full text-2xl font-bold bg-secondary/50 rounded-xl border border-border py-3 px-4 outline-none text-foreground focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">{reserve.displaySymbol}</span>
            </div>
            {usdValue && <p className="text-xs text-muted-foreground mt-1.5">≈ ${usdValue}</p>}
          </div>

          {/* Info */}
          <div className="space-y-2 p-3 rounded-xl bg-secondary/20 border border-border">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{action === 'supply' ? 'Supply' : 'Borrow'} APY</span>
              <span className={`font-bold ${action === 'supply' ? 'text-emerald-400' : 'text-primary'}`}>
                {(action === 'supply' ? reserve.supplyAPY : reserve.borrowAPY).toFixed(2)}%
              </span>
            </div>
            {action === 'supply' && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Max LTV</span>
                  <span className="text-foreground font-medium">{reserve.ltv}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Liquidation Threshold</span>
                  <span className="text-foreground font-medium">{reserve.liquidationThreshold}%</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Available Liquidity</span>
              <span className="text-foreground font-medium">{formatUsd(reserve.available)}</span>
            </div>
          </div>

          {/* Action Button */}
          {isConnected ? (
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all capitalize ${
                action === 'supply'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-emerald-500/30'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-primary/30'
              } disabled:cursor-not-allowed`}
            >
              {action} {reserve.displaySymbol}
            </button>
          ) : (
            <button
              onClick={openConnectModal}
              className="w-full py-3 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Connect Wallet
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LendingPage() {
  const [activeTab, setActiveTab] = useState<LendTab>('supply');
  const [actionModal, setActionModal] = useState<{ reserve: AaveReserve; action: LendTab } | null>(null);
  const { data: reserves, isLoading, error } = useAaveReserves();

  const totalSupply = reserves?.reduce((s, r) => s + r.totalSupply, 0) || 0;
  const totalBorrow = reserves?.reduce((s, r) => s + r.totalBorrow, 0) || 0;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Lending</h2>
          <p className="text-muted-foreground text-sm">Supply & borrow on Aave V3 • Live on-chain data</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ethereum Mainnet
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
          <p className="text-lg font-bold text-foreground">{isLoading ? '...' : formatUsd(totalSupply)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Borrow</p>
          <p className="text-lg font-bold text-foreground">{isLoading ? '...' : formatUsd(totalBorrow)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 hidden sm:block">
          <p className="text-xs text-muted-foreground mb-1">Available</p>
          <p className="text-lg font-bold text-foreground">{isLoading ? '...' : formatUsd(totalSupply - totalBorrow)}</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 max-w-xs mb-5">
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

      {/* Loading */}
      {isLoading && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 animate-pulse">
              <div className="w-9 h-9 bg-secondary rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-secondary rounded w-20 mb-1" />
                <div className="h-3 bg-secondary rounded w-14" />
              </div>
              <div className="h-4 bg-secondary rounded w-16" />
              <div className="h-4 bg-secondary rounded w-16" />
              <div className="h-8 bg-secondary rounded-lg w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 border border-border rounded-xl bg-card">
          <p className="text-destructive font-medium">Failed to fetch on-chain data</p>
          <p className="text-muted-foreground text-sm mt-1">Check your connection and try again</p>
        </div>
      )}

      {/* Table */}
      {reserves && (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-[1fr_100px_100px_100px_90px] gap-4 px-5 py-3 bg-secondary/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            <span>Asset</span>
            <span className="text-right">{activeTab === 'supply' ? 'Supply APY' : 'Borrow APY'}</span>
            <span className="text-right">Total {activeTab === 'supply' ? 'Supply' : 'Borrow'}</span>
            <span className="text-right">Available</span>
            <span className="text-right">Action</span>
          </div>

          {/* Data Rows */}
          {reserves.map((r) => (
            <div
              key={r.symbol}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_100px_100px_90px] gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/10 transition-colors items-center"
            >
              <div className="flex items-center gap-3">
                <TokenLogo address={r.address} symbol={r.displaySymbol} size="md" />
                <div>
                  <div className="font-bold text-foreground text-sm">{r.displaySymbol}</div>
                  <div className="text-[10px] text-muted-foreground">${r.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-sm ${activeTab === 'supply' ? 'text-emerald-400' : 'text-primary'}`}>
                  {(activeTab === 'supply' ? r.supplyAPY : r.borrowAPY).toFixed(2)}%
                </span>
              </div>
              <div className="text-right text-foreground font-medium text-sm hidden sm:block">
                {formatUsd(activeTab === 'supply' ? r.totalSupply : r.totalBorrow)}
              </div>
              <div className="text-right text-foreground/70 text-sm hidden sm:block">
                {formatUsd(r.available)}
              </div>
              <div className="text-right">
                <button
                  onClick={() => setActionModal({ reserve: r, action: activeTab })}
                  disabled={activeTab === 'borrow' && !r.borrowingEnabled}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all capitalize disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {activeTab}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Info */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>Aave V3 Protocol</span>
        <span>•</span>
        <span>Ethereum Mainnet</span>
        <span>•</span>
        <a
          href="https://app.aave.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          app.aave.com <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <ActionModal
            reserve={actionModal.reserve}
            action={actionModal.action}
            onClose={() => setActionModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
