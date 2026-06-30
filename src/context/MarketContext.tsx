import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Coin, MarketStats, PriceAlert } from '../types';
import {
  fetchMarketStats,
  NOBITEX_SYMBOLS,
  getCoinImage,
  NobitexStats,
} from '../services/nobitex';

interface MarketContextType {
  coins: Coin[];
  marketStats: MarketStats;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  watchlist: string[];
  alerts: PriceAlert[];
  toggleWatchlist: (coinId: string) => void;
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  removeAlert: (alertId: string) => void;
  getCoinById: (id: string) => Coin | undefined;
  usdToIrr: number;
  notifications: { id: string; title: string; message: string; type: string }[];
  dismissNotification: (id: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Parse Nobitex stat value safely
function parseNum(val: string | undefined): number {
  if (!val || val === 'N/A' || val === '') return 0;
  return parseFloat(val) || 0;
}

// Calculate 24h change %
function calcChange(latest: string, open: string): number {
  const l = parseNum(latest);
  const o = parseNum(open);
  if (!o || !l) return 0;
  return ((l - o) / o) * 100;
}

// Build coin objects from Nobitex stats response
function buildCoins(
  statsData: Record<string, NobitexStats>,
  prevCoins: Coin[]
): { coins: Coin[]; usdtRls: number } {
  let usdtRls = 0;

  // Get USDT/RLS rate
  const usdtRlsKey = 'usdt-rls';
  if (statsData[usdtRlsKey]) {
    usdtRls = parseNum(statsData[usdtRlsKey].latest);
  }

  const coinMap = new Map<string, Coin>();

  // Process each symbol
  NOBITEX_SYMBOLS.forEach((sym, idx) => {
    const key = `${sym.src}-${sym.dst}`;
    const stat = statsData[key];
    if (!stat) return;

    const latestRaw = parseNum(stat.latest);
    if (latestRaw === 0) return;

    // Skip duplicate USDT-based if we already have it
    const coinId = `${sym.src}-${sym.dst}`;
    if (coinMap.has(coinId)) return;

    let priceUsdt = 0;
    let priceRls = 0;

    if (sym.dst === 'usdt') {
      priceUsdt = latestRaw;
      priceRls = usdtRls > 0 ? latestRaw * usdtRls : 0;
    } else if (sym.dst === 'rls') {
      priceRls = latestRaw;
      priceUsdt = usdtRls > 0 ? latestRaw / usdtRls : 0;
    }

    const prev = prevCoins.find(c => c.id === coinId);
    const prevPrice = prev?.current_price || priceUsdt;
    const direction: 'up' | 'down' | 'same' =
      priceUsdt > prevPrice ? 'up' : priceUsdt < prevPrice ? 'down' : 'same';

    const dayChange = parseNum(stat.dayChange) || calcChange(stat.latest, stat.dayOpen);
    const high24h = parseNum(stat.dayHigh);
    const low24h = parseNum(stat.dayLow);
    const volumeSrc = parseNum(stat.volumeSrc);
    const volumeDst = parseNum(stat.volumeDst);
    const bestSell = parseNum(stat.bestSell);
    const bestBuy = parseNum(stat.bestBuy);

    // Estimate market cap from volume (rough proxy for display)
    const marketCap = sym.dst === 'usdt'
      ? priceUsdt * volumeSrc * 100 // rough estimate
      : priceRls * volumeSrc * 100;

    const coin: Coin = {
      id: coinId,
      symbol: sym.symbol,
      name: sym.name,
      nameFa: sym.nameFa,
      image: getCoinImage(sym.src),
      current_price: sym.dst === 'usdt' ? priceUsdt : priceRls / (usdtRls || 1),
      price_irr: sym.dst === 'rls' ? priceRls : priceRls,
      market_cap: marketCap,
      market_cap_rank: idx + 1,
      total_volume: sym.dst === 'usdt' ? volumeDst : volumeDst / (usdtRls || 1),
      price_change_percentage_24h: dayChange,
      high_24h: sym.dst === 'usdt' ? high24h : high24h / (usdtRls || 1),
      low_24h: sym.dst === 'usdt' ? low24h : low24h / (usdtRls || 1),
      circulating_supply: volumeSrc * 1000,
      ath: high24h * 2,
      atl: low24h * 0.5,
      prevPrice,
      priceDirection: direction,
      // Store raw Nobitex prices
      _raw: {
        latest: latestRaw,
        bestSell,
        bestBuy,
        volumeSrc,
        volumeDst,
        dayHigh: high24h,
        dayLow: low24h,
        dayOpen: parseNum(stat.dayOpen),
        dst: sym.dst,
        src: sym.src,
      }
    } as Coin & { _raw: any };

    coinMap.set(coinId, coin);
  });

  return { coins: Array.from(coinMap.values()), usdtRls };
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [usdtRls, setUsdtRls] = useState<number>(620000);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: string }[]>([]);
  const prevCoinsRef = useRef<Coin[]>([]);
  const isFetchingRef = useRef(false);

  const marketStats: MarketStats = {
    totalMarketCap: coins.reduce((s, c) => s + c.market_cap, 0),
    total24hVolume: coins.reduce((s, c) => s + c.total_volume, 0),
    btcDominance: (() => {
      const btc = coins.find(c => c.symbol === 'BTC' && c.id.includes('usdt'));
      const total = coins.reduce((s, c) => s + c.market_cap, 0);
      return btc && total > 0 ? (btc.market_cap / total) * 100 : 0;
    })(),
    activeCryptocurrencies: coins.length,
    usdToIrr: usdtRls,
  };

  // Load watchlist & alerts from localStorage
  useEffect(() => {
    const wl = localStorage.getItem('ramzinex_watchlist');
    const al = localStorage.getItem('ramzinex_alerts');
    if (wl) try { setWatchlist(JSON.parse(wl)); } catch {}
    if (al) try { setAlerts(JSON.parse(al)); } catch {}
  }, []);

  const addNotificationFn = useCallback((notif: { type: string; title: string; message: string }) => {
    const id = String(Date.now() + Math.random());
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 6000);
  }, []);

