import type { Metadata } from 'next';
import './globals.css';
import { ClientNavigation } from '@/components/client-navigation';
import { inter, manrope, jetbrainsMono } from './fonts';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'White Pine - The Digital Town Hall',
  description: 'The digital town hall. The digital protest. The digital voting booth. Join the civic engagement revolution.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
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
        <div className="min-h-screen bg-background">
          <ClientNavigation session={session} />
          <main className="container max-w-screen-2xl px-6 py-6 mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
