import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input 
      className={`w-full px-3 py-2 border border-border bg-surface text-primary rounded-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${className}`}
      {...props}
    />
  );
}
