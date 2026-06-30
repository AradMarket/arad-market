import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MarketTicker from './MarketTicker';
import ToastContainer from '../ui/Toast';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'داشبورد',
  '/market': 'بازار ارز دیجیتال',
  '/chart': 'نمودار قیمت',
  '/watchlist': 'لیست دیده‌بانی',
  '/alerts': 'هشدارهای قیمت',
  '/converter': 'تبدیل ارز',
  '/admin': 'پنل مدیریت',
  '/profile': 'پروفایل کاربری',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'آراد مارکت';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden" dir="rtl">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MarketTicker />
        <Header onMenuToggle={() => setSidebarOpen(true)} title={title} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
