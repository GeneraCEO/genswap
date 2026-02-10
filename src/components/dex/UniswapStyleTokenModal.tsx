import { useState } from 'react';
import { X, Search, TrendingUp, Star } from 'lucide-react';
import { Token } from '../../types';
import { TokenLogo } from './TokenLogo';

interface UniswapStyleTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  selectedToken: Token | null;
}

export function UniswapStyleTokenModal({
  isOpen,
  onClose,
  tokens,
  onSelectToken,
  selectedToken,
}: UniswapStyleTokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (token: Token) => {
    onSelectToken(token);
    onClose();
    setSearchQuery('');
  };

  const popularTokens = tokens.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-card border-2 border-primary rounded-2xl overflow-hidden text-foreground shadow-2xl shadow-primary/20">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select a token</h2>
            <button
              onClick={() => { onClose(); setSearchQuery(''); }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full py-3 pl-12 pr-4 rounded-xl font-medium outline-none transition-all bg-secondary text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary border border-border"
            />
          </div>
        </div>

        {/* Popular Tokens */}
        {!searchQuery && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-muted-foreground">POPULAR TOKENS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border hover:border-primary transition-all"
                >
                  <TokenLogo address={token.address} symbol={token.symbol} size="sm" />
                  <span className="font-bold text-sm">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Token List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token, idx) => {
              const isSelected = selectedToken?.address === token.address;
              return (
                <button
                  key={`${token.address}-${idx}`}
                  onClick={() => handleSelect(token)}
                  className={`w-full p-4 flex items-center justify-between transition-all hover:bg-secondary/80 ${
                    isSelected ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <TokenLogo address={token.address} symbol={token.symbol} size="lg" />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{token.symbol}</span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base">{token.balance}</div>
                    <div className="text-xs text-muted-foreground">{token.symbol}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-muted-foreground font-medium">No tokens found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>Manage token lists</span>
          </div>
        </div>
      </div>
    </div>
  );
}
