"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "../styles/index.css";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });


const HIDE_HEADER_FOOTER_ROUTES = [
  '/categories',
  '/tag'
  // Add more routes as needed
];


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldHide = HIDE_HEADER_FOOTER_ROUTES.includes(pathname);
  
  useMetadata({
  title: "Prithvi Travels - Top Travel Destinations for 2024",
  description: "Discover the top places to visit this year with Prithvi Travels.",
  image: {
    url: "https://firebasestorage.googleapis.com/v0/b/foodweb-world.firebasestorage.app/o/adminPanel%2Farchive%2Fimages%2Fsubboard.jpg?alt=media&token=d7de14c2-69fa-44a8-a09f-a55a565b362d",  // Will auto-convert to absolute URL
    width: 1200,
    height: 630,
    alt: "Travel destinations collage",
  },
  canonicalUrl: "https://prithvi-travels-36eo.vercel.app",
  openGraph: {
    type: "article",
    siteName: "Prithvi Travels",
    publishedTime: "2024-05-20T00:00:00Z",
  },
  keywords : "Travel",
  twitter: {
    card: "summary_large_image",
    site: "@PrithviTravels",
  },
});
  
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC]  ${inter.className} pathname === '/categories' ? 'hidden' : ''`}>
      <Providers>
          <Header/>{/* 👈 Hide on /categories */}
          {children}
          <Footer/>{/* 👈 Hide on /categories */}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
import { useMetadata } from "./hooks/MetaDta";

