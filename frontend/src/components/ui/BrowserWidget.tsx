'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrowserWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [url, setUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    // Simulation of browser loading
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        let target = searchQuery;
        if (!target.includes('.') && !target.startsWith('http')) {
            target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
        } else if (!target.startsWith('http')) {
            target = `https://${target}`;
        }

        setUrl(target);
        setHistory(prev => [target, ...prev].slice(0, 10));

        // In a real app we'd open a new tab or use an allowable iframe
        // specific for "Google", we'll just open new tab as it's blocked in iframes
        if (target.includes('google.com')) {
            setTimeout(() => {
                window.open(target, '_blank');
                setIsLoading(false);
            }, 800);
        } else {
            // For demo purposes, we settle the loading state
            setTimeout(() => setIsLoading(false), 1500);
        }
    };

    const toggleWidget = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setIsMaximized(false);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            {!isMaximized && (
                <motion.button
                    onClick={toggleWidget}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    )}
                </motion.button>
            )}

            {/* Pop-up Widget / Browser Mode */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={isMaximized ? { opacity: 0, scale: 0.9 } : { opacity: 0, y: 20, scale: 0.95 }}
                        animate={isMaximized
                            ? { opacity: 1, y: 0, scale: 1, top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', borderRadius: 0 }
                            : { opacity: 1, y: 0, scale: 1, top: 'auto', left: 'auto', right: '1.5rem', bottom: '5rem', width: '320px', height: 'auto', borderRadius: '1rem' }
                        }
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed z-40 bg-[#1a1a20]/95 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col shadow-2xl ${isMaximized ? '' : 'max-h-[500px]'
                            }`}
                    >
                        {/* Browser Toolbar */}
                        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-[#0a0a0f]/50">
                            {/* Controls */}
                            <div className="flex items-center gap-1.5 mr-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer" onClick={() => setIsOpen(false)}></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)}></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer"></div>
                            </div>

                            {/* Address Bar */}
                            <form onSubmit={handleSearch} className="flex-1 relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                                    {url.includes('https') ? (
                                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Google or type URL..."
                                    className="w-full bg-[#0a0a0f] text-white text-xs sm:text-sm rounded-full py-1.5 pl-8 pr-3 border border-white/5 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                            </form>
                        </div>

                        {/* Browser Content Simulated */}
                        <div className="flex-1 bg-white relative overflow-hidden">
                            {isLoading && (
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-100 z-50">
                                    <div className="h-full bg-blue-500 animate-progress"></div>
                                </div>
                            )}

                            {url ? (
                                <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500 text-sm p-8 text-center">
                                    <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                    <p className="font-medium text-gray-700 mb-2">Navigation Event</p>
                                    <p>Opened <strong>{url}</strong> in a new tab due to security restrictions.</p>
                                    <button onClick={() => setUrl('')} className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-xs">Returns to Start</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full bg-[#1a1a20] text-gray-400 space-y-4">
                                    <h3 className="text-xl font-thin tracking-widest text-white">BROWSER<span className="font-bold text-blue-500">WIDGET</span></h3>
                                    <div className="grid grid-cols-4 gap-4 px-8 mt-4">
                                        {['Google', 'News', 'CoinGecko', 'TradingView'].map(site => (
                                            <button key={site} onClick={() => { setSearchQuery(site); handleSearch({ preventDefault: () => { } } as any); }} className="flex flex-col items-center gap-2 group">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                    <span className="text-xs font-bold">{site[0]}</span>
                                                </div>
                                                <span className="text-[10px]">{site}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
