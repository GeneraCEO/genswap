import { useState } from 'react';
import { Header } from '../components/dex/Header';
import { BottomNavigation, Tab } from '../components/dex/BottomNavigation';
import { CompleteSwapInterface } from '../components/dex/CompleteSwapInterface';
import { UniswapStyleTokenModal } from '../components/dex/UniswapStyleTokenModal';
import { SettingsModal } from '../components/dex/SettingsModal';
import { PerpetualsPage } from '../components/dex/PerpetualsPage';
import { LendingPage } from '../components/dex/LendingPage';
import { PortfolioPage } from '../components/dex/PortfolioPage';
import { PredictionsPage } from '../components/dex/PredictionsPage';
import { BridgePage } from '../components/dex/BridgePage';
import { TradingViewWidget } from '../components/dex/TradingViewWidget';
import { chains } from '../data/chains';
import { getTokenListByChain } from '../data/tokenList';
import { Chain, Token } from '../types';

// Map token symbols to TradingView symbols
const TV_SYMBOL_MAP: Record<string, string> = {
  ETH: 'BINANCE:ETHUSDT', BTC: 'BINANCE:BTCUSDT', WBTC: 'BINANCE:BTCUSDT',
  USDC: 'BINANCE:USDCUSDT', USDT: 'BINANCE:USDTUSD', SOL: 'BINANCE:SOLUSDT',
  LINK: 'BINANCE:LINKUSDT', UNI: 'BINANCE:UNIUSDT', AAVE: 'BINANCE:AAVEUSDT',
  DOGE: 'BINANCE:DOGEUSDT', ARB: 'BINANCE:ARBUSDT', OP: 'BINANCE:OPUSDT',
  MATIC: 'BINANCE:MATICUSDT', DAI: 'BINANCE:DAIUSDT', MKR: 'BINANCE:MKRUSDT',
  CRV: 'BINANCE:CRVUSDT', SUSHI: 'BINANCE:SUSHIUSDT', SHIB: 'BINANCE:SHIBUSDT',
  PEPE: 'BINANCE:PEPEUSDT', APE: 'BINANCE:APEUSDT', LDO: 'BINANCE:LDOUSDT',
};

const Index = () => {
  const [fromChain, setFromChain] = useState<Chain>(chains[0]);
  const [toChain, setToChain] = useState<Chain>(chains[1]);
  const [activeTab, setActiveTab] = useState<Tab>('swap');
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenModalField, setTokenModalField] = useState<'from' | 'to'>('from');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

  const fromTokens = getTokenListByChain(fromChain.id);
  const toTokens = getTokenListByChain(toChain.id);

  const handleFromChainChange = (chain: Chain) => { setFromChain(chain); setFromToken(null); };
  const handleToChainChange = (chain: Chain) => { setToChain(chain); setToToken(null); };

  const handleOpenTokenModal = (field: 'from' | 'to') => {
    setTokenModalField(field);
    setTokenModalOpen(true);
  };

  const handleSelectToken = (token: Token) => {
    if (tokenModalField === 'from') setFromToken(token);
    else setToToken(token);
  };

  const tvSymbol = TV_SYMBOL_MAP[fromToken?.symbol || 'ETH'] || 'BINANCE:ETHUSDT';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'swap':
        return (
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full max-w-6xl mx-auto">
            <CompleteSwapInterface
              tokens={tokenModalField === 'from' ? fromTokens : toTokens}
              onOpenTokenModal={handleOpenTokenModal}
              fromToken={fromToken}
              toToken={toToken}
              onOpenSettings={() => setSettingsOpen(true)}
              fromChain={fromChain}
              toChain={toChain}
              onFromChainChange={handleFromChainChange}
              onToChainChange={handleToChainChange}
            />
            <div className="flex-1 w-full min-w-0 hidden lg:block">
              <TradingViewWidget symbol={tvSymbol} height={520} />
            </div>
          </div>
        );
      case 'perpetuals':
        return <PerpetualsPage />;
      case 'lend':
        return <LendingPage />;
      case 'predictions':
        return <PredictionsPage />;
      case 'bridge':
        return <BridgePage />;
      case 'portfolio':
        return <PortfolioPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedChain={fromChain}
        onSelectChain={handleFromChainChange}
      />

      <div className="container mx-auto px-4 py-8 pb-24">
        {renderTabContent()}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <UniswapStyleTokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        tokens={tokenModalField === 'from' ? fromTokens : toTokens}
        onSelectToken={handleSelectToken}
        selectedToken={tokenModalField === 'from' ? fromToken : toToken}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </div>
  );
};

export default Index;
