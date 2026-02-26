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

export default React.memo(function MarketWidget({ onSelectSymbol, limit }: { onSelectSymbol?: (symbol: string) => void, limit?: number }) {
    const [allCoins, setAllCoins] = useState<Coin[]>([]); // Pool of available coins
    const [displayedCoins, setDisplayedCoins] = useState<Coin[]>([]); // User's watchlist
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Load saved watchlist or default
    useEffect(() => {
        const savedIds = localStorage.getItem('user_watchlist_v1');
        const defaultIds = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple'];

        const fetchPrices = async () => {
            try {
                // Fetch top 50 to have a pool for searching
                const res = await fetch('/api/crypto?per_page=50');
                if (res.ok) {
                    const data = await res.json();
                    setAllCoins(data);

                    const targetIds = savedIds ? JSON.parse(savedIds) : defaultIds;
                    const initialList = data.filter((c: Coin) => targetIds.includes(c.id));

                    // Fallback if list is empty or matches nothing (should rarely happen with top 50)
                    if (initialList.length === 0) {
                        setDisplayedCoins(data.slice(0, 5));
                    } else {
                        setDisplayedCoins(initialList);
                    }
                } else {
                    throw new Error('API Failed');
                }
            } catch (error) {
                console.error("Market data fetch failed, using fallback:", error);
                // Fallback Data
                const fallbackData = [
                    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 96500, price_change_percentage_24h: 2.5 },
                    { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2450, price_change_percentage_24h: -1.2 },
                    { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 180, price_change_percentage_24h: 5.4 },
                    { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png', current_price: 600, price_change_percentage_24h: 0.5 },
                    { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 1.10, price_change_percentage_24h: -0.8 },
                ];
                setAllCoins(fallbackData);
                setDisplayedCoins(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // 1 min refresh for list
        return () => clearInterval(interval);
    }, []);

    // Save watchlist changes
    useEffect(() => {
        if (displayedCoins.length > 0) {
            const ids = displayedCoins.map(c => c.id);
            localStorage.setItem('user_watchlist_v1', JSON.stringify(ids));
        }
    }, [displayedCoins]);

    const handleAddCoin = (coin: Coin) => {
        if (!displayedCoins.find(c => c.id === coin.id)) {
            setDisplayedCoins(prev => [...prev, coin]);
        }
        setSearchQuery('');
        setIsSearching(false);
    };

    const handleRemoveCoin = (e: React.MouseEvent, coinId: string) => {
        e.stopPropagation();
        setDisplayedCoins(prev => prev.filter(c => c.id !== coinId));
    };

    const filteredSearch = searchQuery
        ? allCoins.filter(c =>
            c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    return (
        <div className="h-full flex flex-col bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden relative">
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50 gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Market</span>

                {/* Search Bar */}
                <div className="flex-1 relative">
                    <div className="flex items-center bg-white/5 rounded-lg px-2 py-1 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <svg className="w-3 h-3 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text"
                            className="w-full bg-transparent text-[10px] text-white focus:outline-none placeholder-gray-600 font-mono"
                            placeholder="SEARCH COIN..."
                            value={searchQuery}
                            onFocus={() => setIsSearching(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                        />
                    </div>

                    {/* Search Dropdown */}
                    {(isSearching && searchQuery) && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a20] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                            {filteredSearch.map(coin => (
                                <button
                                    key={coin.id}
                                    onClick={() => handleAddCoin(coin)}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                                >
                                    <span className="text-xs font-bold text-white">{coin.symbol.toUpperCase()}</span>
                                    <span className="text-[10px] text-gray-500">ADD +</span>
                                </button>
                            ))}
                            {filteredSearch.length === 0 && (
                                <div className="p-2 text-center text-[10px] text-gray-500">No coins found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Column Headers */}
                <div className="grid grid-cols-3 px-4 py-2 bg-white/[0.02] border-b border-white/5 text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                    <div className="text-left">Symbol</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">24h %</div>
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
                        {displayedCoins.map((coin) => {
                            const isPositive = coin.price_change_percentage_24h >= 0;
                            return (
                                <motion.div
                                    key={coin.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => onSelectSymbol?.(`BINANCE:${coin.symbol.toUpperCase()}USDT`)}
                                    className="grid grid-cols-3 items-center px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors group relative"
                                >
                                    {/* Symbol & Icon */}
                                    <div className="flex items-center gap-2">
                                        <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold font-mono text-gray-200 group-hover:text-blue-400 transition-colors uppercase">{coin.symbol}</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <span className="text-xs font-mono font-medium text-gray-300">
                                            ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2, maximumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                                        </span>
                                    </div>

                                    {/* 24h Change & Remove Button Container */}
                                    <div className="text-right flex items-center justify-end relative">
                                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded transition-transform group-hover:-translate-x-6 ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                            {isPositive ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                        </span>

                                        {/* Remove Button (Revealed on hover) */}
                                        <button
                                            onClick={(e) => handleRemoveCoin(e, coin.id)}
                                            className="absolute right-0 opacity-0 group-hover:opacity-100 p-0.5 text-gray-500 hover:text-red-400 transition-all"
                                            title="Remove from watchlist"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});
