'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import WindowFrame from '@/components/ui/WindowFrame';
import LiveNewsWidget from '@/components/dashboard/LiveNewsWidget';
import MarketWidget from '@/components/dashboard/MarketWidget';
import NewsWidget from '@/components/dashboard/NewsWidget';
import ChartWidget from '@/components/dashboard/ChartWidget';
import DashboardChatWidget from '@/components/dashboard/DashboardChatWidget';
import BrowserWidget from '@/components/dashboard/BrowserWidget';
import TradingPanel from '@/components/dashboard/TradingPanel';

// Types for our Grid System
type WidgetType = 'MARKET' | 'NEWS' | 'CHART' | 'CHAT' | 'BROWSER' | 'TRADING' | 'LIVENEWS';

interface Widget {
    id: string;
    type: WidgetType;
    colSpan: number; // 1 to 12
    rowSpan: number; // 1 to 12
}

const DEFAULT_LAYOUT: Widget[] = [
    { id: 'chart-1', type: 'CHART', colSpan: 8, rowSpan: 5 },
    { id: 'market-1', type: 'MARKET', colSpan: 4, rowSpan: 8 },
    { id: 'trading-1', type: 'TRADING', colSpan: 8, rowSpan: 3 }, // Trading Panel below chart
    { id: 'livenews-1', type: 'LIVENEWS', colSpan: 6, rowSpan: 5 }, // Replaced generic NEWS with LIVENEWS for demo
    { id: 'chat-1', type: 'CHAT', colSpan: 6, rowSpan: 5 },
    { id: 'browser-1', type: 'BROWSER', colSpan: 12, rowSpan: 6 }, // Browser at bottom
];

const AVAILABLE_WIDGETS: { type: WidgetType; label: string; defaultCol: number; defaultRow: number }[] = [
    { type: 'MARKET', label: 'Market Ticker', defaultCol: 3, defaultRow: 6 },
    { type: 'NEWS', label: 'News Feed (Classic)', defaultCol: 3, defaultRow: 6 },
    { type: 'LIVENEWS', label: 'Live Wire (Pro)', defaultCol: 6, defaultRow: 6 },
    { type: 'CHART', label: 'Chart View', defaultCol: 6, defaultRow: 6 },
    { type: 'CHAT', label: 'AI Agent', defaultCol: 3, defaultRow: 8 },
    { type: 'BROWSER', label: 'Web Browser', defaultCol: 6, defaultRow: 4 },
    { type: 'TRADING', label: 'Trading Panel', defaultCol: 6, defaultRow: 4 },
];

