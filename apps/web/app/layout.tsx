import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';
import { inter, manrope, jetbrainsMono } from './fonts';

export const metadata: Metadata = {
  title: 'White Pine',
  description: 'A modern web application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container max-w-screen-2xl px-6 py-6 mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
