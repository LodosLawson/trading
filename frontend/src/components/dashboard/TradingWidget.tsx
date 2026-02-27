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
import ChartWidget from './ChartWidget'; // Import TV Chart

type Tab = 'sim' | 'positions' | 'history' | 'pnl' | 'wallet' | 'tv' | 'mt';

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'sim', label: 'Sim', icon: '◈' },
    { id: 'tv', label: 'TV Grafik', icon: '📊' },
    { id: 'mt', label: 'MetaTrader', icon: '⚡' },
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
    authLoading?: boolean;
}

import { auth } from '@/lib/firebase';

// ─── Outer Guard: no hooks here, just a prop check ───────────────────────────
export default function TradingWidget(props: TradingWidgetProps) {
    // 1. If we are currently checking auth state with Firebase, show loading
    if (props.authLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 bg-[#0a0a0f] text-center">
                <motion.div
                    className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="text-[10px] text-emerald-500/70 tracking-widest uppercase font-mono animate-pulse">Kimlik Doğrulanıyor...</div>
            </div>
        );
    }

    // Direct fallback: If no React Context user, and no direct Firebase user, we fallback to 'guest'.
    // This allows the user to immediately track wallets and play the simulation without logging in.
    let actualUserId = props.userId || auth?.currentUser?.uid || 'guest';

    // In rare cases where props.userId is literally an empty string from TerminalPage, force it to 'guest'
    if (actualUserId === '') {
        actualUserId = 'guest';
    }

    // 3. User is authorized (or playing as guest)
    return <TradingWidgetInner {...props} userId={actualUserId} />;
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

    // MetaTrader Mock State
    const [mtStatus, setMtStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
    const [mtAccounts, setMtAccounts] = useState({ broker: 'IC Markets - Live 15', login: '' });
    const [mtTrades, setMtTrades] = useState<{ id: string; symbol: string; side: string; qty: number; pnl: number }[]>([]);

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
        const lastSnapDate = localStorage.getItem(`latest_sim_snap_${userId}`);

        // If we already saved for today, just skip.
        if (lastSnapDate === today) {
            snapshotDone.current = true;
            return;
        }

        const totalValue = portfolio.spotBalance + portfolio.futuresBalance;
        const pnl = totalValue - portfolio.startBalance;

        saveSnapshot(userId, { date: today, spotBalance: portfolio.spotBalance, futuresBalance: portfolio.futuresBalance, totalValue, pnl })
            .then(() => {
                localStorage.setItem(`latest_sim_snap_${userId}`, today);
            })
            .catch(err => console.error("Failed to save snapshot:", err));

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

    // MT Connection Form Handler
    const handleMtConnect = (e: React.FormEvent) => {
        e.preventDefault();
        setMtStatus('connecting');
        setTimeout(() => {
            setMtStatus('connected');
            // Mock active MT5 trades
            setMtTrades([
                { id: 'mt1', symbol: 'BINANCE:BTCUSDT', side: 'LONG', qty: 0.5, pnl: 450.25 },
                { id: 'mt2', symbol: 'BINANCE:ETHUSDT', side: 'SHORT', qty: 2.0, pnl: -120.50 },
            ]);
        }, 2000);
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
                        {tab === 'tv' && (
                            <div className="relative w-full h-[600px] min-h-[400px]">
                                <ChartWidget symbol={activeSymbol} onSymbolChange={onSymbolChange} />
                                {/* MOCK MT TRADES OVERLAY */}
                                {mtStatus === 'connected' && mtTrades.length > 0 && (
                                    <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest text-right mb-1">
                                            Active MT Trades
                                        </div>
                                        {mtTrades.map(trade => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={trade.id}
                                                className="pointer-events-auto bg-[#0a0a0f]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl flex items-center justify-between gap-6 hover:border-white/20 transition-colors"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${trade.side === 'LONG' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        <span className="text-sm font-bold text-white">{trade.symbol.split(':')[1] || trade.symbol}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                                                        {trade.qty.toFixed(2)} LOT • {trade.side}
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {tab === 'mt' && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full max-w-sm bg-white/3 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />

                                    <div className="text-center mb-8">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-white mb-1">MetaTrader Connect</h3>
                                        <p className="text-xs text-gray-500">Sync your MT4/MT5 account live.</p>
                                    </div>

                                    {mtStatus === 'idle' && (
                                        <form onSubmit={handleMtConnect} className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Broker / Server</label>
                                                <input required type="text" placeholder="e.g. ICMarkets-Live15" value={mtAccounts.broker} onChange={e => setMtAccounts({ ...mtAccounts, broker: e.target.value })} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Login ID</label>
                                                <input required type="number" placeholder="Account Number" value={mtAccounts.login} onChange={e => setMtAccounts({ ...mtAccounts, login: e.target.value })} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Password</label>
                                                <input required type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-700" />
                                            </div>

                                            <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                                                Bağlan
                                            </button>
                                        </form>
                                    )}

                                    {mtStatus === 'connecting' && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="relative w-16 h-16 mb-4">
                                                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                                                <motion.div className="absolute inset-0 rounded-full border-2 border-t-blue-500" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                            </div>
                                            <div className="text-xs font-mono text-blue-400 tracking-widest uppercase animate-pulse">Terminale Bağlanıyor...</div>
                                        </div>
                                    )}

                                    {mtStatus === 'connected' && (
                                        <div className="flex flex-col items-center justify-center text-center py-8">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                                ✓
                                            </motion.div>
                                            <h3 className="text-white font-bold text-lg mb-1">{mtAccounts.broker}</h3>
                                            <div className="text-xs text-gray-500 font-mono mb-6">Account: {mtAccounts.login}</div>
                                            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                                <div className="text-[10px] text-emerald-500/70 uppercase tracking-widest mb-1">Bağlantı Durumu</div>
                                                <div className="text-emerald-400 font-bold text-sm">Aktif & Senkronize</div>
                                            </div>
                                            <button onClick={() => setMtStatus('idle')} className="mt-6 text-xs text-gray-500 hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
                                                Bağlantıyı Kes
                                            </button>
                                        </div>
                                    )}

                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
