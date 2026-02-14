import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-[var(--color-danger)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}


