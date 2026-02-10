import { BarChart3, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { NetworkSelector } from './NetworkSelector';
import { Chain } from '../../types';

interface HeaderProps {
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
  onOpenChart?: () => void;
}

export function Header({ selectedChain, onSelectChain, onOpenChart }: HeaderProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-primary-foreground font-bold text-xl">GZ</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">DEX</span>
          </div>

          <NetworkSelector selectedChain={selectedChain} onSelectChain={onSelectChain} />

          <div className="flex items-center gap-2">
            {onOpenChart && (
              <button
                onClick={onOpenChart}
                className="p-2.5 rounded-lg hover:bg-secondary transition-all text-muted-foreground hover:text-foreground border border-border hover:border-primary"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            )}

            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 rounded-lg transition-colors font-medium border border-primary/50"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm">{truncatedAddress}</span>
              </button>
            ) : (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-primary/30"
              >
                <Wallet className="w-5 h-5" />
                <span className="hidden sm:block">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
