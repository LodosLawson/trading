'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
    quantity: number;
    avgPrice: number;
}

interface Portfolio {
    [symbol: string]: PortfolioItem;
}

interface TradingPanelProps {
    symbol: string; // e.g., "BINANCE:BTCUSDT"
}

export default function TradingPanel({ symbol }: TradingPanelProps) {
    const [balance, setBalance] = useState(100000); // Default $100k demo
    const [portfolio, setPortfolio] = useState<Portfolio>({});
    const [amount, setAmount] = useState('');
    const [orderType, setOrderType] = useState<'limit' | 'market'>('market');
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [limitPrice, setLimitPrice] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Parse symbol to get base asset name (e.g. BTC from BINANCE:BTCUSDT)
    const baseAsset = symbol.split(':')[1]?.replace('USDT', '') || 'ASSET';

    // Persist/Load state
    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'trade' | 'history'>('trade');

    // Persist/Load state
    useEffect(() => {
        const savedBalance = localStorage.getItem('demo_balance_v2');
        const savedPortfolio = localStorage.getItem('demo_portfolio_v2');
        const savedHistory = localStorage.getItem('demo_trade_history_v1');

        if (savedBalance) setBalance(parseFloat(savedBalance));
        if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    useEffect(() => {
        localStorage.setItem('demo_balance_v2', balance.toString());
        localStorage.setItem('demo_portfolio_v2', JSON.stringify(portfolio));
        localStorage.setItem('demo_trade_history_v1', JSON.stringify(history));
    }, [balance, portfolio, history]);

    // ... (keep fetchPrice effect)

    // ... (keep handlePercentage)

    const handleTrade = () => {
        const qty = parseFloat(amount);
        const execPrice = orderType === 'limit' && parseFloat(limitPrice) > 0 ? parseFloat(limitPrice) : price;

        if (isNaN(qty) || qty <= 0) {
            setNotification({ msg: 'Invalid quantity', type: 'error' });
            return;
        }
        if (execPrice <= 0) {
            setNotification({ msg: 'Invalid price', type: 'error' });
            return;
        }

        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            const newTrade = {
                id: Date.now(),
                symbol: baseAsset,
                side,
                amount: qty,
                price: execPrice,
                total: qty * execPrice,
                date: new Date().toISOString(),
                type: orderType
            };

            if (side === 'buy') {
                const totalCost = qty * execPrice;
                if (totalCost > balance) {
                    setNotification({ msg: 'Insufficient funds', type: 'error' });
                } else {
                    setBalance(prev => prev - totalCost);
                    setPortfolio(prev => {
                        const current = prev[baseAsset] || { quantity: 0, avgPrice: 0 };
                        const newQty = current.quantity + qty;
                        const newAvg = ((current.quantity * current.avgPrice) + (qty * execPrice)) / newQty;
                        return { ...prev, [baseAsset]: { quantity: newQty, avgPrice: newAvg } };
                    });
                    setHistory(prev => [newTrade, ...prev]);
                    setNotification({ msg: `Bought ${qty} ${baseAsset} @ ${execPrice.toFixed(2)}`, type: 'success' });
                    setAmount('');
                }
            } else {
                // Sell
                const current = portfolio[baseAsset] || { quantity: 0, avgPrice: 0 };
                if (qty > current.quantity) {
                    setNotification({ msg: `Insufficient ${baseAsset}`, type: 'error' });
                } else {
                    const revenue = qty * execPrice;
                    setBalance(prev => prev + revenue);
                    setPortfolio(prev => {
                        const newQty = current.quantity - qty;
                        if (newQty <= 0.000001) {
                            const newP = { ...prev };
                            delete newP[baseAsset];
                            return newP;
                        }
                        return { ...prev, [baseAsset]: { ...current, quantity: newQty } };
                    });
                    setHistory(prev => [newTrade, ...prev]);
                    setNotification({ msg: `Sold ${qty} ${baseAsset} @ ${execPrice.toFixed(2)}`, type: 'success' });
                    setAmount('');
                }
            }
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }, 600);
    };

    // Calculate PnL
    const assetData = portfolio[baseAsset];
    const pnl = assetData ? (price - assetData.avgPrice) * assetData.quantity : 0;
    const pnlPct = assetData ? ((price - assetData.avgPrice) / assetData.avgPrice) * 100 : 0;

    return (
        <div className="h-full bg-[#121218] border border-white/5 rounded-xl overflow-hidden flex flex-col relative font-sans">
            {/* Pro Header with Tabs */}
            <div className="shrink-0 flex items-center bg-[#0a0a0f] border-b border-white/5">
                <button
                    onClick={() => setActiveTab('trade')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'trade' ? 'border-amber-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Trade
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'history' ? 'border-amber-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    History
                </button>
            </div>

            {/* Balance Bar */}
            <div className="shrink-0 px-4 py-2 bg-[#121218] border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-mono">BAL</span>
                    <span className="text-xs font-bold text-white tracking-wide">{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-gray-600">USDT</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-amber-500/80 font-mono border border-amber-500/10">Simulated</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode='wait'>
                    {activeTab === 'trade' ? (
                        <motion.div
                            key="trade"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            {/* Order Type Tabs */}
                            <div className="flex border-b border-white/5 bg-[#1a1a20]">
                                {['market', 'limit'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setOrderType(t as any)}
                                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${orderType === t ? 'text-amber-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>


                            {/* Main Form */}
                            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">

                                {/* Side Toggle */}
                                <div className="flex bg-black/40 p-1 rounded-lg">
                                    <button
                                        onClick={() => setSide('buy')}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${side === 'buy' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => setSide('sell')}
                                        className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${side === 'sell' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Sell
                                    </button>
                                </div>

                                {/* Price Input (Limit only) */}
                                <AnimatePresence>
                                    {orderType === 'limit' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <label className="text-[9px] uppercase text-gray-500 font-bold mb-1 block">Limit Price</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={limitPrice}
                                                    onChange={(e) => setLimitPrice(e.target.value)}
                                                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-right text-sm text-white font-mono focus:border-amber-500/50 outline-none transition-colors"
                                                />
                                                <span className="absolute left-3 top-2 text-xs text-gray-600">USDT</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Amount Input */}
                                <div>
                                    <label className="flex justify-between text-[9px] uppercase text-gray-500 font-bold mb-1">
                                        <span>Amount</span>
                                        <span>{baseAsset}</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-right text-sm text-white font-mono focus:border-amber-500/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Percentage Buttons */}
                                <div className="grid grid-cols-4 gap-1">
                                    {[0.25, 0.50, 0.75, 1].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePercentage(p)}
                                            className="bg-white/5 hover:bg-white/10 border border-white/5 rounded py-1 text-[9px] text-gray-400 font-mono transition-colors"
                                        >
                                            {p * 100}%
                                        </button>
                                    ))}
                                </div>

                            </div>

                            {/* Order Summary & PnL */}
                            <div className="mt-auto space-y-3 p-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500">Est. Total</span>
                                        <span className="font-mono text-white">
                                            {((parseFloat(amount) || 0) * (orderType === 'limit' && parseFloat(limitPrice) > 0 ? parseFloat(limitPrice) : price)).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
                                        </span>
                                    </div>
                                    {assetData && (
                                        <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-1 mt-1">
                                            <span className="text-gray-500">Unrealized PnL</span>
                                            <span className={`font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleTrade}
                                    disabled={loading || price <= 0}
                                    className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg transform transition-all active:scale-[0.98] ${side === 'buy'
                                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-900/20'
                                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-900/20'
                                        }`}
                                >
                                    {loading ? 'Executing...' : `${side.toUpperCase()} ${baseAsset}`}
                                </button>
                            </div>

                            {/* Notification */}
                            <AnimatePresence>
                                {notification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className={`absolute bottom-4 left-4 right-4 p-2 rounded text-center text-[10px] font-bold uppercase tracking-wider ${notification.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                                            }`}
                                    >
                                        {notification.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full overflow-y-auto custom-scrollbar p-2"
                        >
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                                    <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-[10px] font-mono uppercase tracking-widest">No Trade History</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map((trade) => (
                                        <div key={trade.id} className="p-2 rounded bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:bg-white/[0.05] transition-colors">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-bold uppercase px-1 rounded ${trade.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {trade.side}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-300">{trade.symbol}</span>
                                                </div>
                                                <span className="text-[9px] text-gray-500 font-mono">{new Date(trade.date).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[10px] font-mono text-white">{trade.amount} @ {trade.price.toLocaleString()}</span>
                                                <span className="text-[9px] text-gray-500 font-mono">Total: {trade.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg border flex items-center justify-center text-xs font-bold shadow-2xl z-20 ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' : 'bg-red-950/90 border-red-500/30 text-red-400'
                            }`}
                    >
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[10px] uppercase font-bold text-blue-500 animate-pulse">Executing</span>
                    </div>
                </div>
            )}
        </div>
    );
}
