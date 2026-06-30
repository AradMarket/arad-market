import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';

export default function ToastContainer() {
  const { notifications, dismissNotification } = useMarket();

  if (notifications.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-xl border glass shadow-xl animate-slide-in ${borders[notif.type as keyof typeof borders] || 'border-slate-700'}`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          {icons[notif.type as keyof typeof icons]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{notif.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 break-words">{notif.message}</p>
          </div>
          <button
            onClick={() => dismissNotification(notif.id)}
            className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
