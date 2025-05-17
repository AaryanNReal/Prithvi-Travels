import Footer from "@/components/Footer";
import Header from "@/components/Header";

import { Inter } from "next/font/google";
import "../styles/index.css";
import { Metadata } from "next";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

const HIDE_HEADER_FOOTER_ROUTES = [
  '/categories',
  '/tag'
  // Add more routes as needed
];

export const metadata: Metadata = {
  title: {
    template: 'Prithvi Travels',
    default: 'Prithvi Travels',
  },
  description: 'Prithvi Travels , Best Travel Company',
  keywords: ['Cruises', 'Tours', 'Travels'],
  authors: [{ name: 'Prithvi Travels ', url: 'https://prithvi-travels-36eo.vercel.app' }],
  themeColor: '#FCFCFC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prithvi-travels-36eo.vercel.app/',
    siteName: 'Prithvi Travels',
    images: [
      {
        url: '/images/logo/logo.png',
        width: 1200,
        height: 630,
        alt: 'Your Site Name',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prithvi Travles',
    description: 'Best Travel Agency',
    images: ['/images/logo/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: In Server Components, you can't use hooks like usePathname directly
  // You would need to use a Client Component or other approach for dynamic routing
  
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={`bg-[#FCFCFC] ${inter.className}`}>
        <Providers>
          {/* Header and Footer visibility would need to be handled in their own components */}
          {/* or by using a client-side wrapper since layout.tsx is a Server Component */}
          <Header />
          {children}
          <Footer />
        
        </Providers>
      </body>
    </html>
  );
}