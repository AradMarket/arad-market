import { useState, useEffect } from 'react';
import { ArrowLeftRight, RefreshCw, Info } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { formatPrice } from '../utils/formatters';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function ConverterPage() {
  const { coins, usdToIrr } = useMarket();

  // Build option list: all coins + IRT/TMN
  const coinOptions = [
    ...coins.filter(c => c._raw?.dst === 'usdt').map(c => ({
      id: c.id, symbol: c.symbol, name: c.nameFa, image: c.image,
      priceUsdt: c.current_price,
      priceRls: c.price_irr,
      change: c.price_change_percentage_24h,
    })),
    { id: 'usdt', symbol: 'USDT', name: 'تتر', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', priceUsdt: 1, priceRls: usdToIrr, change: 0 },
    { id: 'rls', symbol: 'RLS', name: 'ریال ایران', image: '', priceUsdt: 1 / usdToIrr, priceRls: 1, change: 0 },
    { id: 'toman', symbol: 'TMN', name: 'تومان', image: '', priceUsdt: 10 / usdToIrr, priceRls: 10, change: 0 },
  ];

  const [fromId, setFromId] = useState('btc-usdt');
  const [toId, setToId] = useState('usdt');
  const [fromAmount, setFromAmount] = useState('1');
  const [toAmount, setToAmount] = useState('');
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');

  const getOption = (id: string) => coinOptions.find(c => c.id === id);

  const getUsdtValue = (id: string): number => {
    const opt = getOption(id);
    return opt?.priceUsdt || 1;
  };

  const fmtNum = (n: number): string => {
    if (!n || isNaN(n)) return '';
    if (n >= 1e12) return (n / 1e12).toFixed(4) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(4) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(4) + 'M';
    if (n < 0.0000001) return n.toFixed(12).replace(/\.?0+$/, '');
    if (n < 0.001) return n.toFixed(8);
    if (n < 1) return n.toFixed(6);
    if (n < 10000) return n.toFixed(4);
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const convert = (amount: number, fromId: string, toId: string): number => {
    const fromUsdt = getUsdtValue(fromId);
    const toUsdt = getUsdtValue(toId);
    if (!fromUsdt || !toUsdt) return 0;
    return (amount * fromUsdt) / toUsdt;
  };

  useEffect(() => {
    if (lastEdited === 'from') {
      const amt = parseFloat(fromAmount) || 0;
      setToAmount(fmtNum(convert(amt, fromId, toId)));
    } else {
      const amt = parseFloat(toAmount) || 0;
      setFromAmount(fmtNum(convert(amt, toId, fromId)));
    }
  }, [fromId, toId, coins]);

  const handleFromChange = (val: string) => {
    setFromAmount(val);
    setLastEdited('from');
    const amt = parseFloat(val) || 0;
    setToAmount(fmtNum(convert(amt, fromId, toId)));
  };

  const handleToChange = (val: string) => {
    setToAmount(val);
    setLastEdited('to');
    const amt = parseFloat(val) || 0;
    setFromAmount(fmtNum(convert(amt, toId, fromId)));
  };

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const fromOpt = getOption(fromId);
  const toOpt = getOption(toId);
  const rate = convert(1, fromId, toId);

  const quickPairs = [
    { from: 'btc-usdt', to: 'usdt', label: 'BTC → USDT' },
    { from: 'eth-usdt', to: 'usdt', label: 'ETH → USDT' },
    { from: 'usdt', to: 'rls', label: 'USDT → ریال' },
    { from: 'usdt', to: 'toman', label: 'USDT → تومان' },
    { from: 'btc-usdt', to: 'rls', label: 'BTC → ریال' },
    { from: 'eth-usdt', to: 'toman', label: 'ETH → تومان' },
  ];

  // BTC conversion table
  const btcCoin = coinOptions.find(c => c.symbol === 'BTC');
  const usdtRls = usdToIrr || 620000;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Converter */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">تبدیل ارز دیجیتال</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-badge" />
                <span>نرخ نوبیتکس</span>
              </div>
            </div>

            {/* Quick Pairs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quickPairs.map(pair => (
                <button key={pair.label}
                  onClick={() => { setFromId(pair.from); setToId(pair.to); setFromAmount('1'); setLastEdited('from'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${fromId === pair.from && toId === pair.to ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'}`}>
                  {pair.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* From */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">از</span>
                  {fromOpt && <span className="text-xs text-slate-400">{fromOpt.name}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <select value={fromId} onChange={e => { setFromId(e.target.value); setLastEdited('from'); }}
                    className="bg-slate-700/80 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-blue-500 min-w-[100px]">
                    {coinOptions.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
                  </select>
                  <input type="number" value={fromAmount} onChange={e => handleFromChange(e.target.value)}
                    placeholder="0" dir="ltr"
                    className="flex-1 bg-transparent text-white text-2xl font-bold placeholder-slate-700 focus:outline-none text-left min-w-0" />
                </div>
                {fromOpt && fromOpt.priceUsdt > 0 && (
                  <p className="text-xs text-slate-500 mt-2 text-left" dir="ltr">
                    ≈ ${((parseFloat(fromAmount) || 0) * fromOpt.priceUsdt).toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT
                  </p>
                )}
              </div>

              {/* Swap */}
              <div className="flex justify-center">
                <button onClick={handleSwap}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all hover:scale-110">
                  <ArrowLeftRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* To */}
              <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">به</span>
                  {toOpt && <span className="text-xs text-slate-400">{toOpt.name}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <select value={toId} onChange={e => { setToId(e.target.value); setLastEdited('to'); }}
                    className="bg-slate-700/80 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-blue-500 min-w-[100px]">
                    {coinOptions.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
                  </select>
                  <input type="number" value={toAmount} onChange={e => handleToChange(e.target.value)}
                    placeholder="0" dir="ltr"
                    className="flex-1 bg-transparent text-blue-400 text-2xl font-bold placeholder-slate-700 focus:outline-none text-left min-w-0" />
                </div>
                {toOpt && toOpt.priceUsdt > 0 && (
                  <p className="text-xs text-slate-500 mt-2 text-left" dir="ltr">
                    ≈ ${((parseFloat(toAmount) || 0) * toOpt.priceUsdt).toLocaleString('en-US', { maximumFractionDigits: 2 })} USDT
                  </p>
                )}
              </div>
            </div>

            {/* Rate Info */}
            <div className="mt-5 p-4 bg-slate-800/30 border border-slate-700/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">نرخ تبدیل:</span>
                <span className="text-white font-bold tabular-nums" dir="ltr">
                  1 {fromOpt?.symbol} = {fmtNum(rate)} {toOpt?.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-3 h-3" />
                <span>نرخ دلار/ریال (نوبیتکس): <span className="text-white tabular-nums">{usdtRls.toLocaleString('en-US')}</span> ریال</span>
              </div>
            </div>

            {/* IRT Rate Display */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'نرخ دلار / ریال', val: `${usdtRls.toLocaleString('en-US')} ﷼`, color: 'text-emerald-400' },
                { label: 'نرخ دلار / تومان', val: `${(usdtRls / 10).toLocaleString('en-US')} ت`, color: 'text-blue-400' },
                { label: 'BTC / تومان', val: btcCoin ? `${((btcCoin.priceUsdt * usdtRls) / 10).toLocaleString('en-US', { maximumFractionDigits: 0 })} ت` : '---', color: 'text-amber-400' },
              ].map(item => (
                <div key={item.label} className="bg-slate-800/30 rounded-xl p-3 text-center border border-slate-700/30">
                  <p className={`text-sm font-bold ${item.color} tabular-nums`} dir="ltr">{item.val}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Live Rates */}
          <Card>
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">نرخ‌های زنده</h3>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-badge" />
            </div>
            <div className="divide-y divide-slate-800/40">
              {coinOptions.filter(c => !['rls', 'toman', 'usdt'].includes(c.id)).slice(0, 10).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 market-row">
                  {c.image ? (
                    <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${c.symbol}&background=1e3a5f&color=60a5fa&size=24`; }} />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">$</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{c.symbol}</p>
                    <p className="text-xs text-slate-500 truncate">{c.name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white tabular-nums" dir="ltr">${formatPrice(c.priceUsdt)}</p>
                    <Badge value={c.change} showIcon={false} className="mt-0.5" />
                  </div>
                  <button onClick={() => { setFromId(c.id); setToId('usdt'); setFromAmount('1'); setLastEdited('from'); }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">
                    انتخاب
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* BTC Table */}
          {btcCoin && (
            <Card>
              <div className="px-4 py-3 border-b border-slate-800/60">
                <h3 className="text-xs font-semibold text-white">جدول تبدیل BTC</h3>
              </div>
              <div className="p-4">
                <div className="divide-y divide-slate-800/40">
                  {[0.001, 0.01, 0.1, 0.5, 1, 5].map(amt => (
                    <div key={amt} className="flex justify-between py-2 text-xs">
                      <span className="text-slate-400 font-mono">{amt} BTC</span>
                      <span className="text-white font-mono tabular-nums" dir="ltr">
                        ${(amt * btcCoin.priceUsdt).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-slate-500 font-mono tabular-nums" dir="ltr">
                        {((amt * btcCoin.priceUsdt * usdtRls) / 10).toLocaleString('en-US', { maximumFractionDigits: 0 })} ت
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
