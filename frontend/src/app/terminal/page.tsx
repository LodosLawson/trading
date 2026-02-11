'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black overflow-hidden relative">

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-violet-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 min-h-screen flex flex-col justify-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <Link href="/" className="inline-block mb-4 text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest">
                        &larr; Return to Landing
                    </Link>
                    <h1 className="text-4xl sm:text-6xl font-thin tracking-tighter mb-2">
                        TERMINAL <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">HUB</span>
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base uppercase tracking-[0.2em]">
                        Select Interface Module
                    </p>
                </motion.div>

                {/* Modules Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* News Module */}
                    <motion.div variants={itemVariants} className="group">
                        <Link href="/news" className="block h-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Global Intel</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Real-time financial news stream with AI-powered sentiment analysis and impact scoring.
                            </p>

                            <div className="flex items-center text-xs font-mono text-blue-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                                Access Feed &rarr;
                            </div>
                        </Link>
                    </motion.div>

                    {/* Market Prices Module */}
                    <motion.div variants={itemVariants} className="group">
                        <Link href="/prices" className="block h-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Market Data</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Live cryptocurrency prices, charts, and market cap rankings with instant search.
                            </p>

                            <div className="flex items-center text-xs font-mono text-emerald-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                                View Markets &rarr;
                            </div>
                        </Link>
                    </motion.div>

                    {/* AI Chat Module */}
                    <motion.div variants={itemVariants} className="group">
                        <Link href="/chat" className="block h-full bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-6 text-violet-400 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h2.25m-2.25 3h2.25m-2.25 3h2.25" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">AI Agent</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Interact with MarketMind for personalized analysis, chart patterns, and trading insights.
                            </p>

                            <div className="flex items-center text-xs font-mono text-violet-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                                Start Session &rarr;
                            </div>
                        </Link>
                    </motion.div>

                    {/* Standard Mode Module */}
                    <motion.div variants={itemVariants} className="group md:col-span-3 lg:col-span-1">
                        <Link href="/dashboard" className="block h-full bg-gradient-to-br from-amber-900/10 to-transparent border border-amber-500/20 rounded-2xl p-8 hover:bg-amber-900/20 hover:border-amber-500/50 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">Standard Mode</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                Pro-level dashboard combining charts, news, and tickers in a single view.
                            </p>

                            <div className="flex items-center text-xs font-mono text-amber-500 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                                Launch Dashboard &rarr;
                            </div>
                        </Link>
                    </motion.div>

                </motion.div>

                {/* Footer Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">System Operational</span>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
