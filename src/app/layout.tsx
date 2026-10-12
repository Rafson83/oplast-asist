import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'OplastAsist • Cyfrowe DTR & Ewidencja Zmian Maszyn',
  description: 'Zarządzanie dokumentacją techniczną, szafami sterowniczymi, schematami elektrycznymi i rejestrem modyfikacji połączeń w Oplast',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OplastAsist',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col antialiased font-sans select-none">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
