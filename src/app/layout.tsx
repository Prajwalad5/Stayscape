import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StayScape — Discover Unique Stays',
    template: '%s | StayScape',
  },
  description: 'Discover and book unique stays around the world. From cozy cabins to luxury villas, find your perfect getaway on StayScape.',
  keywords: ['rental', 'vacation', 'stays', 'property', 'booking', 'travel'],
  authors: [{ name: 'StayScape' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'StayScape',
    title: 'StayScape — Discover Unique Stays',
    description: 'Discover and book unique stays around the world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayScape — Discover Unique Stays',
    description: 'Discover and book unique stays around the world.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
