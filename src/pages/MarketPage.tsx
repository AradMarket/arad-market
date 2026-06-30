import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, TrendingUp, ChevronUp, ChevronDown, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatPrice, formatVolume } from '../utils/formatters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SkeletonRow from '../components/ui/SkeletonRow';

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type SortDir = 'asc' | 'desc';

export default function MarketPage() {
  const { coins, isLoading, watchlist, toggleWatchlist, usdToIrr, error } = useMarket();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers' | 'watchlist' | 'irt' | 'usdt'>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    let result = [...coins];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        c.nameFa.includes(q) ||
        c.id.includes(q)
      );
    }
    if (filter === 'gainers') result = result.filter(c => c.price_change_percentage_24h > 0);
    if (filter === 'losers') result = result.filter(c => c.price_change_percentage_24h < 0);
    if (filter === 'watchlist') result = result.filter(c => watchlist.includes(c.id));
    if (filter === 'irt') result = result.filter(c => c._raw?.dst === 'rls');
    if (filter === 'usdt') result = result.filter(c => c._raw?.dst === 'usdt');
    result.sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return result;
  }, [coins, search, filter, sortKey, sortDir, watchlist]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const irtPairs = coins.filter(c => c._raw?.dst === 'rls').length;
  const usdtPairs = coins.filter(c => c._raw?.dst === 'usdt').length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'کل بازارها', value: coins.length, color: 'text-slate-300', icon: Activity },
          { label: 'جفت‌ارز IRT', value: irtPairs, color: 'text-emerald-400', icon: TrendingUp },
          { label: 'جفت‌ارز USDT', value: usdtPairs, color: 'text-blue-400', icon: TrendingUp },
          { label: 'نرخ دلار/ریال', value: usdToIrr.toLocaleString('fa-IR', { maximumFractionDigits: 0 }), color: 'text-amber-400', icon: RefreshCw },
        ].map(stat => (
          <Card key={stat.label} className="px-4 py-3 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
              <p className="text-slate-500 text-xs">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-800/60">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="جستجوی ارز دیجیتال..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'همه' },
              { key: 'usdt', label: 'USDT' },
              { key: 'irt', label: 'تومان/IRT' },
              { key: 'gainers', label: '↑ رشد' },
              { key: 'losers', label: '↓ افت' },
              { key: 'watchlist', label: '★ دیده‌بانی' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 w-12">
                  <button className="flex items-center gap-1" onClick={() => handleSort('market_cap_rank')}>
                    # <SortIcon col="market_cap_rank" />
                  </button>
                </th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">ارز / بازار</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">
                  <button className="flex items-center gap-1" onClick={() => handleSort('current_price')}>
                    قیمت (USDT) <SortIcon col="current_price" />
                  </button>
                </th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden sm:table-cell">قیمت (تومان)</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3">
                  <button className="flex items-center gap-1" onClick={() => handleSort('price_change_percentage_24h')}>
                    تغییر ۲۴ه <SortIcon col="price_change_percentage_24h" />
                  </button>
                </th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden md:table-cell">
                  <button className="flex items-center gap-1" onClick={() => handleSort('total_volume')}>
                    حجم معاملات <SortIcon col="total_volume" />
                  </button>
                </th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 hidden lg:table-cell">سقف/کف ۲۴ه</th>
                <th className="text-right text-xs text-slate-500 font-medium px-4 py-3 w-20">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {isLoading ? (
                Array(12).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8}><SkeletonRow /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>ارزی با این مشخصات یافت نشد</p>
                  </td>
                </tr>
              ) : (
                filtered.map(coin => {
                  const isRls = coin._raw?.dst === 'rls';
                  const displayPrice = coin.current_price;
                  const tomanPrice = isRls
                    ? (coin._raw?.latest || 0) / 10
                    : coin.price_irr / 10;

                  return (
                    <tr key={coin.id} className="market-row transition-colors group">
                      <td className="px-4 py-3.5 text-slate-500 text-sm">{coin.market_cap_rank}</td>
                      <td className="px-4 py-3.5">
                        <Link to={`/chart?coin=${coin.id}`} className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0">
                            <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full"
                              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=32`; }} />
                            {coin.priceDirection === 'up' && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />}
                            {coin.priceDirection === 'down' && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{coin.symbol}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs text-slate-500">{coin.nameFa}</p>
                              <span className={`text-xs px-1 py-0.5 rounded font-mono ${isRls ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {isRls ? 'IRT' : 'USDT'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className={`text-sm font-bold tabular-nums transition-colors ${coin.priceDirection === 'up' ? 'text-emerald-400' : coin.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`} dir="ltr">
                          {isRls ? `${(coin._raw?.latest || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ﷼` : `$${formatPrice(displayPrice)}`}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-400 hidden sm:table-cell tabular-nums" dir="ltr">
                        {tomanPrice > 0 ? `${tomanPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} ت` : '---'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={coin.price_change_percentage_24h} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-300 hidden md:table-cell tabular-nums" dir="ltr">
                        {coin._raw
                          ? `${coin._raw.volumeSrc.toFixed(2)} ${coin.symbol}`
                          : formatVolume(coin.total_volume)}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-xs" dir="ltr">
                        <span className="text-emerald-400">
                          {isRls ? `${(coin._raw?.dayHigh || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ﷼` : `$${formatPrice(coin.high_24h)}`}
                        </span>
                        <span className="text-slate-600 mx-1">/</span>
                        <span className="text-red-400">
                          {isRls ? `${(coin._raw?.dayLow || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ﷼` : `$${formatPrice(coin.low_24h)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleWatchlist(coin.id)}
                            className={`transition-colors ${watchlist.includes(coin.id) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}>
                            <Star className={`w-4 h-4 ${watchlist.includes(coin.id) ? 'fill-amber-400' : ''}`} />
                          </button>
                          <Link to={`/chart?coin=${coin.id}`} className="text-slate-600 hover:text-blue-400 transition-colors">
                            <Activity className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800/60 flex items-center justify-between">
            <p className="text-xs text-slate-500">{filtered.length} بازار نمایش داده می‌شود</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <RefreshCw className="w-3 h-3" />
              <span>هر ۱۰ ثانیه بروزرسانی از API نوبیتکس</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
