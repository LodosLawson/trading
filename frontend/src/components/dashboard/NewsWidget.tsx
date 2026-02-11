'use client';

import React, { useEffect, useState } from 'react';

interface NewsItem {
    title: string;
    source: string;
    published_at: string;
    url: string;
}

export default function NewsWidget() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/crypto-news');
                if (res.ok) {
                    const data = await res.json();
                    setNews(data.slice(0, 10)); // Limit to 10 for widget
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
        const interval = setInterval(fetchNews, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, []);

    const timeAgo = (dateStr: string) => {
        try {
            const diff = Date.now() - new Date(dateStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 60) return `${mins}m`;
            const hrs = Math.floor(mins / 60);
            return `${hrs}h`;
        } catch { return ''; }
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Wire</span>
                    <span className="relative flex h-1.5 w-1.5 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                </div>
                <span className="text-[9px] text-gray-600 font-mono">UPDATED</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {loading ? (
                    <div className="p-4 text-center text-xs text-gray-500 animate-pulse">Scanning Global Feeds...</div>
                ) : (
                    <div className="space-y-2">
                        {news.map((item, i) => (
                            <a
                                key={i}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-blue-500/20 transition-all group"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/20">
                                        {item.source}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">{timeAgo(item.published_at)}</span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-200 leading-snug group-hover:text-blue-200 transition-colors">
                                    {item.title}
                                </h4>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
