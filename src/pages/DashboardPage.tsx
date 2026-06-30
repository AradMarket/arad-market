import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Star, Bell, ArrowLeftRight,
  BarChart2, Activity, Globe, DollarSign, AlertCircle,
  RefreshCw, Zap
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import {
  formatPrice, formatPercent,
  getPriceColorClass, generateChartData
} from '../utils/formatters';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SkeletonRow from '../components/ui/SkeletonRow';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
        <p className="text-slate-400 mb-0.5">{label}</p>
        <p className="text-white font-semibold">${formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { coins, marketStats, isLoading, watchlist, toggleWatchlist, usdToIrr, error, lastUpdated } = useMarket();
  const { user } = useAuth();

  // Get key coins
  const btc = useMemo(() => coins.find(c => c.symbol === 'BTC' && c._raw?.dst === 'usdt'), [coins]);
  const eth = useMemo(() => coins.find(c => c.symbol === 'ETH' && c._raw?.dst === 'usdt'), [coins]);
  const usdtIrt = useMemo(() => coins.find(c => c.symbol === 'USDT' && c._raw?.dst === 'rls'), [coins]);


  const topGainers = useMemo(() =>
    [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5),
    [coins]);
  const topLosers = useMemo(() =>
    [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5),
    [coins]);

  const btcChartData = useMemo(() => btc ? generateChartData(btc.current_price, 7, 60) : [], [btc?.id]);
  const ethChartData = useMemo(() => eth ? generateChartData(eth.current_price, 7, 60) : [], [eth?.id]);

  const quickActions = [
    { label: 'بازار', icon: BarChart2, to: '/market', color: 'blue', bg: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
    { label: 'نمودار', icon: Activity, to: '/chart', color: 'violet', bg: 'bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' },
    { label: 'دیده‌بانی', icon: Star, to: '/watchlist', color: 'amber', bg: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
    { label: 'هشدار', icon: Bell, to: '/alerts', color: 'emerald', bg: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
    { label: 'تبدیل', icon: ArrowLeftRight, to: '/converter', color: 'pink', bg: 'bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20' },
  ];

  const statsCards = [
    {
      label: 'نرخ دلار/ریال',
      value: usdToIrr > 0 ? usdToIrr.toLocaleString('fa-IR', { maximumFractionDigits: 0 }) : '---',
      sub: usdtIrt?._raw ? `تومان: ${(usdtIrt._raw.latest / 10).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}` : 'نرخ لحظه‌ای',
      icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
    },
    {
      label: 'بیت‌کوین',
      value: btc ? `$${formatPrice(btc.current_price)}` : '---',
      sub: btc ? formatPercent(btc.price_change_percentage_24h) : '',
      icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10',
    },
    {
      label: 'اتریوم',
      value: eth ? `$${formatPrice(eth.current_price)}` : '---',
      sub: eth ? formatPercent(eth.price_change_percentage_24h) : '',
      icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    {
      label: 'بازارهای فعال',
      value: marketStats.activeCryptocurrencies,
      sub: 'نوبیتکس',
      icon: Globe, color: 'text-violet-400', bg: 'bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">{error}</p>
          {lastUpdated && (
            <span className="text-amber-500 text-xs mr-auto flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString('fa-IR')}
            </span>
          )}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-900/40 via-slate-800/60 to-violet-900/30 border border-slate-700/60 p-6">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">خوش آمدید</p>
            <h2 className="text-2xl font-bold text-white">{user?.name} 👋</h2>
            <p className="text-slate-400 mt-2 text-sm">
              داده‌های بازار مستقیم از <span className="text-blue-400 font-medium">API رسمی نوبیتکس</span> دریافت می‌شود
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-badge" />
                <span>آخرین بروزرسانی: {lastUpdated.toLocaleTimeString('fa-IR')}</span>
              </div>
            )}
          </div>
          {btc && (
            <div className="hidden md:block text-right">
              <p className="text-slate-500 text-xs mb-1">بیت‌کوین لحظه‌ای</p>
              <p className={`text-2xl font-bold tabular-nums ${btc.priceDirection === 'up' ? 'text-emerald-400' : btc.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`} dir="ltr">
                ${formatPrice(btc.current_price)}
              </p>
              <Badge value={btc.price_change_percentage_24h} className="mt-1" />
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full translate-x-16 translate-y-16" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-3">
        {quickActions.map(action => (
          <Link key={action.to} to={action.to}
            className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border ${action.bg} transition-all duration-200 text-center`}>
            <action.icon className={`w-5 h-5 text-${action.color}-400`} />
            <span className="text-xs text-slate-300 font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(stat => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold text-white tabular-nums`} dir="ltr">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Mini Charts - BTC & ETH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { coin: btc, data: btcChartData, color: '#f59e0b' },
          { coin: eth, data: ethChartData, color: '#8b5cf6' },
        ].map(({ coin, data, color }) => coin ? (
          <Card key={coin.id} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.symbol} className="w-9 h-9 rounded-full"
                  onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=36`; }} />
                <div>
                  <p className="text-white font-semibold text-sm">{coin.nameFa}</p>
                  <p className="text-slate-500 text-xs">{coin.symbol}/USDT · نوبیتکس</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold tabular-nums ${coin.priceDirection === 'up' ? 'text-emerald-400' : coin.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`} dir="ltr">
                  ${formatPrice(coin.current_price)}
                </p>
                <Badge value={coin.price_change_percentage_24h} className="mt-1" />
              </div>
            </div>
            {/* Nobitex raw data */}
            {coin._raw && (
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <p className="text-slate-600">بهترین خرید</p>
                  <p className="text-emerald-400 font-mono" dir="ltr">${formatPrice(coin._raw.bestBuy)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600">بهترین فروش</p>
                  <p className="text-red-400 font-mono" dir="ltr">${formatPrice(coin._raw.bestSell)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600">حجم ۲۴ه</p>
                  <p className="text-slate-300 font-mono">{coin._raw.volumeSrc.toFixed(2)}</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#grad-${coin.id})`} dot={false} />
                <Tooltip content={<CustomTooltip />} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        ) : null)}
      </div>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'بیشترین رشد ۲۴ ساعته', icon: TrendingUp, iconColor: 'text-emerald-400', data: topGainers },
          { title: 'بیشترین افت ۲۴ ساعته', icon: TrendingDown, iconColor: 'text-red-400', data: topLosers },
        ].map(({ title, icon: Icon, iconColor, data }) => (
          <Card key={title}>
            <div className="px-5 py-4 border-b border-slate-800/80 flex items-center gap-2">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {isLoading ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />) :
                data.map(coin => (
                  <div key={coin.id} className="flex items-center gap-3 px-5 py-3 market-row transition-colors">
                    <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=32`; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{coin.symbol}</p>
                      <p className="text-xs text-slate-500 truncate">{coin.nameFa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white tabular-nums" dir="ltr">
                        {coin._raw?.dst === 'rls'
                          ? `${(coin._raw.latest / 10).toLocaleString('en-US', { maximumFractionDigits: 0 })} ت`
                          : `$${formatPrice(coin.current_price)}`}
                      </p>
                      <Badge value={coin.price_change_percentage_24h} className="mt-0.5" />
                    </div>
                    <button onClick={() => toggleWatchlist(coin.id)} className="text-slate-600 hover:text-amber-400 transition-colors flex-shrink-0">
                      <Star className={`w-4 h-4 ${watchlist.includes(coin.id) ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                  </div>
                ))
              }
            </div>
          </Card>
        ))}
      </div>

      {/* All Markets Table */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">بازارهای نوبیتکس</h3>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">زنده</span>
          </div>
          <Link to="/market" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">مشاهده همه ←</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['#', 'ارز', 'قیمت', 'قیمت (تومان)', 'تغییر ۲۴ه', 'بازار'].map(h => (
                  <th key={h} className="text-right text-xs text-slate-500 font-medium px-4 py-3 first:pr-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {isLoading ? Array(10).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>
              )) : coins.slice(0, 12).map(coin => {
                const isRls = coin._raw?.dst === 'rls';
                const tomanPrice = isRls ? (coin._raw!.latest / 10) : (coin.price_irr / 10);
                return (
                  <tr key={coin.id} className="market-row transition-colors group">
                    <td className="px-5 py-3 text-slate-500 text-xs">{coin.market_cap_rank}</td>
                    <td className="px-4 py-3">
                      <Link to={`/chart?coin=${coin.id}`} className="flex items-center gap-2">
                        <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full flex-shrink-0"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=28`; }} />
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">{coin.symbol}</p>
                          <p className="text-xs text-slate-500">{coin.nameFa}</p>
                        </div>
                      </Link>
                    </td>
                    <td className={`px-4 py-3 text-xs font-bold tabular-nums ${coin.priceDirection === 'up' ? 'text-emerald-400' : coin.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`} dir="ltr">
                      {isRls ? `${(coin._raw!.latest).toLocaleString('en-US', { maximumFractionDigits: 0 })} ﷼` : `$${formatPrice(coin.current_price)}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell tabular-nums" dir="ltr">
                      {tomanPrice > 0 ? `${tomanPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} ت` : '---'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${getPriceColorClass(coin.price_change_percentage_24h)} tabular-nums`}>
                        {formatPercent(coin.price_change_percentage_24h)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isRls ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {isRls ? 'IRT' : 'USDT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
