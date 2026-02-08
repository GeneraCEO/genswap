import { useState } from 'react';
import { Header } from '../components/dex/Header';
import { BottomNavigation, Tab } from '../components/dex/BottomNavigation';
import { CompleteSwapInterface } from '../components/dex/CompleteSwapInterface';
import { UniswapStyleTokenModal } from '../components/dex/UniswapStyleTokenModal';
import { SettingsModal } from '../components/dex/SettingsModal';
import { ChartModal } from '../components/dex/ChartModal';
import { chains } from '../data/chains';
import { getTokenListByChain } from '../data/tokenList';
import { Chain, Token } from '../types';

const Index = () => {
  const [fromChain, setFromChain] = useState<Chain>(chains[0]);
  const [toChain, setToChain] = useState<Chain>(chains[1]);
  const [activeTab, setActiveTab] = useState<Tab>('swap');
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenModalField, setTokenModalField] = useState<'from' | 'to'>('from');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

  const fromTokens = getTokenListByChain(fromChain.id);
  const toTokens = getTokenListByChain(toChain.id);

  const handleFromChainChange = (chain: Chain) => {
    setFromChain(chain);
    setFromToken(null);
  };

  const handleToChainChange = (chain: Chain) => {
    setToChain(chain);
    setToToken(null);
  };

  const handleOpenTokenModal = (field: 'from' | 'to') => {
    setTokenModalField(field);
    setTokenModalOpen(true);
  };

  const handleSelectToken = (token: Token) => {
    if (tokenModalField === 'from') {
      setFromToken(token);
    } else {
      setToToken(token);
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'swap') {
      return (
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
      );
    }

    const tabInfo: Record<string, { emoji: string; title: string; desc: string }> = {
      perpetuals: { emoji: '📊', title: 'Perpetuals', desc: 'Trade perpetual futures with leverage' },
      predictions: { emoji: '🔮', title: 'Predictions', desc: 'Predict price movements and earn rewards' },
      bridge: { emoji: '🌉', title: 'Bridge', desc: 'Transfer assets across different chains' },
      lend: { emoji: '💰', title: 'Lend', desc: 'Lend your assets and earn interest' },
    };

    const info = tabInfo[activeTab];
    if (!info) return null;

    return (
      <div className="w-full max-w-md mx-auto text-center py-16">
        <div className="text-6xl mb-4">{info.emoji}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{info.title}</h3>
        <p className="text-gray-400">{info.desc}</p>
        <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Header
        selectedChain={fromChain}
        onSelectChain={handleFromChainChange}
        onOpenChart={() => setChartOpen(true)}
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

      <ChartModal isOpen={chartOpen} onClose={() => setChartOpen(false)} />
    </div>
  );
};

export default Index;
