import { useState, useEffect } from 'react';
import { Menu, Search, Bell, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { formatPrice } from '../../utils/formatters';
import { Link } from 'react-router-dom';

interface Props {
  onMenuToggle: () => void;
  title: string;
}

export default function Header({ onMenuToggle, title }: Props) {
  const { lastUpdated, isLoading, alerts, coins, error } = useMarket();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadAlerts = alerts.filter(a => a.isTriggered).length;
  const isApiLive = !error && lastUpdated !== null;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = searchQuery
    ? coins.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameFa.includes(searchQuery)
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/80">
      <div className="flex items-center gap-3 px-4 md:px-6 py-3">
        {/* Menu toggle */}
        <button onClick={onMenuToggle} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1">
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-base font-semibold text-white hidden sm:block">{title}</h2>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="جستجوی ارز، نماد..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pr-9 pl-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {searchOpen && searchQuery && filteredCoins.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
              {filteredCoins.map(coin => (
                <Link key={coin.id} to={`/chart?coin=${coin.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors">
                  <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=28`; }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                    <p className="text-xs text-slate-500">{coin.nameFa}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white tabular-nums" dir="ltr">
                      ${formatPrice(coin.current_price)}
                    </p>
                    <span className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))}
              <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-600 text-center">
                داده از API نوبیتکس
              </div>
            </div>
          )}
        </div>

        {/* Right Items */}
        <div className="flex items-center gap-2 mr-auto">
          {/* API Status */}
          <div className={`hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
            isLoading ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' :
            isApiLive ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' :
            'border-amber-500/30 bg-amber-500/5 text-amber-400'
          }`}>
            {isLoading ? (
              <><RefreshCw className="w-3 h-3 animate-spin" /> <span>در حال بروزرسانی</span></>
            ) : isApiLive ? (
              <><Wifi className="w-3 h-3" /> <span>API نوبیتکس</span> <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-badge" /></>
            ) : (
              <><WifiOff className="w-3 h-3" /> <span>داده محلی</span></>
            )}
          </div>

          {/* Time */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Clock className="w-3 h-3" />
            <span dir="ltr">{currentTime.toLocaleTimeString('fa-IR')}</span>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="hidden xl:block text-xs text-slate-600" dir="ltr">
              {lastUpdated.toLocaleTimeString('fa-IR')}
            </div>
          )}

          {/* Notifications */}
          <Link to="/alerts" className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadAlerts}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
