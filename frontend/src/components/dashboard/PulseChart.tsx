'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PulseChartProps {
    symbol: string;
}

export default function PulseChart({ symbol }: PulseChartProps) {
    // Generate some mock data for the visual
    const [dataPoints, setDataPoints] = useState<number[]>([]);

    useEffect(() => {
        // Reset and generate new data when symbol changes
        const generateData = () => {
            return Array.from({ length: 20 }, () => Math.random() * 100);
        };
        setDataPoints(generateData());

        // Simulate live updates
        const interval = setInterval(() => {
            setDataPoints(prev => [...prev.slice(1), Math.random() * 100]);
        }, 800);

        return () => clearInterval(interval);
    }, [symbol]);

    return (
        <div className="w-full h-full bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden p-6">

            {/* Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
            </div>

            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-xl font-thin text-white tracking-widest">{symbol.split(':')[1]?.replace('USDT', '') || symbol}</h3>
                <span className="text-[10px] text-blue-400 font-mono uppercase">Market Pulse Engine Active</span>
            </div>

            {/* The Pulse Visualization - Bars */}
            <div className="flex items-end justify-center w-full h-64 gap-1 z-10">
                {dataPoints.map((point, i) => (
                    <motion.div
                        key={i}
                        layout
                        initial={{ height: 0 }}
                        animate={{
                            height: `${point}%`,
                            backgroundColor: point > 50 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-full max-w-[40px] rounded-t-sm"
                    />
                ))}
            </div>

            {/* Overlay Trend Line (Bezier) */}
            <div className="absolute inset-x-6 bottom-10 h-64 pointer-events-none opacity-50">
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <motion.path
                        d={`M 0 ${100 - dataPoints[0]} ` + dataPoints.map((p, i) => `L ${(i / (dataPoints.length - 1)) * 100}% ${100 - p}`).join(' ')}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-4 text-[10px] text-gray-500 font-mono">
                <span>VOL: HIGH</span>
                <span>MOMENTUM: BULLISH</span>
                <span>RSI: 64.2</span>
            </div>
        </div>
    );
}
