import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('لطفاً همه فیلدها را پر کنید'); return; }
    setIsLoading(true);
    setError('');
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const fillDemo = (type: 'admin' | 'user') => {
    if (type === 'admin') { setEmail('aradnavaee@gmail.com'); setPassword('Admin@1234'); }
    else { setEmail('mohamadnavaee@gmail.com'); setPassword('User@1234'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex" dir="rtl">
      {/* Left Info Panel */}
      <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between border-l border-slate-800/60 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-chart.jpg" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/70 to-slate-950/95" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">آراد مارکت</h1>
                <p className="text-xs text-slate-500">داشبورد قدرتمند آراد مارکت</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                  داشبورد حرفه‌ای<br />
                  <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">ارز دیجیتال</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  قیمت لحظه‌ای از API نوبیتکس، نمودار پیشرفته،<br />
                  هشدار قیمت و تبدیل ارز — همه در یک پنل حرفه‌ای
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'داده واقعی', value: 'نوبیتکس', color: 'blue' },
                  { label: 'بروزرسانی', value: '۱۰ثانیه', color: 'violet' },
                  { label: 'جفت‌ارز', value: '۲۰۰+', color: 'emerald' },
                  { label: 'هشدار قیمت', value: 'رایگان', color: 'amber' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/40 backdrop-blur rounded-xl p-4 border border-slate-700/40">
                    <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                    <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {[
                  'داده واقعی از API رسمی نوبیتکس',
                  'نمودار OHLCV با تایم‌فریم‌های مختلف',
                  'دفتر سفارشات و معاملات اخیر',
                  'هشدار قیمت شخصی‌سازی شده',
                  'تبدیل بین تمام ارزها با نرخ لحظه‌ای',
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-slate-600 text-sm">
            © ۱۴۰۳ آراد مارکت | داده‌های بازار از نوبیتکس
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">آراد مارکت</h1>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">ورود به حساب</h3>
          <p className="text-slate-400">به داشبورد حرفه‌ای آراد مارکت دسترسی داشته باشید</p>
        </div>

        {/* Demo Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => fillDemo('admin')} className="py-2.5 text-sm bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-colors">
            👑 ورود ادمین
          </button>
          <button onClick={() => fillDemo('user')} className="py-2.5 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 transition-colors">
            👤 ورود کاربر
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">آدرس ایمیل</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-9 pl-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pr-9 pl-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                dir="ltr"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded" />
              مرا به خاطر بسپار
            </label>
            <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
              فراموشی رمز عبور؟
            </button>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            ورود به حساب
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          حساب ندارید؟{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            ثبت‌نام رایگان
          </Link>
        </p>

        <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700/40">
          <p className="text-xs text-slate-500 text-center mb-2 font-medium">دسترسی نمایشی</p>
          <div className="space-y-1 text-xs text-slate-600 text-center">
            <p>ادمین: aradnavaee@gmail.com / Admin@1234</p>
            <p>کاربر: mohamadnavaee@gmail.com / User@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
