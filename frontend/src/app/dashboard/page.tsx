'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ChartWidget from '@/components/dashboard/ChartWidget';
import MarketWidget from '@/components/dashboard/MarketWidget';
import NewsWidget from '@/components/dashboard/NewsWidget';
import DashboardChatWidget from '@/components/dashboard/DashboardChatWidget';
import TradingPanel from '@/components/dashboard/TradingPanel';

export default function DashboardPage() {
    const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');
    const [rightPanelMode, setRightPanelMode] = useState<'market' | 'trade'>('market');

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
                    <div className="w-[1px] h-4 bg-white/10 hidden sm:block"></div>
                    <h1 className="text-sm font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 uppercase hidden sm:block">
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
                        <span className="hidden sm:inline">Connected</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout - Responsive */}
            <main className="flex-1 p-2 gap-2 grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 overflow-y-auto md:overflow-hidden">

                {/* 1. Main Chart Area (Desktop: Top Left, Mobile: Top) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-1 md:col-span-9 md:row-span-4 h-[350px] md:h-auto relative group order-1"
                >
                    <ChartWidget symbol={selectedSymbol} />
                </motion.div>

                {/* 2. Right Panel (Market / Trade) (Desktop: Right Side, Mobile: Under Chart) */}
                <div className="col-span-1 md:col-span-3 md:row-span-6 h-[250px] md:h-full order-2 md:order-2 flex flex-col gap-2">
                    {/* Tabs */}
                    <div className="flex p-1 bg-white/5 rounded-lg shrink-0">
                        <button
                            onClick={() => setRightPanelMode('market')}
                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-all ${rightPanelMode === 'market' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setRightPanelMode('trade')}
                            className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-all ${rightPanelMode === 'trade' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Trade
                        </button>
                    </div>

                    <motion.div
                        key={rightPanelMode}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-hidden"
                    >
                        {rightPanelMode === 'market' ? (
                            <MarketWidget onSelectSymbol={setSelectedSymbol} />
                        ) : (
                            <TradingPanel symbol={selectedSymbol} />
                        )}
                    </motion.div>
                </div>

                {/* 3. News Feed (Desktop: Bottom Left, Mobile: Bottom) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 md:col-span-5 md:row-span-2 h-[250px] md:h-auto order-4 md:order-3"
                >
                    <NewsWidget />
                </motion.div>

                {/* 4. Chat Widget (Desktop: Bottom Center, Mobile: Under Ticker) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-1 md:col-span-4 md:row-span-2 h-[250px] md:h-auto order-3 md:order-4"
                >
                    <DashboardChatWidget symbol={selectedSymbol} />
                </motion.div>

            </main>
        </div>
    );
}
