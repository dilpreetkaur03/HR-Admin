import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-[var(--color-surface)] 
          border border-[var(--color-border)] 
          rounded-2xl
          ${hover ? 'hover:border-[var(--color-accent)]/50 transition-colors cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

