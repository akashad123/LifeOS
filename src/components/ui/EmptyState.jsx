import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border bg-background rounded-none">
      {Icon && <Icon className="w-12 h-12 text-muted mb-4" />}
      <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
      <p className="text-secondary mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
