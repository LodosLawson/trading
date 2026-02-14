'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrowserWidget({ defaultUrl }: { defaultUrl?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [url, setUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Sync prop changes
    useEffect(() => {
        if (defaultUrl) {
            setUrl(defaultUrl);
            setSearchQuery(defaultUrl);
            setIsOpen(true);
        }
    }, [defaultUrl]);

    // Handle Search / Navigation
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        let target = searchQuery;
        if (!target.includes('.') && !target.startsWith('http')) {
            target = `https://www.google.com/search?q=${encodeURIComponent(target)}&igu=1`; // igu=1 allows some google framing
        } else if (!target.startsWith('http')) {
            target = `https://${target}`;
        }

        setUrl(target);
        setHistory(prev => [target, ...prev].slice(0, 10));
        setTimeout(() => setIsLoading(false), 1000); // Reset loading after a delay
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
                            : { opacity: 1, y: 0, scale: 1, top: 'auto', left: 'auto', right: '1.5rem', bottom: '5rem', width: '360px', height: '600px', borderRadius: '1rem' }
                        }
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed z-40 bg-[#1a1a20] border border-white/10 overflow-hidden flex flex-col shadow-2xl ${isMaximized ? '' : 'max-h-[80vh]'}`}
                    >
                        {/* Browser Toolbar */}
                        <div className="flex items-center gap-2 p-3 border-b border-white/10 bg-[#0a0a0f]">
                            {/* Controls */}
                            <div className="flex items-center gap-1.5 mr-2">
                                <button className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer" onClick={() => setIsOpen(false)} />
                                <button className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
                                <button className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer" onClick={() => handleSearch({ preventDefault: () => { } } as any)} />
                            </div>

                            {/* Address Bar */}
                            <form onSubmit={handleSearch} className="flex-1 relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
                                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search or enter URL..."
                                    className="w-full bg-[#050508] text-white text-xs sm:text-sm rounded-lg py-1.5 pl-8 pr-8 border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                                />
                                {url && (
                                    <button
                                        type="button"
                                        onClick={() => window.open(url, '_blank')}
                                        title="Open External"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Browser Content (Iframe) */}
                        <div className="flex-1 bg-white relative">
                            {isLoading && (
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-100 z-50">
                                    <div className="h-full bg-blue-500 animate-progress"></div>
                                </div>
                            )}

                            {url ? (
                                <iframe
                                    ref={iframeRef}
                                    src={url}
                                    title="Browser View"
                                    className="w-full h-full border-none"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                    onError={() => setIsLoading(false)}
                                    onLoad={() => setIsLoading(false)}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full bg-[#121218] text-gray-400 space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black tracking-widest text-white mb-2">NEBULA<span className="text-blue-500">BROWSER</span></h3>
                                        <p className="text-xs text-gray-600 uppercase tracking-widest">Secure In-App Navigation</p>
                                    </div>

                                    <div className="grid grid-cols-4 gap-6 px-8">
                                        {[
                                            { name: 'Google', url: 'https://www.google.com/search?igu=1' },
                                            { name: 'News', url: 'https://cryptonews.com' },
                                            { name: 'CoinGecko', url: 'https://www.coingecko.com' },
                                            { name: 'TradingView', url: 'https://www.tradingview.com' }
                                        ].map(site => (
                                            <button
                                                key={site.name}
                                                onClick={() => { setUrl(site.url); setSearchQuery(site.url); }}
                                                className="flex flex-col items-center gap-3 group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-blue-500/30 transition-all shadow-lg group-hover:shadow-blue-500/10">
                                                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{site.name[0]}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-500 group-hover:text-blue-400 transition-colors uppercase font-bold">{site.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Overlay for blocked sites hint */}
                            {url && (
                                <div className="absolute bottom-4 right-4 pointer-events-none">
                                    <div className="px-3 py-2 bg-black/80 backdrop-blur text-[10px] text-gray-400 rounded-lg border border-white/10 max-w-[200px] text-center">
                                        If site fails to load, click the <span className="text-white">External Link</span> icon in the bar.
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
