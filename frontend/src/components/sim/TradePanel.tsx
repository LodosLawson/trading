'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Portfolio, SimPosition, SimTrade, TradeMode } from '../../lib/simulationService';

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50, 100];

interface TradePanelProps {
    portfolio: Portfolio;
    activeSymbol: string;
    userId: string;
    onTrade: (trade: Omit<SimTrade, 'id'>, position: Omit<SimPosition, 'id'>, portfolio: Partial<Portfolio>) => Promise<void>;
}

async function fetchCurrentPrice(symbol: string): Promise<number> {
    try {
        const coinMap: Record<string, string> = {
            'BTCUSDT': 'bitcoin', 'ETHUSDT': 'ethereum', 'SOLUSDT': 'solana',
            'XRPUSDT': 'ripple', 'DOGEUSDT': 'dogecoin', 'BNBUSDT': 'binancecoin',
            'ADAUSDT': 'cardano', 'AVAXUSDT': 'avalanche-2',
        };
        const raw = symbol.split(':')[1] || symbol;
        const coinId = coinMap[raw] || raw.replace('USDT', '').toLowerCase();
        const res = await fetch(`/api/crypto?per_page=100`);
        if (!res.ok) return 0;
        const coins: any[] = await res.json();
        const coin = coins.find(c => c.id === coinId);
        return coin?.current_price ?? 0;
    } catch { return 0; }
}

