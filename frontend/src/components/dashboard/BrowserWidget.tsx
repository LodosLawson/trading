'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrowserWidgetProps {
    className?: string;
    mode?: 'full' | 'embedded';
}

interface Tab {
    id: string;
    title: string;
    url: string;
    icon?: string;
    history: string[];
    historyIndex: number;
}

const INITIAL_TAB: Tab = {
    id: 'tab-1',
    title: 'New Tab',
    url: 'about:blank',
    history: ['about:blank'],
    historyIndex: 0
};

const FAVORITES = [
    { name: 'Google', url: 'https://www.google.com/search?igu=1' },
    { name: 'Bing', url: 'https://www.bing.com' },
    { name: 'TradingView', url: 'https://www.tradingview.com' },
    { name: 'CoinGecko', url: 'https://www.coingecko.com' },
    { name: 'Crypto.com', url: 'https://crypto.com/exchange' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' }
];

export default function BrowserWidget({ className = '', mode = 'full' }: BrowserWidgetProps) {
    const [tabs, setTabs] = useState<Tab[]>([INITIAL_TAB]);
    const [activeTabId, setActiveTabId] = useState<string>('tab-1');
    const [inputUrl, setInputUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

    useEffect(() => {
        if (activeTab) {
            setInputUrl(activeTab.url === 'about:blank' ? '' : activeTab.url);
        }
    }, [activeTabId]);

    // --- Tab Management ---

    const addTab = () => {
        const newTab: Tab = {
            id: `tab-${Date.now()}`,
            title: 'New Tab',
            url: 'about:blank',
            history: ['about:blank'],
            historyIndex: 0
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
    };

    const closeTab = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (tabs.length === 1) {
            // If only one tab, just reset it
            setTabs([{ ...INITIAL_TAB, id: `tab-${Date.now()}` }]);
            setActiveTabId(`tab-${Date.now()}`);
            return;
        }
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        }
    };

    // --- Navigation Logic ---

    const navigate = (url: string) => {
        let finalUrl = url;
        if (!url.startsWith('http') && !url.startsWith('about:')) {
            // Simple search or domain guess
            if (url.includes('.') && !url.includes(' ')) {
                finalUrl = `https://${url}`;
            } else {
                finalUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
            }
        }

        setIsLoading(true);
        updateTab(activeTabId, {
            url: finalUrl,
            history: [...activeTab.history.slice(0, activeTab.historyIndex + 1), finalUrl],
            historyIndex: activeTab.historyIndex + 1,
            title: finalUrl.replace('https://', '').split('/')[0] // Rough title guess
        });

        // Mock loading finish
        setTimeout(() => setIsLoading(false), 1500);
    };

    const goBack = () => {
        if (activeTab.historyIndex > 0) {
            const newIndex = activeTab.historyIndex - 1;
            updateTab(activeTabId, {
                historyIndex: newIndex,
                url: activeTab.history[newIndex]
            });
        }
    };

    const goForward = () => {
        if (activeTab.historyIndex < activeTab.history.length - 1) {
            const newIndex = activeTab.historyIndex + 1;
            updateTab(activeTabId, {
                historyIndex: newIndex,
                url: activeTab.history[newIndex]
            });
        }
    };

    const reload = () => {
        setIsLoading(true);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
        setTimeout(() => setIsLoading(false), 1000);
    };

    const updateTab = (id: string, updates: Partial<Tab>) => {
        setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    // --- Event Handlers ---

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            navigate(inputUrl);
        }
    };

    return (
        <div className={`flex flex-col w-full h-full bg-[#121218] overflow-hidden ${className}`}>

            {/* Tab Bar */}
            <div className="flex items-center bg-[#0a0a0f] border-b border-white/5 pt-2 px-2 gap-1 overflow-x-auto custom-scrollbar h-10 shrink-0">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`group relative flex items-center min-w-[120px] max-w-[200px] h-full px-3 pr-2 rounded-t-lg text-xs font-medium cursor-pointer transition-colors border-t border-x border-transparent select-none ${activeTabId === tab.id ? 'bg-[#1e1e24] text-white border-white/5' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                        title="Home / Refresh"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </button>
                )}

                {/* Address Bar */}
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search (Bing) or URL..."
                        className="w-full bg-[#050508] text-white text-base sm:text-sm rounded-lg py-2 pl-9 pr-9 border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                    {url && (
                        <button
                            type="button"
                            onClick={() => window.open(url, '_blank')}
                            title="Open External"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </button>
                    )}
                </form>
            </div>

            {/* Browser Content (Iframe) */}
            <div className="flex-1 bg-white relative">
                {isLoading && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-100 z-50">
                        <div className="h-full bg-blue-500 animate-progress"></div>
                    </div>
                )}

                {url ? (
                    <iframe
                        ref={iframeRef}
                        src={url}
                        title="Browser View"
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox"
                        referrerPolicy="no-referrer"
                        onError={() => setIsLoading(false)}
                        onLoad={() => setIsLoading(false)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#121218] text-gray-400 space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-black tracking-widest text-white mb-2">NEBULA<span className="text-blue-500">BROWSER</span></h3>
                            <p className="text-xs text-gray-600 uppercase tracking-widest">Embedded Web Gateway</p>
                        </div>

                        <div className="grid grid-cols-4 gap-6 px-8">
                            {[
                                { name: 'Bing', url: 'https://www.bing.com/search?q=crypto' },
                                { name: 'Wifi', url: 'https://fast.com' },
                                { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
                                { name: 'Docs', url: 'https://devdocs.io' }
                            ].map(site => (
                                <button
                                    key={site.name}
                                    onClick={() => { setUrl(site.url); setSearchQuery(site.url); }}
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:border-blue-500/30 transition-all shadow-lg group-hover:shadow-blue-500/10">
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white">{site.name[0]}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 group-hover:text-blue-400 transition-colors uppercase font-bold">{site.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500/80 text-center max-w-xs">
                            Note: Many sites (Google, Twitter) block embedding. Use the ↗ icon to open them externally.
                        </div>
                    </div>
                )}

                {/* Overlay for blocked sites hint */}
                {url && (
                    <div className="absolute bottom-4 right-4 pointer-events-none">
                        <div className="px-3 py-2 bg-black/80 backdrop-blur text-[10px] text-gray-400 rounded-lg border border-white/10 max-w-[200px] text-center">
                            If site fails to load, click the <span className="text-white">External Link</span> icon in the bar.
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
            </AnimatePresence >
        </>
    );
}
