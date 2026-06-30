import { useState } from 'react';
import { Shield, Users, Bell, TrendingUp, Activity, Eye, CheckCircle, XCircle, Search } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatPrice, formatMarketCap, formatDateTime, formatDate } from '../utils/formatters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const MOCK_ADMIN_USERS = [
  { id: '1', name: 'آراد نوایی', email: 'aradnavaee@gmail.com', role: 'admin', isVerified: true, createdAt: '2024-01-15', alertCount: 5, watchlistCount: 12 },
  { id: '2', name: 'محمد نوایی', email: 'mohamadnavaee@gmail.com', role: 'user', isVerified: true, createdAt: '2024-03-22', alertCount: 3, watchlistCount: 7 },
];

type AdminTab = 'overview' | 'users' | 'coins' | 'alerts';

export default function AdminPage() {
  const { coins, alerts } = useMarket();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [coinSearch, setCoinSearch] = useState('');
  const [disabledCoins, setDisabledCoins] = useState<string[]>([]);

  const filteredUsers = MOCK_ADMIN_USERS.filter(u =>
    u.name.includes(userSearch) || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCoins = coins.filter(c =>
    c.name.toLowerCase().includes(coinSearch.toLowerCase()) ||
    c.symbol.toLowerCase().includes(coinSearch.toLowerCase()) ||
    c.nameFa.includes(coinSearch)
  );

  const toggleCoin = (coinId: string) => {
    setDisabledCoins(prev =>
      prev.includes(coinId) ? prev.filter(id => id !== coinId) : [...prev, coinId]
    );
  };

  const stats = [
    { label: 'کل کاربران', value: MOCK_ADMIN_USERS.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'کاربران تأیید شده', value: MOCK_ADMIN_USERS.filter(u => u.isVerified).length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'کل هشدارها', value: alerts.length, icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'ارزهای فعال', value: coins.length - disabledCoins.length, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ];

  const tabs = [
    { key: 'overview', label: 'نمای کلی', icon: TrendingUp },
    { key: 'users', label: 'کاربران', icon: Users },
    { key: 'coins', label: 'ارزها', icon: Activity },
    { key: 'alerts', label: 'هشدارها', icon: Bell },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      {/* Admin Header */}
      <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">پنل مدیریت آراد مارکت</h2>
          <p className="text-sm text-slate-400">مدیریت کامل کاربران، هشدارها و ارزهای دیجیتال</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 live-badge"></div>
          <span className="text-xs text-slate-400">سیستم فعال</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="p-5 flex items-center gap-3">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Top Coins */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-800/60">
              <h3 className="text-sm font-semibold text-white">برترین ارزهای بازار</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/40">
                    <th className="text-right text-xs text-slate-500 px-5 py-3 font-medium">#</th>
                    <th className="text-right text-xs text-slate-500 px-4 py-3 font-medium">ارز</th>
                    <th className="text-right text-xs text-slate-500 px-4 py-3 font-medium">قیمت</th>
                    <th className="text-right text-xs text-slate-500 px-4 py-3 font-medium">تغییر</th>
                    <th className="text-right text-xs text-slate-500 px-4 py-3 font-medium">ارزش بازار</th>
                    <th className="text-right text-xs text-slate-500 px-4 py-3 font-medium">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {coins.slice(0, 8).map(coin => (
                    <tr key={coin.id} className="market-row">
                      <td className="px-5 py-3 text-xs text-slate-500">{coin.market_cap_rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=24`; }} />
                          <div>
                            <p className="text-xs font-semibold text-white">{coin.symbol}</p>
                            <p className="text-xs text-slate-500">{coin.nameFa}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white">${formatPrice(coin.current_price)}</td>
                      <td className="px-4 py-3"><Badge value={coin.price_change_percentage_24h} /></td>
                      <td className="px-4 py-3 text-xs text-slate-300">{formatMarketCap(coin.market_cap)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          disabledCoins.includes(coin.id)
                            ? 'text-red-400 border-red-500/30 bg-red-500/10'
                            : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        }`}>
                          {disabledCoins.includes(coin.id) ? 'غیرفعال' : 'فعال'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Users */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-800/60">
              <h3 className="text-sm font-semibold text-white">کاربران اخیر</h3>
            </div>
            <div className="divide-y divide-slate-800/40">
              {MOCK_ADMIN_USERS.slice(0, 3).map(user => (
                <div key={user.id} className="flex items-center gap-4 px-5 py-3 market-row">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(user.createdAt)}</div>
                  {user.isVerified
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <XCircle className="w-4 h-4 text-red-400" />
                  }
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <div className="p-4 border-b border-slate-800/60">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="جستجوی کاربر..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/40">
                  {['کاربر', 'ایمیل', 'نقش', 'تأیید', 'هشدارها', 'دیده‌بانی', 'تاریخ عضویت', 'عملیات'].map(h => (
                    <th key={h} className="text-right text-xs text-slate-500 px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="market-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        user.role === 'admin'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                      }`}>
                        {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isVerified
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{user.alertCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{user.watchlistCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="text-slate-500 hover:text-blue-400 transition-colors p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Coins Tab */}
      {activeTab === 'coins' && (
        <Card>
          <div className="p-4 border-b border-slate-800/60 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="جستجوی ارز..."
                value={coinSearch}
                onChange={e => setCoinSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              <span className="text-emerald-400">{coins.length - disabledCoins.length}</span> فعال،
              <span className="text-red-400 mr-1">{disabledCoins.length}</span> غیرفعال
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/40">
                  {['ارز', 'قیمت', 'تغییر ۲۴ه', 'ارزش بازار', 'وضعیت', 'عملیات'].map(h => (
                    <th key={h} className="text-right text-xs text-slate-500 px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredCoins.map(coin => (
                  <tr key={coin.id} className={`market-row ${disabledCoins.includes(coin.id) ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={coin.image} alt={coin.symbol} className="w-7 h-7 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=28`; }} />
                        <div>
                          <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                          <p className="text-xs text-slate-500">{coin.nameFa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-white">${formatPrice(coin.current_price)}</td>
                    <td className="px-4 py-3"><Badge value={coin.price_change_percentage_24h} /></td>
                    <td className="px-4 py-3 text-xs text-slate-300">{formatMarketCap(coin.market_cap)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        disabledCoins.includes(coin.id)
                          ? 'text-red-400 border-red-500/30 bg-red-500/10'
                          : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      }`}>
                        {disabledCoins.includes(coin.id) ? 'غیرفعال' : 'فعال'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCoin(coin.id)}
                        className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                          disabledCoins.includes(coin.id)
                            ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        {disabledCoins.includes(coin.id) ? 'فعال‌سازی' : 'غیرفعال'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white">تمام هشدارهای کاربران ({alerts.length})</h3>
          </div>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Bell className="w-12 h-12 mb-4 opacity-30" />
              <p>هیچ هشداری ثبت نشده است</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/40">
                    {['ارز', 'قیمت هدف', 'شرط', 'وضعیت', 'تاریخ'].map(h => (
                      <th key={h} className="text-right text-xs text-slate-500 px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {alerts.map(alert => (
                    <tr key={alert.id} className="market-row">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                            {alert.coinSymbol.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{alert.coinSymbol}</p>
                            <p className="text-xs text-slate-500">{alert.coinName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-white">${formatPrice(alert.targetPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          alert.condition === 'above'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-red-400 border-red-500/30 bg-red-500/10'
                        }`}>
                          {alert.condition === 'above' ? '↑ بالاتر' : '↓ پایین‌تر'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          alert.isTriggered
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : alert.isActive
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                            : 'text-slate-400 border-slate-600/30 bg-slate-600/10'
                        }`}>
                          {alert.isTriggered ? 'فعال شد' : alert.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(alert.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
