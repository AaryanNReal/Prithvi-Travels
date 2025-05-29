"use client"
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Cruises from "@/components/Cruises/cruises";
import Domestic from "@/components/Domestic/Domestic";
import Hero from "@/components/Hero";
import International from "@/components/International/Intertional";
import Testimonials from "@/components/Testimonials";

// Enhanced background with more dynamic elements
const BackgroundElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    {/* Multi-layered Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
    <div className="absolute inset-0 bg-gradient-to-tl from-cyan-30/20 via-transparent to-rose-30/20" />
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-40/10 via-transparent to-violet-40/15" />
    
    {/* Animated Mesh Gradient Overlay */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-blue-200/40 to-transparent rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-radial from-purple-200/40 to-transparent rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-radial from-teal-200/40 to-transparent rounded-full blur-3xl animate-pulse" 
           style={{ animationDuration: '12s', animationDelay: '4s' }} />
    </div>
    
    {/* Floating Geometric Shapes with Enhanced Animation */}
    <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-20 animate-float shadow-lg" 
         style={{ animationDuration: '6s' }} />
    <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full opacity-25 animate-float shadow-lg" 
         style={{ animationDuration: '8s', animationDelay: '1s' }} />
    <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-gradient-to-br from-teal-300 to-teal-500 rounded-full opacity-30 animate-float shadow-lg" 
         style={{ animationDuration: '7s', animationDelay: '2s' }} />
    <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-15 animate-float shadow-lg" 
         style={{ animationDuration: '9s', animationDelay: '3s' }} />
    
    {/* Additional Floating Shapes */}
    <div className="absolute top-1/2 left-1/6 w-8 h-20 bg-gradient-to-b from-rose-300 to-pink-400 rounded-full opacity-20 animate-float rotate-45" 
         style={{ animationDuration: '11s', animationDelay: '1.5s' }} />
    <div className="absolute bottom-1/3 right-1/6 w-14 h-14 bg-gradient-to-br from-indigo-300 to-blue-400 rotate-12 opacity-25 animate-float" 
         style={{ animationDuration: '13s', animationDelay: '2.5s', borderRadius: '30%' }} />
    
    {/* Enhanced Particle System */}
    <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-60 animate-pulse shadow-sm" 
         style={{ animationDuration: '3s' }} />
    <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-50 animate-pulse shadow-sm" 
         style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full opacity-70 animate-pulse shadow-sm" 
         style={{ animationDuration: '3.5s', animationDelay: '2.5s' }} />
    <div className="absolute top-1/6 right-1/2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-45 animate-pulse shadow-sm" 
         style={{ animationDuration: '5s', animationDelay: '3s' }} />
    <div className="absolute bottom-1/6 left-1/2 w-2 h-2 bg-gradient-to-br from-rose-400 to-red-500 rounded-full opacity-55 animate-pulse shadow-sm" 
         style={{ animationDuration: '4.5s', animationDelay: '4s' }} />
    
    {/* Dynamic Grid Pattern with Animation */}
    <div className="absolute inset-0 opacity-8"
         style={{
           backgroundImage: `
             radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.15) 2px, transparent 0),
             radial-gradient(circle at 75px 75px, rgba(139, 92, 246, 0.1) 1px, transparent 0)
           `,
           backgroundSize: '100px 100px, 150px 150px',
           animation: 'gridMove 20s linear infinite'
         }} />
    
    {/* Animated Light Rays */}
    <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-300/20 to-transparent opacity-30 animate-pulse"
         style={{ animationDuration: '6s', animationDelay: '1s' }} />
    <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-300/20 to-transparent opacity-25 animate-pulse"
         style={{ animationDuration: '8s', animationDelay: '3s' }} />
    <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-teal-300/20 to-transparent opacity-35 animate-pulse"
         style={{ animationDuration: '7s', animationDelay: '5s' }} />
    
    {/* Enhanced Animated Waves */}
    <svg 
      className="absolute bottom-0 left-0 w-full h-40 opacity-15" 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,60 C300,10 900,110 1200,60 L1200,120 L0,120 Z" fill="url(#waveGradient1)">
        <animateTransform 
          attributeName="transform"
          type="translate"
          values="0 0; -100 0; 0 0"
          dur="12s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M0,80 C400,30 800,130 1200,80 L1200,120 L0,120 Z" fill="url(#waveGradient2)" opacity="0.7">
        <animateTransform 
          attributeName="transform"
          type="translate"
          values="0 0; 150 0; 0 0"
          dur="15s"
          repeatCount="indefinite"
        />
      </path>
      <defs>
        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
    
    {/* Top Wave Effect */}
    <svg 
      className="absolute top-0 left-0 w-full h-32 opacity-10 rotate-180" 
      viewBox="0 0 1200 120" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,60 C400,120 800,0 1200,60 L1200,0 L0,0 Z" fill="url(#topWaveGradient)">
        <animateTransform 
          attributeName="transform"
          type="translate"
          values="0 0; 80 0; 0 0"
          dur="18s"
          repeatCount="indefinite"
        />
      </path>
      <defs>
        <linearGradient id="topWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
    </svg>
    
    {/* Enhanced Floating Travel Icons */}
    <div className="absolute top-1/5 left-1/5 text-blue-400 opacity-25 animate-pulse">
      <svg width="45" height="45" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    </div>
    <div className="absolute top-2/3 right-1/5 text-purple-400 opacity-20 animate-pulse" 
         style={{ animationDelay: '2s' }}>
      <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </div>
    <div className="absolute bottom-1/3 left-2/3 text-teal-400 opacity-30 animate-pulse" 
         style={{ animationDelay: '4s' }}>
      <svg width="35" height="35" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
    <div className="absolute top-1/3 left-1/2 text-rose-400 opacity-25 animate-pulse" 
         style={{ animationDelay: '6s' }}>
      <svg width="38" height="38" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
    <div className="absolute bottom-1/5 right-1/3 text-yellow-400 opacity-20 animate-pulse" 
         style={{ animationDelay: '8s' }}>
      <svg width="42" height="42" fill="currentColor" viewBox="0 0 24 24" className="drop-shadow-sm">
        <path d="M14 6V4h-4v2h4zM4 8v11h16V8H4zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V8c0-1.11.89-2 2-2h16z" />
      </svg>
    </div>
    
    {/* Floating Sparkles */}
    <div className="absolute top-1/4 left-3/4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" 
         style={{ animationDuration: '2s', animationDelay: '1s' }} />
    <div className="absolute top-3/5 left-1/5 w-1 h-1 bg-white rounded-full opacity-50 animate-ping" 
         style={{ animationDuration: '3s', animationDelay: '2s' }} />
    <div className="absolute bottom-2/5 right-1/4 w-1 h-1 bg-white rounded-full opacity-70 animate-ping" 
         style={{ animationDuration: '2.5s', animationDelay: '3s' }} />
    
    {/* CSS Animation Keyframes */}
    <style jsx>{`
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        50% { transform: translate(-25px, -25px); }
        100% { transform: translate(0, 0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(1deg); }
        66% { transform: translateY(-5px) rotate(-1deg); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .bg-gradient-radial {
        background: radial-gradient(circle, var(--tw-gradient-stops));
      }
    `}</style>
  </div>
);

export default function Home() {
  return (
    <>
      <BackgroundElements />

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
        
        {/* Cruises Section */}
        <div className="relative">
          <div className="absolute  bg-gradient-to-b from-cyan-50/40 to-blue-100/30" />
          <Cruises />
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