'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Portfolio, SimPosition, SimTrade, WalletEntry,
    createPortfolio, listenPortfolio, updatePortfolio,
    openPosition, listenPositions, closePosition,
    recordTrade, listenTrades,
    addWallet, removeWallet, listenWallets,
    saveSnapshot,
} from '../../lib/simulationService';

import SimSetup from '../sim/SimSetup';
import PortfolioOverview from '../sim/PortfolioOverview';
import TradePanel from '../sim/TradePanel';
import PositionsList from '../sim/PositionsList';
import PnlChart from '../sim/PnlChart';
import WalletTracker from '../sim/WalletTracker';

type Tab = 'sim' | 'positions' | 'history' | 'pnl' | 'wallet';

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'sim', label: 'Sim', icon: '◈' },
    { id: 'positions', label: 'Pozisyon', icon: '◉' },
    { id: 'history', label: 'Geçmiş', icon: '◷' },
    { id: 'pnl', label: 'PnL', icon: '◊' },
    { id: 'wallet', label: 'Cüzdan', icon: '◫' },
];

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface TradingWidgetProps {
    activeSymbol?: string;
    onSymbolChange?: (sym: string) => void;
    userId: string;
}

// ─── Outer Guard: no hooks here, just a prop check ───────────────────────────
export default function TradingWidget(props: TradingWidgetProps) {
    // userId '' = not logged in (terminal page passes user?.uid || '')
    if (!props.userId) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <div className="text-4xl">🔐</div>
                <div className="text-sm font-bold text-white">Giriş Gerekli</div>
                <div className="text-xs text-gray-500">Trading simülasyonunu kullanmak için hesabınıza giriş yapın.</div>
            </div>
        );
    }
    return <TradingWidgetInner {...props} />;
}

