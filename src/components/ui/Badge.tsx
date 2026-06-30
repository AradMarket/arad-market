import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

interface Props {
  value: number;
  showIcon?: boolean;
  className?: string;
}

export default function Badge({ value, showIcon = true, className = '' }: Props) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const colors = isPositive
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : isNegative
    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${colors} ${className}`}>
      {showIcon && <Icon className="w-3 h-3" />}
      {formatPercent(value)}
    </span>
  );
}
