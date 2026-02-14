interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}


