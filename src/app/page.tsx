import AboutSectionOne from "@/components/About/AboutSectionOne";
"use client";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact/contact";
import Cruises from "@/components/Cruises/cruises";
import Domestic from "@/components/Domestic/Domestic";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";
import { useMetadata } from "./hooks/MetaDta";


export default function Home() {
  
useMetadata({
  title: "Prithvi Travels - Top Travel Destinations for 2024",
  description: "Discover the top places to visit this year with Prithvi Travels.",
  image: {
    url: "/images/logo/logo.png",  // Will auto-convert to absolute URL
    width: 1200,
    height: 630,
    alt: "Travel destinations collage",
  },
  canonicalUrl: "https://prithvi-travels-36eo.vercel.app/blog/top-destinations-2024",
  openGraph: {
    type: "article",
    siteName: "Prithvi Travels",
    publishedTime: "2024-05-20T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    site: "@PrithviTravels",
  },
});
  
  return (
    <>
      <ScrollUp />
      <Hero />
      <Domestic/>
      <International/>
      <Cruises/>
      <Features />
      
      <Brands />
      
      <Testimonials />
      
      <Blog />
      <Contact />
    </>
  );
}
