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

    // ... (keep fetchPrice effect)

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
            </div>
        </div>
    ))
}
                                </div >
                            )}
                        </motion.div >
                    )}
                </AnimatePresence >
            </div >

    {/* Notification Toast */ }
    <AnimatePresence>
{
    notification && (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg border flex items-center justify-center text-xs font-bold shadow-2xl z-20 ${notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' : 'bg-red-950/90 border-red-500/30 text-red-400'
                }`}
        >
            {notification.msg}
        </motion.div>
    )
}
            </AnimatePresence >

    {/* Loading Overlay */ }
{
    loading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] uppercase font-bold text-blue-500 animate-pulse">Executing</span>
            </div>
        </div>
    )
}
        </div >
    );
}
