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



export default function Home() {
  

  
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
