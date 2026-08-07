import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  ...props 
}) {
  const baseStyle = "px-4 py-2 font-medium transition-colors rounded-none focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border border-border bg-transparent text-primary hover:bg-background",
    danger: "bg-danger text-white hover:bg-danger/90"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
