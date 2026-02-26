'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseChart from './PulseChart';

// Popular symbols for quick access
const POPULAR = [
    { label: 'BTC', symbol: 'BINANCE:BTCUSDT' },
    { label: 'ETH', symbol: 'BINANCE:ETHUSDT' },
    { label: 'SOL', symbol: 'BINANCE:SOLUSDT' },
    { label: 'AAPL', symbol: 'NASDAQ:AAPL' },
    { label: 'TSLA', symbol: 'NASDAQ:TSLA' },
    { label: 'SPY', symbol: 'AMEX:SPY' },
    { label: 'XRP', symbol: 'BINANCE:XRPUSDT' },
    { label: 'DOGE', symbol: 'BINANCE:DOGEUSDT' },
];

interface ChartWidgetProps {
    symbol?: string;
    theme?: 'light' | 'dark';
    onSymbolChange?: (sym: string) => void;
}

export default function ChartWidget({
    symbol: externalSymbol = 'BINANCE:BTCUSDT',
    theme = 'dark',
    onSymbolChange,
}: ChartWidgetProps) {
    const containerId = useRef(`tv_${Math.random().toString(36).substring(7)}`);
    const [viewMode, setViewMode] = useState<'tv' | 'pulse'>('tv');

    // Widget owns its local symbol state; syncs to parent via callback
    const [symbol, setSymbol] = useState(externalSymbol);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Sync if parent changes (e.g. Market widget click)
    useEffect(() => { setSymbol(externalSymbol); }, [externalSymbol]);

    const changeSymbol = useCallback((sym: string) => {
        setSymbol(sym);
        setSearchQuery('');
        setShowSearch(false);
        onSymbolChange?.(sym);
    }, [onSymbolChange]);

    const handleSearchSubmit = () => {
        const q = searchQuery.trim().toUpperCase();
        if (!q) return;
        // Build a best-guess TradingView symbol
        const guessed = q.includes(':') ? q
            : q.endsWith('USDT') ? `BINANCE:${q}`
                : q.length <= 4 ? `NASDAQ:${q}` // short tickers → NASDAQ
                    : `BINANCE:${q}USDT`;
        changeSymbol(guessed);
    };

    // Filter popular symbols by query
    const filtered = searchQuery
        ? POPULAR.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
        : POPULAR;

    // TradingView widget init
    useEffect(() => {
        if (viewMode !== 'tv') return;
        let tvWidget: any = null;
        let isMounted = true;

        const initWidget = () => {
            if (!isMounted) return;
            const container = document.getElementById(containerId.current);
            if (!container) { setTimeout(initWidget, 100); return; }
            container.innerHTML = '';
            if ((window as any).TradingView) {
                try {
                    tvWidget = new (window as any).TradingView.widget({
                        autosize: true,
                        symbol,
                        interval: 'D',
                        timezone: 'Etc/UTC',
                        theme,
                        style: '1',
                        locale: 'en',
                        enable_publishing: false,
                        allow_symbol_change: true,
                        container_id: containerId.current,
                        hide_side_toolbar: false,
                        hide_top_toolbar: false,
                        studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
                    });
                } catch (e) {
                    console.error("TV init error:", e);
                }
            }
        };

        if ((window as any).TradingView) {
            initWidget();
        } else {
            const existing = document.querySelector('script[src*="tv.js"]');
            if (existing) {
                existing.addEventListener('load', initWidget);
            } else {
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.onload = initWidget;
                document.head.appendChild(script);
            }
        }

        return () => {
            isMounted = false;
            const existing = document.querySelector('script[src*="tv.js"]');
            if (existing) {
                existing.removeEventListener('load', initWidget);
            }

            if (tvWidget && typeof tvWidget.remove === 'function') {
                try { tvWidget.remove(); } catch (e) { /* ignore */ }
            }
            tvWidget = null;

            // Hack: TradingView evaluates its widget injection asynchronously.
            // If React unmounts this component *before* TradingView finishes, TV throws an 
            // Uncaught TypeError: Cannot read properties of null (reading 'container').
            // We prevent this by leaving a hidden "honeypot" container with the same ID 
            // in the DOM for a few seconds so TV can safely inject into the void.
            if (!document.getElementById(containerId.current)) {
                const dummy = document.createElement('div');
                dummy.id = containerId.current;
                dummy.style.display = 'none';
                document.body.appendChild(dummy);
                setTimeout(() => {
                    if (document.body.contains(dummy)) {
                        document.body.removeChild(dummy);
                    }
                }, 3000);
            }
        };
    }, [symbol, theme, viewMode]);

    const tickerLabel = symbol.split(':')[1]?.replace('USDT', '') || symbol;

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0f] relative overflow-hidden">

            {/* ── Top Toolbar ── */}
            <div className="relative z-30 flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-[#0a0a0f]/95 backdrop-blur-sm shrink-0">

                {/* Symbol Search Trigger */}
                <button
                    onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 transition-all group"
                >
                    <svg className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-xs font-bold text-white tracking-wider">{tickerLabel}</span>
                    <span className="text-[9px] text-gray-600">▼</span>
                </button>

                {/* Quick chips */}
                <div className="flex gap-1 overflow-x-auto scrollbar-none">
                    {POPULAR.map(p => (
                        <button
                            key={p.symbol}
                            onClick={() => changeSymbol(p.symbol)}
                            className={`shrink-0 px-2 py-1 text-[9px] font-bold rounded-md border transition-all ${symbol === p.symbol
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-white/3 border-white/8 text-gray-500 hover:text-white hover:border-white/20'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-1">
                    {/* TV / Pulse toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-white/10 bg-white/3">
                        <button
                            onClick={() => setViewMode('tv')}
                            className={`px-2.5 py-1 text-[9px] font-bold transition-all ${viewMode === 'tv' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >TV</button>
                        <button
                            onClick={() => setViewMode('pulse')}
                            className={`px-2.5 py-1 text-[9px] font-bold transition-all ${viewMode === 'pulse' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >PULSE</button>
                    </div>
                </div>
            </div>

            {/* ── Search Overlay ── */}
            <AnimatePresence>
                {showSearch && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowSearch(false)}
                        />
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-12 left-3 right-3 z-50 bg-[#13131c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    ref={searchRef}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); if (e.key === 'Escape') setShowSearch(false); }}
                                    placeholder="Search symbol… e.g. BTC, AAPL, BINANCE:ETHUSDT"
                                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="text-gray-600 hover:text-white transition-colors text-xs">✕</button>
                                )}
                            </div>

                            {/* Results */}
                            <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                {filtered.length === 0 ? (
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-xs font-bold font-mono text-blue-400 uppercase">{searchQuery}</span>
                                        <span className="text-[10px] text-gray-500">Press Enter or click to search</span>
                                    </button>
                                ) : (
                                    filtered.map(p => (
                                        <button
                                            key={p.symbol}
                                            onClick={() => changeSymbol(p.symbol)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-white/5 transition-colors ${symbol === p.symbol ? 'bg-blue-600/20' : ''}`}
                                        >
                                            <div>
                                                <div className="text-sm font-bold text-white">{p.label}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{p.symbol}</div>
                                            </div>
                                            {symbol === p.symbol && <span className="text-blue-400 text-xs">●</span>}
                                        </button>
                                    ))
                                )}
                                {searchQuery && (
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <span className="text-xs">Search for "<b className="text-white">{searchQuery}</b>" on TradingView</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Chart Content ── */}
            <div className="flex-1 relative z-10 min-h-0">
                {viewMode === 'tv' ? (
                    <div id={containerId.current} className="w-full h-full" />
                ) : (
                    <PulseChart symbol={symbol} />
                )}
            </div>
        </div>
    );
}
