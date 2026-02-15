'use client';

import React, { useEffect, useRef, useState } from 'react';
import PulseChart from './PulseChart';

export default function ChartWidget({ symbol = 'BINANCE:BTCUSDT', theme = 'dark' }: { symbol?: string; theme?: 'light' | 'dark' }) {
    const containerId = useRef(`tv_chart_${Math.random().toString(36).substring(7)}`);
    const [viewMode, setViewMode] = useState<'tv' | 'pulse'>('tv');

    useEffect(() => {
        if (viewMode !== 'tv') return;

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if ((window as any).TradingView) {
                new (window as any).TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: theme,
                    style: '1',
                    locale: 'en',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: containerId.current,
                    hide_side_toolbar: false,
                    studies: [
                        "RSI@tv-basicstudies",
                        "MASimple@tv-basicstudies"
                    ]
                });
            }
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, [symbol, theme, viewMode]);

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0f] relative group overflow-hidden">

            {/* View Toggle (Absolute Positioned for "Layer" feel) */}
            <div className="absolute top-3 right-16 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 flex gap-1 shadow-xl transform hover:scale-105 transition-all">
                <button
                    onClick={() => setViewMode('tv')}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${viewMode === 'tv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    TRADINGVIEW
                </button>
                <button
                    onClick={() => setViewMode('pulse')}
                    className={`px-3 py-1 text-[10px] font-bold rounded ${viewMode === 'pulse' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-white/10'}`}
                >
                    PULSE
                </button>
            </div>

            {/* Content Layer */}
            <div className="flex-1 w-full h-full relative z-10">
                {viewMode === 'tv' ? (
                    <div id={containerId.current} className="w-full h-full" />
                ) : (
                    <PulseChart symbol={symbol} />
                )}
            </div>
        </div>
    );
}
