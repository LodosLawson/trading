'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    total_volume: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_1h: number | null;
    price_change_percentage_7d: number | null;
    circulating_supply: number;
    total_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    sparkline_7d: number[];
    last_updated: string;
}

// Inline SVG sparkline renderer
function Sparkline({ data, color }: { data: number[]; color: string }) {
    if (!data || data.length < 2) return null;

    const width = 120;
    const height = 32;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-60">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
            />
        </svg>
    );
}

function formatNumber(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
}

function formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined) return '—';
    if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
}

function PctBadge({ value }: { value: number | null | undefined }) {
    if (value === null || value === undefined) return <span className="text-gray-600 text-xs">—</span>;
    const isPositive = value >= 0;
    return (
        <span className={`text-xs font-mono tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
    );
}

export default function PricesPage() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPrices = useCallback(async () => {
        try {
            const res = await fetch('/api/crypto?per_page=100');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCoins(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch crypto prices:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest">
                            &larr; Home
                        </Link>
                        <h1 className="text-xl font-thin tracking-tight">
                            CRYPTO<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">PULSE</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[1600px] mx-auto px-6 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="text-xs text-gray-600 animate-pulse uppercase tracking-widest">Loading Market Data</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-gray-600 border-b border-white/5">
                                    <th className="text-left py-3 px-2 w-12">#</th>
                                    <th className="text-left py-3 px-2">Name</th>
                                    <th className="text-right py-3 px-2">Price</th>
                                    <th className="text-right py-3 px-2">1h %</th>
                                    <th className="text-right py-3 px-2">24h %</th>
                                    <th className="text-right py-3 px-2">7d %</th>
                                    <th className="text-right py-3 px-2">Market Cap</th>
                                    <th className="text-right py-3 px-2">Volume (24h)</th>
                                    <th className="text-right py-3 px-2 hidden lg:table-cell">7d Chart</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoins.map((coin, index) => {
                                    const is24hPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
                                    const sparkColor = is24hPositive ? '#34d399' : '#f87171';

                                    return (
                                        <motion.tr
                                            key={coin.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(index * 0.02, 1) }}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-default"
                                        >
                                            <td className="py-3 px-2 text-gray-600 text-xs font-mono">{coin.market_cap_rank}</td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-3">
                                                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                                    <div>
                                                        <span className="font-medium text-white group-hover:text-blue-300 transition-colors">{coin.name}</span>
                                                        <span className="ml-2 text-gray-600 text-xs">{coin.symbol}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-right font-mono tabular-nums text-white">
                                                {formatPrice(coin.current_price)}
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <PctBadge value={coin.price_change_percentage_1h} />
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <PctBadge value={coin.price_change_percentage_24h} />
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <PctBadge value={coin.price_change_percentage_7d} />
                                            </td>
                                            <td className="py-3 px-2 text-right text-gray-400 font-mono tabular-nums text-xs">
                                                {formatNumber(coin.market_cap)}
                                            </td>
                                            <td className="py-3 px-2 text-right text-gray-500 font-mono tabular-nums text-xs">
                                                {formatNumber(coin.total_volume)}
                                            </td>
                                            <td className="py-3 px-2 text-right hidden lg:table-cell">
                                                <Sparkline data={coin.sparkline_7d} color={sparkColor} />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredCoins.length === 0 && (
                            <div className="text-center py-20 text-gray-600 text-sm">
                                No coins match &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
