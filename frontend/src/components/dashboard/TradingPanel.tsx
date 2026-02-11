'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Portfolio {
    [symbol: string]: number; // Quantity
}

interface TradingPanelProps {
    symbol: string; // e.g., "BINANCE:BTCUSDT"
    currentPrice?: number; // Optional, if we can pass it. If not, we might need to fetch it or simulate it.
}

export default function TradingPanel({ symbol }: TradingPanelProps) {
    const [balance, setBalance] = useState(100000); // Default $100k demo
    const [portfolio, setPortfolio] = useState<Portfolio>({});
    const [amount, setAmount] = useState('');
    const [mode, setMode] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Parse symbol to get base asset name (e.g. BTC from BINANCE:BTCUSDT)
    const baseAsset = symbol.split(':')[1]?.replace('USDT', '') || 'ASSET';

    // Persist/Load state
    useEffect(() => {
        const savedBalance = localStorage.getItem('demo_balance');
        const savedPortfolio = localStorage.getItem('demo_portfolio');
        if (savedBalance) setBalance(parseFloat(savedBalance));
        if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    }, []);

    useEffect(() => {
        localStorage.setItem('demo_balance', balance.toString());
        localStorage.setItem('demo_portfolio', JSON.stringify(portfolio));
    }, [balance, portfolio]);

    // Fetch price (simulated or real)
    useEffect(() => {
        // In a real app we'd use a websocket or the passed prop.
        // Here we'll just fetch from our internal API for the base asset
        const fetchPrice = async () => {
            try {
                // Determine ID from symbol map or search. 
                // Simplified: Search by symbol name
                const res = await fetch(`/api/search?q=${baseAsset}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    // Get price for the first match (likely the correct coin)
                    // We need a price endpoint. Let's use the chart endpoint for latest price as a proxy
                    const id = data[0].id;
                    const priceRes = await fetch(`/api/chart?id=${id}&days=1&type=line`);
                    const priceData = await priceRes.json();
                    if (priceData.prices && priceData.prices.length > 0) {
                        setPrice(priceData.prices[priceData.prices.length - 1][1]);
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 10000);
        return () => clearInterval(interval);
    }, [baseAsset]);

    const handleTrade = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            setNotification({ msg: 'Invalid amount', type: 'error' });
            return;
        }
        if (price <= 0) {
            setNotification({ msg: 'Fetching price...', type: 'error' });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            if (mode === 'buy') {
                const cost = val * price; // We treat 'amount' as Quantity for simplicity? Or USDT value? 
                // Let's say Input is usually Quantity in TradingView, but beginners think in USD.
                // Let's make Input = USD Amount for "Buy", and Quantity for "Sell" to be intuitive?
                // Actually, let's stick to standard: Input is Quantity.

                const totalCost = val * price;
                if (totalCost > balance) {
                    setNotification({ msg: 'Insufficient funds', type: 'error' });
                } else {
                    setBalance(prev => prev - totalCost);
                    setPortfolio(prev => ({ ...prev, [baseAsset]: (prev[baseAsset] || 0) + val }));
                    setNotification({ msg: `Bought ${val} ${baseAsset}`, type: 'success' });
                    setAmount('');
                }
            } else {
                // Sell
                const owned = portfolio[baseAsset] || 0;
                if (val > owned) {
                    setNotification({ msg: `Insufficient ${baseAsset}`, type: 'error' });
                } else {
                    const revenue = val * price;
                    setBalance(prev => prev + revenue);
                    setPortfolio(prev => ({ ...prev, [baseAsset]: prev[baseAsset] - val }));
                    setNotification({ msg: `Sold ${val} ${baseAsset}`, type: 'success' });
                    setAmount('');
                }
            }
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="h-full bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trade Simulator</span>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Demo Mode
                </div>
            </div>

            {/* Price Display */}
            <div className="px-4 py-3 bg-[#0a0a0f]/30">
                <div className="flex justify-between items-baseline mb-1">
                    <h2 className="text-xl font-bold text-white">{baseAsset}</h2>
                    <span className="text-lg font-mono text-blue-400">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Wallet Balance</span>
                    <span className="font-mono text-white">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                    <span>Owned</span>
                    <span className="font-mono text-white">{(portfolio[baseAsset] || 0).toLocaleString()} {baseAsset}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2">
                <button
                    onClick={() => setMode('buy')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'buy' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setMode('sell')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'sell' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    SELL
                </button>
            </div>

            {/* Input */}
            <div className="p-4 space-y-4 flex-1">
                <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Quantity ({baseAsset})</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-3 text-white font-mono focus:outline-none focus:border-blue-500/50"
                        />
                        <button
                            onClick={() => setAmount(mode === 'buy' ? ((balance / price) * 0.99).toFixed(5) : (portfolio[baseAsset] || 0).toString())}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 hover:text-white uppercase font-bold"
                        >
                            Max
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-gray-500 mb-1">Estimated Total</p>
                    <div className="text-xl font-mono text-white">
                        ${(parseFloat(amount || '0') * price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                </div>

                <button
                    onClick={handleTrade}
                    disabled={loading || price <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 ${mode === 'buy'
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                            : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? 'Processing...' : `${mode.toUpperCase()} ${baseAsset}`}
                </button>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg text-center text-xs font-bold ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}
                    >
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
