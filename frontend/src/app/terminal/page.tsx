'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MarketWidget from '@/components/dashboard/MarketWidget';
import NewsWidget from '@/components/dashboard/NewsWidget';
import ChartWidget from '@/components/dashboard/ChartWidget';
import DashboardChatWidget from '@/components/dashboard/DashboardChatWidget';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function TerminalPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black overflow-hidden relative flex flex-col">

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            {/* Header */}
            <header className="relative z-20 shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Landing
                    </Link>
                    <div className="h-4 w-px bg-white/10"></div>
                    <h1 className="text-xl font-thin tracking-tight">
                        TERMINAL <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">HUB</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-500 bg-emerald-900/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="hidden sm:inline font-mono uppercase">System Online</span>
                </div>
            </header>

            {/* Main Content Grid */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex-1 p-6 grid grid-cols-12 grid-rows-12 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full"
            >
                {/* 1. Market Overview (Left Column) */}
                <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 row-span-8 md:row-span-12 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                    <div className="absolute inset-x-0 bottom-0 top-auto z-20 p-4 bg-gradient-to-t from-[#121218] to-transparent h-24 flex items-end justify-center pointer-events-none"></div>
                    <Link href="/prices" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                        Full Market View
                    </Link>
                    <MarketWidget limit={15} />
                </motion.div>

                {/* 2. Main Chart Area (Center) */}
                <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 row-span-8 md:row-span-8 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                    <ChartWidget symbol="BINANCE:BTCUSDT" />
                    <Link href="/dashboard" className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-blue-600/80 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors" title="Open Trading Terminal">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15.75 9m-9 10.5h4.5m-4.5 0v-4.5m0 4.5L9 15.75M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15.75 15.75" />
                        </svg>
                    </Link>
                </motion.div>

                {/* 3. News Feed (Right Column) */}
                <motion.div variants={itemVariants} className="col-span-12 md:col-span-3 row-span-6 md:row-span-12 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                    <div className="absolute inset-x-0 bottom-0 top-auto z-20 p-4 bg-gradient-to-t from-[#121218] to-transparent h-24 flex items-end justify-center pointer-events-none"></div>
                    <Link href="/news" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                        Read All News
                    </Link>
                    <NewsWidget limit={8} />
                </motion.div>

                {/* 4. AI Chat (Bottom Center) */}
                <motion.div variants={itemVariants} className="col-span-12 md:col-span-6 row-span-4 md:row-span-4 relative rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                    <DashboardChatWidget />
                </motion.div>

            </motion.main>
        </div>
    );
}
