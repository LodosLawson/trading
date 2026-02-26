'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChartWidget from './ChartWidget'; // Ensure this is imported


// Simplistic Line Chart component (Pure SVG)
const SimpleTrendChart = ({ data, color = '#10b981' }: { data: number[], color?: string }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 200;
    const height = 60;

    // Create points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            {/* Gradient Background */}
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="opacity-20 absolute inset-0">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                <path d={`M0,${height} ${points} L${width},${height} Z`} fill="url(#grad)" />
            </svg>
            {/* Line */}
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="relative z-10">
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

interface NewsItem {
    title: string;
    source: string;
    published_at: string;
    url: string;
    impact_score?: number;
    reasoning?: string;
    affected_assets?: string[];
    summary?: string;
}

export default React.memo(function LiveNewsWidget() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [analyzingId, setAnalyzingId] = useState<number | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<Record<number, string>>({});
    const [filter, setFilter] = useState<'latest' | '24h'>('latest');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // In a real scenario, you would pass a 'source=crypto.com' param to your backend
                const res = await fetch('/api/news');
                if (res.ok) {
                    const data = await res.json();
                    // Post-process to simulate "Crypto.com" priority or explicit feed integration
                    const enhancedData = data.map((item: any, idx: number) => ({
                        ...item,
                        source: idx % 3 === 0 ? 'Crypto.com' : (item.source || 'CoinTelegraph'), // Simulating mixture
                        affected_assets: item.affected_assets || (item.title.match(/(Bitcoin|BTC|Ethereum|ETH|Solana|SOL)/i) ? [item.title.match(/(Bitcoin|BTC|Ethereum|ETH|Solana|SOL)/i)[0].toUpperCase().replace('BITCOIN', 'BTC').replace('ETHEREUM', 'ETH')] : ['BTC']),
                        impact_score: item.impact_score || (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 5 : -Math.floor(Math.random() * 5)),
                        summary: item.summary || "This event could trigger significant volatility in the short term. Market participants should monitor key support levels."
                    }));
                    setNews(enhancedData);
                } else {
                    // Fallback Mock Data if API fails
                    setNews([
                        { title: "Generic Market Update: Bitcoin Surges", source: "Crypto.com", published_at: new Date().toISOString(), url: "#", affected_assets: ['BTC'], impact_score: 8, summary: "Bitcoin breaks key resistance levels." },
                        { title: "Ethereum Network Upgrade Successful", source: "Crypto.com", published_at: new Date(Date.now() - 3600000).toISOString(), url: "#", affected_assets: ['ETH'], impact_score: 7, summary: "Gas fees expected to drop." },
                    ]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const toggleExpand = (index: number) => {
        setExpandedId(expandedId === index ? null : index);
    };

    const analyzeNews = async (index: number, newsItem: NewsItem) => {
        if (aiAnalysis[index]) return; // Already analyzed
        setAnalyzingId(index);

        // Simulate AI Delay
        setTimeout(() => {
            const analysis = `🤖 AI INTERPRETATION:\n\nBased on the sentiment around "${newsItem.title}", the market is reacting ${newsItem.impact_score && newsItem.impact_score > 0 ? 'positively' : 'cautiously'}. \n\nThe probability of a short-term trend continuation for ${newsItem.affected_assets?.[0]} is high. Consider this a ${Math.abs(newsItem.impact_score || 0) > 7 ? 'High Impact' : 'Medium Impact'} event.`;
            setAiAnalysis(prev => ({ ...prev, [index]: analysis }));
            setAnalyzingId(null);
        }, 1200);
    };

    // Filter Logic
    const filteredNews = news.filter(item => {
        if (filter === 'latest') return true;
        // Simple mock filter for demo - in reality, check timestamp diff < 24h
        return true;
    });

    return (
        <div className="h-full flex flex-col bg-[#121218] border border-white/5 rounded-xl overflow-hidden relative font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Live Wire // News</span>
                </div>
                <div className="flex bg-white/5 rounded-lg p-0.5">
                    <button
                        onClick={() => setFilter('latest')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-all ${filter === 'latest' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                    >
                        Latest
                    </button>
                    <button
                        onClick={() => setFilter('24h')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-all ${filter === '24h' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                    >
                        24h
                    </button>
                </div>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0e0e12]">
                {loading ? (
                    <div className="flex flex-col gap-4 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredNews.map((item, i) => (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`border-b border-white/5 transition-colors ${expandedId === i ? 'bg-[#15151a]' : 'hover:bg-white/[0.02]'}`}
                            >
                                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(i)}>
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase font-mono">{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${item.source === 'Crypto.com' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                                    {item.source}
                                                </span>
                                            </div>
                                            <h3 className={`text-sm font-medium leading-snug ${expandedId === i ? 'text-white' : 'text-gray-300'}`}>
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Impact Badge (Mini) */}
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            {item.impact_score && (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${item.impact_score > 6 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    item.impact_score < -6 ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/30'
                                                    }`}>
                                                    {item.impact_score}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-black/20"
                                        >
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Left: Analysis & Content */}
                                                <div className="space-y-3">
                                                    <p className="text-xs text-gray-400 italic">"{item.summary}"</p>

                                                    {/* AI Button/Output */}
                                                    <div className="pt-2">
                                                        {!aiAnalysis[i] ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); analyzeNews(i, item); }}
                                                                disabled={analyzingId === i}
                                                                className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 group"
                                                            >
                                                                {analyzingId === i ? (
                                                                    <span className="animate-pulse">Processing...</span>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                                        AI INTERPRETER
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg"
                                                            >
                                                                <p className="text-[10px] text-violet-300 whitespace-pre-line leading-relaxed font-medium">
                                                                    {aiAnalysis[i]}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Simplified Chart (Trend) */}
                                                <div className="h-32 bg-[#0a0a0f] rounded-lg border border-white/10 overflow-hidden relative">
                                                    <div className="absolute top-2 left-2 z-10 text-[9px] font-bold text-gray-500 uppercase">
                                                        {item.affected_assets?.[0]} 7D Trend
                                                    </div>
                                                    <SimpleTrendChart
                                                        data={[40, 42, 45, 41, 44, 48, 55, 53, 58, 62, 59, 65]}
                                                        color={item.impact_score && item.impact_score < 0 ? '#ef4444' : '#10b981'}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
