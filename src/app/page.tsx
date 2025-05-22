import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";

import Cruises from "@/components/Cruises/cruises";
import Domestic from "@/components/Domestic/Domestic";

import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";

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


export default function Home() {
  

  
  return (
    <>
      <ScrollUp />
      <Hero />
      <Domestic/>
      <International/>
      <Cruises/>
      
      <Brands />
      <Blog/>
      <Testimonials />
  
      
    </>
  );
}
