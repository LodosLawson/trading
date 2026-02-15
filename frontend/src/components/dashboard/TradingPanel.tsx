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

    // Mock Price Data (since we don't have a live websocket for this demo widget yet)
    useEffect(() => {
        // Initial price
        setPrice(baseAsset === 'BTC' ? 96500 : baseAsset === 'ETH' ? 2450 : 100);

        const interval = setInterval(() => {
            setPrice(prev => prev * (1 + (Math.random() - 0.5) * 0.002));
        }, 3000);
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
                    setLoading(false);
                    return;
                }
                setBalance(prev => prev - totalCost);
                setPortfolio(prev => ({
                    ...prev,
                    [baseAsset]: {
                        quantity: (prev[baseAsset]?.quantity || 0) + qty,
                        avgPrice: (prev[baseAsset]?.avgPrice || 0) // Simplified avg price logic for demo
                    }
                }));
                setNotification({ msg: `Bought ${qty} ${baseAsset}`, type: 'success' });
            } else {
                const owned = portfolio[baseAsset]?.quantity || 0;
                if (qty > owned) {
                    setNotification({ msg: 'Insufficient assets', type: 'error' });
                    setLoading(false);
                    return;
                }
                const totalReceive = qty * execPrice;
                setBalance(prev => prev + totalReceive);
                setPortfolio(prev => ({
                    ...prev,
                    [baseAsset]: {
                        ...prev[baseAsset],
                        quantity: prev[baseAsset].quantity - qty
                    }
                }));
                setNotification({ msg: `Sold ${qty} ${baseAsset}`, type: 'success' });
            }

            setHistory(prev => [newTrade, ...prev]);
            setLoading(false);
            setAmount('');
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full bg-[#121218] text-white p-4 overflow-hidden relative">
            {/* Header: Balance & Tabs */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <div className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Available Balance</div>
                    <div className="font-mono text-lg font-bold text-emerald-400">
                        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="flex bg-[#1a1a20] rounded-lg p-1 border border-white/5">
                    <button
                        onClick={() => setActiveTab('trade')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'trade' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        Trade
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute top-16 left-4 right-4 z-50 p-2 rounded-lg text-xs font-bold text-center border ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                    >
                        {notification.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
                {activeTab === 'trade' ? (
                    <div className="space-y-4 pb-2">
                        {/* Buy/Sell Toggles */}
                        <div className="grid grid-cols-2 gap-2 bg-[#0a0a0f] p-1 rounded-xl border border-white/5 shrink-0">
                            <button
                                onClick={() => setSide('buy')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${side === 'buy' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Buy {baseAsset}
                            </button>
                            <button
                                onClick={() => setSide('sell')}
                                className={`py-2 text-sm font-bold rounded-lg transition-all ${side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Sell {baseAsset}
                            </button>
                        </div>

                        {/* Order Type */}
                        <div className="flex gap-4 border-b border-white/5 pb-2">
                            <button
                                onClick={() => setOrderType('market')}
                                className={`text-xs font-bold pb-1 border-b-2 transition-all ${orderType === 'market' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Market
                            </button>
                            <button
                                onClick={() => setOrderType('limit')}
                                className={`text-xs font-bold pb-1 border-b-2 transition-all ${orderType === 'limit' ? 'text-blue-400 border-blue-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Limit
                            </button>
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Price Input (Limit only) */}
                            {orderType === 'limit' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Limit Price</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            value={limitPrice}
                                            onChange={(e) => setLimitPrice(e.target.value)}
                                            placeholder={price.toFixed(2)}
                                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-500">USD</span>
                                    </div>
                                </div>
                            )}

                            {/* Amount Input */}
                            <div className={`space-y-1 ${orderType === 'market' ? 'col-span-2' : ''}`}>
                                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Amount</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg py-2 pl-3 pr-16 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-gray-500">{baseAsset}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Percentages */}
                        <div className="flex justify-between gap-2">
                            {[0.25, 0.50, 0.75, 1].map((pct) => (
                                <button
                                    key={pct}
                                    onClick={() => handlePercentage(pct)}
                                    className="flex-1 py-1 text-[10px] font-medium bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded border border-white/5 transition-colors"
                                >
                                    {pct * 100}%
                                </button>
                            ))}
                        </div>

                        {/* Total Estimation */}
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-xs text-gray-400">Est. Total</span>
                            <span className="font-mono text-sm font-bold text-white">
                                ${(parseFloat(amount || '0') * (orderType === 'limit' ? parseFloat(limitPrice || '0') : price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                ) : (
                    // History Tab
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <span className="text-sm">No trades yet</span>
                            </div>
                        ) : (
                            history.slice().reverse().map((trade: any) => (
                                <div key={trade.id} className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors group">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold uppercase ${trade.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {trade.side}
                                            </span>
                                            <span className="text-xs text-gray-400 truncate">{new Date(trade.date).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                            @{trade.price.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{trade.amount} <span className="text-[10px] text-gray-500">{trade.symbol}</span></div>
                                        <div className="text-[10px] text-gray-400">${trade.total.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Sticky Footer: Action Button */}
            {activeTab === 'trade' && (
                <div className="mt-4 pt-4 border-t border-white/5 shrink-0">
                    <button
                        onClick={handleTrade}
                        disabled={loading}
                        className={`w-full py-3 text-sm font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'bg-gray-700 cursor-not-allowed text-gray-400' :
                                side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' :
                                    'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20'
                            }`}
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                            </>
                        )}
                    </button>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-500 px-1">
                        <span>Maker: 0.02%</span>
                        <span>Taker: 0.04%</span>
                    </div>
                </div>
            )}
        </div>
    );
}
