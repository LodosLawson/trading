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
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Wire</span>
                <span className="block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {loading ? (
                    <div className="p-4 text-center text-xs text-gray-600">Loading Intelligence...</div>
                ) : (
                    <div className="space-y-1">
                        {news.map((item, i) => (
                            <a
                                key={i}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-bold text-blue-400 uppercase">{item.source}</span>
                                    <span className="text-[9px] text-gray-600">{timeAgo(item.published_at)}</span>
                                </div>
                                <h4 className="text-xs text-gray-200 leading-snug group-hover:text-white line-clamp-2 md:line-clamp-1 lg:line-clamp-2">
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
