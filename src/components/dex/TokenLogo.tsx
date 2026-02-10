import { useState } from 'react';
import { getTokenLogo, getTokenFallback } from '@/lib/logos';

interface TokenLogoProps {
  address: string;
  symbol: string;
  chainId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-11 h-11',
};

export function TokenLogo({ address, symbol, chainId = 'ethereum', size = 'md', className = '' }: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = getTokenLogo(address, chainId);

  if (failed) {
    return (
      <div className={`${sizeMap[size]} rounded-full bg-secondary flex items-center justify-center text-xs font-bold ${className}`}>
        {getTokenFallback(symbol)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={symbol}
      className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
