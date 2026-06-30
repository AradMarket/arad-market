import { Link } from 'react-router-dom';
import { Star, Trash2, TrendingUp, Activity, Bell, ArrowRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatPrice, formatMarketCap, formatPercent } from '../utils/formatters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import {
  AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { useMemo } from 'react';
import { generateChartData } from '../utils/formatters';

function MiniChart({ coin }: { coin: any }) {
  const data = useMemo(() => generateChartData(coin.current_price, 7, 30), [coin.id]);
  const isPositive = coin.price_change_percentage_24h >= 0;
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`wl-grad-${coin.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.2} />
            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="price" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={1.5} fill={`url(#wl-grad-${coin.id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function WatchlistPage() {
  const { coins, watchlist, toggleWatchlist, addAlert } = useMarket();
  const watchedCoins = coins.filter(c => watchlist.includes(c.id));

  if (watchedCoins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
          <Star className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">لیست دیده‌بانی خالی است</h2>
        <p className="text-slate-400 mb-6 max-w-md">
          ارزهای مورد علاقه خود را به این لیست اضافه کنید تا قیمت آن‌ها را راحت‌تر رصد کنید
        </p>
        <Link to="/market">
          <Button leftIcon={<ArrowRight className="w-4 h-4" />}>
            مشاهده بازار
          </Button>
        </Link>
      </div>
    );
  }

  // Summary stats
  const avgChange = watchedCoins.reduce((s, c) => s + c.price_change_percentage_24h, 0) / watchedCoins.length;
  const gainers = watchedCoins.filter(c => c.price_change_percentage_24h > 0).length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">تعداد ارزهای دیده‌بانی</p>
              <p className="text-2xl font-bold text-white">{watchedCoins.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${avgChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp className={`w-5 h-5 ${avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">میانگین تغییر ۲۴ ساعته</p>
              <p className={`text-2xl font-bold ${avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercent(avgChange)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">در حال رشد</p>
              <p className="text-2xl font-bold text-white">{gainers} از {watchedCoins.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchedCoins.map(coin => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <Card key={coin.id} hover className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.symbol}
                    className="w-10 h-10 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=40`; }}
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{coin.symbol}</p>
                    <p className="text-xs text-slate-500">{coin.nameFa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => addAlert({
                      userId: '1',
                      coinId: coin.id,
                      coinName: coin.nameFa,
                      coinSymbol: coin.symbol,
                      targetPrice: Math.round(coin.current_price * 1.05),
                      condition: 'above',
                      isActive: true,
                    })}
                    className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="تنظیم هشدار"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWatchlist(coin.id)}
                    className="p-1.5 text-amber-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="حذف از دیده‌بانی"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'} ${coin.priceDirection === 'up' ? 'price-up' : coin.priceDirection === 'down' ? 'price-down' : ''}`}>
                  ${formatPrice(coin.current_price)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge value={coin.price_change_percentage_24h} />
                  <span className="text-xs text-slate-500">
                    {(coin.price_irr / 10).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} ت
                  </span>
                </div>
              </div>

              {/* Mini Chart */}
              <MiniChart coin={coin} />

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                <div className="text-xs text-slate-500">
                  <span>سقف ۲۴ه: </span>
                  <span className="text-emerald-400">${formatPrice(coin.high_24h)}</span>
                </div>
                <div className="text-xs text-slate-500">
                  <span>کف ۲۴ه: </span>
                  <span className="text-red-400">${formatPrice(coin.low_24h)}</span>
                </div>
                <Link
                  to={`/chart?coin=${coin.id}`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  نمودار <Activity className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table View */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-800/60">
          <h3 className="text-sm font-semibold text-white">جزئیات کامل</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-right text-xs text-slate-500 font-medium px-5 py-3">ارز</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">قیمت</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">تغییر ۲۴ه</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden md:table-cell">ارزش بازار</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden lg:table-cell">سقف/کف ۲۴ه</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {watchedCoins.map(coin => (
                <tr key={coin.id} className="market-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=32`; }} />
                      <div>
                        <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                        <p className="text-xs text-slate-500">{coin.nameFa}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className={`text-sm font-bold ${coin.priceDirection === 'up' ? 'text-emerald-400' : coin.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`}>
                      ${formatPrice(coin.current_price)}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge value={coin.price_change_percentage_24h} />
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-300 hidden md:table-cell">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-emerald-400">${formatPrice(coin.high_24h)}</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-xs text-red-400">${formatPrice(coin.low_24h)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/chart?coin=${coin.id}`} className="text-slate-500 hover:text-blue-400 transition-colors">
                        <Activity className="w-4 h-4" />
                      </Link>
                      <button onClick={() => toggleWatchlist(coin.id)} className="text-amber-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
