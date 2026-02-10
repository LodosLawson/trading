'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ChatWidget from '@/components/ui/ChatWidget';

/* ── Types ───────────────────────────────────────── */
interface CryptoNewsItem {
    title: string;
    body: string;
    url: string;
    source: string;
    published_at: string;
    currencies: Array<{ code: string; title: string }>;
}

interface MarketSummary {
    sentiment: string;
    signal: string;
    takeaways: string[];
}

interface AIAnalysis {
    loading: boolean;
    result: string | null;
    symbols: string[];
}

interface SymbolPrice {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
    sparkline_7d: number[];
}

/* ── Sparkline ───────────────────────────────────── */
function MiniChart({ data, color, w = 80, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = 2 + (h - 4) - ((val - min) / range) * (h - 4);
        return `${x},${y}`;
    }).join(' ');

    const gradId = `g-${color.replace('#', '')}-${w}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon fill={`url(#${gradId})`} points={`0,${h} ${points} ${w},${h}`} />
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
    );
}

/* ── Symbol Chip with Price ──────────────────────── */
function SymbolChip({ symbol, priceData, onTap }: {
    symbol: string;
    priceData: SymbolPrice | null;
    onTap: (symbol: string) => void;
}) {
    if (!priceData) {
        return (
            <span className="px-2 py-1 bg-white/5 text-gray-500 text-[10px] font-mono rounded border border-white/5">
                {symbol}
            </span>
        );
    }

    const isUp = priceData.price_change_percentage_24h >= 0;
    const color = isUp ? '#34d399' : '#f87171';

    return (
        <button
            onClick={() => onTap(symbol)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-lg transition-all active:scale-95 group"
        >
            {priceData.image && (
                <img src={priceData.image} alt="" className="w-4 h-4 rounded-full" />
            )}
            <span className="text-[11px] font-mono font-medium text-gray-300 group-hover:text-white">{symbol}</span>
            <span className={`text-[10px] font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '▲' : '▼'}{Math.abs(priceData.price_change_percentage_24h).toFixed(1)}%
            </span>
            <MiniChart data={priceData.sparkline_7d} color={color} w={40} h={16} />
        </button>
    );
}

/* ── Symbol Detail Modal ─────────────────────────── */
function SymbolDetail({ symbol, priceData, onClose }: {
    symbol: string;
    priceData: SymbolPrice | null;
    onClose: () => void;
}) {
    if (!priceData) return null;
    const isUp = priceData.price_change_percentage_24h >= 0;
    const color = isUp ? '#34d399' : '#f87171';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#111118] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[80vh] overflow-auto"
            >
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img src={priceData.image} alt="" className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="font-medium text-white">{priceData.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{symbol}</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-600 hover:text-white text-xl">&times;</button>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <div className="text-2xl font-mono tabular-nums text-white">
                            ${priceData.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: priceData.current_price < 1 ? 6 : 2 })}
                        </div>
                        <span className={`text-sm font-mono ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '▲' : '▼'} {Math.abs(priceData.price_change_percentage_24h).toFixed(2)}% (24h)
                        </span>
                    </div>

                    {/* Large Chart */}
                    <div className="bg-white/[0.02] rounded-xl p-3 mb-4">
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">7-Day Chart</div>
                        <MiniChart data={priceData.sparkline_7d} color={color} w={320} h={120} />
                    </div>

                    {/* Link to full page */}
                    <Link
                        href="/prices"
                        className="block text-center text-xs text-blue-400 hover:text-blue-300 py-2 border border-blue-500/20 rounded-lg hover:bg-blue-500/5 transition-all"
                    >
                        View All Markets →
                    </Link>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────────── */
export default function NewsPage() {
    const [news, setNews] = useState<CryptoNewsItem[]>([]);
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyses, setAnalyses] = useState<Record<number, AIAnalysis>>({});
    const [priceMap, setPriceMap] = useState<Record<string, SymbolPrice>>({});
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [showWatchlist, setShowWatchlist] = useState(false);

    // Load watchlist from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('mp-watchlist');
            if (saved) setWatchlist(JSON.parse(saved));
        } catch { /* */ }
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const toggleWatch = useCallback((title: string) => {
        setWatchlist(prev => {
            const next = prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title];
            localStorage.setItem('mp-watchlist', JSON.stringify(next));
            return next;
        });
    }, []);

    // Filter news by search
    const filteredNews = searchQuery.trim()
        ? news.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.currencies.some(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : news;

    // Check for new related news and notify
    const prevNewsRef = React.useRef<string[]>([]);
    useEffect(() => {
        if (prevNewsRef.current.length === 0) {
            prevNewsRef.current = news.map(n => n.title);
            return;
        }
        const newTitles = news.filter(n => !prevNewsRef.current.includes(n.title));
        for (const item of newTitles) {
            const isWatched = watchlist.some(w =>
                item.title.toLowerCase().includes(w.toLowerCase().substring(0, 30)) ||
                item.currencies.some(c => watchlist.some(ww => ww.toLowerCase().includes(c.code.toLowerCase())))
            );
            if (isWatched && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('MarketPulse — Watched News', { body: item.title, icon: '/icons/icon-192.svg' });
            }
        }
        prevNewsRef.current = news.map(n => n.title);
    }, [news, watchlist]);

    // Fetch crypto news + summary
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, summaryRes] = await Promise.all([
                    fetch('/api/crypto-news'),
                    fetch('/api/summary')
                ]);

                const newsData = newsRes.ok ? await newsRes.json() : [];
                const summaryData = summaryRes.ok ? await summaryRes.json() : null;

                setNews(newsData || []);
                if (summaryData?.sentiment) setSummary(summaryData);
            } catch (error) {
                console.error('Failed to fetch:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Auto-refresh every 2 minutes
        const interval = setInterval(fetchData, 120000);
        return () => clearInterval(interval);
    }, []);

    // Fetch prices for all mentioned symbols
    const fetchPricesForSymbols = useCallback(async () => {
        try {
            const res = await fetch('/api/crypto?per_page=100');
            if (!res.ok) return;
            const coins: SymbolPrice[] = await res.json();
            const map: Record<string, SymbolPrice> = {};
            for (const c of coins) {
                map[c.symbol.toUpperCase()] = c;
            }
            setPriceMap(map);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchPricesForSymbols();
    }, [fetchPricesForSymbols]);

    // Auto-analyze a news article
    const analyzeArticle = async (index: number, item: CryptoNewsItem) => {
        setAnalyses(prev => ({ ...prev, [index]: { loading: true, result: null, symbols: [] } }));

        try {
            const prompt = `Analyze this crypto news for trading impact. Output format:
1. Brief analysis (2-3 sentences max)
2. Sentiment score: -10 to +10
3. Affected symbols: comma-separated (e.g. BTC, ETH, SOL)

News Title: "${item.title}"
Content: "${item.body}"
Mentioned currencies: ${item.currencies.map(c => c.code).join(', ') || 'None specified'}`;

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt }),
            });
            const data = await res.json();
            const reply = data.reply || '';

            // Extract symbols from AI response or from article currencies
            const articleSymbols = item.currencies.map(c => c.code.toUpperCase());
            const symbolRegex = /\b(BTC|ETH|SOL|BNB|XRP|ADA|DOGE|DOT|AVAX|MATIC|LINK|UNI|ATOM|LTC|NEAR|APT|ARB|OP|SUI|SEI|TIA|JUP|WIF|PEPE|SHIB|BONK)\b/gi;
            const aiSymbols: string[] = (reply.match(symbolRegex) || []).map((s: string) => s.toUpperCase());
            const allSymbols: string[] = [...new Set<string>([...articleSymbols, ...aiSymbols])];

            setAnalyses(prev => ({
                ...prev,
                [index]: { loading: false, result: reply, symbols: allSymbols }
            }));
        } catch {
            setAnalyses(prev => ({
                ...prev,
                [index]: { loading: false, result: 'Analysis unavailable.', symbols: item.currencies.map(c => c.code.toUpperCase()) }
            }));
        }
    };

    const sentimentColor = (s: string) => {
        if (s === 'Bullish') return 'text-emerald-400';
        if (s === 'Bearish') return 'text-red-400';
        if (s === 'Volatile') return 'text-amber-400';
        return 'text-gray-400';
    };

    const signalStyle = (s: string) => {
        if (s === 'Buy Dip') return 'bg-emerald-900/30 text-emerald-300 border-emerald-800';
        if (s === 'Sell Rallies') return 'bg-red-900/30 text-red-300 border-red-800';
        return 'bg-blue-900/30 text-blue-300 border-blue-800';
    };

    const timeAgo = (dateStr: string) => {
        try {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            return `${Math.floor(hrs / 24)}d ago`;
        } catch {
            return 'Just Now';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black">

            {/* ── Header ─── */}
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-600 hover:text-white transition-colors text-xs">
                            &larr;
                        </Link>
                        <h1 className="text-lg font-thin tracking-tight">
                            CRYPTO<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">NEWS</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Watchlist toggle */}
                        <button
                            onClick={() => setShowWatchlist(!showWatchlist)}
                            className={`p-1.5 rounded-lg transition-colors ${showWatchlist ? 'bg-amber-500/20 text-amber-400' : 'text-gray-600 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill={showWatchlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        </button>
                        {/* AI Chat link */}
                        <Link href="/chat" className="p-1.5 text-gray-600 hover:text-blue-400 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </Link>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {/* ── Search Bar ─── */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by coin, keyword (BTC, Ethereum, DeFi...)"
                            className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/30 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white text-xs">&times;</button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Watchlist Panel ─── */}
            <AnimatePresence>
                {showWatchlist && watchlist.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="max-w-3xl mx-auto px-4 sm:px-6 overflow-hidden"
                    >
                        <div className="py-3 border-b border-white/5">
                            <div className="text-[10px] text-amber-400/70 uppercase tracking-widest font-bold mb-2">Watched News ({watchlist.length})</div>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {watchlist.map((title, i) => (
                                    <div key={i} className="flex items-center justify-between gap-2 text-xs">
                                        <span className="text-gray-400 truncate flex-1">{title}</span>
                                        <button onClick={() => toggleWatch(title)} className="text-gray-700 hover:text-red-400 shrink-0">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

                {/* ── Market Summary ─── */}
                {summary && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-white/[0.02] border border-white/5 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-light">
                                Pulse: <span className={`font-bold ${sentimentColor(summary.sentiment)}`}>{summary.sentiment}</span>
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${signalStyle(summary.signal)}`}>
                                {summary.signal.toUpperCase()}
                            </span>
                        </div>
                        <ul className="space-y-1.5">
                            {summary.takeaways.map((t, i) => (
                                <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">›</span>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* ── Loading ─── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-1.5 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="text-[10px] text-gray-600 animate-pulse uppercase tracking-widest">Loading Crypto News</p>
                    </div>
                ) : (
                    /* ── News Cards ─── */
                    <div className="space-y-4">
                        {filteredNews.map((item, index) => {
                            const analysis = analyses[index];
                            const hasAnalysis = analysis?.result;
                            const symbols = analysis?.symbols || item.currencies.map(c => c.code.toUpperCase());

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.05, 0.4) }}
                                    className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                                >
                                    <div className="p-4 sm:p-5">
                                        {/* Source + Time */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] uppercase tracking-widest text-blue-400/70 font-bold">{item.source}</span>
                                            <span className="text-[10px] text-gray-700">{timeAgo(item.published_at)}</span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-sm sm:text-base font-medium text-white leading-snug mb-2">
                                            {item.title}
                                        </h2>

                                        {/* Body/Content */}
                                        <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                                            {item.body}
                                        </p>

                                        {/* Currency Tags from article */}
                                        {item.currencies.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {item.currencies.map((c, i) => (
                                                    <SymbolChip
                                                        key={i}
                                                        symbol={c.code.toUpperCase()}
                                                        priceData={priceMap[c.code.toUpperCase()] || null}
                                                        onTap={setSelectedSymbol}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-gray-600 hover:text-blue-400 uppercase tracking-widest transition-colors"
                                                >
                                                    Source →
                                                </a>
                                                <button
                                                    onClick={() => toggleWatch(item.title)}
                                                    className={`flex items-center gap-1 text-[10px] transition-colors ${watchlist.includes(item.title) ? 'text-amber-400' : 'text-gray-700 hover:text-amber-400'}`}
                                                >
                                                    <svg className="w-3 h-3" fill={watchlist.includes(item.title) ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                    </svg>
                                                    {watchlist.includes(item.title) ? 'Watching' : 'Watch'}
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => analyzeArticle(index, item)}
                                                disabled={analysis?.loading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-50 active:scale-95"
                                            >
                                                {analysis?.loading ? (
                                                    <>
                                                        <span className="w-3 h-3 border-t border-blue-300 rounded-full animate-spin"></span>
                                                        Analyzing...
                                                    </>
                                                ) : hasAnalysis ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Re-analyze
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                        </svg>
                                                        AI Analyze
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── AI Analysis Panel ─── */}
                                    <AnimatePresence>
                                        {hasAnalysis && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 sm:px-5 pb-4 pt-3 bg-blue-950/20 border-t border-blue-500/10">
                                                    {/* AI Header */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                        </svg>
                                                        <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">MarketMind Analysis</span>
                                                    </div>

                                                    {/* AI Text */}
                                                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-3">
                                                        {analysis.result}
                                                    </p>

                                                    {/* Affected Symbols with Charts */}
                                                    {symbols.length > 0 && (
                                                        <div>
                                                            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Affected Instruments</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {symbols.map((sym, i) => (
                                                                    <SymbolChip
                                                                        key={i}
                                                                        symbol={sym}
                                                                        priceData={priceMap[sym] || null}
                                                                        onTap={setSelectedSymbol}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}

                        {news.length === 0 && !loading && (
                            <div className="text-center py-20 text-gray-600 text-sm">
                                No news available. Check back later.
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── Symbol Detail Modal ─── */}
            <AnimatePresence>
                {selectedSymbol && (
                    <SymbolDetail
                        symbol={selectedSymbol}
                        priceData={priceMap[selectedSymbol] || null}
                        onClose={() => setSelectedSymbol(null)}
                    />
                )}
            </AnimatePresence>

            <ChatWidget />
        </div>
    );
}
