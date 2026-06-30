import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '../../utils/formatters';

interface Props {
  price: number;
  prevPrice?: number;
  direction?: 'up' | 'down' | 'same';
  className?: string;
}

export default function PriceCell({ price, direction = 'same', className = '' }: Props) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevRef = useRef<'up' | 'down' | 'same'>('same');

  useEffect(() => {
    if (direction !== 'same' && direction !== prevRef.current) {
      setFlash(direction);
      const timer = setTimeout(() => setFlash(null), 600);
      prevRef.current = direction;
      return () => clearTimeout(timer);
    }
  }, [direction, price]);

  const colorClass = flash === 'up'
    ? 'text-emerald-400'
    : flash === 'down'
    ? 'text-red-400'
    : direction === 'up'
    ? 'text-emerald-400'
    : direction === 'down'
    ? 'text-red-400'
    : 'text-white';

  return (
    <span className={`font-semibold transition-colors duration-300 ${colorClass} ${className}`}>
      ${formatPrice(price)}
    </span>
  );
}
