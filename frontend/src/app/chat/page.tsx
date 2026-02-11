'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ── Types ───────────────────────────────────────── */
interface Message {
    role: 'user' | 'ai';
    content: string;
    chart?: ChartData | null;
}

interface SearchResult {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number | null;
}

interface ChartData {
    coinId: string;
    coinName: string;
    timeframe: string;
    prices: number[][];
    ohlc: number[][] | null;
}

const TIMEFRAMES = [
    { label: '5m', days: '1', desc: '5-Minute (24h)' },
    { label: '1h', days: '1', desc: 'Hourly (24h)' },
    { label: '1D', days: '7', desc: 'Daily (7d)' },
    { label: '1W', days: '30', desc: 'Weekly (30d)' },
    { label: '1M', days: '90', desc: 'Monthly (90d)' },
];

/* ── Candlestick Chart ───────────────────────────── */
function CandlestickChart({ ohlc, timeframe }: { ohlc: number[][]; timeframe: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || ohlc.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const pad = { top: 20, bottom: 30, left: 10, right: 60 };
        const chartW = w - pad.left - pad.right;
        const chartH = h - pad.top - pad.bottom;

        const allPrices = ohlc.flatMap(c => [c[1], c[2], c[3], c[4]]);
        const minP = Math.min(...allPrices);
        const maxP = Math.max(...allPrices);
        const rangeP = maxP - minP || 1;

        const toY = (p: number) => pad.top + chartH - ((p - minP) / rangeP) * chartH;
        const barW = Math.max(1, (chartW / ohlc.length) * 0.6);

        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();

            // Price labels
            const price = maxP - (rangeP / 4) * i;
            ctx.fillStyle = '#555';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(6)}`, w - pad.right + 5, y + 3);
        }

        // Candles
        ohlc.forEach((candle, i) => {
            const [, open, high, low, close] = candle;
            const x = pad.left + (i / ohlc.length) * chartW + barW / 2;
            const isGreen = close >= open;
            const color = isGreen ? '#34d399' : '#f87171';

            // Wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, toY(high));
            ctx.lineTo(x, toY(low));
            ctx.stroke();

            // Body
            const bodyTop = toY(Math.max(open, close));
            const bodyBot = toY(Math.min(open, close));
            const bodyH = Math.max(1, bodyBot - bodyTop);
            ctx.fillStyle = color;
            ctx.fillRect(x - barW / 2, bodyTop, barW, bodyH);
        });

        // Timeframe label
        ctx.fillStyle = '#444';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(timeframe, w / 2, h - 8);

    }, [ohlc, timeframe]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-lg" style={{ width: '100%', height: '100%' }} />;
}

/* ── Line Chart ──────────────────────────────────── */
function LineChart({ prices, timeframe }: { prices: number[][]; timeframe: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || prices.length === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const pad = { top: 15, bottom: 25, left: 10, right: 55 };
        const chartW = w - pad.left - pad.right;
        const chartH = h - pad.top - pad.bottom;

        const vals = prices.map(p => p[1]);
        const minV = Math.min(...vals);
        const maxV = Math.max(...vals);
        const rangeV = maxV - minV || 1;

        const toX = (i: number) => pad.left + (i / (vals.length - 1)) * chartW;
        const toY = (v: number) => pad.top + chartH - ((v - minV) / rangeV) * chartH;

        // Background
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(w - pad.right, y);
            ctx.stroke();
            const price = maxV - (rangeV / 4) * i;
            ctx.fillStyle = '#555';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(price >= 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(6)}`, w - pad.right + 5, y + 3);
        }

        const isUp = vals[vals.length - 1] >= vals[0];
        const lineColor = isUp ? '#34d399' : '#f87171';

        // Fill
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, isUp ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.moveTo(toX(0), h - pad.bottom);
        vals.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
        ctx.lineTo(toX(vals.length - 1), h - pad.bottom);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        vals.forEach((v, i) => {
            if (i === 0) ctx.moveTo(toX(i), toY(v));
            else ctx.lineTo(toX(i), toY(v));
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Timeframe
        ctx.fillStyle = '#444';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(timeframe, w / 2, h - 5);

    }, [prices, timeframe]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-lg" style={{ width: '100%', height: '100%' }} />;
}

