'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Show footer on home page and all marketing pages
  const shouldShowFooter = pathname === '/' || pathname.startsWith('/marketing');
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <Footer />;
}

