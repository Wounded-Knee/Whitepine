import { Inter, Ubuntu, JetBrains_Mono } from 'next/font/google';

// Body font - Inter with variable font support
export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Display font for headings - Ubuntu for modern, humanist aesthetics
export const ubuntu = Ubuntu({ 
  subsets: ['latin'],
  variable: '--font-ubuntu',
  display: 'swap',
  weight: ['300', '400', '500'],
});

// Monospace font for code
export const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

