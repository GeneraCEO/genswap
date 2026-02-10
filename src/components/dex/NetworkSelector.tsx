import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Chain } from '../../types';
import { chains } from '../../data/chains';
import { ChainLogo } from './ChainLogo';

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
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-all text-foreground"
      >
        <ChainLogo chainId={selectedChain.id} fallbackIcon={selectedChain.icon} size="sm" />
        <span className="hidden sm:block text-sm font-medium">{selectedChain.name}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-popover border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {chains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => {
                onSelectChain(chain);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left ${
                selectedChain.id === chain.id ? 'bg-secondary text-primary' : 'text-foreground'
              }`}
            >
              <ChainLogo chainId={chain.id} fallbackIcon={chain.icon} size="sm" />
              <span className="text-sm font-medium">{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
