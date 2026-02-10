'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

/* ── Sparkline Chart ─────────────────────────────────── */
function SparkChart({ data, color, width = 120, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const innerH = height - padding * 2;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = padding + innerH - ((val - min) / range) * innerH;
        return `${x},${y}`;
    }).join(' ');

    // Gradient fill path
    const firstPoint = `0,${height}`;
    const lastPoint = `${width},${height}`;
    const fillPoints = `${firstPoint} ${points} ${lastPoint}`;
    const gradId = `grad-${color.replace('#', '')}`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon fill={`url(#${gradId})`} points={fillPoints} />
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
    );
}

/* ── Formatters ──────────────────────────────────────── */
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

function PctBadge({ value, size = 'sm' }: { value: number | null | undefined; size?: 'sm' | 'lg' }) {
    if (value === null || value === undefined) return <span className="text-gray-600 text-xs">—</span>;
    const isPositive = value >= 0;
    const textSize = size === 'lg' ? 'text-sm' : 'text-xs';
    return (
        <span className={`${textSize} font-mono tabular-nums font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
        </span>
    );
}

/* ── Expanded Coin Detail ────────────────────────────── */
function CoinDetail({ coin }: { coin: Coin }) {
    const is24hPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
    const sparkColor = is24hPositive ? '#34d399' : '#f87171';

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
        >
            <div className="px-4 pb-4 pt-1 border-t border-white/5">
                {/* Large Chart */}
                <div className="my-3 bg-white/[0.02] rounded-lg p-3">
                    <SparkChart data={coin.sparkline_7d} color={sparkColor} width={320} height={80} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-gray-600 block">Market Cap</span>
                        <span className="text-gray-300 font-mono">{formatNumber(coin.market_cap)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block">Volume (24h)</span>
                        <span className="text-gray-300 font-mono">{formatNumber(coin.total_volume)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block">ATH</span>
                        <span className="text-gray-300 font-mono">{formatPrice(coin.ath)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block">From ATH</span>
                        <span className="text-red-400 font-mono text-xs">{coin.ath_change_percentage?.toFixed(1)}%</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block">Circulating</span>
                        <span className="text-gray-300 font-mono">{coin.circulating_supply ? `${(coin.circulating_supply / 1e6).toFixed(1)}M` : '—'}</span>
                    </div>
                    <div>
                        <span className="text-gray-600 block">1h Change</span>
                        <PctBadge value={coin.price_change_percentage_1h} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────────────── */
export default function PricesPage() {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black">

            {/* ── Header ─── */}
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                            <Link href="/" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest shrink-0">
                                &larr;
                            </Link>
                            <h1 className="text-lg sm:text-xl font-thin tracking-tight truncate">
                                CRYPTO<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">PULSE</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-28 sm:w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                {lastUpdated && <span>{lastUpdated.toLocaleTimeString()}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Content ─── */}
            <main className="max-w-[1600px] mx-auto px-0 sm:px-6 py-2 sm:py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="text-xs text-gray-600 animate-pulse uppercase tracking-widest">Loading Market Data</p>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table (hidden on mobile) ─── */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-widest text-gray-600 border-b border-white/5">
                                        <th className="text-left py-3 px-3 w-12">#</th>
                                        <th className="text-left py-3 px-3">Name</th>
                                        <th className="text-right py-3 px-3">Price</th>
                                        <th className="text-right py-3 px-3">24h</th>
                                        <th className="text-right py-3 px-3">7d</th>
                                        <th className="text-right py-3 px-3">Market Cap</th>
                                        <th className="text-right py-3 px-3">Volume</th>
                                        <th className="text-right py-3 px-3 w-36">7d Chart</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCoins.map((coin, index) => {
                                        const is24hPos = (coin.price_change_percentage_24h ?? 0) >= 0;
                                        const sparkColor = is24hPos ? '#34d399' : '#f87171';
                                        return (
                                            <motion.tr
                                                key={coin.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: Math.min(index * 0.015, 0.8) }}
                                                className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors group"
                                            >
                                                <td className="py-3 px-3 text-gray-600 text-xs font-mono">{coin.market_cap_rank}</td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={coin.image} alt="" className="w-7 h-7 rounded-full" />
                                                        <div>
                                                            <span className="font-medium text-white">{coin.name}</span>
                                                            <span className="ml-2 text-gray-600 text-xs">{coin.symbol}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono tabular-nums text-white">{formatPrice(coin.current_price)}</td>
                                                <td className="py-3 px-3 text-right"><PctBadge value={coin.price_change_percentage_24h} /></td>
                                                <td className="py-3 px-3 text-right"><PctBadge value={coin.price_change_percentage_7d} /></td>
                                                <td className="py-3 px-3 text-right text-gray-400 font-mono tabular-nums text-xs">{formatNumber(coin.market_cap)}</td>
                                                <td className="py-3 px-3 text-right text-gray-500 font-mono tabular-nums text-xs">{formatNumber(coin.total_volume)}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <SparkChart data={coin.sparkline_7d} color={sparkColor} width={130} height={36} />
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Card List ─── */}
                        <div className="md:hidden divide-y divide-white/5">
                            {filteredCoins.map((coin, index) => {
                                const is24hPos = (coin.price_change_percentage_24h ?? 0) >= 0;
                                const sparkColor = is24hPos ? '#34d399' : '#f87171';
                                const isExpanded = expandedId === coin.id;

                                return (
                                    <motion.div
                                        key={coin.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: Math.min(index * 0.02, 0.6) }}
                                    >
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : coin.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 active:bg-white/[0.03] transition-colors"
                                        >
                                            {/* Rank */}
                                            <span className="text-gray-600 text-[10px] font-mono w-5 text-right shrink-0">{coin.market_cap_rank}</span>

                                            {/* Icon */}
                                            <img src={coin.image} alt="" className="w-8 h-8 rounded-full shrink-0" />

                                            {/* Name + % */}
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-sm font-medium text-white truncate">{coin.name}</span>
                                                    <span className="text-[10px] text-gray-600">{coin.symbol}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <PctBadge value={coin.price_change_percentage_24h} />
                                                    <span className="text-gray-700 text-[10px]">24h</span>
                                                </div>
                                            </div>

                                            {/* Price + Mini Chart */}
                                            <div className="text-right shrink-0">
                                                <div className="text-sm font-mono tabular-nums text-white">{formatPrice(coin.current_price)}</div>
                                                <div className="mt-1">
                                                    <SparkChart data={coin.sparkline_7d} color={sparkColor} width={60} height={20} />
                                                </div>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && <CoinDetail coin={coin} />}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {filteredCoins.length === 0 && (
                            <div className="text-center py-20 text-gray-600 text-sm">
                                No coins match &quot;{searchQuery}&quot;
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
