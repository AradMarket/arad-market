export interface Coin {
  id: string;
  symbol: string;
  name: string;
  nameFa: string;
  image: string;
  current_price: number;
  price_irr: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
  prevPrice?: number;
  priceDirection?: 'up' | 'down' | 'same';
  // Nobitex raw data
  _raw?: {
    latest: number;
    bestSell: number;
    bestBuy: number;
    volumeSrc: number;
    volumeDst: number;
    dayHigh: number;
    dayLow: number;
    dayOpen: number;
    dst: string;
    src: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface WatchlistItem {
  id: string;
  coinId: string;
  userId: string;
  addedAt: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface MarketStats {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  activeCryptocurrencies: number;
  usdToIrr: number;
}

export interface ConverterState {
  fromCoin: string;
  toCoin: string;
  amount: string;
  result: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  alertCount: number;
  watchlistCount: number;
}

export interface TimeFrame {
  label: string;
  labelFa: string;
  value: '1H' | '24H' | '7D' | '30D' | '1Y';
  days: number;
}

export interface NobitexOrderBookEntry {
  price: string;
  volume: string;
}

export interface OrderBook {
  asks: [string, string][];
  bids: [string, string][];
  lastUpdate: number;
}

export interface RecentTrade {
  time: number;
  price: string;
  volume: string;
  type: 'sell' | 'buy';
}
