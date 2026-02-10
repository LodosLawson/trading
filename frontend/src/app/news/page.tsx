'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ChatWidget from '@/components/ui/ChatWidget';

interface NewsItem {
    title: string;
    link: string;
    source: string;
    published_at: string;
    snippet?: string;
    impact_score?: number;
    reasoning?: string;
    affected_assets?: string[];
}

interface MarketSummary {
    sentiment: string;
    signal: string;
    takeaways: string[];
}

/* ── AI Analysis State per card ──────────────────── */
interface AnalysisState {
    loading: boolean;
    result: string | null;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyses, setAnalyses] = useState<Record<number, AnalysisState>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, summaryRes] = await Promise.all([
                    fetch('/api/news'),
                    fetch('/api/summary')
                ]);

                if (!newsRes.ok || !summaryRes.ok) {
                    throw new Error(`HTTP error! status: ${newsRes.status} / ${summaryRes.status}`);
                }

                const newsData = await newsRes.json();
                const summaryData = await summaryRes.json();

                setNews(newsData || []);
                if (summaryData && summaryData.sentiment) {
                    setSummary(summaryData);
                } else {
                    setSummary(null);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const analyzeArticle = async (index: number, title: string) => {
        setAnalyses(prev => ({ ...prev, [index]: { loading: true, result: null } }));

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Analyze this news headline for trading impact. Be concise (max 3 sentences). Include sentiment score (-10 to +10) and affected assets:\n\n"${title}"`
                }),
            });
            const data = await res.json();
            setAnalyses(prev => ({ ...prev, [index]: { loading: false, result: data.reply } }));
        } catch {
            setAnalyses(prev => ({ ...prev, [index]: { loading: false, result: 'Analysis failed. Try again.' } }));
        }
    };

    const sentimentColor = (s: string) => {
        if (s === 'Bullish') return 'text-emerald-400';
        if (s === 'Bearish') return 'text-red-400';
        if (s === 'Volatile') return 'text-amber-400';
        return 'text-gray-400';
    };

    const signalBg = (s: string) => {
        if (s === 'Buy Dip') return 'bg-emerald-900/30 text-emerald-300 border-emerald-800';
        if (s === 'Sell Rallies') return 'bg-red-900/30 text-red-300 border-red-800';
        return 'bg-blue-900/30 text-blue-300 border-blue-800';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black">

            {/* ── Header ─── */}
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-xs uppercase tracking-widest">
                            &larr;
                        </Link>
                        <h1 className="text-lg sm:text-xl font-thin tracking-tight">
                            MARKET<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">PULSE</span>
                        </h1>
                    </div>
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest hidden sm:block">Live Feed / AI Enhanced</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

                {/* ── Market Summary ─── */}
                {summary && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-white/[0.03] border border-white/5 rounded-xl p-4 sm:p-6"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                            <h2 className="text-base sm:text-lg font-light">
                                Market Pulse: <span className={`font-bold ${sentimentColor(summary.sentiment)}`}>{summary.sentiment.toUpperCase()}</span>
                            </h2>
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${signalBg(summary.signal)}`}>
                                {summary.signal.toUpperCase()}
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {summary.takeaways.map((point, i) => (
                                <li key={i} className="text-xs sm:text-sm text-gray-400 flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5 shrink-0">›</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* ── Loading ─── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-1.5 rounded-full border-t-2 border-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                        </div>
                        <p className="text-[10px] text-gray-600 animate-pulse uppercase tracking-widest">Analyzing Market Data</p>
                    </div>
                ) : (
                    /* ── News Cards ─── */
                    <div className="space-y-4">
                        {news.map((item, index) => {
                            const analysis = analyses[index];

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.06, 0.5) }}
                                    className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                                >
                                    {/* Card Content */}
                                    <div className="p-4 sm:p-5">
                                        {/* Source + Time */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">{item.source}</span>
                                            <span className="text-[10px] text-gray-700">{item.published_at}</span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-base sm:text-lg font-medium text-white leading-snug mb-3">
                                            {item.title}
                                        </h2>

                                        {/* Snippet / Content Preview */}
                                        {item.snippet && (
                                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-3 line-clamp-3">
                                                {item.snippet}
                                            </p>
                                        )}

                                        {/* Impact Score Badge (if pre-analyzed) */}
                                        {item.impact_score !== undefined && (
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.impact_score > 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                                    Impact: {item.impact_score > 0 ? '+' : ''}{item.impact_score}
                                                </span>
                                                {item.affected_assets && item.affected_assets.map((asset, i) => (
                                                    <span key={i} className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                                                        {asset}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-gray-600 hover:text-blue-400 uppercase tracking-widest transition-colors"
                                                >
                                                    Source &rarr;
                                                </a>
                                            )}

                                            <button
                                                onClick={() => analyzeArticle(index, item.title)}
                                                disabled={analysis?.loading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                            >
                                                {analysis?.loading ? (
                                                    <>
                                                        <span className="inline-block w-3 h-3 border-t border-blue-300 rounded-full animate-spin"></span>
                                                        Analyzing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                                                        </svg>
                                                        AI Analyze
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── Inline AI Analysis Result ─── */}
                                    <AnimatePresence>
                                        {analysis?.result && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 sm:px-5 pb-4 pt-3 bg-blue-950/20 border-t border-blue-500/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                                        </svg>
                                                        <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">MarketMind Analysis</span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                        {analysis.result}
                                                    </p>
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

            <ChatWidget />
        </div>
    );
}
