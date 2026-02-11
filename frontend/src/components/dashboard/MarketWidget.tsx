'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Coin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
}

export default function MarketWidget({ onSelectSymbol }: { onSelectSymbol?: (symbol: string) => void }) {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/crypto?per_page=20');
                if (res.ok) {
                    const data = await res.json();
                    setCoins(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Market Ticker</span>
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-4 text-center text-xs text-gray-600">Loading...</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {coins.map((coin) => (
                            <button
                                key={coin.id}
                                onClick={() => onSelectSymbol?.(`BINANCE:${coin.symbol.toUpperCase()}USDT`)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                                    <div>
                                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{coin.symbol.toUpperCase()}</div>
                                        <div className="text-[10px] text-gray-600">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-mono font-medium text-white">
                                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price < 1 ? 6 : 2 })}
                                    </div>
                                    <div className={`text-[10px] font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
