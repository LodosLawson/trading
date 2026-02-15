'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChartWidget from './ChartWidget'; // Reuse existing ChartWidget

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

export default function LiveNewsWidget() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [analyzingId, setAnalyzingId] = useState<number | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // In a real scenario, this would be your actual API
                // For now, we reuse the existing endpoint or mock data if it fails
                const res = await fetch('/api/news');
                if (res.ok) {
                    const data = await res.json();
                    // Enhance data with mock fields if missing, for demonstration
                    const enhancedData = data.map((item: any) => ({
                        ...item,
                        affected_assets: item.affected_assets || (item.title.includes('Bitcoin') ? ['BTC'] : item.title.includes('Ethereum') ? ['ETH'] : ['BTC']),
                        impact_score: item.impact_score || (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 5 : -Math.floor(Math.random() * 5)),
                        summary: item.summary || "This is a brief summary of the news event. It highlights the key factors driving market sentiment and potential price action."
                    }));
                    setNews(enhancedData);
                } else {
                    // Fallback Mock Data if API fails
                    setNews([
                        { title: "Generic Market Update: Bitcoin Surges", source: "MarketWire", published_at: new Date().toISOString(), url: "#", affected_assets: ['BTC'], impact_score: 8, summary: "Bitcoin breaks key resistance levels." },
                        { title: "Ethereum Network Upgrade Successful", source: "CryptoDaily", published_at: new Date().toISOString(), url: "#", affected_assets: ['ETH'], impact_score: 7, summary: "Gas fees expected to drop significanty." },
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
            const analysis = `AI Analysis for "${newsItem.title}":\n\nBased on historical patterns, this news suggests a ${newsItem.impact_score && newsItem.impact_score > 0 ? 'bullish' : 'bearish'} trend for ${newsItem.affected_assets?.[0] || 'the market'}. Volatility is expected to increase in the short term ($4H). Traders should watch for key support levels.`;
            setAiAnalysis(prev => ({ ...prev, [index]: analysis }));
            setAnalyzingId(null);
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col bg-[#121218] border border-white/5 rounded-xl overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Live Wire // Global Feed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        AI ACTIVE
                    </span>
                </div>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {loading ? (
                    <div className="flex flex-col gap-4 p-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-white/5">
                        {news.map((item, i) => (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`group transition-colors ${expandedId === i ? 'bg-[#1a1a20]' : 'hover:bg-white/[0.02]'}`}
                            >
                                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(i)}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">{new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{item.source}</span>
                                                {item.impact_score && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.impact_score > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                                        Impact: {item.impact_score}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-sm font-medium leading-relaxed transition-colors ${expandedId === i ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {item.title}
                                            </h3>
                                        </div>
                                        <div className="shrink-0 pt-1">
                                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedId === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[#050508]/50 border-t border-white/5"
                                        >
                                            <div className="p-4 space-y-4">
                                                {/* Details Grid */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                    {/* Context Analysis */}
                                                    <div className="lg:col-span-2 space-y-3">
                                                        <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-white/10 pl-3">
                                                            "{item.summary}"
                                                        </p>

                                                        {/* AI Analysis Section */}
                                                        <div className="bg-[#15151a] rounded-lg border border-white/5 p-3">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                                    AI Insight
                                                                </span>
                                                                {!aiAnalysis[i] && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); analyzeNews(i, item); }}
                                                                        disabled={analyzingId === i}
                                                                        className="text-[10px] bg-violet-600 hover:bg-violet-500 text-white px-2 py-1 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                                                                    >
                                                                        {analyzingId === i ? 'Analyzing...' : 'Generate Analysis'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {analyzingId === i && (
                                                                <div className="space-y-1 animate-pulse">
                                                                    <div className="h-2 bg-white/10 rounded w-3/4"></div>
                                                                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                                                </div>
                                                            )}
                                                            {aiAnalysis[i] && (
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-300 whitespace-pre-line">
                                                                    {aiAnalysis[i]}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Related Chart */}
                                                    <div className="h-40 bg-black rounded-lg overflow-hidden border border-white/10 relative">
                                                        <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-300 border border-white/10">
                                                            {item.affected_assets?.[0] || 'BTC'}USD
                                                        </div>
                                                        <ChartWidget symbol={`BINANCE:${item.affected_assets?.[0] || 'BTC'}USDT`} theme="dark" />
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex justify-end pt-2">
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                                    >
                                                        Read Full Source
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
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
}
