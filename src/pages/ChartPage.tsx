import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ComposedChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Star, Bell, ChevronDown, Activity,
  BarChart2, RefreshCw, BookOpen, ArrowUpDown
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import {
  fetchOHLCV, fetchOrderBook, fetchRecentTrades,
  NobitexOHLCV, NobitexOrderBook, NobitexTrade
} from '../services/nobitex';
import { formatPrice, formatPercent, getPriceColorClass, generateChartData } from '../utils/formatters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

type TimeFrame = '1H' | '4H' | '24H' | '7D' | '30D';
type ChartType = 'area' | 'candle';
type RightPanel = 'orderbook' | 'trades' | 'info';

const TIME_FRAMES: { label: string; value: TimeFrame; resolution: string; seconds: number }[] = [
  { label: '۱ ساعت',   value: '1H',  resolution: '60',  seconds: 3600 },
  { label: '۴ ساعت',   value: '4H',  resolution: '240', seconds: 4 * 3600 },
  { label: '۲۴ ساعت',  value: '24H', resolution: 'D',   seconds: 86400 },
  { label: '۷ روز',    value: '7D',  resolution: 'W',   seconds: 7 * 86400 },
  { label: '۳۰ روز',   value: '30D', resolution: 'M',   seconds: 30 * 86400 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-slate-400 mb-2">{d.date}</p>
        {d.open !== undefined ? (
          <div className="space-y-1">
            <p className="flex gap-2"><span className="text-slate-500 w-10">باز:</span><span className="text-white font-semibold">${formatPrice(d.open)}</span></p>
            <p className="flex gap-2"><span className="text-slate-500 w-10">سقف:</span><span className="text-emerald-400 font-semibold">${formatPrice(d.high)}</span></p>
            <p className="flex gap-2"><span className="text-slate-500 w-10">کف:</span><span className="text-red-400 font-semibold">${formatPrice(d.low)}</span></p>
            <p className="flex gap-2"><span className="text-slate-500 w-10">بسته:</span><span className="text-blue-400 font-semibold">${formatPrice(d.close)}</span></p>
          </div>
        ) : (
          <p className="text-white font-bold">${formatPrice(d.price)}</p>
        )}
      </div>
    );
  }
  return null;
};

