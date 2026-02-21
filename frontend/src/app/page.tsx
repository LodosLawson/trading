'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'blue',
    title: 'Real-Time Pulse',
    desc: 'Live market data from global exchanges',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'violet',
    title: 'AI Intelligence',
    desc: 'Autonomous agents analyze news & sentiment',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    color: 'emerald',
    title: 'Dynamic Layouts',
    desc: 'Grid, List, Window & Focus modes',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect immediately
    if (!loading && user) {
      router.replace('/terminal');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xs font-mono tracking-[0.3em] text-gray-600 uppercase"
        >
          MARKETPULSE
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#030304] text-white font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white flex flex-col">

      {/* ─── Ambient BG ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[70vw] h-[70vw] bg-blue-700/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-violet-700/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        {/* Logo */}
        <div className="text-xl md:text-2xl font-black tracking-tighter">
          MARKET<span className="text-blue-500">PULSE</span>
        </div>

        {/* Pill actions */}
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
              Login
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-500 hover:text-white transition-all active:scale-95">
              Get Access
            </button>
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 pt-8 pb-16 md:pt-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Live Markets — AI Powered
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-[clamp(2.8rem,12vw,8rem)] font-black tracking-tighter leading-[0.9] mb-6 md:mb-8"
        >
          THE FUTURE<br />
          OF{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-white">
            INTEL
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm md:text-lg text-gray-400 max-w-xs md:max-w-2xl leading-relaxed mb-10 md:mb-12"
        >
          An AI-native financial terminal for the next generation of traders.
          Real-time data, news intelligence, and autonomous agents — in one workspace.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <Link href="/auth/signup" className="w-full sm:w-auto">
            <button className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)]">
              Initialize Terminal
            </button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 border border-white/10 rounded-2xl font-bold text-sm tracking-widest uppercase text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95">
              Sign In
            </button>
          </Link>
        </motion.div>

        {/* Scroll hint — mobile only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-14 md:mt-20 flex flex-col items-center gap-2 text-gray-600"
        >
          <span className="text-[9px] uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ─── Features — mobile card stack ─── */}
      <section className="relative z-10 px-5 pb-16 md:pb-24 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-start gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
            >
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                                ${f.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : ''}
                                ${f.color === 'violet' ? 'bg-violet-500/10 text-violet-400' : ''}
                                ${f.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                            `}>
                {f.icon}
              </div>
              <div>
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 py-6 px-5 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          © 2026 MarketPulse Systems — Powered by LockTrace
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Online
          </span>
          <span>v2.4.0</span>
        </div>
      </footer>

    </main>
  );
}
