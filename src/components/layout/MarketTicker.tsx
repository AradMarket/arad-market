import { useMarket } from '../../context/MarketContext';
import { formatPrice } from '../../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketTicker() {
  const { coins } = useMarket();

  // Show USDT pairs in ticker (they have USD prices)
  const tickerCoins = coins
    .filter(c => c._raw?.dst === 'usdt')
    .slice(0, 12);

  if (tickerCoins.length === 0) return null;

  const TickerItem = ({ coin }: { coin: typeof tickerCoins[0] }) => {
    const isPositive = coin.price_change_percentage_24h >= 0;
    return (
      <Link to={`/chart?coin=${coin.id}`} className="inline-flex items-center gap-2 px-4 hover:opacity-80 transition-opacity">
        <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full"
          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=1e3a5f&color=60a5fa&size=16`; }} />
        <span className="text-slate-400 text-xs font-medium">{coin.symbol}</span>
        <span className={`text-xs font-bold tabular-nums ${coin.priceDirection === 'up' ? 'text-emerald-400' : coin.priceDirection === 'down' ? 'text-red-400' : 'text-white'}`} dir="ltr">
          ${formatPrice(coin.current_price)}
        </span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </span>
        <span className="text-slate-800 text-xs">|</span>
      </Link>
    );
  };

  return (
    <div className="bg-slate-900/70 border-b border-slate-800/60 overflow-hidden py-1.5 select-none">
      <div className="ticker-content inline-flex">
        {[...tickerCoins, ...tickerCoins].map((coin, i) => (
          <TickerItem key={`${coin.id}-${i}`} coin={coin} />
        ))}
      </div>
    </div>
  );
}
