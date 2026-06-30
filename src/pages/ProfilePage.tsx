import { useState } from 'react';
import { User, Mail, Shield, Bell, Star, Activity, Edit2, CheckCircle, Key, Globe, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { formatDate, formatDateTime } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { watchlist, alerts, coins } = useMarket();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const watchedCoins = coins.filter(c => watchlist.includes(c.id)).slice(0, 5);
  const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered);

  const handleSave = () => {
    if (user) {
      updateUser({ ...user, name });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const stats = [
    { label: 'دیده‌بانی', value: watchlist.length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'هشدارهای فعال', value: activeAlerts.length, icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'روز عضویت', value: Math.floor((Date.now() - new Date(user?.createdAt || '').getTime()) / (1000 * 60 * 60 * 24)), icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto" dir="rtl">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <User className="w-10 h-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-900 hover:bg-blue-700 transition-colors">
              <Edit2 className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-slate-800 border border-blue-500 rounded-xl px-3 py-2 text-white text-lg font-bold focus:outline-none"
                />
                <Button size="sm" onClick={handleSave}>ذخیره</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(user?.name || ''); }}>انصراف</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                {saved && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                <button onClick={() => setEditing(true)} className="text-slate-500 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
              {user?.isVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  تأیید شده
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${
                user?.role === 'admin'
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
              }`}>
                {user?.role === 'admin' ? '👑 مدیر سیستم' : '👤 کاربر عادی'}
              </span>
              <span className="text-xs text-slate-500 px-2.5 py-1 rounded-full border border-slate-700">
                عضو از {formatDate(user?.createdAt || '')}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            {stats.map(stat => (
              <div key={stat.label} className={`p-3 rounded-xl ${stat.bg} text-center min-w-[80px]`}>
                <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Settings */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white">تنظیمات حساب</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Security */}
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="flex items-center gap-3 mb-3">
                <Key className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-medium text-white">امنیت</h4>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  تغییر رمز عبور
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Globe className="w-4 h-4" />
                  احراز هویت دو عاملی
                </Button>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-medium text-white">اعلان‌ها</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'هشدار ایمیل', sub: 'دریافت هشدار قیمت از طریق ایمیل', value: emailAlerts, setter: setEmailAlerts },
                  { label: 'اعلان مرورگر', sub: 'دریافت نوتیفیکیشن در مرورگر', value: pushAlerts, setter: setPushAlerts },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => item.setter(!item.value)}
                      className={`relative w-11 h-6 rounded-full transition-all ${item.value ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${item.value ? 'left-5.5' : 'left-0.5'}`} style={{ left: item.value ? '1.375rem' : '0.125rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
              <div className="flex items-center gap-3 mb-3">
                <Moon className="w-4 h-4 text-violet-400" />
                <h4 className="text-sm font-medium text-white">ظاهر</h4>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">حالت تاریک</p>
                  <p className="text-xs text-slate-500">تم پیش‌فرض سیستم</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">فعال</span>
                  <div className="w-11 h-6 rounded-full bg-blue-600 relative">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Watchlist Preview */}
        <div className="space-y-4">
          <Card>
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">دیده‌بانی من</h3>
              <a href="/watchlist" className="text-xs text-blue-400 hover:text-blue-300">مشاهده همه</a>
            </div>
            {watchedCoins.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>ارزی در لیست دیده‌بانی نیست</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {watchedCoins.map(coin => (
                  <div key={coin.id} className="flex items-center gap-3 px-5 py-3 market-row">
                    <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=32`; }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                      <p className="text-xs text-slate-500">{coin.nameFa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">${coin.current_price.toLocaleString()}</p>
                      <Badge value={coin.price_change_percentage_24h} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Alerts Preview */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">هشدارهای فعال</h3>
              <a href="/alerts" className="text-xs text-blue-400 hover:text-blue-300">مدیریت</a>
            </div>
            {activeAlerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>هشدار فعالی ندارید</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {activeAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-2 h-2 rounded-full ${alert.condition === 'above' ? 'bg-emerald-400' : 'bg-red-400'} live-badge`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{alert.coinSymbol}</p>
                      <p className="text-xs text-slate-500">
                        {alert.condition === 'above' ? 'بالاتر از' : 'پایین‌تر از'} ${alert.targetPrice.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDateTime(alert.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
