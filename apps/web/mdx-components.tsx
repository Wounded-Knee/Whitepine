import type { MDXComponents } from 'mdx/types';
import React, { type ReactNode } from 'react';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

function CustomH1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-medium text-foreground mb-6 text-balance" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-5xl)', lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)' }}>
      {children}
    </h1>
  );
}

function CustomH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-medium text-foreground mb-4 mt-12 text-balance" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-4xl)', lineHeight: 'var(--line-height-tight)', letterSpacing: 'var(--letter-spacing-tight)' }}>
      {children}
    </h2>
  );
}

function CustomH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-normal text-foreground mb-3 mt-8 text-balance" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-3xl)', lineHeight: 'var(--line-height-snug)', letterSpacing: 'var(--letter-spacing-tight)' }}>
      {children}
    </h3>
  );
}

function CustomH4({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-normal text-foreground mb-3 mt-6" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-2xl)', lineHeight: 'var(--line-height-snug)' }}>
      {children}
    </h4>
  );
}

function CustomH5({ children }: { children: ReactNode }) {
  return (
    <h5 className="font-normal text-foreground mb-2 mt-6" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-xl)', lineHeight: 'var(--line-height-snug)' }}>
      {children}
    </h5>
  );
}

function CustomH6({ children }: { children: ReactNode }) {
  return (
    <h6 className="font-normal text-foreground mb-2 mt-6" style={{ fontFamily: 'var(--font-ubuntu)', fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height-normal)' }}>
      {children}
    </h6>
  );
}

function CustomP({ children }: { children: ReactNode }) {
  return (
    <p className="text-foreground mb-5 text-pretty" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
      {children}
    </p>
  );
}

function CustomA({ href, children }: { href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors"
    >
      {children}
    </a>
  );
}

function CustomCode({ children }: { children: ReactNode }) {
  return (
    <code className="font-mono bg-muted text-foreground px-2 py-0.5 rounded text-[0.875em]">
      {children}
    </code>
  );
}

function CustomPre({ children }: { children: ReactNode }) {
  return (
    <pre className="font-mono bg-muted text-foreground p-5 rounded-lg overflow-x-auto my-6 text-sm" style={{ lineHeight: 'var(--line-height-normal)' }}>
      {children}
    </pre>
  );
}

function CustomBlockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-primary pl-6 italic text-muted-foreground my-8" style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height-relaxed)' }}>
      {children}
    </blockquote>
  );
}

function CustomUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-6 text-foreground mb-5 space-y-2" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
      {children}
    </ul>
  );
}

function CustomOl({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal pl-6 text-foreground mb-5 space-y-2" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
      {children}
    </ol>
  );
}

function CustomLi({ children }: { children: ReactNode }) {
  return (
    <li className="text-foreground" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
      {children}
    </li>
  );
}

function CustomHr() {
  return (
    <hr className="border-none border-t border-border my-12" />
  );
}

function CustomStrong({ children }: { children: ReactNode }) {
  return (
    <strong className="font-medium text-foreground">
      {children}
    </strong>
  );
}

function CustomEm({ children }: { children: ReactNode }) {
  return (
    <em className="italic">
      {children}
    </em>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: CustomH1,
    h2: CustomH2,
    h3: CustomH3,
    h4: CustomH4,
    h5: CustomH5,
    h6: CustomH6,
    p: CustomP,
    a: CustomA,
    code: CustomCode,
    pre: CustomPre,
    blockquote: CustomBlockquote,
    ul: CustomUl,
    ol: CustomOl,
    li: CustomLi,
    hr: CustomHr,
    strong: CustomStrong,
    em: CustomEm,
    ...components,
  };
}
