'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ControlCenterProps {
    widgets: Record<string, { id: string; visible: boolean; order?: number }>;
    toggleWidget: (id: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
    'market-overview': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    'chart-widget': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    'news-feed': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    ),
    'browser-widget': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
    ),
    'ai-chat': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    ),
};

const LABELS: Record<string, string> = {
    'market-overview': 'Market',
    'chart-widget': 'Chart',
    'news-feed': 'News',
    'browser-widget': 'Browser',
    'ai-chat': 'AI Chat',
};

export default function ControlCenter({ widgets, toggleWidget }: ControlCenterProps) {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
        >
            {Object.entries(widgets).map(([key, config]) => (
                <button
                    key={key}
                    onClick={() => toggleWidget(key)}
                    className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${config.visible
                        ? 'bg-white/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'bg-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                >
                    {ICONS[key] || <div className="w-4 h-4 bg-gray-500" />}

                    {/* Active Indicator */}
                    {config.visible && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,1)]" />
                    )}

                    {/* Tooltip */}
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-white text-[10px] px-2 py-1 rounded border border-white/10 font-bold tracking-wider uppercase backdrop-blur-md">
                        {LABELS[key] || key}
                    </div>
                </button>
            ))}
        </motion.div>
    );
}
