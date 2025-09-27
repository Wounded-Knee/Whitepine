import type { MDXComponents } from 'mdx/types';
import React, { type ReactNode } from 'react';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

function CustomH1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
      {children}
    </h1>
  );
}

function CustomH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-4 mt-8">
      {children}
    </h2>
  );
}

function CustomH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-200 mb-3 mt-6">
      {children}
    </h3>
  );
}

function CustomP({ children }: { children: ReactNode }) {
  return (
    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
      {children}
    </p>
  );
}

function CustomA({ href, children }: { href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
    >
      {children}
    </a>
  );
}

function CustomCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  );
}

function CustomPre({ children }: { children: ReactNode }) {
  return (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  );
}

function CustomBlockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-4">
      {children}
    </blockquote>
  );
}

function CustomUl({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
      {children}
    </ul>
  );
}

function CustomOl({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
      {children}
    </ol>
  );
}

function CustomLi({ children }: { children: ReactNode }) {
  return (
    <li className="text-gray-600 dark:text-gray-300">
      {children}
    </li>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: CustomH1,
    h2: CustomH2,
    h3: CustomH3,
    p: CustomP,
    a: CustomA,
    code: CustomCode,
    pre: CustomPre,
    blockquote: CustomBlockquote,
    ul: CustomUl,
    ol: CustomOl,
    li: CustomLi,
    ...components,
  };
}
