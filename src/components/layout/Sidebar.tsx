import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Star, Bell, ArrowLeftRight,
  Shield, LogOut, User, ChevronLeft, Activity, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'داشبورد', labelEn: 'Dashboard' },
  { to: '/market', icon: TrendingUp, label: 'بازار', labelEn: 'Market' },
  { to: '/chart', icon: Activity, label: 'نمودار', labelEn: 'Chart' },
  { to: '/watchlist', icon: Star, label: 'لیست دیده‌بانی', labelEn: 'Watchlist' },
  { to: '/alerts', icon: Bell, label: 'هشدار قیمت', labelEn: 'Alerts' },
  { to: '/converter', icon: ArrowLeftRight, label: 'تبدیل ارز', labelEn: 'Converter' },
];

export default function Sidebar({ isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const { alerts, watchlist } = useMarket();
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 z-50 flex flex-col
          bg-slate-950 border-l border-slate-800/80
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">آراد مارکت</h1>
              <p className="text-xs text-slate-500">Arad Market</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0">
                ادمین
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="text-xs text-slate-600 px-3 mb-2 font-medium uppercase tracking-wider">منوی اصلی</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'nav-item-active'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.to === '/alerts' && activeAlerts > 0 && (
                <span className="mr-auto bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeAlerts}
                </span>
              )}
              {item.to === '/watchlist' && watchlist.length > 0 && (
                <span className="mr-auto bg-slate-700 text-slate-300 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="text-xs text-slate-600 px-3 mb-2 mt-4 font-medium uppercase tracking-wider">مدیریت</p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? 'nav-item-active' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                }
              >
                <Shield className="w-4.5 h-4.5" />
                <span>پنل مدیریت</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Market Status */}
        <div className="px-4 py-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 live-badge"></div>
            <span>بازار فعال است</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 py-3 border-t border-slate-800/80 space-y-1">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive ? 'nav-item-active' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
            }
          >
            <User className="w-4.5 h-4.5" />
            <span>پروفایل</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
    </>
  );
}
