import { useState } from 'react';
import { Token, Chain } from '../../types';
import { ArrowDownUp, Settings, ChevronDown } from 'lucide-react';
import { CompactNetworkSelector } from './CompactNetworkSelector';

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
  fromChain,
  toChain,
  onFromChainChange,
  onToChainChange,
}: CompleteSwapInterfaceProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

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
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-3xl p-[2px] shadow-2xl">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Swap</h2>
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-xl hover:bg-gray-800/50 transition-all text-gray-400 hover:text-white border border-gray-700 hover:border-indigo-500"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* FROM SECTION */}
          <div className="mb-3">
            <div className="bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 rounded-2xl p-[2px]">
              <div className="bg-gray-900/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Pay</span>
                  {fromToken && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Balance:</span>
                      <span className="text-sm font-bold text-white">{fromToken.balance}</span>
                    </div>
                  )}
                </div>

                <CompactNetworkSelector
                  selectedChain={fromChain}
                  onSelectChain={onFromChainChange}
                  label="Source Network"
                />

                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-3xl sm:text-4xl font-bold outline-none text-white placeholder-gray-700"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handlePercentageClick(pct)}
                      disabled={!fromToken}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-800 hover:bg-gray-700 text-white transition-all border border-gray-700 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    onClick={() => handlePercentageClick(100)}
                    disabled={!fromToken}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-500 text-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    MAX
                  </button>
                </div>

                <button
                  onClick={() => onOpenTokenModal('from')}
                  className="w-full flex items-center justify-between bg-gray-800/80 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all border border-gray-700 hover:border-indigo-500"
                >
                  <div className="flex items-center gap-3">
                    {fromToken ? (
                      <>
                        <span className="text-2xl">{fromToken.logoUrl}</span>
                        <div className="text-left">
                          <div className="font-bold text-white text-base">{fromToken.symbol}</div>
                          <div className="text-xs text-gray-400">{fromToken.name}</div>
                        </div>
                      </>
                    ) : (
                      <span className="font-bold text-white">Select Token</span>
                    )}
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-indigo-500 hover:border-cyan-500 transition-all shadow-lg hover:shadow-indigo-500/30 hover:scale-110 active:scale-95"
            >
              <ArrowDownUp className="w-5 h-5 text-cyan-500" />
            </button>
          </div>

          {/* TO SECTION */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 rounded-2xl p-[2px]">
              <div className="bg-gray-900/90 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Receive</span>
                  {toToken && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Balance:</span>
                      <span className="text-sm font-bold text-white">{toToken.balance}</span>
                    </div>
                  )}
                </div>

                <CompactNetworkSelector
                  selectedChain={toChain}
                  onSelectChain={onToChainChange}
                  label="Destination Network"
                />

                <input
                  type="text"
                  value={toAmount}
                  readOnly
                  placeholder="0.0"
                  className="w-full bg-transparent text-3xl sm:text-4xl font-bold outline-none text-white placeholder-gray-700"
                />

                <button
                  onClick={() => onOpenTokenModal('to')}
                  className="w-full flex items-center justify-between bg-gray-800/80 hover:bg-gray-700 px-4 py-3 rounded-xl transition-all border border-gray-700 hover:border-indigo-500 mt-3"
                >
                  <div className="flex items-center gap-3">
                    {toToken ? (
                      <>
                        <span className="text-2xl">{toToken.logoUrl}</span>
                        <div className="text-left">
                          <div className="font-bold text-white text-base">{toToken.symbol}</div>
                          <div className="text-xs text-gray-400">{toToken.name}</div>
                        </div>
                      </>
                    ) : (
                      <span className="font-bold text-white">Select Token</span>
                    )}
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Price Info */}
          {fromToken && toToken && fromAmount && (
            <div className="mb-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exchange Rate</span>
                <span className="text-white font-medium">
                  1 {fromToken.symbol} ≈ 1,500 {toToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <button
            disabled={!fromToken || !toToken || !fromAmount}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              !fromToken || !toToken || !fromAmount
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border-2 border-indigo-500'
            }`}
          >
            {!fromToken || !toToken ? 'Select Tokens' : !fromAmount ? 'Enter Amount' : 'Swap'}
          </button>
        </div>
      </div>
    </div>
  );
}
