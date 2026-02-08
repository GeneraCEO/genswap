export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  balance: string;
}

export interface Chain {
  id: string;
  name: string;
  icon: string;
  theme: string;
  logo: string;
}
