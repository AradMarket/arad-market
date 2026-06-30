import { useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatPrice, formatDateTime } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import type { PriceAlert } from '../types';

export default function AlertsPage() {
  const { coins, alerts, addAlert, removeAlert } = useMarket();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    coinId: 'bitcoin',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  });
  const [added, setAdded] = useState(false);

  const selectedCoin = coins.find(c => c.id === form.coinId);

  const handleSubmit = () => {
    if (!selectedCoin || !form.targetPrice) return;
    addAlert({
      userId: '1',
      coinId: form.coinId,
      coinName: selectedCoin.nameFa,
      coinSymbol: selectedCoin.symbol,
      targetPrice: parseFloat(form.targetPrice),
      condition: form.condition,
      isActive: true,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setShowModal(false);
      setForm({ coinId: 'bitcoin', targetPrice: '', condition: 'above' });
    }, 1500);
  };

  const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered);
  const triggeredAlerts = alerts.filter(a => a.isTriggered);
  const totalAlerts = alerts.length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">هشدارهای قیمت</h2>
          <p className="text-sm text-slate-400 mt-0.5">هر دقیقه قیمت‌ها بررسی می‌شوند و در صورت رسیدن به قیمت هدف اطلاع داده می‌شود</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          هشدار جدید
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'کل هشدارها', value: totalAlerts, icon: Bell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'فعال', value: activeAlerts.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'فعال شده', value: triggeredAlerts.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(stat => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 live-badge"></div>
            <h3 className="text-sm font-semibold text-white">هشدارهای فعال</h3>
            <span className="text-xs text-slate-500">({activeAlerts.length})</span>
          </div>
          <div className="divide-y divide-slate-800/40">
            {activeAlerts.map(alert => {
              const coin = coins.find(c => c.id === alert.coinId);
              const currentPrice = coin?.current_price || 0;
              const progress = alert.condition === 'above'
                ? Math.min(100, (currentPrice / alert.targetPrice) * 100)
                : Math.min(100, (alert.targetPrice / currentPrice) * 100);

              return (
                <AlertRow key={alert.id} alert={alert} coin={coin} currentPrice={currentPrice} progress={progress} onRemove={removeAlert} />
              );
            })}
          </div>
        </Card>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">هشدارهای فعال شده</h3>
          </div>
          <div className="divide-y divide-slate-800/40">
            {triggeredAlerts.map(alert => {
              const coin = coins.find(c => c.id === alert.coinId);
              return (
                <div key={alert.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {coin && <img src={coin.image} alt={coin.symbol} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=40`; }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{alert.coinSymbol}</p>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">فعال شد</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {alert.condition === 'above' ? 'بالاتر از' : 'پایین‌تر از'} ${formatPrice(alert.targetPrice)}
                      {alert.triggeredAt && ` • ${formatDateTime(alert.triggeredAt)}`}
                    </p>
                  </div>
                  <button onClick={() => removeAlert(alert.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">هشداری تنظیم نشده</h2>
          <p className="text-slate-400 mb-6 max-w-md">هشدار قیمت تنظیم کنید تا در زمان رسیدن به قیمت هدف مطلع شوید</p>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            هشدار جدید
          </Button>
        </div>
      )}

      {/* Add Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">هشدار قیمت جدید</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors text-xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Coin Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">انتخاب ارز</label>
                <select
                  value={form.coinId}
                  onChange={e => {
                    const coin = coins.find(c => c.id === e.target.value);
                    setForm(f => ({
                      ...f,
                      coinId: e.target.value,
                      targetPrice: coin ? String(Math.round(coin.current_price)) : f.targetPrice
                    }));
                  }}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {coins.map(c => (
                    <option key={c.id} value={c.id}>{c.symbol} - {c.nameFa}</option>
                  ))}
                </select>
              </div>

              {/* Selected Coin Info */}
              {selectedCoin && (
                <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
                  <img src={selectedCoin.image} alt={selectedCoin.symbol} className="w-8 h-8 rounded-full" onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedCoin.symbol}&background=1e3a5f&color=60a5fa&size=32`; }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{selectedCoin.nameFa}</p>
                    <p className="text-xs text-slate-400">قیمت فعلی: <span className="text-white">${formatPrice(selectedCoin.current_price)}</span></p>
                  </div>
                  <Badge value={selectedCoin.price_change_percentage_24h} />
                </div>
              )}

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">شرط هشدار</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, condition: 'above' }))}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all ${
                      form.condition === 'above'
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>بالاتر از قیمت</span>
                  </button>
                  <button
                    onClick={() => setForm(f => ({ ...f, condition: 'below' }))}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all ${
                      form.condition === 'below'
                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>پایین‌تر از قیمت</span>
                  </button>
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">قیمت هدف (USDT)</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    value={form.targetPrice}
                    onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-7 pl-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    dir="ltr"
                  />
                </div>
                {selectedCoin && form.targetPrice && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    {form.condition === 'above' ? 'سود' : 'کاهش'} مورد انتظار:{' '}
                    <span className={parseFloat(form.targetPrice) > selectedCoin.current_price ? 'text-emerald-400' : 'text-red-400'}>
                      {(((parseFloat(form.targetPrice) - selectedCoin.current_price) / selectedCoin.current_price) * 100).toFixed(2)}%
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-slate-400">در محیط نمایشی، هشدارها در داشبورد نمایش داده می‌شوند. در نسخه واقعی، ایمیل ارسال می‌شود.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmit} className="flex-1" variant={added ? 'success' : 'primary'}>
                {added ? '✓ هشدار ثبت شد!' : 'ثبت هشدار'}
              </Button>
              <Button onClick={() => setShowModal(false)} variant="secondary">انصراف</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert, coin, currentPrice, progress, onRemove
}: {
  alert: PriceAlert;
  coin: any;
  currentPrice: number;
  progress: number;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {coin && (
            <img
              src={coin.image}
              alt={coin.symbol}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=40`; }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-white">{alert.coinSymbol}</p>
            <span className="text-xs text-slate-500">{alert.coinName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
              alert.condition === 'above'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}>
              {alert.condition === 'above' ? '↑ بالاتر از' : '↓ پایین‌تر از'} ${formatPrice(alert.targetPrice)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>قیمت فعلی: <span className="text-white">${formatPrice(currentPrice)}</span></span>
            <span>•</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {formatDateTime(alert.createdAt)}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>پیشرفت</span>
              <span>{Math.min(100, progress).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${alert.condition === 'above' ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        </div>
        <button onClick={() => onRemove(alert.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
