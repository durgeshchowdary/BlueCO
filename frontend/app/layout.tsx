import './globals.css';
import type { Metadata } from 'next';
import ObservabilityClient from '../components/ObservabilityClient';
import { DemoModeProvider } from '../providers/DemoModeProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://out-play.in'),
  applicationName: 'OUT-PLAY',
  title: {
    default: 'OUT-PLAY | Sports Academy Management',
    template: '%s | OUT-PLAY',
  },
  description:
    'Premium sports academy management software for student CRM, attendance, payments, events, HRMS, and academy performance dashboards.',
  keywords: [
    'sports academy software',
    'academy management',
    'student CRM',
    'sports attendance',
    'sports payments',
    'OUT-PLAY',
  ],
  authors: [{ name: 'OUT-PLAY' }],
  creator: 'OUT-PLAY',
  publisher: 'OUT-PLAY',
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
    siteName: 'OUT-PLAY',
    title: 'OUT-PLAY | Sports Academy Management',
    description:
      'Run admissions, batches, attendance, payments, events, HRMS, and academy KPIs from one polished sports operations platform.',
    images: [
      {
        url: '/images/hero-sports.webp',
        width: 1200,
        height: 630,
        alt: 'OUT-PLAY sports academy management dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUT-PLAY | Sports Academy Management',
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
      <body>
        <DemoModeProvider>
          <ObservabilityClient />
          {children}
        </DemoModeProvider>
      </body>
    </html>
  );
}