/* ── Main Chat Page ──────────────────────────────── */
export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'MarketMind online. Ask me to analyze any crypto asset (e.g., "Analyze SOL") for real-time data.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [activeChart, setActiveChart] = useState<ChartData | null>(null);
    const [selectedTf, setSelectedTf] = useState(TIMEFRAMES[2]); // Default: 1D
    const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    // Debounced search
    const handleSearch = useCallback((q: string) => {
        setSearchQuery(q);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!q.trim()) { setSearchResults([]); return; }

        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
                if (res.ok) setSearchResults(await res.json());
            } catch { /* silent */ }
        }, 300);
    }, []);

    // Fetch chart data
    const fetchChart = useCallback(async (coinId: string, coinName: string, tf: typeof TIMEFRAMES[0]) => {
        try {
            const [lineRes, ohlcRes] = await Promise.all([
                fetch(`/api/chart?id=${coinId}&days=${tf.days}&type=line`),
                fetch(`/api/chart?id=${coinId}&days=${tf.days}&type=ohlc`),
            ]);

            const lineData = lineRes.ok ? await lineRes.json() : { prices: [] };
            const ohlcData = ohlcRes.ok ? await ohlcRes.json() : [];

            setActiveChart({
                coinId,
                coinName,
                timeframe: tf.desc,
                prices: lineData.prices || [],
                ohlc: Array.isArray(ohlcData) ? ohlcData : null,
            });
        } catch {
            setActiveChart(null);
        }
    }, []);

    // Select coin from search
    const selectCoin = useCallback((coin: SearchResult) => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
        fetchChart(coin.id, coin.name, selectedTf);

        // Also send a message to AI
        const msg = `Analyze ${coin.name} (${coin.symbol}) - provide technical outlook and key levels.`;
        sendMessageDirect(msg);
    }, [fetchChart, selectedTf]);

    // Change timeframe on active chart
    const switchTimeframe = useCallback((tf: typeof TIMEFRAMES[0]) => {
        setSelectedTf(tf);
        if (activeChart) {
            fetchChart(activeChart.coinId, activeChart.coinName, tf);
        }
    }, [activeChart, fetchChart]);

    // Send message
    const sendMessage = async () => {
        if (!input.trim()) return;
        sendMessageDirect(input);
        setInput('');
    };

    const sendMessageDirect = async (text: string) => {
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // 1. Get AI Response
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            const replyText = data.reply || 'No response.';

            // 2. Detect Symbols for Rich UI
            const symbolRegex = /\b(BTC|ETH|SOL|BNB|XRP|ADA|DOGE|DOT|AVAX|MATIC|LINK|UNI|ATOM|LTC|NEAR|APT|ARB|OP|SUI|SEI|TIA|JUP|WIF|PEPE|SHIB|BONK)\b/i;
            const match = text.match(symbolRegex) || replyText.match(symbolRegex);
            let chartData: ChartData | null = null;

            if (match) {
                const symbol = match[0].toUpperCase();
                // SEARCH for coin ID
                try {
                    const searchRes = await fetch(`/api/search?q=${symbol}`);
                    const searchData = await searchRes.json();
                    if (searchData && searchData.length > 0) {
                        const coin = searchData[0];
                        // Fetch Chart Data
                        const [lineRes, ohlcRes] = await Promise.all([
                            fetch(`/api/chart?id=${coin.id}&days=1&type=line`),
                            fetch(`/api/chart?id=${coin.id}&days=1&type=ohlc`),
                        ]);
                        const lineData = lineRes.ok ? await lineRes.json() : { prices: [] };
                        const ohlcData = ohlcRes.ok ? await ohlcRes.json() : [];

                        chartData = {
                            coinId: coin.id,
                            coinName: coin.name,
                            timeframe: '24h',
                            prices: lineData.prices || [],
                            ohlc: Array.isArray(ohlcData) ? ohlcData : null,
                        };
                    }
                } catch (e) { console.error(e); }
            }

            setMessages(prev => [...prev, { role: 'ai', content: replyText, chart: chartData }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-dvh bg-[#0a0a0f] text-white flex flex-col font-sans overflow-hidden">

            {/* ── Header ─── */}
            <header className="shrink-0 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/terminal" className="text-gray-600 hover:text-white transition-colors text-xs">&larr;</Link>
                    <h1 className="text-base font-thin tracking-tight">
                        MARKET<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">MIND</span>
                    </h1>
                    <span className="text-[9px] text-gray-700 uppercase tracking-widest hidden sm:inline">AI Terminal</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search toggle */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>

                    {/* Chart type toggle */}
                    {activeChart && (
                        <button
                            onClick={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
                            className="px-2 py-1 text-[10px] text-gray-500 border border-white/5 rounded hover:bg-white/5 transition-colors"
                        >
                            {chartType === 'candle' ? '📊 Candle' : '📈 Line'}
                        </button>
                    )}
                </div>
            </header>

            {/* ── Search Dropdown ─── */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="shrink-0 border-b border-white/5 overflow-hidden"
                    >
                        <div className="p-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search coin (BTC, Ethereum, SOL...)"
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                            />
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                                    {searchResults.map(coin => (
                                        <button
                                            key={coin.id}
                                            onClick={() => selectCoin(coin)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                        >
                                            <img src={coin.thumb} alt="" className="w-5 h-5 rounded-full" />
                                            <span className="text-sm text-white">{coin.name}</span>
                                            <span className="text-[10px] text-gray-600 font-mono">{coin.symbol}</span>
                                            {coin.market_cap_rank && (
                                                <span className="text-[9px] text-gray-700 ml-auto">#{coin.market_cap_rank}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Chart Panel (Main) ─── */}
            <AnimatePresence>
                {activeChart && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="shrink-0 border-b border-white/5 overflow-hidden"
                    >
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-white">{activeChart.coinName}</span>
                                <button onClick={() => setActiveChart(null)} className="text-gray-600 hover:text-white text-xs">&times;</button>
                            </div>
                            <div className="flex gap-1 mb-2">
                                {TIMEFRAMES.map(tf => (
                                    <button
                                        key={tf.label}
                                        onClick={() => switchTimeframe(tf)}
                                        className={`px-2 py-1 text-[10px] rounded transition-colors ${selectedTf.label === tf.label
                                            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                                            : 'text-gray-600 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>
                            <div className="h-48 sm:h-64 bg-[#0a0a0f] rounded-lg border border-white/5">
                                {chartType === 'candle' && activeChart.ohlc && activeChart.ohlc.length > 0 ? (
                                    <CandlestickChart ohlc={activeChart.ohlc} timeframe={activeChart.timeframe} />
                                ) : activeChart.prices.length > 0 ? (
                                    <LineChart prices={activeChart.prices} timeframe={activeChart.timeframe} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-600 text-xs">Loading chart...</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Messages ─── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" ref={scrollRef}>
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${m.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-[#1a1a20] text-gray-200 border border-white/10 rounded-bl-none'
                            }`}>
                            {m.role === 'ai' && (
                                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/5">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-violet-500 flex items-center justify-center text-[8px] font-bold text-white">AI</div>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">MarketMind</span>
                                </div>
                            )}

                            {m.content}

                            {/* Rich Widget: Chart in Message */}
                            {m.chart && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        <span>{m.chart.coinName} Analysis</span>
                                        <span className={`text-[10px] ${m.chart.prices[m.chart.prices.length - 1]?.[1] >= m.chart.prices[0]?.[1] ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {m.chart.prices[m.chart.prices.length - 1]?.[1] >= m.chart.prices[0]?.[1] ? 'BULLISH' : 'BEARISH'}
                                        </span>
                                    </div>
                                    <div className="h-32 w-full bg-black/20 rounded-lg overflow-hidden border border-white/5">
                                        <LineChart prices={m.chart.prices} timeframe="24h" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] text-gray-700 mt-1 px-1">
                            {m.role === 'user' ? 'You' : 'AI Agent'} • Just now
                        </span>
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 bg-[#1a1a20] border border-white/10 rounded-2xl rounded-bl-none">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Input Bar ─── */}
            <div className="shrink-0 border-t border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl p-3 sm:p-4">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        placeholder="Ask MarketMind..."
                        className="flex-1 bg-[#1a1a20] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#202025] transition-all shadow-inner"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