// ─── Inner Component: all hooks here, userId always a non-empty string ────────
function TradingWidgetInner({ activeSymbol = 'BINANCE:BTCUSDT', onSymbolChange, userId }: TradingWidgetProps) {
    const [tab, setTab] = useState<Tab>('sim');
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [positions, setPositions] = useState<SimPosition[]>([]);
    const [trades, setTrades] = useState<SimTrade[]>([]);
    const [wallets, setWallets] = useState<WalletEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const snapshotDone = useRef(false);

    // ── Firebase real-time listeners ──────────────────────────────────────────
    useEffect(() => {
        const unsubs = [
            listenPortfolio(userId, p => { setPortfolio(p); setLoading(false); }),
            listenPositions(userId, setPositions),
            listenTrades(userId, setTrades),
            listenWallets(userId, setWallets),
        ];
        return () => unsubs.forEach(u => u());
    }, [userId]);

    // Daily snapshot — save once per day when portfolio loads
    useEffect(() => {
        if (!portfolio || snapshotDone.current) return;
        const today = new Date().toISOString().split('T')[0];
        const totalValue = portfolio.spotBalance + portfolio.futuresBalance;
        const pnl = totalValue - portfolio.startBalance;
        saveSnapshot(userId, { date: today, spotBalance: portfolio.spotBalance, futuresBalance: portfolio.futuresBalance, totalValue, pnl });
        snapshotDone.current = true;
    }, [portfolio, userId]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleStartSim = async (spotAmount: number, futuresAmount: number) => {
        await createPortfolio(userId, spotAmount, futuresAmount);
    };

    const handleTrade = async (
        trade: Omit<SimTrade, 'id'>,
        position: Omit<SimPosition, 'id'>,
        portfolioPatch: Partial<Portfolio>
    ) => {
        await Promise.all([
            recordTrade(userId, trade),
            openPosition(userId, position),
            updatePortfolio(userId, portfolioPatch),
        ]);
        setTab('positions');
    };

    const handleClosePosition = async (pos: SimPosition, currentPrice: number) => {
        if (!portfolio) return;
        const priceDiff = pos.side === 'LONG' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
        const pnl = priceDiff * pos.qty * pos.leverage;
        const returnedMargin = (pos.entryPrice * pos.qty) / pos.leverage;
        const totalReturn = returnedMargin + pnl;

        const portfolioPatch: Partial<Portfolio> =
            pos.mode === 'SPOT'
                ? { spotBalance: portfolio.spotBalance + totalReturn }
                : { futuresBalance: portfolio.futuresBalance + totalReturn };

        await Promise.all([
            closePosition(userId, pos.id!),
            recordTrade(userId, {
                symbol: pos.symbol,
                side: pos.side === 'LONG' ? 'SELL' : 'BUY',
                qty: pos.qty,
                price: currentPrice,
                mode: pos.mode,
                pnl,
                closedAt: null,
                openedAt: null,
                positionId: pos.id,
                leverage: pos.leverage,
            }),
            updatePortfolio(userId, portfolioPatch),
        ]);
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            </div>
        );
    }

    // ── First time setup ──────────────────────────────────────────────────────
    if (!portfolio) {
        return <SimSetup onStart={handleStartSim} />;
    }

    // ── Main widget ───────────────────────────────────────────────────────────
    const totalBalance = portfolio.spotBalance + portfolio.futuresBalance;
    const totalPnl = totalBalance - portfolio.startBalance;
    const isPos = totalPnl >= 0;

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0f] overflow-hidden">

            {/* Mini header */}
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest">Paper Trading</div>
                        <div className="text-sm font-black text-white">${fmt(totalBalance)}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPos ? '▲' : '▼'} ${Math.abs(totalPnl).toFixed(2)}
                    </div>
                </div>
                <div className="flex justify-end mt-1">
                    <button
                        onClick={async () => {
                            if (!confirm('Simülasyonu sıfırlamak istediğinize emin misiniz?')) return;
                            await createPortfolio(userId, portfolio.initialSpot, portfolio.initialFutures);
                        }}
                        className="text-[8px] text-gray-700 hover:text-red-500 transition-colors"
                    >⟳ Sıfırla</button>
                </div>
            </div>

            {/* Tab bar */}
            <div className="shrink-0 flex border-b border-white/5 overflow-x-auto scrollbar-none">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 min-w-0 flex flex-col items-center py-2 px-1 text-center transition-all relative ${tab === t.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        <span className="text-xs">{t.icon}</span>
                        <span className="text-[8px] font-bold mt-0.5 leading-none">{t.label}</span>
                        {tab === t.id && (
                            <motion.div layoutId="trading-tab-ind" className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full" />
                        )}
                        {t.id === 'positions' && positions.length > 0 && (
                            <span className="absolute top-1.5 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[7px] font-bold flex items-center justify-center">
                                {positions.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                    >
                        {tab === 'sim' && (
                            <>
                                <PortfolioOverview portfolio={portfolio} positions={positions} trades={trades} />
                                <div className="border-t border-white/5" />
                                <TradePanel portfolio={portfolio} activeSymbol={activeSymbol} userId={userId} onTrade={handleTrade} />
                            </>
                        )}
                        {tab === 'positions' && <PositionsList positions={positions} onClose={handleClosePosition} />}
                        {tab === 'history' && (
                            <div className="flex flex-col gap-1.5 p-4">
                                {trades.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-600">
                                        <span className="text-3xl opacity-30">◷</span>
                                        <span className="text-xs">İşlem geçmişi burada görünür</span>
                                    </div>
                                ) : trades.map((t: SimTrade) => {
                                    const isB = t.side === 'BUY';
                                    return (
                                        <div key={t.id} className="flex items-center gap-3 rounded-xl bg-white/3 border border-white/6 px-3 py-2.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isB ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                                {t.side}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-white">{t.symbol}</div>
                                                <div className="text-[9px] text-gray-600 font-mono">{t.qty?.toFixed(6)} @ ${t.price?.toFixed(2)} · {t.mode}</div>
                                            </div>
                                            {t.pnl != null && (
                                                <span className={`text-xs font-mono font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {tab === 'pnl' && <PnlChart userId={userId} startBalance={portfolio.startBalance} />}
                        {tab === 'wallet' && (
                            <WalletTracker
                                wallets={wallets}
                                onAdd={async w => { await addWallet(userId, w); }}
                                onRemove={id => removeWallet(userId, id)}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
