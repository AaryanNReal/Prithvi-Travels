"use client"
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Cruises from "@/components/Cruises/cruises";
import Domestic from "@/components/Domestic/Domestic";
import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import Testimonials from "@/components/Testimonials";
import SpecialOffersTours from "@/components/speacialoffer";
import AnimatedBackground from "@/components/Common/AnimatedBackground";
import DirectionalSlider from "@/components/Theme";
export default function Home() {
  return (
    <>
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10">
        <ScrollUp />
        
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <Hero />
        </div>
        
        {/* Domestic Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-l from-teal-50/50 to-transparent" />
          <Domestic />
        </div>
        
        {/* International Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-r from-purple-50/50 to-blue-50/50" />
          <International />
        </div>

        <div className="relative">
          <div className="absolute  bg-gradient-to-r from-purple-50/50 to-blue-50/50" />
          <SpecialOffersTours></SpecialOffersTours>
        </div>
        
        {/* Cruises Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-b from-cyan-50/40 to-blue-100/30" />
          <Cruises />
        </div>

          <div className="relative">
          <div className="absolute  bg-gradient-to-l from-yellow-50/30 to-orange-50/30" />
          <DirectionalSlider />
        </div>
      
        {/* Testimonials Section */}
        <div className="relative">
          <div className="absolute bg-gradient-to-r from-rose-50/40 to-pink-50/40" />
          <Testimonials />
        </div>
        
        {/* Blog Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-l from-yellow-50/30 to-orange-50/30" />
          <Blog />
        </div>
      </div>
    </>
  );
}