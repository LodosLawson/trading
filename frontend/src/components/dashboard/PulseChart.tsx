'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface PulseChartProps {
    symbol: string;
}

export default function PulseChart({ symbol }: PulseChartProps) {
    const [dataPoints, setDataPoints] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Helper to map trading symbols to CoinGecko IDs
    const mapSymbolToID = (sym: string) => {
        const s = sym.split(':')[1]?.replace('USDT', '').toLowerCase() || sym.toLowerCase();
        const map: Record<string, string> = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'sol': 'solana',
            'xrp': 'ripple',
            'doge': 'dogecoin',
            'ada': 'cardano',
            'dot': 'polkadot',
            'matic': 'matic-network'
        };
        return map[s] || s; // fallback to symbol name (might work for some)
    };

    useEffect(() => {
        setMounted(true);

        const fetchData = async () => {
            setLoading(true);
            try {
                const coinId = mapSymbolToID(symbol);
                const res = await fetch(`/api/history/${coinId}?days=1`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        // Downsample if too many points (keep ~50 for smoothness)
                        const downsampled = data.filter((_, i) => i % Math.ceil(data.length / 50) === 0);
                        setDataPoints(downsampled);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch pulse data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Poll every minute for real updates
        const poll = setInterval(fetchData, 60000);

        // Animation loop for "breathing" effect on the *last* point only
        const animInterval = setInterval(() => {
            setDataPoints(prev => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                // Micro-movements on the last point to keep it alive
                const noise = (Math.random() - 0.5) * (last * 0.002);
                return [...prev.slice(0, -1), last + noise];
            });
        }, 100);

        return () => {
            clearInterval(poll);
            clearInterval(animInterval);
        };
    }, [symbol]);

    // Construct SVG Path
    const pathD = useMemo(() => {
        if (dataPoints.length === 0) return '';

        const max = Math.max(...dataPoints);
        const min = Math.min(...dataPoints);
        const range = max - min || 1;

        return dataPoints.map((p, i) => {
            const x = (i / (dataPoints.length - 1)) * 100;
            // Normalize to 0-100
            const normalized = ((p - min) / range) * 80 + 10; // keep 10% padding top/bottom
            const y = 100 - normalized;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    }, [dataPoints]);

    if (!mounted) return null;

    return (
        <div className="w-full h-full bg-gradient-to-b from-[#0f1115] to-[#050507] flex flex-col items-center justify-center relative overflow-hidden group">

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[120%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow" />
            </div>

            {/* Header Info */}
            <div className="absolute top-6 left-6 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <h2 className="text-2xl font-thin tracking-widest text-white">{symbol.split(':')[1]?.replace('USDT', '') || symbol}</h2>
                </div>
                <div className="text-[10px] font-mono text-blue-400 mt-1 uppercase tracking-[0.2em] opacity-80">
                    Market Sentiment Engine // <span className="text-white">LIVE</span>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="absolute inset-0 z-10 p-8 flex items-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Fill Area */}
                    <motion.path
                        d={`${pathD} L 100 100 L 0 100 Z`}
                        fill="url(#pulseGradient)"
                        stroke="none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Stroke Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="0.5"
                        vectorEffect="non-scaling-stroke"
                        filter="url(#glow)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
            </div>

            {/* Futuristic Grid/Overlay */}
            <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-[0.05]" />
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 z-20 font-mono text-[9px] text-gray-500">
                <div className="flex gap-4">
                    <span>VOL <b className="text-white">HIGH</b></span>
                    <span>24H <b className="text-green-400">+4.2%</b></span>
                </div>
                <div className="w-32 h-0.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div className="w-[70%] h-full bg-blue-500 rounded-full animate-pulse" />
                </div>
            </div>

        </div>
    );
}
