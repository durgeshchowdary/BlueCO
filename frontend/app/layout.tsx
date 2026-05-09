import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://playgrid.ai'),
  applicationName: 'PlayGrid AI',
  title: {
    default: 'PlayGrid AI | Sports Academy Management',
    template: '%s | PlayGrid AI',
  },
  description:
    'Premium sports academy management software for student CRM, attendance, payments, events, HRMS, and academy performance dashboards.',
  keywords: [
    'sports academy software',
    'academy management',
    'student CRM',
    'sports attendance',
    'sports payments',
    'PlayGrid AI',
  ],
  authors: [{ name: 'PlayGrid AI' }],
  creator: 'PlayGrid AI',
  publisher: 'PlayGrid AI',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'PlayGrid AI',
    title: 'PlayGrid AI | Sports Academy Management',
    description:
      'Run admissions, batches, attendance, payments, events, HRMS, and academy KPIs from one polished sports operations platform.',
    images: [
      {
        url: '/images/hero-sports.webp',
        width: 1200,
        height: 630,
        alt: 'PlayGrid AI sports academy management dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayGrid AI | Sports Academy Management',
    description:
      'Premium sports academy management for CRM, attendance, payments, events, HRMS, and performance dashboards.',
    images: ['/images/hero-sports.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
