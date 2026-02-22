'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimPosition } from '../../lib/simulationService';

interface PositionsListProps {
    positions: SimPosition[];
    onClose: (pos: SimPosition, currentPrice: number) => Promise<void>;
}

async function fetchPrice(symbol: string): Promise<number> {
    const coinMap: Record<string, string> = {
        'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana',
        'XRP': 'ripple', 'DOGE': 'dogecoin', 'BNB': 'binancecoin',
    };
    try {
        const id = coinMap[symbol.toUpperCase()] || symbol.toLowerCase();
        const res = await fetch(`/api/crypto?per_page=100`);
        if (!res.ok) return 0;
        const coins: any[] = await res.json();
        return coins.find(c => c.id === id)?.current_price ?? 0;
    } catch { return 0; }
}

export default function PositionsList({ positions, onClose }: PositionsListProps) {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [closing, setClosing] = useState<string | null>(null);

    useEffect(() => {
        const symbols = [...new Set(positions.map(p => p.symbol))];
        const fetch = async () => {
            const map: Record<string, number> = {};
            await Promise.all(symbols.map(async s => { map[s] = await fetchPrice(s); }));
            setPrices(map);
        };
        fetch();
        const iv = setInterval(fetch, 20000);
        return () => clearInterval(iv);
    }, [positions]);

    function calcPnl(pos: SimPosition, currentPrice: number): number {
        if (!currentPrice) return 0;
        const priceDiff = pos.side === 'LONG'
            ? currentPrice - pos.entryPrice
            : pos.entryPrice - currentPrice;
        return priceDiff * pos.qty * pos.leverage;
    }

    if (positions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-600">
                <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs">Açık pozisyon yok</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-4">
            <AnimatePresence>
                {positions.map(pos => {
                    const cp = prices[pos.symbol] ?? 0;
                    const pnl = calcPnl(pos, cp);
                    const isPos = pnl >= 0;
                    const entryVal = pos.qty * pos.entryPrice;
                    const pnlPct = entryVal ? (pnl / entryVal) * 100 * pos.leverage : 0;

                    return (
                        <motion.div
                            key={pos.id}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            className="rounded-2xl bg-white/3 border border-white/8 p-3"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${pos.side === 'LONG' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                        {pos.side}
                                    </span>
                                    <span className="text-sm font-bold text-white">{pos.symbol}</span>
                                    {pos.mode === 'FUTURES' && (
                                        <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{pos.leverage}x</span>
                                    )}
                                </div>
                                <button
                                    disabled={!!closing}
                                    onClick={async () => {
                                        setClosing(pos.id!);
                                        try { await onClose(pos, cp); } finally { setClosing(null); }
                                    }}
                                    className="text-[9px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all disabled:opacity-40"
                                >
                                    {closing === pos.id ? '…' : 'KAPAT'}
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                                <div>
                                    <div className="text-gray-600">Giriş</div>
                                    <div className="text-gray-300">${pos.entryPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600">Anlık</div>
                                    <div className="text-white">{cp ? `$${cp.toFixed(2)}` : '…'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-600">PnL</div>
                                    <div className={`font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isPos ? '+' : ''}${pnl.toFixed(2)}
                                        <span className="text-[8px] ml-0.5 opacity-70">({isPos ? '+' : ''}{pnlPct.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            </div>

                            {/* SL / TP indicators */}
                            {(pos.sl || pos.tp) && (
                                <div className="flex gap-3 mt-2 text-[9px] font-mono">
                                    {pos.sl && <span className="text-red-500/70">SL ${pos.sl.toFixed(2)}</span>}
                                    {pos.tp && <span className="text-emerald-500/70">TP ${pos.tp.toFixed(2)}</span>}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
