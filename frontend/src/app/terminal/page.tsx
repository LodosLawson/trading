'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MarketWidget from '@/components/dashboard/MarketWidget';
import NewsWidget from '@/components/dashboard/NewsWidget';
import ChartWidget from '@/components/dashboard/ChartWidget';
import DashboardChatWidget from '@/components/dashboard/DashboardChatWidget';

// --- SIDEBAR COMPONENT ---
const SidebarItem = ({ icon, label, href, active }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) => (
    <Link href={href} className={`flex flex-col items-center justify-center p-3 mb-2 rounded-xl transition-all group ${active ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'}`}>
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-600/20' : 'group-hover:bg-white/5'} transition-colors`}>
            {icon}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-14 bg-black/80 px-2 py-1 rounded border border-white/10 pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
    </Link>
);


export default function TerminalPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black overflow-hidden relative flex">

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="relative z-50 w-16 border-r border-white/5 bg-[#0a0a0f]/90 backdrop-blur flex flex-col items-center py-6">
                {/* Logo / Brand */}
                <div className="mb-8 p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </div>

                {/* Nav Links */}
                <div className="flex-1 w-full px-2 flex flex-col gap-2">
                    <SidebarItem href="/terminal" active label="Hub" icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                    } />
                    <SidebarItem href="/prices" label="Markets" icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    } />
                    <SidebarItem href="/news" label="Intel" icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                    } />
                    <SidebarItem href="/chat" label="AI Agent" icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h2.25m-2.25 3h2.25m-2.25 3h2.25" /></svg>
                    } />
                    <SidebarItem href="/dashboard" label="Trade" icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" /></svg>
                    } />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="relative z-20 shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-thin tracking-tight">
                            TERMINAL <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">HUB</span>
                        </h1>
                        <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-gray-500 bg-white/5 border border-white/5">v2.1.0-beta</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-500 bg-emerald-900/10 px-2 py-1 rounded-full border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="hidden sm:inline font-mono uppercase">System Online</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Grid */}
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10 flex-1 p-6 grid grid-cols-12 grid-rows-12 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full"
                >
                    {/* 1. Market Overview (Left Column) */}
                    <div className="col-span-12 md:col-span-3 row-span-8 md:row-span-12 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                        <div className="absolute inset-x-0 bottom-0 top-auto z-20 p-4 bg-gradient-to-t from-[#121218] to-transparent h-24 flex items-end justify-center pointer-events-none"></div>
                        <Link href="/prices" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                            Full Market View
                        </Link>
                        <MarketWidget limit={15} />
                    </div>

                    {/* 2. Main Chart Area (Center) */}
                    <div className="col-span-12 md:col-span-6 row-span-8 md:row-span-8 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                        <ChartWidget symbol="BINANCE:BTCUSDT" />
                        <Link href="/dashboard" className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-blue-600/80 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors" title="Open Trading Terminal">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15.75 9m-9 10.5h4.5m-4.5 0v-4.5m0 4.5L9 15.75M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15.75 15.75" />
                            </svg>
                        </Link>
                    </div>

                    {/* 3. News Feed (Right Column) */}
                    <div className="col-span-12 md:col-span-3 row-span-6 md:row-span-12 relative group rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                        <div className="absolute inset-x-0 bottom-0 top-auto z-20 p-4 bg-gradient-to-t from-[#121218] to-transparent h-24 flex items-end justify-center pointer-events-none"></div>
                        <Link href="/news" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-auto">
                            Read All News
                        </Link>
                        <NewsWidget limit={8} />
                    </div>

                    {/* 4. AI Chat (Bottom Center) */}
                    <div className="col-span-12 md:col-span-6 row-span-4 md:row-span-4 relative rounded-2xl overflow-hidden border border-white/10 bg-[#121218]">
                        <DashboardChatWidget />
                    </div>

                </motion.main>
            </div>
        </div>
    );
}
