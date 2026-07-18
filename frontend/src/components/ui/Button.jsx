import React from 'react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 outline-none-focus rounded-[14px]";

  const variants = {
    primary: "bg-gradient-to-r from-landing-accent via-dest-1 to-landing-accent animate-gradient-shift text-white shadow-lg shadow-landing-accent/30 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-landing-accent/40 border-none",
    secondary: "bg-bg-surface hover:bg-bg-surface-hover text-text-primary border border-border-subtle hover:border-landing-accent/30 shadow-sm",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
  };

  const sizes = {
    sm: "px-4 h-10 text-sm",
    md: "px-[30px] h-[54px] text-[16px]",
    lg: "px-[30px] h-[54px] text-[16px]"
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
