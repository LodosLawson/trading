'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SimSetupProps {
    onStart: (spotAmount: number, futuresAmount: number) => Promise<void>;
    loading?: boolean;
}

export default function SimSetup({ onStart, loading }: SimSetupProps) {
    const [spotAmount, setSpotAmount] = useState('10000');
    const [futuresAmount, setFuturesAmount] = useState('5000');
    const [starting, setStarting] = useState(false);

    const total = (parseFloat(spotAmount) || 0) + (parseFloat(futuresAmount) || 0);

    const handleStart = async () => {
        const spot = parseFloat(spotAmount);
        const futures = parseFloat(futuresAmount);
        if (isNaN(spot) || isNaN(futures) || spot + futures <= 0) return;
        setStarting(true);
        try {
            await onStart(spot, futures);
        } catch (e: any) {
            console.error(e);
            alert("Simülasyon başlatılamadı: " + (e.message || "Bilinmeyen hata"));
        } finally {
            setStarting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-6 p-6"
        >
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>

            <div className="text-center">
                <h2 className="text-xl font-black text-white">Trading Simulation</h2>
                <p className="text-xs text-gray-500 mt-1">Gerçek para riski yok. Tüm işlemler Firebase'e kaydedilir.</p>
            </div>

            <div className="w-full max-w-xs space-y-3">
                {/* Spot balance */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Spot Bakiye (USDT)</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/50 transition-colors">
                        <span className="text-sm text-gray-500">$</span>
                        <input
                            type="number"
                            value={spotAmount}
                            onChange={e => setSpotAmount(e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm outline-none"
                            min="0"
                        />
                    </div>
                </div>

                {/* Futures balance */}
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Futures Bakiye (USDT)</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-purple-500/50 transition-colors">
                        <span className="text-sm text-gray-500">$</span>
                        <input
                            type="number"
                            value={futuresAmount}
                            onChange={e => setFuturesAmount(e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm outline-none"
                            min="0"
                        />
                    </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-gray-600">Toplam Sermaye</span>
                    <span className="text-sm font-bold text-white">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Start button */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStart}
                    disabled={starting || loading || total <= 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {starting ? 'Başlatılıyor…' : '🚀 Simülasyonu Başlat'}
                </motion.button>
            </div>
        </motion.div>
    );
}
