'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#030304] text-white overflow-hidden font-sans selection:bg-blue-500 selection:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-6 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="text-2xl font-black tracking-tighter">
          MARKET<span className="text-blue-500">PULSE</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth">
            <button className="px-6 py-2 text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
              Login
            </button>
          </Link>
          <Link href="/auth?mode=register">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              Get Access
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center">

        {/* Background FX */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
        </div>

        <div className="z-10 max-w-5xl space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-9xl font-black tracking-tighter leading-none"
          >
            THE FUTURE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white">INTELLIGENCE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Market Pulse is an AI-Native financial terminal designed for the next generation of traders.
            Fuse real-time data, news intelligence, and autonomous agents into a single, customizable workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-8"
          >
            <Link href="/auth">
              <button className="group relative px-12 py-5 bg-white text-black rounded-full font-bold text-lg tracking-widest uppercase hover:scale-105 transition-transform duration-300">
                <span className="relative z-10">Initialize Terminal</span>
                <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Breakdown */}
      <section className="py-32 px-6 md:px-20 bg-[#050508] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Feature 1 */}
          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold">Real-Time Pulse</h3>
            <p className="text-gray-400 leading-relaxed">
              Streaming data from global exchanges with zero latency.
              Visualization engines powered by TradingView and internal algorithms.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="text-2xl font-bold">AI Intelligence</h3>
            <p className="text-gray-400 leading-relaxed">
              Autonomous agents analyze news, sentiment, and market structure to surface opportunities execution before they happen.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4 group">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:border-green-500/50 transition-colors">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold">Dynamic Layouts</h3>
            <p className="text-gray-400 leading-relaxed">
              Switch between Grid, List, Windowed, or Focus modes.
              Your workspace adapts to your trading style, saved instantly to the cloud.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 flex items-center justify-between px-8 border-t border-white/5 text-[10px] text-gray-600 uppercase tracking-widest">
        <div>© 2026 Market Pulse Systems</div>
        <div className="flex gap-4">
          <span>Status: Online</span>
          <span>Version 2.2.0</span>
        </div>
      </footer>

    </main>
  );
}
