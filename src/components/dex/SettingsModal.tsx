import { useState } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: string;
  onSlippageChange: (value: string) => void;
}

export function SettingsModal({ isOpen, onClose, slippage, onSlippageChange }: SettingsModalProps) {
  const [customSlippage, setCustomSlippage] = useState('');
  const presetSlippages = ['0.1', '0.5', '1.0'];

  if (!isOpen) return null;

  const handlePresetClick = (value: string) => {
    onSlippageChange(value);
    setCustomSlippage('');
  };

  const handleCustomChange = (value: string) => {
    setCustomSlippage(value);
    onSlippageChange(value);
  };

  const isCustom = !presetSlippages.includes(slippage);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gray-900 border-2 border-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold">Slippage tolerance</span>
            {slippage && <span className="text-sm text-gray-400">{slippage}%</span>}
          </div>
          <div className="flex gap-2 mb-3">
            {presetSlippages.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all ${
                  slippage === preset
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Custom"
              value={isCustom ? slippage : customSlippage}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-full py-3 px-4 pr-8 rounded-xl font-bold outline-none transition-all bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
          </div>
          {parseFloat(slippage) > 5 && (
            <div className="mt-3 p-3 rounded-lg text-sm font-bold bg-yellow-900/30 text-yellow-400">
              ⚠️ High slippage tolerance may result in unfavorable trades
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold">Transaction deadline</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="30"
              defaultValue="30"
              className="w-full py-3 px-4 pr-20 rounded-xl font-bold outline-none transition-all bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
