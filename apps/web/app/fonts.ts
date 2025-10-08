import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';

// Body font - Inter with variable font support
export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Display font for headings - Manrope for modern, clean aesthetics
export const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Monospace font for code
export const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

