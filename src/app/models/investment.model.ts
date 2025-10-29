export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profit: number;
  profitPercent: number;
}

export interface PortfolioForm {
  quantity: number;
  averagePrice: number;
}

export const POPULAR_STOCKS: Stock[] = [
  { symbol: 'PETR4', name: 'Petrobras PN', price: 32.45, change: 1.23, changePercent: 3.95 },
  { symbol: 'VALE3', name: 'Vale ON', price: 68.90, change: -2.10, changePercent: -2.96 },
  { symbol: 'ITUB4', name: 'Itaú PN', price: 28.75, change: 0.45, changePercent: 1.59 },
  { symbol: 'BBDC4', name: 'Bradesco PN', price: 14.20, change: -0.30, changePercent: -2.07 },
  { symbol: 'ABEV3', name: 'Ambev ON', price: 12.85, change: 0.15, changePercent: 1.18 },
  { symbol: 'WEGE3', name: 'WEG ON', price: 36.80, change: 0.80, changePercent: 2.22 },
  { symbol: 'RENT3', name: 'Localiza ON', price: 45.60, change: -1.20, changePercent: -2.56 },
  { symbol: 'LREN3', name: 'Lojas Renner ON', price: 18.90, change: 0.40, changePercent: 2.16 },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON', price: 2.15, change: 0.05, changePercent: 2.38 },
  { symbol: 'CVCB3', name: 'CVC ON', price: 6.80, change: -0.20, changePercent: -2.86 }
];
