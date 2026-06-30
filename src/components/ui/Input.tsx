import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className = '',
  ...props
}: Props) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftElement}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-800/50 border border-slate-700 rounded-xl
            px-4 py-3 text-sm text-white placeholder-slate-500
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
            transition-all duration-200
            ${leftElement ? 'pr-10' : ''}
            ${rightElement ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
