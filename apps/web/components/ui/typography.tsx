import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 
      className={cn("font-serif font-bold text-foreground mb-6 text-balance", className)}
      style={{ 
        fontSize: 'var(--font-size-5xl)', 
        lineHeight: 'var(--line-height-tight)', 
        letterSpacing: 'var(--letter-spacing-tight)' 
      }}
    >
      {children}
    </h1>
  );
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 
      className={cn("font-serif font-bold text-foreground mb-4 mt-12 text-balance", className)}
      style={{ 
        fontSize: 'var(--font-size-4xl)', 
        lineHeight: 'var(--line-height-tight)', 
        letterSpacing: 'var(--letter-spacing-tight)' 
      }}
    >
      {children}
    </h2>
  );
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 
      className={cn("font-serif font-semibold text-foreground mb-3 mt-8 text-balance", className)}
      style={{ 
        fontSize: 'var(--font-size-3xl)', 
        lineHeight: 'var(--line-height-snug)', 
        letterSpacing: 'var(--letter-spacing-tight)' 
      }}
    >
      {children}
    </h3>
  );
}

export function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4 
      className={cn("font-serif font-semibold text-foreground mb-3 mt-6", className)}
      style={{ 
        fontSize: 'var(--font-size-2xl)', 
        lineHeight: 'var(--line-height-snug)' 
      }}
    >
      {children}
    </h4>
  );
}

export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p 
      className={cn("text-foreground mb-5 text-pretty", className)}
      style={{ lineHeight: 'var(--line-height-relaxed)' }}
    >
      {children}
    </p>
  );
}

export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p 
      className={cn("text-muted-foreground mb-5", className)}
      style={{ 
        fontSize: 'var(--font-size-xl)', 
        lineHeight: 'var(--line-height-relaxed)' 
      }}
    >
      {children}
    </p>
  );
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <p 
      className={cn("font-semibold text-foreground", className)}
      style={{ fontSize: 'var(--font-size-lg)' }}
    >
      {children}
    </p>
  );
}

export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small 
      className={cn("text-muted-foreground", className)}
      style={{ 
        fontSize: 'var(--font-size-sm)', 
        lineHeight: 'var(--line-height-normal)' 
      }}
    >
      {children}
    </small>
  );
}

export function TypographyMuted({ children, className }: TypographyProps) {
  return (
    <p 
      className={cn("text-muted-foreground", className)}
      style={{ fontSize: 'var(--font-size-sm)' }}
    >
      {children}
    </p>
  );
}

export function TypographyBlockquote({ children, className }: TypographyProps) {
  return (
    <blockquote 
      className={cn("border-l-4 border-primary pl-6 italic text-muted-foreground my-8", className)}
      style={{ 
        fontSize: 'var(--font-size-lg)', 
        lineHeight: 'var(--line-height-relaxed)' 
      }}
    >
      {children}
    </blockquote>
  );
}

export function TypographyCode({ children, className }: TypographyProps) {
  return (
    <code className={cn("font-mono bg-muted text-foreground px-2 py-0.5 rounded text-[0.875em]", className)}>
      {children}
    </code>
  );
}

export function TypographyList({ children, className }: TypographyProps) {
  return (
    <ul 
      className={cn("list-disc pl-6 text-foreground mb-5 space-y-2", className)}
      style={{ lineHeight: 'var(--line-height-relaxed)' }}
    >
      {children}
    </ul>
  );
}

