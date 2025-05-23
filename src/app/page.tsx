"use client"
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Cruises from "@/components/Cruises/cruises";
import Domestic from "@/components/Domestic/Domestic";
import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import { Metadata } from "next";
import Testimonials from "@/components/Testimonials";



export default function Home() {
  return (
    <>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-25 animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '8s' }} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-teal-200 rounded-full opacity-30 animate-bounce" 
             style={{ animationDelay: '2s', animationDuration: '7s' }} />
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-yellow-200 rounded-full opacity-15 animate-bounce" 
             style={{ animationDelay: '3s', animationDuration: '9s' }} />
        
        {/* Animated Particles */}
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-ping" 
             style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-30 animate-ping" 
             style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-teal-400 rounded-full opacity-50 animate-ping" 
             style={{ animationDelay: '2.5s', animationDuration: '3.5s' }} />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5"
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }} />
        
        {/* Animated Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,10 900,110 1200,60 L1200,120 L0,120 Z" fill="url(#waveGradient)">
            <animateTransform 
              attributeName="transform"
              type="translate"
              values="0 0; -50 0; 0 0"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Floating Travel Icons */}
        <div className="absolute top-1/5 left-1/5 text-blue-300 opacity-20 animate-pulse">
          <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
        <div className="absolute top-2/3 right-1/5 text-purple-300 opacity-15 animate-pulse" 
             style={{ animationDelay: '2s' }}>
          <svg width="35" height="35" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <div className="absolute bottom-1/3 left-2/3 text-teal-300 opacity-25 animate-pulse" 
             style={{ animationDelay: '4s' }}>
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>

      {/* Main Content with Enhanced Styling */}
      <div className="relative z-10">
        <ScrollUp />
        
        {/* Hero Section with Enhanced Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm" />
          <Hero />
        </div>
        
        {/* Domestic Section with Subtle Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-l from-teal-50/50 to-transparent" />
          <Domestic />
        </div>
        
        {/* International Section with Enhanced Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50" />
          <International />
        </div>
        
        {/* Cruises Section with Ocean-inspired Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/40 to-blue-100/30" />
          <Cruises />
        </div>
        
        {/* Brands Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-slate-50/50" />
          <Brands />
        </div>
        
        {/* Blog Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-l from-yellow-50/30 to-orange-50/30" />
          <Blog />
        </div>
        
        {/* Testimonials Section with Warm Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-50/40 to-pink-50/40" />
          <Testimonials />
        </div>
      </div>

      {/* Custom CSS for enhanced animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}