export default function TradePanel({ portfolio, activeSymbol, onTrade }: TradePanelProps) {
    const [mode, setMode] = useState<TradeMode>('SPOT');
    const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
    const [amount, setAmount] = useState('');
    const [leverage, setLeverage] = useState(1);
    const [sl, setSl] = useState('');
    const [tp, setTp] = useState('');
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [lastResult, setLastResult] = useState<{ msg: string; ok: boolean } | null>(null);

    const ticker = (activeSymbol.split(':')[1] || activeSymbol).replace('USDT', '');

    useEffect(() => {
        setCurrentPrice(null);
        fetchCurrentPrice(activeSymbol).then(setCurrentPrice);
        const iv = setInterval(() => fetchCurrentPrice(activeSymbol).then(setCurrentPrice), 30000);
        return () => clearInterval(iv);
    }, [activeSymbol]);

    const available = mode === 'SPOT' ? portfolio.spotBalance : portfolio.futuresBalance;
    const amountNum = parseFloat(amount) || 0;
    const qty = currentPrice && amountNum > 0 ? amountNum / currentPrice : 0;
    const positionSize = amountNum * (mode === 'FUTURES' ? leverage : 1);

    const handleTrade = async () => {
        if (!currentPrice || amountNum <= 0 || amountNum > available) return;
        setSubmitting(true);
        setLastResult(null);
        try {
            const posSide = side === 'BUY' ? 'LONG' : 'SHORT';
            const portfolioPatch: Partial<Portfolio> =
                mode === 'SPOT'
                    ? { spotBalance: portfolio.spotBalance - amountNum }
                    : { futuresBalance: portfolio.futuresBalance - amountNum / leverage };

            const trade: Omit<SimTrade, 'id'> = {
                symbol: ticker,
                side,
                qty,
                price: currentPrice,
                mode,
                leverage: mode === 'FUTURES' ? leverage : 1,
                openedAt: null,
            };

            const position: Omit<SimPosition, 'id'> = {
                symbol: ticker,
                side: posSide,
                qty,
                entryPrice: currentPrice,
                leverage: mode === 'FUTURES' ? leverage : 1,
                sl: sl ? parseFloat(sl) : null,
                tp: tp ? parseFloat(tp) : null,
                mode,
                openedAt: null,
            };

            await onTrade(trade, position, portfolioPatch);
            setAmount('');
            setSl(''); setTp('');
            setLastResult({ msg: `${side} ${qty.toFixed(6)} ${ticker} @ $${currentPrice.toFixed(2)}`, ok: true });
        } catch (e: any) {
            setLastResult({ msg: e.message || 'İşlem başarısız', ok: false });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4">

            {/* Mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-white/8 bg-white/3">
                {(['SPOT', 'FUTURES'] as TradeMode[]).map(m => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); if (m === 'SPOT') setLeverage(1); }}
                        className={`flex-1 py-2 text-xs font-bold transition-all ${mode === m ? m === 'SPOT' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >{m}</button>
                ))}
            </div>

            {/* Symbol & Price */}
            <div className="flex justif-between items-center gap-2 rounded-xl bg-white/3 border border-white/8 px-3 py-2.5">
                <div>
                    <div className="text-xs font-bold text-white">{ticker}/USDT</div>
                    <div className="text-[9px] text-gray-500">{mode}</div>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-sm font-mono font-bold text-white">
                        {currentPrice ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '…'}
                    </div>
                    <div className="text-[9px] text-gray-500">Anlık Fiyat</div>
                </div>
            </div>

            {/* Buy / Sell toggle */}
            <div className="flex rounded-xl overflow-hidden border border-white/8">
                <button
                    onClick={() => setSide('BUY')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all ${side === 'BUY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/3 text-gray-500 hover:text-emerald-400'}`}
                >▲ LONG / AL</button>
                <button
                    onClick={() => setSide('SELL')}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all ${side === 'SELL' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-white/3 text-gray-500 hover:text-red-400'}`}
                >▼ SHORT / SAT</button>
            </div>

            {/* Amount */}
            <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block flex justify-between">
                    <span>Miktar (USDT)</span>
                    <span className="text-gray-600">Bakiye: ${available.toFixed(2)}</span>
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-emerald-500/40 transition-colors">
                    <span className="text-gray-500 text-sm">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-white text-sm outline-none"
                        min="0"
                    />
                </div>
                {/* Quick % buttons */}
                <div className="flex gap-1 mt-1.5">
                    {[25, 50, 75, 100].map(pct => (
                        <button
                            key={pct}
                            onClick={() => setAmount((available * pct / 100).toFixed(2))}
                            className="flex-1 py-1 text-[9px] font-bold rounded-md bg-white/5 border border-white/8 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                        >{pct}%</button>
                    ))}
                </div>
            </div>

            {/* Leverage (futures only) */}
            {mode === 'FUTURES' && (
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">
                        Kaldıraç: <span className="text-purple-400 font-bold">{leverage}x</span>
                    </label>
                    <div className="flex gap-1 flex-wrap">
                        {LEVERAGE_OPTIONS.map(lv => (
                            <button
                                key={lv}
                                onClick={() => setLeverage(lv)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${leverage === lv ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/3 border-white/8 text-gray-500 hover:text-white'}`}
                            >{lv}x</button>
                        ))}
                    </div>
                </div>
            )}

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Stop Loss $</label>
                    <input
                        type="number"
                        value={sl}
                        onChange={e => setSl(e.target.value)}
                        placeholder="İsteğe bağlı"
                        className="w-full bg-white/5 border border-red-500/20 focus:border-red-500/50 rounded-lg px-2.5 py-2 text-xs text-white outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Take Profit $</label>
                    <input
                        type="number"
                        value={tp}
                        onChange={e => setTp(e.target.value)}
                        placeholder="İsteğe bağlı"
                        className="w-full bg-white/5 border border-emerald-500/20 focus:border-emerald-500/50 rounded-lg px-2.5 py-2 text-xs text-white outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Order summary */}
            {amountNum > 0 && currentPrice && (
                <div className="rounded-lg bg-white/3 border border-white/6 px-3 py-2 text-[10px] font-mono text-gray-500 space-y-0.5">
                    <div className="flex justify-between"><span>Miktar</span><span className="text-white">{qty.toFixed(6)} {ticker}</span></div>
                    {mode === 'FUTURES' && <div className="flex justify-between"><span>Pozisyon Büyüklüğü</span><span className="text-purple-400">${positionSize.toFixed(2)}</span></div>}
                    {sl && <div className="flex justify-between"><span>Stop Loss</span><span className="text-red-400">${parseFloat(sl).toFixed(2)}</span></div>}
                    {tp && <div className="flex justify-between"><span>Take Profit</span><span className="text-emerald-400">${parseFloat(tp).toFixed(2)}</span></div>}
                </div>
            )}

            {/* Result flash */}
            <AnimatePresence>
                {lastResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-[10px] px-3 py-2 rounded-lg border font-mono ${lastResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                    >{lastResult.ok ? '✓' : '✗'} {lastResult.msg}</motion.div>
                )}
            </AnimatePresence>

            {/* Execute button */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleTrade}
                disabled={submitting || !currentPrice || amountNum <= 0 || amountNum > available}
                className={`w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${side === 'BUY'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/20 hover:from-red-500 hover:to-rose-500'
                    } text-white`}
            >
                {submitting ? 'İşleniyor…' : `${side === 'BUY' ? '▲ AL (LONG)' : '▼ SAT (SHORT)'} ${ticker}`}
            </motion.button>
        </div>
    );
}
