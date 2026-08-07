import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface border border-border p-4 rounded-none shadow-sm ${className}`}>
      {children}
    </div>
  );
}
