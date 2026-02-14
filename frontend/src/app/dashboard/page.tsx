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
    const [mobileTab, setMobileTab] = useState<'chart' | 'trade' | 'markets' | 'intel'>('chart');

    // Helper for Nav Icons
    const NavIcon = ({ active, label, icon }: { active: boolean, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setMobileTab(label.toLowerCase() as any)}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${active ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
        >
            <div className={`p-1.5 rounded-full ${active ? 'bg-amber-400/10' : ''}`}>
                {icon}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden flex flex-col">

            {/* Header */}
            <header className="shrink-0 h-12 bg-[#0a0a0f] border-b border-white/5 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/terminal" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        <span className="hidden sm:inline">Terminal</span>
                    </Link>
                    <div className="w-[1px] h-4 bg-white/10 hidden sm:block"></div>
                    <h1 className="text-sm font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 uppercase">
                        Standard Mode
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setMobileTab('markets')} className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 font-mono border border-white/5 hover:border-amber-500/50 transition-colors">
                        {selectedSymbol.split(':')[1]}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="hidden sm:inline">Live</span>
                    </div>
                </div>
            </header>

            {/* --- DESKTOP LAYOUT (Grid) --- */}
            <main className="hidden md:grid flex-1 p-2 gap-2 grid-cols-12 grid-rows-6 overflow-hidden">
                {/* 1. Main Chart Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-9 row-span-4 relative group border border-white/5 rounded-xl overflow-hidden bg-[#1a1a20]"
                >
                    <ChartWidget symbol={selectedSymbol} />
                </motion.div>

                {/* 2. Right Panel (Tabs for Market / Trade) */}
                <div className="col-span-3 row-span-6 flex flex-col gap-2">
                    <div className="flex p-1 bg-white/5 rounded-lg shrink-0">
                        <button
                            onClick={() => setRightPanelMode('market')}
                            className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded transition-all ${rightPanelMode === 'market' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Market
                        </button>
                        <button
                            onClick={() => setRightPanelMode('trade')}
                            className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded transition-all ${rightPanelMode === 'trade' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Trade
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {rightPanelMode === 'market' ? (
                            <MarketWidget onSelectSymbol={setSelectedSymbol} />
                        ) : (
                            <TradingPanel symbol={selectedSymbol} />
                        )}
                    </div>
                </div>

                {/* 3. News Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-5 row-span-2"
                >
                    <NewsWidget />
                </motion.div>

                {/* 4. Chat Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-4 row-span-2"
                >
                    <DashboardChatWidget symbol={selectedSymbol} />
                </motion.div>
            </main>

            {/* --- MOBILE LAYOUT (App Style) --- */}
            <main className="md:hidden flex-1 flex flex-col overflow-hidden relative">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#050508]">
                    {mobileTab === 'chart' && (
                        <div className="h-full border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <ChartWidget symbol={selectedSymbol} />
                        </div>
                    )}
                    {mobileTab === 'trade' && (
                        <div className="h-full pb-20">
                            <TradingPanel symbol={selectedSymbol} />
                        </div>
                    )}
                    {mobileTab === 'markets' && (
                        <div className="h-full pb-20">
                            <MarketWidget onSelectSymbol={(s) => { setSelectedSymbol(s); setMobileTab('chart'); }} />
                        </div>
                    )}
                    {mobileTab === 'intel' && (
                        <div className="flex flex-col gap-4 h-full pb-20">
                            {/* Chat Context Header */}
                            <div className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
                                <h3 className="text-xs font-bold text-blue-200 mb-1">Active Context</h3>
                                <div className="text-[10px] text-gray-400"> Analyzing <span className="text-white font-mono">{selectedSymbol}</span></div>
                            </div>
                            <div className="flex-1 min-h-[400px]">
                                <DashboardChatWidget symbol={selectedSymbol} />
                            </div>
                            <div className="h-[300px]">
                                <NewsWidget />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="shrink-0 h-[60px] bg-[#0f0f13] border-t border-white/10 flex items-center justify-around px-2 z-50 pb-safe">
                    <NavIcon
                        active={mobileTab === 'chart'} label="Chart"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M6 16.5h2.25m-2.25 0H3.75m4.5-3.75h4.5M6 16.5L6 21m0 0l2.25-2.25M6 21l-2.25-2.25m10.5-8.25h3m-3 3.75h3m-3 3.75h3" /></svg>}
                    />
                    <NavIcon
                        active={mobileTab === 'trade'} label="Trade"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>}
                    />
                    <NavIcon
                        active={mobileTab === 'markets'} label="Markets"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>}
                    />
                    <NavIcon
                        active={mobileTab === 'intel'} label="Intel"
                        icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>}
                    />
                </div>
            </main>
        </div>
    );
}
