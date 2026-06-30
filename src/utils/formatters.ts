export function formatPrice(price: number, decimals?: number): string {
  if (price === undefined || price === null) return '---';
  if (price === 0) return '0';

  if (price < 0.000001) {
    return price.toFixed(10).replace(/\.?0+$/, '');
  }
  if (price < 0.001) {
    return price.toFixed(8);
  }
  if (price < 0.01) {
    return price.toFixed(6);
  }
  if (price < 1) {
    return price.toFixed(4);
  }
  if (price < 100) {
    return price.toFixed(decimals ?? 2);
  }
  if (price < 10000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatIRR(amount: number): string {
  if (!amount) return '---';
  if (amount >= 1_000_000_000_000) {
    return `${(amount / 1_000_000_000_000).toFixed(2)} هزار میلیارد`;
  }
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} میلیارد`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)} میلیون`;
  }
  return amount.toLocaleString('fa-IR');
}

export function formatMarketCap(num: number): string {
  if (!num) return '---';
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

export function formatVolume(num: number): string {
  return formatMarketCap(num);
}

export function formatPercent(num: number): string {
  if (num === undefined || num === null) return '0.00%';
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatSupply(num: number): string {
  if (!num) return '---';
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  return num.toLocaleString();
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function generateChartData(currentPrice: number, days: number, points: number = 100): {
  timestamp: number; date: string; price: number; open: number; high: number; low: number; close: number; volume: number;
}[] {
  const data = [];
  const now = Date.now();
  const interval = (days * 24 * 60 * 60 * 1000) / points;
  let price = currentPrice * (0.85 + Math.random() * 0.3);

  for (let i = points; i >= 0; i--) {
    const timestamp = now - i * interval;
    const open = price;
    const change = (Math.random() - 0.485) * 0.04;
    price = price * (1 + change);
    const high = Math.max(open, price) * (1 + Math.random() * 0.015);
    const low = Math.min(open, price) * (1 - Math.random() * 0.015);

    data.push({
      timestamp,
      date: new Date(timestamp).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(6)),
      open: parseFloat(open.toFixed(6)),
      high: parseFloat(high.toFixed(6)),
      low: parseFloat(low.toFixed(6)),
      close: parseFloat(price.toFixed(6)),
      volume: Math.random() * 1000000000 + 500000000,
    });
  }

  // Force last point to be close to current price
  if (data.length > 0) {
    data[data.length - 1].close = currentPrice;
    data[data.length - 1].price = currentPrice;
  }

  return data;
}

export function getPriceColorClass(change: number): string {
  if (change > 0) return 'text-emerald-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-400';
}

export function getPriceBgClass(change: number): string {
  if (change > 0) return 'bg-emerald-400/10 text-emerald-400';
  if (change < 0) return 'bg-red-400/10 text-red-400';
  return 'bg-slate-400/10 text-slate-400';
}

export function truncateAddress(str: string, chars = 6): string {
  if (str.length <= chars * 2) return str;
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}
