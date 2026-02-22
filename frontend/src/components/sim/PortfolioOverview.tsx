'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Portfolio } from '../../lib/simulationService';

interface PortfolioOverviewProps {
    portfolio: Portfolio;
    positions: any[];
    trades: any[];
}

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pnlPct(current: number, initial: number) {
    if (!initial) return 0;
    return ((current - initial) / initial) * 100;
}

export default function PortfolioOverview({ portfolio, positions, trades }: PortfolioOverviewProps) {
    const totalBalance = portfolio.spotBalance + portfolio.futuresBalance;
    const totalStart = portfolio.startBalance;
    const totalPnl = totalBalance - totalStart;
    const totalPnlPct = pnlPct(totalBalance, totalStart);
    const isPos = totalPnl >= 0;

    const spotPnlPct = pnlPct(portfolio.spotBalance, portfolio.initialSpot);
    const futPnlPct = pnlPct(portfolio.futuresBalance, portfolio.initialFutures);

    const unrealizedPnl = positions.reduce((acc, pos) => acc + (pos._currentPnl ?? 0), 0);

    return (
        <div className="flex flex-col gap-3 p-4">

            {/* Total balance hero */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-br from-white/5 to-white/2 border border-white/8 p-4"
            >
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Toplam Portföy</div>
                <div className="text-3xl font-black text-white">${fmt(totalBalance)}</div>
                <div className={`flex items-center gap-2 mt-1 text-sm font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span>{isPos ? '▲' : '▼'} ${Math.abs(totalPnl).toFixed(2)}</span>
                    <span className="text-xs font-medium opacity-70">({isPos ? '+' : ''}{totalPnlPct.toFixed(2)}%)</span>
                </div>
                {unrealizedPnl !== 0 && (
                    <div className="mt-1 text-[10px] text-gray-500">
                        Gerçekleşmemiş PnL: <span className={unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>${unrealizedPnl.toFixed(2)}</span>
                    </div>
                )}
            </motion.div>

            {/* Spot / Futures cards */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Spot', balance: portfolio.spotBalance, initial: portfolio.initialSpot, color: 'emerald', icon: '◈' },
                    { label: 'Futures', balance: portfolio.futuresBalance, initial: portfolio.initialFutures, color: 'purple', icon: '◉' },
                ].map(({ label, balance, initial, color, icon }) => {
                    const pct = pnlPct(balance, initial);
                    const pos = pct >= 0;
                    return (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl bg-white/3 border border-white/8 p-3"
                        >
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className={`text-${color}-400 text-sm`}>{icon}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{label}</span>
                            </div>
                            <div className="text-lg font-bold text-white">${fmt(balance)}</div>
                            <div className={`text-xs font-bold mt-0.5 ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                                {pos ? '+' : ''}{pct.toFixed(2)}%
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Toplam İşlem', value: trades.length.toString() },
                    { label: 'Açık Pozisyon', value: positions.length.toString() },
                    { label: 'Başlangıç', value: `$${fmt(totalStart)}` },
                ].map(s => (
                    <div key={s.label} className="rounded-xl bg-white/2 border border-white/5 p-2.5 text-center">
                        <div className="text-base font-bold text-white">{s.value}</div>
                        <div className="text-[9px] text-gray-600 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
