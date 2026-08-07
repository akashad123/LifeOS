import React from 'react';

export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {description && <p className="text-secondary mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
