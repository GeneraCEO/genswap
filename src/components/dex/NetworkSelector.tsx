import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Chain } from '../../types';
import { chains } from '../../data/chains';

interface NetworkSelectorProps {
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
}

export function NetworkSelector({ selectedChain, onSelectChain }: NetworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition-all text-white"
      >
        <span className="text-lg">{selectedChain.icon}</span>
        <span className="hidden sm:block text-sm font-medium">{selectedChain.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                onSelectChain(chain);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left ${
                selectedChain.id === chain.id ? 'bg-gray-800 text-indigo-400' : 'text-white'
              }`}
            >
              <span className="text-lg">{chain.icon}</span>
              <span className="text-sm font-medium">{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
