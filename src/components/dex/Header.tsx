import { Wallet, BarChart3 } from 'lucide-react';
import { NetworkSelector } from './NetworkSelector';
import { Chain } from '../../types';

interface HeaderProps {
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
  onOpenChart?: () => void;
}

export function Header({ selectedChain, onSelectChain, onOpenChart }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">GZ</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">DEX</span>
          </div>

          <NetworkSelector selectedChain={selectedChain} onSelectChain={onSelectChain} />

          <div className="flex items-center gap-2">
            {onOpenChart && (
              <button
                onClick={onOpenChart}
                className="p-2.5 rounded-lg hover:bg-gray-800/50 transition-all text-gray-400 hover:text-white border border-gray-700 hover:border-indigo-500"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            )}
            <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium shadow-lg hover:shadow-indigo-500/50">
              <Wallet className="w-5 h-5" />
              <span className="hidden sm:block">Connect</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