export default function ChartPage() {
  const [searchParams] = useSearchParams();
  const { coins, watchlist, toggleWatchlist, addAlert } = useMarket();

  const initialCoinId = searchParams.get('coin') || 'btc-usdt';
  const [selectedCoinId, setSelectedCoinId] = useState(initialCoinId);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [rightPanel, setRightPanel] = useState<RightPanel>('orderbook');
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertAdded, setAlertAdded] = useState(false);

  const [ohlcvData, setOhlcvData] = useState<any[]>([]);
  const [ohlcvLoading, setOhlcvLoading] = useState(false);
  const [orderBook, setOrderBook] = useState<NobitexOrderBook | null>(null);
  const [trades, setTrades] = useState<NobitexTrade[]>([]);
  const [orderBookLoading, setOrderBookLoading] = useState(false);
  const [tradesLoading, setTradesLoading] = useState(false);

  const coin = coins.find(c => c.id === selectedCoinId) || coins[0];
  const tf = TIME_FRAMES.find(t => t.value === timeFrame) || TIME_FRAMES[2];

  // Build Nobitex symbol for OHLCV: e.g. BTCUSDT, ETHIRT
  const nobitexSymbol = useMemo(() => {
    if (!coin?._raw) return coin?.symbol ? `${coin.symbol}USDT` : 'BTCUSDT';
    const { src, dst } = coin._raw;
    if (dst === 'rls') return `${src.toUpperCase()}IRT`;
    return `${src.toUpperCase()}${dst.toUpperCase()}`;
  }, [coin]);

  // Fetch OHLCV chart data from Nobitex
  const loadOHLCV = useCallback(async () => {
    if (!nobitexSymbol) return;
    setOhlcvLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - tf.seconds * 200;
      const data: NobitexOHLCV = await fetchOHLCV(nobitexSymbol, tf.resolution, from, now);
      if (data.s === 'ok' && data.t && data.t.length > 0) {
        const formatted = data.t.map((ts, i) => ({
          timestamp: ts * 1000,
          date: new Date(ts * 1000).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          price: data.c[i],
          open: data.o[i],
          high: data.h[i],
          low: data.l[i],
          close: data.c[i],
          volume: data.v[i],
        }));
        setOhlcvData(formatted);
      } else {
        // fallback to generated data
        setOhlcvData(generateChartData(coin?.current_price || 67000, tf.seconds / 86400, 120));
      }
    } catch {
      setOhlcvData(generateChartData(coin?.current_price || 67000, tf.seconds / 86400, 120));
    } finally {
      setOhlcvLoading(false);
    }
  }, [nobitexSymbol, tf.resolution, tf.seconds, coin?.current_price]);

  // Fetch order book
  const loadOrderBook = useCallback(async () => {
    if (!nobitexSymbol) return;
    setOrderBookLoading(true);
    try {
      const data = await fetchOrderBook(nobitexSymbol);
      setOrderBook(data);
    } catch {
      // Generate mock order book
      const price = coin?.current_price || 67000;
      setOrderBook({
        asks: Array.from({ length: 12 }, (_, i) => [
          (price * (1 + (i + 1) * 0.0015)).toFixed(2),
          (Math.random() * 2 + 0.1).toFixed(4)
        ] as [string, string]),
        bids: Array.from({ length: 12 }, (_, i) => [
          (price * (1 - (i + 1) * 0.0015)).toFixed(2),
          (Math.random() * 2 + 0.1).toFixed(4)
        ] as [string, string]),
        lastUpdate: Date.now(),
      });
    } finally {
      setOrderBookLoading(false);
    }
  }, [nobitexSymbol, coin?.current_price]);

  // Fetch recent trades
  const loadTrades = useCallback(async () => {
    if (!nobitexSymbol) return;
    setTradesLoading(true);
    try {
      const data = await fetchRecentTrades(nobitexSymbol);
      setTrades(data.slice(0, 30));
    } catch {
      // Generate mock trades
      const price = coin?.current_price || 67000;
      setTrades(Array.from({ length: 20 }, (_, i) => ({
        time: Date.now() - i * 15000,
        price: (price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2),
        volume: (Math.random() * 1.5 + 0.01).toFixed(4),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
      })));
    } finally {
      setTradesLoading(false);
    }
  }, [nobitexSymbol, coin?.current_price]);

  useEffect(() => { loadOHLCV(); }, [loadOHLCV]);
  useEffect(() => { loadOrderBook(); loadTrades(); }, [loadOrderBook, loadTrades]);

  // Auto-refresh every 15s
  useEffect(() => {
    const interval = setInterval(() => { loadOrderBook(); loadTrades(); }, 15000);
    return () => clearInterval(interval);
  }, [loadOrderBook, loadTrades]);

  const isPositive = (coin?.price_change_percentage_24h || 0) >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';
  const isInWatchlist = coin ? watchlist.includes(coin.id) : false;

  const handleAddAlert = () => {
    if (!coin || !alertPrice) return;
    addAlert({
      userId: '1', coinId: coin.id, coinName: coin.nameFa, coinSymbol: coin.symbol,
      targetPrice: parseFloat(alertPrice), condition: alertCondition, isActive: true,
    });
    setAlertAdded(true);
    setTimeout(() => { setAlertAdded(false); setShowAlertModal(false); }, 1500);
  };

  // Order book depth calculation
  const maxAskVol = useMemo(() => orderBook ? Math.max(...orderBook.asks.slice(0, 10).map(a => parseFloat(a[1]))) : 1, [orderBook]);
  const maxBidVol = useMemo(() => orderBook ? Math.max(...orderBook.bids.slice(0, 10).map(b => parseFloat(b[1]))) : 1, [orderBook]);

  if (!coin && coins.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayCoin = coin || coins[0];

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Coin Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCoinPicker(!showCoinPicker)}
            className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 hover:border-blue-500/50 transition-all min-w-[180px]"
          >
            <img src={displayCoin?.image} alt="" className="w-7 h-7 rounded-full flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayCoin?.symbol}&background=1e3a5f&color=60a5fa&size=28`; }} />
            <div className="text-right flex-1">
              <p className="text-sm font-bold text-white">{displayCoin?.symbol}/{displayCoin?._raw?.dst?.toUpperCase() || 'USDT'}</p>
              <p className="text-xs text-slate-500">{displayCoin?.nameFa}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCoinPicker ? 'rotate-180' : ''}`} />
          </button>

          {showCoinPicker && (
            <div className="absolute top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto">
              {coins.map(c => (
                <button key={c.id} onClick={() => { setSelectedCoinId(c.id); setShowCoinPicker(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors ${c.id === selectedCoinId ? 'bg-blue-500/10' : ''}`}>
                  <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${c.symbol}&background=1e3a5f&color=60a5fa&size=24`; }} />
                  <div className="flex-1 text-right">
                    <p className="text-xs font-semibold text-white">{c.symbol}</p>
                    <p className="text-xs text-slate-500 truncate">{c.nameFa}</p>
                  </div>
                  <p className={`text-xs font-semibold ${getPriceColorClass(c.price_change_percentage_24h)}`}>
                    {formatPercent(c.price_change_percentage_24h)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`text-3xl font-bold tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">
              ${formatPrice(displayCoin?.current_price || 0)}
            </span>
            <Badge value={displayCoin?.price_change_percentage_24h || 0} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span>سقف ۲۴ه: <span className="text-emerald-400">${formatPrice(displayCoin?.high_24h || 0)}</span></span>
            <span>کف ۲۴ه: <span className="text-red-400">${formatPrice(displayCoin?.low_24h || 0)}</span></span>
            {displayCoin?.price_irr > 0 && (
              <span>ریال: <span className="text-white">{(displayCoin.price_irr).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}</span></span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => toggleWatchlist(displayCoin?.id || '')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${isInWatchlist ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-slate-700 text-slate-400 hover:border-amber-500/40 hover:text-amber-400'}`}>
            <Star className={`w-4 h-4 ${isInWatchlist ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isInWatchlist ? 'دیده‌بانی' : 'افزودن'}</span>
          </button>
          <button onClick={() => { setAlertPrice(String(Math.round(displayCoin?.current_price || 0))); setShowAlertModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">هشدار</span>
          </button>
          <button onClick={() => { loadOHLCV(); loadOrderBook(); loadTrades(); }}
            className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Chart Area */}
        <div className="xl:col-span-3 space-y-3">
          <Card>
            {/* Chart Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 flex-wrap gap-2">
              <div className="flex items-center gap-1">
                {TIME_FRAMES.map(tf => (
                  <button key={tf.value} onClick={() => setTimeFrame(tf.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${timeFrame === tf.value ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    {tf.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[
                  { type: 'area', icon: Activity, label: 'خطی' },
                  { type: 'candle', icon: BarChart2, label: 'شمعی' },
                ].map(ct => (
                  <button key={ct.type} onClick={() => setChartType(ct.type as ChartType)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${chartType === ct.type ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                    <ct.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{ct.label}</span>
                  </button>
                ))}
                <span className="text-xs text-slate-600 px-2">
                  {nobitexSymbol}
                </span>
              </div>
            </div>

            {/* Main Chart */}
            <div className="p-4 relative">
              {ohlcvLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                  <LoadingSpinner />
                </div>
              )}
              <ResponsiveContainer width="100%" height={340}>
                {chartType === 'candle' ? (
                  <ComposedChart data={ohlcvData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false}
                      tickFormatter={v => `$${formatPrice(v)}`} width={72} orientation="left" domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="high" fill="#10b981" opacity={0.5} radius={[1, 1, 0, 0]} />
                    <Bar dataKey="low" fill="#ef4444" opacity={0.5} radius={[1, 1, 0, 0]} />
                    <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1.5}
                      fill="transparent" dot={false} />
                  </ComposedChart>
                ) : (
                  <AreaChart data={ohlcvData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false}
                      tickFormatter={v => `$${formatPrice(v)}`} width={72} orientation="left" domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2}
                      fill="url(#chartGrad)" dot={false}
                      activeDot={{ r: 4, fill: chartColor, stroke: '#0a0e1a', strokeWidth: 2 }} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Volume bar */}
            <div className="px-4 pb-3 border-t border-slate-800/40 pt-2">
              <p className="text-xs text-slate-600 mb-1">حجم</p>
              <ResponsiveContainer width="100%" height={60}>
                <ComposedChart data={ohlcvData} margin={{ top: 0, right: 10, left: 5, bottom: 0 }}>
                  <Bar dataKey="volume" fill="#3b82f6" opacity={0.45} radius={[1, 1, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'باز شدن دوره', val: ohlcvData[0]?.open, color: 'text-slate-300' },
              { label: 'بالاترین دوره', val: ohlcvData.length > 0 ? Math.max(...ohlcvData.map(d => d.high || d.price)) : 0, color: 'text-emerald-400' },
              { label: 'پایین‌ترین دوره', val: ohlcvData.length > 0 ? Math.min(...ohlcvData.map(d => d.low || d.price)) : 0, color: 'text-red-400' },
              { label: 'بسته شدن', val: ohlcvData[ohlcvData.length - 1]?.close, color: 'text-blue-400' },
            ].map(s => (
              <Card key={s.label} className="p-4">
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-sm font-bold ${s.color} tabular-nums`} dir="ltr">
                  ${formatPrice(s.val || 0)}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-3">
          {/* Panel Tabs */}
          <Card>
            <div className="flex border-b border-slate-800/60">
              {[
                { key: 'orderbook', label: 'دفتر سفارش', icon: BookOpen },
                { key: 'trades', label: 'معاملات', icon: ArrowUpDown },
                { key: 'info', label: 'اطلاعات', icon: Activity },
              ].map(tab => (
                <button key={tab.key} onClick={() => setRightPanel(tab.key as RightPanel)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${rightPanel === tab.key ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-white'}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline xl:hidden 2xl:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Order Book */}
            {rightPanel === 'orderbook' && (
              <div>
                {orderBookLoading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : orderBook ? (
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-800/40">
                      <span>قیمت (USDT)</span>
                      <span className="text-left">مقدار</span>
                    </div>
                    {/* Asks (sell orders) - red */}
                    <div className="divide-y divide-slate-800/20 max-h-48 overflow-y-auto">
                      {orderBook.asks.slice(0, 10).reverse().map(([price, vol], i) => (
                        <div key={i} className="relative px-3 py-1.5 grid grid-cols-2">
                          <div className="absolute inset-0 bg-red-500/5 origin-right" style={{ transform: `scaleX(${parseFloat(vol) / maxAskVol})` }} />
                          <span className="text-red-400 text-xs font-mono relative z-10" dir="ltr">{parseFloat(price).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                          <span className="text-slate-400 text-xs font-mono text-left relative z-10" dir="ltr">{parseFloat(vol).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                    {/* Current Price */}
                    <div className={`px-3 py-2 text-center font-bold text-sm border-y border-slate-700/60 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">
                      ${formatPrice(displayCoin?.current_price || 0)}
                      {isPositive ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
                    </div>
                    {/* Bids (buy orders) - green */}
                    <div className="divide-y divide-slate-800/20 max-h-48 overflow-y-auto">
                      {orderBook.bids.slice(0, 10).map(([price, vol], i) => (
                        <div key={i} className="relative px-3 py-1.5 grid grid-cols-2">
                          <div className="absolute inset-0 bg-emerald-500/5 origin-right" style={{ transform: `scaleX(${parseFloat(vol) / maxBidVol})` }} />
                          <span className="text-emerald-400 text-xs font-mono relative z-10" dir="ltr">{parseFloat(price).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                          <span className="text-slate-400 text-xs font-mono text-left relative z-10" dir="ltr">{parseFloat(vol).toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Recent Trades */}
            {rightPanel === 'trades' && (
              <div>
                <div className="grid grid-cols-3 px-3 py-2 text-xs text-slate-500 border-b border-slate-800/40">
                  <span>قیمت</span>
                  <span className="text-center">مقدار</span>
                  <span className="text-left">زمان</span>
                </div>
                {tradesLoading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : (
                  <div className="divide-y divide-slate-800/20 max-h-[420px] overflow-y-auto">
                    {trades.map((trade, i) => (
                      <div key={i} className="grid grid-cols-3 px-3 py-1.5 hover:bg-slate-800/30 transition-colors">
                        <span className={`text-xs font-mono ${trade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">
                          {parseFloat(trade.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 font-mono text-center" dir="ltr">
                          {parseFloat(trade.volume).toFixed(4)}
                        </span>
                        <span className="text-xs text-slate-600 text-left" dir="ltr">
                          {new Date(trade.time).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Coin Info */}
            {rightPanel === 'info' && displayCoin && (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                  <img src={displayCoin.image} alt={displayCoin.symbol} className="w-10 h-10 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayCoin.symbol}&background=1e3a5f&color=60a5fa&size=40`; }} />
                  <div>
                    <p className="text-sm font-bold text-white">{displayCoin.nameFa}</p>
                    <p className="text-xs text-slate-500">{displayCoin.name}</p>
                  </div>
                </div>
                {[
                  { label: 'بهترین خرید', val: displayCoin._raw ? `$${formatPrice(displayCoin._raw.bestBuy)}` : '---', color: 'text-emerald-400' },
                  { label: 'بهترین فروش', val: displayCoin._raw ? `$${formatPrice(displayCoin._raw.bestSell)}` : '---', color: 'text-red-400' },
                  { label: 'سقف ۲۴ ساعته', val: `$${formatPrice(displayCoin.high_24h)}`, color: 'text-emerald-300' },
                  { label: 'کف ۲۴ ساعته', val: `$${formatPrice(displayCoin.low_24h)}`, color: 'text-red-300' },
                  { label: 'حجم پایه ۲۴ه', val: displayCoin._raw ? `${(displayCoin._raw.volumeSrc).toFixed(2)} ${displayCoin.symbol}` : '---', color: 'text-slate-300' },
                  { label: 'قیمت به ریال', val: `${(displayCoin.price_irr).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}`, color: 'text-blue-400' },
                  { label: 'تغییر ۲۴ ساعته', val: formatPercent(displayCoin.price_change_percentage_24h), color: isPositive ? 'text-emerald-400' : 'text-red-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className={`text-xs font-semibold ${row.color} tabular-nums`} dir="ltr">{row.val}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Other Coins Quick List */}
          <Card>
            <div className="px-4 py-3 border-b border-slate-800/60">
              <h4 className="text-xs font-semibold text-slate-400">سایر بازارها</h4>
            </div>
            <div className="p-1 max-h-56 overflow-y-auto">
              {coins.filter(c => c.id !== selectedCoinId).slice(0, 8).map(c => (
                <button key={c.id} onClick={() => setSelectedCoinId(c.id)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/60 transition-colors">
                  <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${c.symbol}&background=1e3a5f&color=60a5fa&size=24`; }} />
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-xs font-semibold text-white">{c.symbol}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-bold tabular-nums ${getPriceColorClass(c.price_change_percentage_24h)}`}>
                      {formatPercent(c.price_change_percentage_24h)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={() => setShowAlertModal(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">هشدار قیمت</h3>
                <p className="text-xs text-slate-500">{displayCoin?.nameFa} ({displayCoin?.symbol})</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                قیمت فعلی: <span className="text-white font-bold">${formatPrice(displayCoin?.current_price || 0)}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { cond: 'above' as const, label: '↑ بالاتر از', cls: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
                  { cond: 'below' as const, label: '↓ پایین‌تر از', cls: 'border-red-500/50 bg-red-500/10 text-red-400' },
                ].map(c => (
                  <button key={c.cond} onClick={() => setAlertCondition(c.cond)}
                    className={`py-2.5 rounded-xl border text-sm transition-all ${alertCondition === c.cond ? c.cls : 'border-slate-700 text-slate-400'}`}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-7 pl-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="قیمت هدف" dir="ltr" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={handleAddAlert} className="flex-1" variant={alertAdded ? 'success' : 'primary'}>
                {alertAdded ? '✓ ثبت شد' : 'ثبت هشدار'}
              </Button>
              <Button onClick={() => setShowAlertModal(false)} variant="secondary">انصراف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
