import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-danger/30 bg-danger/5 rounded-none">
      <AlertTriangle className="w-12 h-12 text-danger mb-4" />
      <h3 className="text-lg font-medium text-primary mb-2">Something went wrong</h3>
      <p className="text-secondary mb-6 max-w-md">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
