import Footer from "@/components/Footer";
import Header from "@/components/Header";

import { Inter } from "next/font/google";
import "../styles/index.css";
import { Metadata } from "next";
import { Providers } from "./providers";
import TrackingWrapper from "@/components/TrackingWrapper";
const inter = Inter({ subsets: ["latin"] });

const HIDE_HEADER_FOOTER_ROUTES = [
  '/categories',
  '/tag'
  // Add more routes as needed
];
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =  'https://prithvi-travels-36eo.vercel.app';
  
  return {
    title: "Prithvi Travels - Premium Tour Packages & Cruise Vacations",
    description: "Experience unforgettable journeys with our curated domestic & international tours, luxury cruises, and personalized travel services.",
    keywords: [
      "travel agency", "tour packages", "vacation planning", 
      "domestic tours", "international tours", "cruise vacations",
      "luxury travel", "holiday packages", "best travel agency"
    ].join(', '),
    openGraph: {
      title: "Prithvi Travels - Premium Tour Packages & Cruise Vacations",
      description: "Experience unforgettable journeys with our curated domestic & international tours, luxury cruises, and personalized travel services.",
      url: baseUrl,
      siteName: "Prithvi Travels",
      images: [
        {
          url: "/images/logo/logo.png",
          width: 1200,
          height: 630,
          alt: "Prithvi Travels - Premium Travel Experiences",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Prithvi Travels - Premium Tour Packages & Cruise Vacations",
      description: "Experience unforgettable journeys with our curated domestic & international tours, luxury cruises, and personalized travel services.",
      images: ["/images/logo/logo.png"],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

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
          <TrackingWrapper> {children}</TrackingWrapper>         
          <Footer />
        
        </Providers>
      </body>
    </html>
  );
}