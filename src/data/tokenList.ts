import { Token } from '../types';

const TW_CDN = 'https://raw.githubusercontent.com/nicenathapong/trustwallet-asset-images/main/tokens';

function tw(addr: string) {
  return `${TW_CDN}/${addr}.png`;
}

export const ethereumTokenList: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoUrl: tw('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'), balance: '2.5432' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, logoUrl: tw('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), balance: '1250.00' },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, logoUrl: tw('0xdAC17F958D2ee523a2206206994597C13D831ec7'), balance: '750.50' },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, logoUrl: tw('0x6B175474E89094C44Da98b954EedeAC495271d0F'), balance: '500.00' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, logoUrl: tw('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'), balance: '0.0845' },
  { symbol: 'BUSD', name: 'Binance USD', address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', decimals: 18, logoUrl: tw('0x4Fabb145d64652a948d72533023f6E7A623C7C53'), balance: '320.00' },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, logoUrl: tw('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'), balance: '45.23' },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, logoUrl: tw('0x514910771AF9Ca656af840dff83E8264EcF986CA'), balance: '89.50' },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, logoUrl: tw('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'), balance: '12.34' },
  { symbol: 'MKR', name: 'Maker', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18, logoUrl: tw('0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'), balance: '0.45' },
  { symbol: 'COMP', name: 'Compound', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', decimals: 18, logoUrl: tw('0xc00e94Cb662C3520282E6f5717214004A7f26888'), balance: '8.90' },
  { symbol: 'SNX', name: 'Synthetix', address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', decimals: 18, logoUrl: tw('0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F'), balance: '125.00' },
  { symbol: 'CRV', name: 'Curve DAO', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18, logoUrl: tw('0xD533a949740bb3306d119CC777fa900bA034cd52'), balance: '567.80' },
  { symbol: 'SUSHI', name: 'SushiSwap', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', decimals: 18, logoUrl: tw('0x6B3595068778DD592e39A122f4f5a5cF09C90fE2'), balance: '234.50' },
  { symbol: 'YFI', name: 'yearn.finance', address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', decimals: 18, logoUrl: tw('0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'), balance: '0.012' },
  { symbol: 'BAL', name: 'Balancer', address: '0xba100000625a3754423978a60c9317c58a424e3D', decimals: 18, logoUrl: tw('0xba100000625a3754423978a60c9317c58a424e3D'), balance: '34.20' },
  { symbol: '1INCH', name: '1inch', address: '0x111111111117dC0aa78b770fA6A738034120C302', decimals: 18, logoUrl: tw('0x111111111117dC0aa78b770fA6A738034120C302'), balance: '456.00' },
  { symbol: 'LDO', name: 'Lido DAO', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18, logoUrl: tw('0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'), balance: '178.90' },
  { symbol: 'MATIC', name: 'Polygon', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18, logoUrl: tw('0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'), balance: '1245.00' },
  { symbol: 'ARB', name: 'Arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, logoUrl: tw('0x912CE59144191C1204E64559FE8253a0e49E6548'), balance: '678.90' },
  { symbol: 'OP', name: 'Optimism', address: '0x4200000000000000000000000000000000000042', decimals: 18, logoUrl: tw('0x4200000000000000000000000000000000000042'), balance: '234.00' },
  { symbol: 'SHIB', name: 'Shiba Inu', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18, logoUrl: tw('0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'), balance: '12500000' },
  { symbol: 'PEPE', name: 'Pepe', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18, logoUrl: tw('0x6982508145454Ce325dDbE47a25d4ec3d2311933'), balance: '8900000' },
  { symbol: 'FLOKI', name: 'FLOKI', address: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E', decimals: 9, logoUrl: tw('0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E'), balance: '5600000' },
  { symbol: 'DOGE', name: 'Dogecoin (Wrapped)', address: '0x4206931337dc273a630d328dA6441786BfaD668f', decimals: 8, logoUrl: tw('0x4206931337dc273a630d328dA6441786BfaD668f'), balance: '3400' },
  { symbol: 'APE', name: 'ApeCoin', address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381', decimals: 18, logoUrl: tw('0x4d224452801ACEd8B2F0aebE155379bb5D594381'), balance: '67.80' },
  { symbol: 'SAND', name: 'The Sandbox', address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0', decimals: 18, logoUrl: tw('0x3845badAde8e6dFF049820680d1F14bD3903a5d0'), balance: '456.00' },
  { symbol: 'MANA', name: 'Decentraland', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', decimals: 18, logoUrl: tw('0x0F5D2fB29fb7d3CFeE444a200298f468908cC942'), balance: '890.00' },
  { symbol: 'GRT', name: 'The Graph', address: '0xc944E90C64B2c07662A292be6244BDf05Cda44a7', decimals: 18, logoUrl: tw('0xc944E90C64B2c07662A292be6244BDf05Cda44a7'), balance: '678.00' },
  { symbol: 'stETH', name: 'Lido Staked ETH', address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18, logoUrl: tw('0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'), balance: '1.234' },
  { symbol: 'rETH', name: 'Rocket Pool ETH', address: '0xae78736Cd615f374D3085123A210448E74Fc6393', decimals: 18, logoUrl: tw('0xae78736Cd615f374D3085123A210448E74Fc6393'), balance: '0.567' },
  { symbol: 'FRAX', name: 'Frax', address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', decimals: 18, logoUrl: tw('0x853d955aCEf822Db058eb8505911ED77F175b99e'), balance: '456.00' },
  { symbol: 'BAT', name: 'Basic Attention Token', address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF', decimals: 18, logoUrl: tw('0x0D8775F648430679A709E98d2b0Cb6250d2887EF'), balance: '1234.00' },
  { symbol: 'ENS', name: 'Ethereum Name Service', address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72', decimals: 18, logoUrl: tw('0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'), balance: '23.00' },
  { symbol: 'FET', name: 'Fetch.ai', address: '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85', decimals: 18, logoUrl: tw('0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85'), balance: '567.00' },
  { symbol: 'RPL', name: 'Rocket Pool', address: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f', decimals: 18, logoUrl: tw('0xD33526068D116cE69F19A9ee46F0bd304F21A51f'), balance: '45.00' },
  { symbol: 'LRC', name: 'Loopring', address: '0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD', decimals: 18, logoUrl: tw('0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD'), balance: '1234.00' },
  { symbol: 'CAKE', name: 'PancakeSwap', address: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898', decimals: 18, logoUrl: tw('0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898'), balance: '123.00' },
  { symbol: 'CHZ', name: 'Chiliz', address: '0x3506424F91fD33084466F402d5D97f05F8e3b4AF', decimals: 18, logoUrl: tw('0x3506424F91fD33084466F402d5D97f05F8e3b4AF'), balance: '2345.00' },
  { symbol: 'PAXG', name: 'PAX Gold', address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78', decimals: 18, logoUrl: tw('0x45804880De22913dAFE09f4980848ECE6EcbAf78'), balance: '0.45' },
  { symbol: 'BLUR', name: 'Blur', address: '0x5283D291DBCF85356A21bA090E6db59121208b44', decimals: 18, logoUrl: tw('0x5283D291DBCF85356A21bA090E6db59121208b44'), balance: '890.00' },
  { symbol: 'IMX', name: 'Immutable X', address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF', decimals: 18, logoUrl: tw('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF'), balance: '456.00' },
  { symbol: 'RNDR', name: 'Render Token', address: '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24', decimals: 18, logoUrl: tw('0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24'), balance: '123.00' },
  { symbol: 'QNT', name: 'Quant', address: '0x4a220E6096B25EADb88358cb44068A3248254675', decimals: 18, logoUrl: tw('0x4a220E6096B25EADb88358cb44068A3248254675'), balance: '5.67' },
  { symbol: 'INJ', name: 'Injective', address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30', decimals: 18, logoUrl: tw('0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'), balance: '34.50' },
  { symbol: 'FXS', name: 'Frax Share', address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0', decimals: 18, logoUrl: tw('0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0'), balance: '67.80' },
  { symbol: 'PENDLE', name: 'Pendle', address: '0x808507121B80c02388fAd14726482e061B8da827', decimals: 18, logoUrl: tw('0x808507121B80c02388fAd14726482e061B8da827'), balance: '234.00' },
  { symbol: 'SSV', name: 'SSV Network', address: '0x9D65fF81a3c488d585bBfb0Bfe3c7707c7917f54', decimals: 18, logoUrl: tw('0x9D65fF81a3c488d585bBfb0Bfe3c7707c7917f54'), balance: '12.30' },
  { symbol: 'DYDX', name: 'dYdX', address: '0x92D6C1e31e14520e676a687F0a93788B716BEff5', decimals: 18, logoUrl: tw('0x92D6C1e31e14520e676a687F0a93788B716BEff5'), balance: '345.00' },
  { symbol: 'MASK', name: 'Mask Network', address: '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074', decimals: 18, logoUrl: tw('0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074'), balance: '123.00' },
  { symbol: 'OCEAN', name: 'Ocean Protocol', address: '0x967da4048cD07aB37855c090aAF366e4ce1b9F48', decimals: 18, logoUrl: tw('0x967da4048cD07aB37855c090aAF366e4ce1b9F48'), balance: '890.00' },
  { symbol: 'ANKR', name: 'Ankr', address: '0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4', decimals: 18, logoUrl: tw('0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4'), balance: '12345.00' },
  { symbol: 'STORJ', name: 'Storj', address: '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC', decimals: 8, logoUrl: tw('0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC'), balance: '567.00' },
  { symbol: 'ZRX', name: '0x', address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498', decimals: 18, logoUrl: tw('0xE41d2489571d322189246DaFA5ebDe1F4699F498'), balance: '890.00' },
  { symbol: 'BAND', name: 'Band Protocol', address: '0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55', decimals: 18, logoUrl: tw('0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55'), balance: '123.00' },
  { symbol: 'CELR', name: 'Celer Network', address: '0x4F9254C83EB525f9FCf346490bbb3ed28a81C667', decimals: 18, logoUrl: tw('0x4F9254C83EB525f9FCf346490bbb3ed28a81C667'), balance: '45678.00' },
  { symbol: 'REN', name: 'Ren', address: '0x408e41876cCCDC0F92210600ef50372656052a38', decimals: 18, logoUrl: tw('0x408e41876cCCDC0F92210600ef50372656052a38'), balance: '2345.00' },
  { symbol: 'KNC', name: 'Kyber Network', address: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202', decimals: 18, logoUrl: tw('0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202'), balance: '678.00' },
  { symbol: 'CELO', name: 'Celo', address: '0x3294395e62F4eB6aF3f1Fcf89f5602D90Fb3Ef69', decimals: 18, logoUrl: tw('0x3294395e62F4eB6aF3f1Fcf89f5602D90Fb3Ef69'), balance: '456.00' },
  { symbol: 'AUDIO', name: 'Audius', address: '0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998', decimals: 18, logoUrl: tw('0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998'), balance: '3456.00' },
  { symbol: 'SPELL', name: 'Spell Token', address: '0x090185f2135308BaD17527004364eBcC2D37e5F6', decimals: 18, logoUrl: tw('0x090185f2135308BaD17527004364eBcC2D37e5F6'), balance: '890000.00' },
];

export const solanaTokenList: Token[] = [
  { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112', decimals: 9, logoUrl: 'https://raw.githubusercontent.com/nicenathapong/trustwallet-asset-images/main/blockchains/solana/info/logo.png', balance: '45.234' },
  { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, logoUrl: tw('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), balance: '1250.00' },
  { symbol: 'USDT', name: 'Tether USD', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, logoUrl: tw('0xdAC17F958D2ee523a2206206994597C13D831ec7'), balance: '750.00' },
  { symbol: 'RAY', name: 'Raydium', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6, logoUrl: '⚡', balance: '125.50' },
  { symbol: 'SRM', name: 'Serum', address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt', decimals: 6, logoUrl: '🔷', balance: '456.00' },
  { symbol: 'ORCA', name: 'Orca', address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6, logoUrl: '🐋', balance: '234.00' },
  { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, logoUrl: '🐕', balance: '12500000' },
  { symbol: 'WIF', name: 'dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, logoUrl: '🎩', balance: '8900000' },
  { symbol: 'MNGO', name: 'Mango Markets', address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', decimals: 6, logoUrl: '🥭', balance: '567.00' },
  { symbol: 'STEP', name: 'Step Finance', address: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT', decimals: 9, logoUrl: '📊', balance: '890.00' },
  { symbol: 'FIDA', name: 'Bonfida', address: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp', decimals: 6, logoUrl: '🔥', balance: '345.00' },
  { symbol: 'STAR', name: 'Star Atlas', address: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx', decimals: 8, logoUrl: '⭐', balance: '2345.00' },
  { symbol: 'SAMO', name: 'Samoyedcoin', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', decimals: 9, logoUrl: '🐕', balance: '3400000' },
  { symbol: 'SLND', name: 'Solend', address: 'SLNDpmoWTVADgEdndyvWzroNL7zSi1dF9PC3xHGtPwp', decimals: 6, logoUrl: '💰', balance: '678.00' },
  { symbol: 'GRAPE', name: 'Grape Protocol', address: '8upjSpvjcdpuzhfR1zriwg5NXkwDruejqNE9WNbPRtyA', decimals: 6, logoUrl: '🍇', balance: '890.00' },
  { symbol: 'JTO', name: 'Jito', address: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9, logoUrl: '⚡', balance: '123.00' },
  { symbol: 'PYTH', name: 'Pyth Network', address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6, logoUrl: '🔮', balance: '2345.00' },
  { symbol: 'JUP', name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, logoUrl: '🪐', balance: '567.00' },
  { symbol: 'RENDER', name: 'Render', address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', decimals: 8, logoUrl: '🎨', balance: '89.00' },
  { symbol: 'W', name: 'Wormhole', address: '85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ', decimals: 6, logoUrl: '🕳️', balance: '456.00' },
  { symbol: 'TENSOR', name: 'Tensor', address: 'TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6', decimals: 9, logoUrl: '📐', balance: '234.00' },
];

export function getTokenListByChain(chainId: string): Token[] {
  switch (chainId) {
    case 'ethereum':
    case 'polygon':
    case 'bnb':
    case 'arbitrum':
    case 'optimism':
    case 'base':
      return ethereumTokenList;
    case 'solana':
      return solanaTokenList;
    case 'sui':
      return ethereumTokenList.slice(0, 50);
    default:
      return ethereumTokenList;
  }
}
