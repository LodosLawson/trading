'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ChartWidget from '@/components/dashboard/ChartWidget';
import MarketWidget from '@/components/dashboard/MarketWidget';
import NewsWidget from '@/components/dashboard/NewsWidget';

export default function DashboardPage() {
    const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');

    return (
        <div className="h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden flex flex-col">

            {/* Header */}
            <header className="shrink-0 h-12 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/terminal" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Terminal
                    </Link>
                    <div className="w-[1px] h-4 bg-white/10"></div>
                    <h1 className="text-sm font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 uppercase">
                        Standard Mode
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 font-mono">
                        {selectedSymbol}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Connected
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <main className="flex-1 p-2 gap-2 grid grid-cols-12 grid-rows-6 overflow-hidden">

                {/* 1. Main Chart Area (Top Left - Large) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-12 md:col-span-9 row-span-4 relative group"
                >
                    <ChartWidget symbol={selectedSymbol} />
                </motion.div>

                {/* 2. Market Ticker (Right Side - Tall) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-12 md:col-span-3 row-span-6 h-full"
                >
                    <MarketWidget onSelectSymbol={setSelectedSymbol} />
                </motion.div>

                {/* 3. News Feed (Bottom Left - Wide) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-12 md:col-span-9 row-span-2"
                >
                    <NewsWidget />
                </motion.div>

            </main>
        </div>
    );
}