  // Fetch from Nobitex API
  const fetchPrices = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      // Fetch all stats in one call (no srcCurrency filter = returns all)
      const stats = await fetchMarketStats();
      const { coins: newCoins, usdtRls: newUsdtRls } = buildCoins(stats, prevCoinsRef.current);

      if (newCoins.length > 0) {
        prevCoinsRef.current = newCoins;
        setCoins(newCoins);
        if (newUsdtRls > 0) setUsdtRls(newUsdtRls);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err: any) {
      console.error('Nobitex API error:', err);
      // If CORS blocked (browser), fallback to mock data
      if (prevCoinsRef.current.length === 0) {
        const mockCoins = generateFallbackCoins();
        prevCoinsRef.current = mockCoins;
        setCoins(mockCoins);
        setUsdtRls(620000);
        setLastUpdated(new Date());
      }
      setError('خطا در دریافت داده از نوبیتکس - استفاده از داده محلی');
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Check alerts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => {
        const updated = [...prev];
        let changed = false;
        updated.forEach((alert, idx) => {
          if (alert.isTriggered || !alert.isActive) return;
          const coin = prevCoinsRef.current.find(c => c.id === alert.coinId);
          if (!coin) return;
          const triggered =
            (alert.condition === 'above' && coin.current_price >= alert.targetPrice) ||
            (alert.condition === 'below' && coin.current_price <= alert.targetPrice);
          if (triggered) {
            updated[idx] = { ...alert, isTriggered: true, triggeredAt: new Date().toISOString() };
            changed = true;
            addNotificationFn({
              type: 'success',
              title: `🔔 هشدار: ${alert.coinSymbol}`,
              message: `قیمت ${alert.coinName} به ${alert.targetPrice.toLocaleString()} رسید!`,
            });
          }
        });
        if (changed) {
          localStorage.setItem('ramzinex_alerts', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [addNotificationFn]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleWatchlist = useCallback((coinId: string) => {
    setWatchlist(prev => {
      const newWl = prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId];
      localStorage.setItem('ramzinex_watchlist', JSON.stringify(newWl));
      return newWl;
    });
  }, []);

  const addAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const newAlert: PriceAlert = { ...alert, id: String(Date.now()), createdAt: new Date().toISOString(), isTriggered: false };
    setAlerts(prev => {
      const updated = [...prev, newAlert];
      localStorage.setItem('ramzinex_alerts', JSON.stringify(updated));
      return updated;
    });
    addNotificationFn({ type: 'info', title: 'هشدار ثبت شد', message: `هشدار برای ${alert.coinName} تنظیم شد` });
  }, [addNotificationFn]);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== alertId);
      localStorage.setItem('ramzinex_alerts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getCoinById = useCallback((id: string) => coins.find(c => c.id === id), [coins]);

  return (
    <MarketContext.Provider value={{
      coins, marketStats, isLoading, lastUpdated, error,
      watchlist, alerts, toggleWatchlist, addAlert, removeAlert,
      getCoinById, usdToIrr: usdtRls, notifications, dismissNotification
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}

// ─── Fallback mock data (used if API is blocked by CORS) ─────────────────────
function generateFallbackCoins(): Coin[] {
  const USDT_RLS = 618500;
  const base = [
    { src: 'btc', dst: 'usdt', symbol: 'BTC', name: 'Bitcoin', nameFa: 'بیت‌کوین', price: 67420, cap: 1.32e12, vol: 2.89e10, change: 2.34, high: 68900, low: 65800 },
    { src: 'eth', dst: 'usdt', symbol: 'ETH', name: 'Ethereum', nameFa: 'اتریوم', price: 3542, cap: 4.25e11, vol: 1.54e10, change: 1.87, high: 3620, low: 3480 },
    { src: 'usdt', dst: 'rls', symbol: 'USDT', name: 'Tether', nameFa: 'تتر', price: USDT_RLS, cap: 1.14e11, vol: 8.9e10, change: 0.05, high: USDT_RLS * 1.01, low: USDT_RLS * 0.99 },
    { src: 'bnb', dst: 'usdt', symbol: 'BNB', name: 'BNB', nameFa: 'بایننس کوین', price: 573, cap: 8.3e10, vol: 1.89e9, change: -0.92, high: 590, low: 568 },
    { src: 'sol', dst: 'usdt', symbol: 'SOL', name: 'Solana', nameFa: 'سولانا', price: 178.4, cap: 8.2e10, vol: 4.2e9, change: 4.56, high: 182, low: 170 },
    { src: 'xrp', dst: 'usdt', symbol: 'XRP', name: 'XRP', nameFa: 'ریپل', price: 0.6234, cap: 3.4e10, vol: 1.7e9, change: -1.23, high: 0.645, low: 0.618 },
    { src: 'ada', dst: 'usdt', symbol: 'ADA', name: 'Cardano', nameFa: 'کاردانو', price: 0.4856, cap: 1.7e10, vol: 4.2e8, change: 3.21, high: 0.496, low: 0.471 },
    { src: 'doge', dst: 'usdt', symbol: 'DOGE', name: 'Dogecoin', nameFa: 'دوج‌کوین', price: 0.1623, cap: 2.3e10, vol: 1.2e9, change: 5.67, high: 0.169, low: 0.153 },
    { src: 'dot', dst: 'usdt', symbol: 'DOT', name: 'Polkadot', nameFa: 'پولکادات', price: 8.42, cap: 1.24e10, vol: 3.9e8, change: -0.78, high: 8.65, low: 8.21 },
    { src: 'shib', dst: 'usdt', symbol: 'SHIB', name: 'Shiba Inu', nameFa: 'شیبا اینو', price: 0.0000248, cap: 1.46e10, vol: 8.9e8, change: 6.34, high: 0.0000258, low: 0.0000232 },
    { src: 'link', dst: 'usdt', symbol: 'LINK', name: 'Chainlink', nameFa: 'چین‌لینک', price: 14.76, cap: 8.9e9, vol: 5.2e8, change: 3.12, high: 15.2, low: 14.3 },
    { src: 'avax', dst: 'usdt', symbol: 'AVAX', name: 'Avalanche', nameFa: 'اولانچ', price: 37.82, cap: 1.56e10, vol: 6.8e8, change: -2.45, high: 39.4, low: 36.9 },
    { src: 'atom', dst: 'usdt', symbol: 'ATOM', name: 'Cosmos', nameFa: 'کازموس', price: 9.12, cap: 3.56e9, vol: 1.8e8, change: -3.21, high: 9.45, low: 8.87 },
    { src: 'uni', dst: 'usdt', symbol: 'UNI', name: 'Uniswap', nameFa: 'یونی‌سواپ', price: 9.84, cap: 7.4e9, vol: 2.9e8, change: 2.89, high: 10.1, low: 9.56 },
    { src: 'near', dst: 'usdt', symbol: 'NEAR', name: 'NEAR Protocol', nameFa: 'نیر پروتکل', price: 7.23, cap: 7.8e9, vol: 3.4e8, change: 1.45, high: 7.5, low: 7.0 },
    { src: 'matic', dst: 'usdt', symbol: 'MATIC', name: 'Polygon', nameFa: 'پالیگان', price: 0.8923, cap: 8.2e9, vol: 4.8e8, change: -1.56, high: 0.924, low: 0.876 },
    { src: 'trx', dst: 'usdt', symbol: 'TRX', name: 'TRON', nameFa: 'ترون', price: 0.1234, cap: 1.07e10, vol: 3.4e8, change: 0.87, high: 0.129, low: 0.121 },
    { src: 'arb', dst: 'usdt', symbol: 'ARB', name: 'Arbitrum', nameFa: 'آربیتروم', price: 1.12, cap: 4.6e9, vol: 2.1e8, change: 2.34, high: 1.16, low: 1.09 },
    { src: 'ton', dst: 'usdt', symbol: 'TON', name: 'Toncoin', nameFa: 'تون‌کوین', price: 5.43, cap: 1.88e10, vol: 4.5e8, change: 3.12, high: 5.65, low: 5.28 },
    { src: 'apt', dst: 'usdt', symbol: 'APT', name: 'Aptos', nameFa: 'اپتوس', price: 9.87, cap: 4.3e9, vol: 2.2e8, change: -1.23, high: 10.2, low: 9.6 },
  ];

  return base.map((c, i) => {
    const priceUsdt = c.dst === 'rls' ? c.price / USDT_RLS : c.price;
    const priceRls = c.dst === 'rls' ? c.price : c.price * USDT_RLS;
    return {
      id: `${c.src}-${c.dst}`,
      symbol: c.symbol,
      name: c.name,
      nameFa: c.nameFa,
      image: getCoinImage(c.src),
      current_price: priceUsdt,
      price_irr: priceRls,
      market_cap: c.cap,
      market_cap_rank: i + 1,
      total_volume: c.vol,
      price_change_percentage_24h: c.change,
      high_24h: c.dst === 'rls' ? c.high / USDT_RLS : c.high,
      low_24h: c.dst === 'rls' ? c.low / USDT_RLS : c.low,
      circulating_supply: c.vol / priceUsdt,
      ath: priceUsdt * 2.1,
      atl: priceUsdt * 0.18,
      priceDirection: 'same' as const,
      prevPrice: priceUsdt,
    };
  });
}
