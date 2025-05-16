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
 title: "Travel Agency",  
  description: "Travel Agency",
  image: {
    url: "/images/logo/logo.png",
    width: 1200,
    height: 630,
    alt: "Travel Agency",
  },
  canonicalUrl: "https://www.example.com",
  keywords: "travel, agency, booking",
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
