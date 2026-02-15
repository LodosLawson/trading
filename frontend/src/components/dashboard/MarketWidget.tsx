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

export default function MarketWidget({ onSelectSymbol, limit }: { onSelectSymbol?: (symbol: string) => void, limit?: number }) {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('/api/crypto?per_page=20');
                if (res.ok) {
                    const data = await res.json();
                    setCoins(data);
                } else {
                    throw new Error('API Failed');
                }
            } catch (error) {
                console.error("Market data fetch failed, using fallback:", error);
                // Fallback Data
                setCoins([
                    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 96500, price_change_percentage_24h: 2.5 },
                    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2450, price_change_percentage_24h: -1.2 },
                    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 180, price_change_percentage_24h: 5.4 },
                    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png', current_price: 600, price_change_percentage_24h: 0.5 },
                    { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 1.10, price_change_percentage_24h: -0.8 },
                    { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.75, price_change_percentage_24h: 1.2 },
                    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png', current_price: 45, price_change_percentage_24h: 3.1 },
                    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.12, price_change_percentage_24h: -2.5 },
                ]);
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
                <span className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 font-mono">LIVE</span>
                    <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Column Headers */}
                <div className="grid grid-cols-3 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                    <div className="text-left">Symbol</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">24h Change</div>
                </div>

                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="flex gap-1">
                            <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1 h-1 bg-white/20 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {(limit ? coins.slice(0, limit) : coins).map((coin) => (
                            <motion.button
                                key={coin.id}
                                onClick={() => onSelectSymbol?.(`BINANCE:${coin.symbol.toUpperCase()}USDT`)}
                                className="w-full grid grid-cols-3 items-center px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {coin.image && <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full opacity-80" />}
                                    <div className="text-xs font-bold text-gray-200 group-hover:text-amber-400 transition-colors truncate">
                                        {coin.symbol.toUpperCase()}
                                    </div>
                                    <span className="text-[9px] text-gray-600 hidden xl:block truncate">{coin.name}</span>
                                </div>

                                <div className="text-right font-mono text-xs text-white">
                                    ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price < 1 ? 6 : 2 })}
                                </div>

                                <div className="text-right flex justify-end">
                                    <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${coin.price_change_percentage_24h >= 0
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
