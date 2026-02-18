'use client';

import React from 'react';
import Link from 'next/link';
<>
  {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

  <div className={`min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white ${showSplash ? 'opacity-0' : ''}`}>

    {/* --- Animated Background --- */}
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -50, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-violet-600/10 rounded-full blur-[150px]"
      />

      {/* Moving Grid Lines (Perspective) */}
      <div className="absolute inset-0 perspective-[500px]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-[length:50px_50px] [transform:rotateX(60deg)_translateY(-100px)] origin-top"></div>
      </div>
    </div>

    {/* --- Main Content --- */}
    <main className="z-10 flex flex-col items-center text-center max-w-5xl w-full">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: showSplash ? 0 : 1, scale: showSplash ? 0.95 : 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 relative"
      >
        {/* Text Glow */}
        <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-3xl opacity-50 rounded-full"></div>

        <h1 className="relative text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">
          MARKET
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-violet-400 to-white">PULSE</span>
        </h1>

        <div className="flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <p className="text-gray-400 text-sm sm:text-lg md:text-xl uppercase tracking-[0.4em] font-light">
            The AI-Native Terminal
          </p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: showSplash ? 0 : 1, y: showSplash ? 40 : 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-sm"
      >
        <Link href="/terminal" className="group relative block w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <button className="relative w-full py-5 bg-[#0a0a0f] ring-1 ring-white/10 rounded-xl leading-none flex items-center justify-center space-x-4 overflow-hidden group-hover:bg-[#121218] transition-colors">
            <span className="text-gray-200 font-bold tracking-widest text-sm group-hover:text-white transition-colors">INITIALIZE TERMINAL</span>
            <span className="text-blue-500 group-hover:translate-x-1 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </span>
          </button>
        </Link>

        <p className="mt-6 text-gray-600 text-[10px] uppercase tracking-widest">
          System v2.1.0 • <span className="text-blue-500/80">Online</span>
        </p>
      </motion.div>
    </main>

    {/* Footer info */}
    <footer className="absolute bottom-6 sm:bottom-8 w-full px-8 flex justify-between text-[10px] text-gray-700 font-mono tracking-wider">
      <span>LOCKTRACE PROTOCOL</span>
      <span>SECURE CONNECTION</span>
    </footer>
  </div>
</>
  );
}
