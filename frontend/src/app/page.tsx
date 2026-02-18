'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#030304] text-white flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050508] to-[#030304] opacity-70" />

      <div className="z-10 text-center space-y-8 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            NETRA
          </h1>
          <p className="text-blue-400 font-mono tracking-[0.2em] text-sm md:text-base uppercase">
            Financial Intelligence Terminal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/auth">
            <button className="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 backdrop-blur-md">
              <span className="relative z-10 text-sm font-bold tracking-widest uppercase group-hover:text-blue-400 transition-colors">
                Enter Terminal
              </span>
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Footer / Status */}
      <div className="absolute bottom-8 text-[10px] text-gray-600 font-mono flex gap-4 uppercase tracking-wider">
        <span>System: Online</span>
        <span>•</span>
        <span>Latency: 12ms</span>
        <span>•</span>
        <span>v2.1.0</span>
      </div>
    </main>
  );
}
