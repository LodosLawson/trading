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
    useEffect(() => {
        const savedBalance = localStorage.getItem('demo_balance_v2');
        const savedPortfolio = localStorage.getItem('demo_portfolio_v2');
        if (savedBalance) setBalance(parseFloat(savedBalance));
        if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    }, []);

    useEffect(() => {
        localStorage.setItem('demo_balance_v2', balance.toString());
        localStorage.setItem('demo_portfolio_v2', JSON.stringify(portfolio));
    }, [balance, portfolio]);

    // Fetch price
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Simplified price fetch - ideally use websocket or prop
                const res = await fetch(`/api/search?q=${baseAsset}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    const id = data[0].id;
                    const priceRes = await fetch(`/api/chart?id=${id}&days=1&type=line`);
                    const priceData = await priceRes.json();
                    if (priceData.prices && priceData.prices.length > 0) {
                        const current = priceData.prices[priceData.prices.length - 1][1];
                        setPrice(current);
                        if (!limitPrice) setLimitPrice(current.toString());
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 5000); // Faster polling for "Pro" feel
        return () => clearInterval(interval);
    }, [baseAsset]);

    const handlePercentage = (pct: number) => {
        if (price <= 0) return;
        if (side === 'buy') {
            const maxBuy = (balance * pct) / price;
            setAmount(maxBuy.toFixed(6));
        } else {
            const owned = portfolio[baseAsset]?.quantity || 0;
            setAmount((owned * pct).toFixed(6));
        }
    };

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
            {/* Pro Header */}
            <div className="shrink-0 p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-200">SPOT</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 font-mono">Demo</span>
                </div>
                <div className="flex gap-4 text-[10px] font-mono text-gray-400">
                    <div>
                        <span className="block text-gray-600">Avbl</span>
                        <span className="text-white">{balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span>
                    </div>
                </div>
            </div>

            {/* Order Type Tabs */}
            <div className="flex border-b border-white/5 bg-[#1a1a20]">
                {['market', 'limit'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setOrderType(t as any)}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors ${orderType === t ? 'text-amber-500 border-b-2 border-amber-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'
                            }`}
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

                {/* Order Summary & PnL */}
                <div className="mt-auto space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Est. Total</span>
                        <span className="text-white font-mono">
                            ${(parseFloat(amount || '0') * (parseFloat(limitPrice) || price)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    {assetData && (
                        <div className="flex justify-between text-[10px]">
                            <span className="text-gray-500">Unrealized PnL</span>
                            <span className={`font-mono ${pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                            </span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleTrade}
                    disabled={loading || price <= 0}
                    className={`w-full py-3 rounded-lg font-bold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
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
        </div>
    );
}
