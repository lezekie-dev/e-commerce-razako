import * as React from 'react';
import { cn } from './cn';

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** prix en centimes */
  amount: number;
  /** prix barré en centimes (optionnel) */
  compareAt?: number;
  currency?: string;
  locale?: string;
}

export function Price({
  amount,
  compareAt,
  currency = 'EUR',
  locale = 'fr-FR',
  className,
  ...props
}: PriceProps) {
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const onSale = compareAt !== undefined && compareAt > amount;

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)} {...props}>
      <span className={cn('text-base font-semibold text-ink-900', onSale && 'text-accent-700')}>
        {fmt.format(amount / 100)}
      </span>
      {onSale && (
        <span className="text-sm text-ink-500 line-through">
          {fmt.format(compareAt! / 100)}
        </span>
      )}
    </span>
  );
}