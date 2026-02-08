import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Chain } from '../../types';
import { chains } from '../../data/chains';

interface CompactNetworkSelectorProps {
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
  label: string;
}

export function CompactNetworkSelector({ selectedChain, onSelectChain, label }: CompactNetworkSelectorProps) {
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition-all text-sm"
      >
        <span>{selectedChain.icon}</span>
        <span className="text-gray-300 font-medium">{selectedChain.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 font-semibold border-b border-gray-800">{label}</div>
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                onSelectChain(chain);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-800 transition-colors text-left text-sm ${
                selectedChain.id === chain.id ? 'bg-gray-800 text-indigo-400' : 'text-white'
              }`}
            >
              <span>{chain.icon}</span>
              <span className="font-medium">{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
