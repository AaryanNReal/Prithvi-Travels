import AboutSectionOne from "@/components/About/AboutSectionOne";
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
export const metadata: Metadata = {
  title: "Prithvi Travels",
  description: "",
  keywords: "travel, tours, prithvi travels, travel agency",
  authors: [{ name: "Prithvi Travels" }],
  creator: "Prithvi Travels",
  publisher: "Prithvi Travels",
  
};

export default function Home() {
  useMetadata({
    title: "Prithvi Travels",     
    description: "Prithvi Travels is a travel agency that offers a wide range of travel services, including domestic and international tours, cruises, and more.",
    keywords: "travel, tours, prithvi travels, travel agency",
    
    
   
    image: "/images/logo.png",
  
    twitter: {
      card: "summary_large_image",
      site: "@prithvitravels",
      creator: "@prithvitravels",
    },
    openGraph: {
      title: "Prithvi Travels",
      description: "Prithvi Travels is a travel agency that offers a wide range of travel services, including domestic and international tours, cruises, and more.",
      url: "https://prithvitravels.com",
      siteName: "Prithvi Travels",
      images: [
        {
          url: "/images/logo.png",
          width: 800,
          height: 600,
          alt: "Prithvi Travels Logo",
        },
      ],
      locale: "en_US",
      type: "website",
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
