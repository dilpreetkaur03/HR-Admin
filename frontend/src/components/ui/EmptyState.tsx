import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-[var(--color-accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}


