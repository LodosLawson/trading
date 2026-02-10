'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatWidget from '@/components/ui/ChatWidget'; // Import ChatWidget

interface NewsItem {
    title: string;
    link: string;
    source: string;
    published_at: string;
    // AI Fields (Optional)
    impact_score?: number;
    reasoning?: string;
    affected_assets?: string[];
}

interface MarketSummary {
    sentiment: string;
    signal: string;
    takeaways: string[];
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [summary, setSummary] = useState<MarketSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel Fetch
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                console.log("Fetching news from:", apiUrl);
                const [newsRes, summaryRes] = await Promise.all([
                    fetch(`${apiUrl}/api/news`),
                    fetch(`${apiUrl}/api/news/summary`)
                ]);

                const newsData = await newsRes.json();
                const summaryData = await summaryRes.json();

                setNews(newsData);
                setSummary(summaryData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-neon-blue selection:text-black">
            <header className="mb-12 flex justify-between items-center border-b border-gray-800 pb-4">
                <h1 className="text-4xl font-thin tracking-tighter">
                    MARKET<span className="font-bold text-blue-500">PULSE</span>
                </h1>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                    Live Feed / AI Enhanced
                </div>
            </header>

            {/* AI Market Summary Section */}
            {summary && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 bg-gray-900/50 border-l-4 border-blue-500 p-6 rounded-r-lg backdrop-blur-sm"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <h2 className="text-2xl font-light mb-2 md:mb-0">
                            MARKET PULSE: <span className={`font-bold ${summary.sentiment === 'Bullish' ? 'text-green-400' :
                                summary.sentiment === 'Bearish' ? 'text-red-400' : 'text-gray-400'
                                }`}>{summary.sentiment.toUpperCase()}</span>
                        </h2>
                        <div className="px-3 py-1 bg-blue-900/30 text-blue-300 text-xs font-bold rounded border border-blue-800">
                            SIGNAL: {summary.signal.toUpperCase()}
                        </div>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {summary.takeaways.map((point, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start">
                                <span className="text-blue-500 mr-2">/</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <div className="text-xs text-gray-500 animate-pulse">Analyzing Market Data...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item, index) => {
                        const score = item.impact_score || 0;
                        const borderColor = score > 0 ? 'hover:border-green-500/50' : score < 0 ? 'hover:border-red-500/50' : 'hover:border-blue-500';

                        return (
                            <motion.a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative block bg-gray-900 border border-gray-800 ${borderColor} transition-colors duration-300 p-6 rounded-none overflow-hidden flex flex-col justify-between h-full`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-blue-400">
                                            {item.source}
                                        </div>
                                        {item.impact_score !== undefined && (
                                            <div className={`text-xs font-bold px-2 py-0.5 rounded ${score > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {score > 0 ? '+' : ''}{score}
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-light leading-snug mb-4 group-hover:text-blue-100 transition-colors">
                                        {item.title}
                                    </h2>

                                    {item.reasoning && (
                                        <p className="text-xs text-gray-400 mb-4 italic border-l-2 border-gray-700 pl-3">
                                            "{item.reasoning}"
                                        </p>
                                    )}

                                    {item.affected_assets && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.affected_assets.map((asset, i) => (
                                                <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">
                                                    {asset}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 border-t border-gray-800 pt-4">
                                    <span>{new Date(item.published_at).toLocaleTimeString()}</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                                        READ_FULL_STORY &rarr;
                                    </span>
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            )}

            <ChatWidget />
        </div>
    );
}
