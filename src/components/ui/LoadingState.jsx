import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
      <p className="text-secondary">{message}</p>
    </div>
  );
}
