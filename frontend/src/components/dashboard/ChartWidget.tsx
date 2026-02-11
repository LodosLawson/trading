'use client';

import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        TradingView: any;
    }
}

export default function ChartWidget({ symbol = 'BINANCE:BTCUSDT', theme = 'dark' }: { symbol?: string; theme?: 'light' | 'dark' }) {
    const containerId = useRef(`tv_chart_${Math.random().toString(36).substring(7)}`);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
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
            // Cleanup if necessary
        };
    }, [symbol, theme]);

    return (
        <div className="w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden border border-white/5 relative">
            <div id={containerId.current} className="w-full h-full" />
        </div>
    );
}
