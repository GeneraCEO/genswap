import { useState } from 'react';
import { X, Search, TrendingUp, Star } from 'lucide-react';
import { Token } from '../../types';

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
      <div className="w-full max-w-md bg-gray-900 border-2 border-indigo-500 rounded-2xl overflow-hidden text-white shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Select a token</h2>
            <button
              onClick={() => { onClose(); setSearchQuery(''); }}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search name or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full py-3 pl-12 pr-4 rounded-xl font-medium outline-none transition-all bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 border border-gray-700"
            />
          </div>
        </div>

        {/* Popular Tokens */}
        {!searchQuery && (
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-bold text-gray-400">POPULAR TOKENS</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-indigo-500 transition-all"
                >
                  <span className="text-lg">{token.logoUrl}</span>
                  <span className="font-bold text-sm">{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Token List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const isSelected = selectedToken?.address === token.address;
              return (
                <button
                  key={`${token.address}-${token.symbol}`}
                  onClick={() => handleSelect(token)}
                  className={`w-full p-4 flex items-center justify-between transition-all hover:bg-gray-800/80 ${
                    isSelected ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">{token.logoUrl}</div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{token.symbol}</span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                      </div>
                      <div className="text-sm text-gray-400 truncate max-w-[200px]">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-base">{token.balance}</div>
                    <div className="text-xs text-gray-500">{token.symbol}</div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No tokens found</p>
              <p className="text-sm text-gray-600 mt-1">Try searching with a different term</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            <span>Manage token lists</span>
          </div>
        </div>
      </div>
    </div>
  );
}
