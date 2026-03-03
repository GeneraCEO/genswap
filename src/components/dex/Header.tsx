import { useState, useRef, useEffect } from 'react';
import { Wallet, ChevronDown, ExternalLink, RefreshCw, LogOut } from 'lucide-react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { NetworkSelector } from './NetworkSelector';
import { Chain } from '../../types';

interface HeaderProps {
  selectedChain: Chain;
  onSelectChain: (chain: Chain) => void;
}

const EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io',
  42161: 'https://arbiscan.io',
  10: 'https://optimistic.etherscan.io',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  56: 'https://bscscan.com',
  43114: 'https://snowtrace.io',
};

export function Header({ selectedChain, onSelectChain }: HeaderProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const explorerUrl = EXPLORER_URLS[chainId] || 'https://etherscan.io';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">GZ</span>
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block">DEX</span>
          </div>

          <NetworkSelector selectedChain={selectedChain} onSelectChain={onSelectChain} />

          <div className="relative" ref={menuRef}>
            {isConnected ? (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 bg-card hover:bg-secondary text-foreground px-3 py-2 rounded-xl transition-colors text-sm border border-border"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium">{truncatedAddress}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {showMenu && (
                  <div className="absolute top-full mt-2 right-0 w-52 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-border">
                      <p className="text-xs text-muted-foreground">Connected</p>
                      <p className="text-sm font-medium text-foreground truncate">{address}</p>
                    </div>
                    <div className="p-1">
                      <a
                        href={`${explorerUrl}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors w-full"
                        onClick={() => setShowMenu(false)}
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        View on Explorer
                      </a>
                      <button
                        onClick={() => { openConnectModal?.(); setShowMenu(false); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors w-full text-left"
                      >
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        Change Wallet
                      </button>
                      <button
                        onClick={() => { disconnect(); setShowMenu(false); }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl transition-colors text-sm font-medium shadow-md shadow-primary/20"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:block">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
