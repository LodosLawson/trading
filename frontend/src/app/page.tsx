'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SplashScreen from '@/components/ui/SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className={`min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white ${showSplash ? 'opacity-0' : ''}`}>

        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-50"></div>

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <main className="z-10 flex flex-col items-center text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 30 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-thin tracking-tighter mb-4">
              MARKET<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">PULSE</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-lg md:text-xl uppercase tracking-[0.2em] font-light">
              AI-Native Financial Intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: showSplash ? 0 : 1, scale: showSplash ? 0.9 : 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-gray-400 max-w-lg mx-auto leading-relaxed text-sm sm:text-base">
              Experience the future of trading. Real-time news analysis, semantic impact scoring, and autonomous agentic insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/news" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-blue-500 hover:text-white transition-all duration-500 overflow-hidden w-full sm:w-auto justify-center">
                <span className="relative z-10 font-bold tracking-wider text-sm">ENTER TERMINAL</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
                <div className="absolute inset-0 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
              </Link>

              <Link href="/prices" className="group relative inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white hover:bg-violet-600 hover:border-violet-600 transition-all duration-500 overflow-hidden w-full sm:w-auto justify-center">
                <span className="relative z-10 font-bold tracking-wider text-sm">CRYPTO PRICES</span>
                <span className="relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </motion.div>
        </main>

        <footer className="absolute bottom-6 sm:bottom-8 text-[10px] sm:text-xs text-gray-700 uppercase tracking-widest">
          Status: <span className="text-emerald-500">Operational</span> • v0.3.0
        </footer>
      </div>
    </>
  );
}