export default function TerminalPage() {
    const { user } = useAuth();
    const [layout, setLayout] = useState<Widget[]>(DEFAULT_LAYOUT);
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Initialize & Load Layout
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- ACTIONS ---

    const removeWidget = (id: string) => {
        setLayout(prev => prev.filter(w => w.id !== id));
    };

    const addWidget = (type: WidgetType) => {
        const template = AVAILABLE_WIDGETS.find(w => w.type === type);
        if (!template) return;

        const newWidget: Widget = {
            id: `${type.toLowerCase()}-${Date.now()}`,
            type: type,
            colSpan: template.defaultCol,
            rowSpan: template.defaultRow
        };
        setLayout(prev => [...prev, newWidget]);
    };

    const resizeWidget = (id: string, deltaCol: number, deltaRow: number) => {
        setLayout(prev => prev.map(w => {
            if (w.id !== id) return w;
            const newCol = Math.max(3, Math.min(12, w.colSpan + deltaCol));
            const newRow = Math.max(4, Math.min(12, w.rowSpan + deltaRow));
            return { ...w, colSpan: newCol, rowSpan: newRow };
        }));
    };

    const moveWidget = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index > 0) {
            const newLayout = [...layout];
            [newLayout[index], newLayout[index - 1]] = [newLayout[index - 1], newLayout[index]];
            setLayout(newLayout);
        } else if (direction === 'right' && index < layout.length - 1) {
            const newLayout = [...layout];
            [newLayout[index], newLayout[index + 1]] = [newLayout[index + 1], newLayout[index]];
            setLayout(newLayout);
        }
    };

    const resetLayout = () => {
        if (confirm('Reset layout to default?')) {
            setLayout(DEFAULT_LAYOUT);
        }
    };

    // --- RENDERERS ---

    const [activeSymbol, setActiveSymbol] = useState('BINANCE:BTCUSDT');

    // --- RENDERERS ---

    const renderWidgetContent = (type: WidgetType) => {
        let content = null;
        let title = '';

        switch (type) {
            case 'MARKET':
                content = <MarketWidget limit={10} onSelectSymbol={setActiveSymbol} />;
                title = 'MARKET TICKER';
                break;
            case 'NEWS':
                content = <NewsWidget limit={8} />;
                title = 'INTELLIGENCE FEED';
                break;
            case 'LIVENEWS':
                content = <LiveNewsWidget />;
                title = 'LIVE WIRE // GLOBAL';
                break;
            case 'CHART':
                content = <ChartWidget symbol={activeSymbol} />;
                title = `CHART // ${activeSymbol.split(':')[1] || activeSymbol}`;
                break;
            case 'CHAT':
                content = <DashboardChatWidget />;
                title = 'AI ANALYST';
                break;
            case 'BROWSER':
                content = <BrowserWidget mode="embedded" />;
                title = 'QUANTUM BROWSER';
                break;
            case 'TRADING':
                content = <TradingPanel symbol={activeSymbol} />;
                title = 'EXECUTION DECK';
                break;
            default: return null;
        }

        return (
            <WindowFrame title={title} className="h-full">
                {content}
            </WindowFrame>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-blue-500 selection:text-black overflow-hidden relative flex flex-col">

            {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            {/* Header / Toolbar */}
            <header className="relative z-20 shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-thin tracking-tight">
                        TERMINAL <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">HUB</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all border ${isEditing ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                    >
                        {isEditing ? 'DONE EDITING' : 'CUSTOMIZE'}
                    </button>
                    {isEditing && (
                        <button onClick={resetLayout} className="text-xs text-red-400 hover:text-red-300 px-2">Reset</button>
                    )}
                </div>
            </header>

            {/* Widget Grid */}
            <motion.main
                layout
                className={`relative z-10 flex-1 p-4 md:p-6 ${isMobile ? 'flex flex-col gap-8 pb-24' : 'grid grid-cols-12 auto-rows-[60px] gap-6 pb-6'} overflow-y-auto custom-scrollbar content-start`}
            >
                <AnimatePresence>
                    {layout.map((widget, index) => (
                        <motion.div
                            layout
                            key={widget.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`relative group rounded-2xl overflow-hidden border bg-[#121218] shadow-lg ${isEditing ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/5'} ${isMobile ? (widget.type === 'BROWSER' || widget.type === 'CHART' ? 'w-full min-h-[500px]' : 'w-full min-h-[350px]') : ''}`}
                            style={!isMobile ? {
                                gridColumn: `span ${widget.colSpan}`,
                                gridRow: `span ${widget.rowSpan}`,
                            } : {}}
                        >
                            {/* Widget Content */}
                            <div className={`h-full w-full ${isEditing ? 'pointer-events-none opacity-50 blur-[1px]' : ''}`}>
                                {renderWidgetContent(widget.type)}
                            </div>

                            {/* Edit Overlays */}
                            {isEditing && (
                                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">

                                    {/* Move Controls */}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        <button onClick={() => moveWidget(index, 'left')} disabled={index === 0} className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button onClick={() => moveWidget(index, 'right')} disabled={index === layout.length - 1} className="p-1.5 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeWidget(widget.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        <div className="col-span-12 md:col-span-3 row-span-4 min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group">
                                            <span className="text-xs text-gray-500 group-hover:text-blue-400 font-bold uppercase tracking-widest">Add Widget</span>
                                            <div className="flex flex-wrap justify-center gap-2 px-4">
                                                {AVAILABLE_WIDGETS.map(w => (
                                                    <button
                                                        key={w.type}
                                                        onClick={() => addWidget(w.type)}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-blue-600 hover:text-white text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded border border-white/5 transition-colors"
                                                    >
                                                        + {w.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                )}
                                    </motion.main>
                                </div>
                            );
}
