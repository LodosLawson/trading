'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PulseChartProps {
    symbol: string;
}

type Interval = '1H' | '4H' | '1D' | '1W';

const INTERVAL_DAYS: Record<Interval, number> = { '1H': 1, '4H': 2, '1D': 14, '1W': 60 };

// Symbol → CoinGecko map
const SYMBOL_MAP: Record<string, string> = {
    btc: 'bitcoin', eth: 'ethereum', sol: 'solana', xrp: 'ripple',
    doge: 'dogecoin', ada: 'cardano', dot: 'polkadot', matic: 'matic-network',
    bnb: 'binancecoin', avax: 'avalanche-2', link: 'chainlink', atom: 'cosmos',
};

function mapSymbol(sym: string): string {
    const s = sym.split(':')[1]?.replace('USDT', '').toLowerCase() || sym.toLowerCase();
    return SYMBOL_MAP[s] || s;
}

function formatPrice(n: number): string {
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    if (n >= 1) return '$' + n.toFixed(2);
    return '$' + n.toFixed(6);
}

export default function PulseChart({ symbol }: PulseChartProps) {
    const [dataPoints, setDataPoints] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [interval, setInterval] = useState<Interval>('1D');
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
    const [high, setHigh] = useState<number | null>(null);
    const [low, setLow] = useState<number | null>(null);
    const [volume, setVolume] = useState<string | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        setLoading(true);
        setDataPoints([]);

        const coinId = mapSymbol(symbol);
        const days = INTERVAL_DAYS[interval];

        const fetchAll = async () => {
            try {
                // Price history
                const histRes = await fetch(`/api/history/${coinId}?days=${days}`);
                if (histRes.ok) {
                    const data: number[] = await histRes.json();
                    if (Array.isArray(data) && data.length > 0) {
                        // Downsample to ~80 points
                        const step = Math.max(1, Math.ceil(data.length / 80));
                        setDataPoints(data.filter((_, i) => i % step === 0));
                        setHigh(Math.max(...data));
                        setLow(Math.min(...data));
                        setCurrentPrice(data[data.length - 1]);
                    }
                }

                // 24h stats
                const statsRes = await fetch(`/api/price/${coinId}`);
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    setPriceChange24h(stats?.price_change_percentage_24h ?? null);
                    if (stats?.current_price) setCurrentPrice(stats.current_price);
                    if (stats?.total_volume) {
                        const v = stats.total_volume;
                        setVolume(v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${v.toLocaleString()}`);
                    }
                }
            } catch (e) {
                console.error('PulseChart fetch error', e);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        const poll = globalThis.setInterval(fetchAll, 60000);

        // Micro-animation on last point
        const anim = globalThis.setInterval(() => {
            setDataPoints(prev => {
                if (!prev.length) return prev;
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), last + (Math.random() - 0.5) * last * 0.002];
            });
        }, 120);

        return () => { globalThis.clearInterval(poll); globalThis.clearInterval(anim); };
    }, [symbol, interval]);

    const isPositive = (priceChange24h ?? 0) >= 0;

    const { pathLine, pathArea, points } = useMemo(() => {
        if (!dataPoints.length) return { pathLine: '', pathArea: '', points: [] };
        const max = Math.max(...dataPoints);
        const min = Math.min(...dataPoints);
        const range = max - min || 1;

        const pts = dataPoints.map((p, i) => ({
            x: (i / (dataPoints.length - 1)) * 100,
            y: 100 - (((p - min) / range) * 82 + 9),
            val: p,
        }));

        // Smooth bezier path
        const line = pts.map((pt, i) => {
            if (i === 0) return `M ${pt.x} ${pt.y}`;
            const prev = pts[i - 1];
            const cx = (prev.x + pt.x) / 2;
            return `C ${cx} ${prev.y} ${cx} ${pt.y} ${pt.x} ${pt.y}`;
        }).join(' ');

        const area = `${line} L 100 100 L 0 100 Z`;
        return { pathLine: line, pathArea: area, points: pts };
    }, [dataPoints]);

    // Hover handler
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || !points.length) return;
        const rect = svgRef.current.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const idx = Math.round(pct * (points.length - 1));
        setHoverIndex(Math.max(0, Math.min(idx, points.length - 1)));
    };

    const hoverPt = hoverIndex !== null ? points[hoverIndex] : null;
    const hoverPrice = hoverPt ? dataPoints[hoverIndex!] : null;

    const lineColor = isPositive ? '#22d3ee' : '#f87171';
    const glowColor = isPositive ? '#06b6d4' : '#ef4444';

    if (!mounted) return null;

    const ticker = symbol.split(':')[1]?.replace('USDT', '') || symbol.toUpperCase();

    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0b0c14] to-[#050508] overflow-hidden select-none">

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-4 pt-3 pb-2 shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-wider text-white">{ticker}</span>
                        {!loading && currentPrice && (
                            <span className="text-lg font-mono font-bold text-white">{formatPrice(currentPrice)}</span>
                        )}
                        {priceChange24h !== null && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-cyan-500/15 text-cyan-400' : 'bg-red-500/15 text-red-400'}`}>
                                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4 mt-0.5 text-[9px] font-mono text-gray-600">
                        {high && <span>H <b className="text-gray-400">{formatPrice(high)}</b></span>}
                        {low && <span>L <b className="text-gray-400">{formatPrice(low)}</b></span>}
                        {volume && <span>VOL <b className="text-gray-400">{volume}</b></span>}
                    </div>
                </div>

                {/* Interval Selector */}
                <div className="flex rounded-lg overflow-hidden border border-white/8 bg-white/3">
                    {(['1H', '4H', '1D', '1W'] as Interval[]).map(iv => (
                        <button
                            key={iv}
                            onClick={() => setInterval(iv)}
                            className={`px-2 py-1 text-[9px] font-bold transition-all ${interval === iv ? 'bg-cyan-600/80 text-white' : 'text-gray-600 hover:text-white'}`}
                        >{iv}</button>
                    ))}
                </div>
            </div>

            {/* ── Chart ── */}
            <div className="flex-1 relative min-h-0 px-2 pb-2">

                {/* Ambient glow */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ filter: 'blur(80px)', opacity: 0.15 }}
                >
                    <div className="w-full h-1/2 rounded-full" style={{ backgroundColor: glowColor }} />
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <motion.div key={i} className="w-1 rounded-full" style={{ backgroundColor: glowColor, height: 20 + Math.random() * 30 }}
                                    animate={{ scaleY: [1, 1.5, 1] }} transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* SVG Chart */}
                {!loading && dataPoints.length > 0 && (
                    <svg
                        ref={svgRef}
                        className="w-full h-full overflow-visible cursor-crosshair"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <defs>
                            <linearGradient id={`grad-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                            </linearGradient>
                            <filter id="lineGlow">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* Grid lines */}
                        {[20, 40, 60, 80].map(y => (
                            <line key={y} x1="0" y1={y} x2="100" y2={y}
                                stroke="white" strokeOpacity="0.04" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                        ))}

                        {/* Area fill */}
                        <motion.path
                            d={pathArea}
                            fill={`url(#grad-${ticker})`}
                            stroke="none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        />

                        {/* Line */}
                        <motion.path
                            d={pathLine}
                            fill="none"
                            stroke={lineColor}
                            strokeWidth="0.6"
                            vectorEffect="non-scaling-stroke"
                            filter="url(#lineGlow)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />

                        {/* Hover crosshair */}
                        {hoverPt && (
                            <>
                                <line x1={hoverPt.x} y1="0" x2={hoverPt.x} y2="100"
                                    stroke="white" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                                <circle cx={hoverPt.x} cy={hoverPt.y} r="1.5"
                                    fill={lineColor} stroke="white" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                            </>
                        )}

                        {/* Live dot on last point */}
                        {points.length > 0 && !hoverPt && (
                            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1.2"
                                fill={lineColor} opacity="0.9" vectorEffect="non-scaling-stroke">
                                <animate attributeName="r" values="1.2;2;1.2" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                    </svg>
                )}

                {/* Hover tooltip */}
                <AnimatePresence>
                    {hoverPrice && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white pointer-events-none z-10 whitespace-nowrap"
                        >
                            {formatPrice(hoverPrice)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
