import { useState } from 'react';
import { CHAIN_LOGOS } from '@/lib/logos';

interface ChainLogoProps {
  chainId: string;
  fallbackIcon: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function ChainLogo({ chainId, fallbackIcon, size = 'md', className = '' }: ChainLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoUrl = CHAIN_LOGOS[chainId];

  if (failed || !logoUrl) {
    return (
      <span className={`${sizeMap[size]} flex items-center justify-center text-sm ${className}`}>
        {fallbackIcon}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={chainId}
      className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
