'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, DragControls } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getUserSettings, saveUserSettings, DEFAULT_SETTINGS, UserSettings } from '@/lib/userSettings';
import WindowFrame from '@/components/ui/WindowFrame';
import WidgetContainer from '@/components/dashboard/WidgetContainer';
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

// New users start with an empty workspace
const DEFAULT_LAYOUT: Widget[] = [];

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
    const router = useRouter();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [layout, setLayout] = useState<Widget[]>(DEFAULT_LAYOUT);
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showAddWidget, setShowAddWidget] = useState(false);

    // Initialize & Load Layout
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        async function loadSettings() {
            const uid = user?.uid || 'guest';
            const s = await getUserSettings(uid);
            setSettings(s);
        }
        loadSettings();

        return () => window.removeEventListener('resize', checkMobile);
    }, [user]);

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
        if (confirm('Clear all widgets?')) {
            setLayout([]);
        }
    };

    // --- RENDERERS ---

    const [activeSymbol, setActiveSymbol] = useState('BINANCE:BTCUSDT');

    // Helper for consistent defaults
    const getDefaultWindowConfig = (id: string) => {
        const index = layout.findIndex(w => w.id === id);
        // Fallback if not found (shouldn't happen)
        const idx = index !== -1 ? index : 0;
        return {
            x: 100 + (idx * 40),
            y: 100 + (idx * 40),
            w: 500,
            h: 400,
            z: 10 + idx
        };
    };

    const updateWindowPosition = (id: string, dx: number, dy: number) => {
        const current = settings.widgets[id]?.window || getDefaultWindowConfig(id);
        const newWindow = { ...current, x: current.x + dx, y: current.y + dy };
        const newWidgets = { ...settings.widgets, [id]: { ...settings.widgets[id], window: newWindow } };
        setSettings({ ...settings, widgets: newWidgets });
        saveUserSettings(user?.uid || 'guest', { ...settings, widgets: newWidgets });
    };

    const handleResize = (id: string, dx: number, dy: number) => {
        const current = settings.widgets[id]?.window || getDefaultWindowConfig(id);
        const newWindow = { ...current, w: Math.max(300, current.w + dx), h: Math.max(200, current.h + dy) };
        const newWidgets = { ...settings.widgets, [id]: { ...settings.widgets[id], window: newWindow } };
        // Optimization: Debounce sending to server? For now setState is fine, visually instant.
        setSettings({ ...settings, widgets: newWidgets });
    };

    const handleResizeEnd = async (id: string) => {
        await saveUserSettings(user?.uid || 'guest', settings);
    };

    const [activeWindow, setActiveWindow] = useState<string | null>(null);

    // --- RENDERERS ---

    const renderWidgetContent = (type: WidgetType, id: string, dragControls?: DragControls) => {
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
            <WindowFrame
                title={title}
                className="h-full"
                dragEnabled={false} // Handled by outer wrapper
                dragControls={dragControls}
                onFocus={() => setActiveWindow(id)}
                onResize={(dx, dy) => handleResize(id, dx, dy)}
                onResizeEnd={() => handleResizeEnd(id)}
            >
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
            <header className="relative z-20 shrink-0 h-14 border-b border-white/5 flex items-center justify-between px-5 bg-[#0a0a0f]/90 backdrop-blur-md">
                {/* Left: Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <h1 className="text-sm font-bold tracking-widest uppercase text-white/80">
                        Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">Hub</span>
                    </h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                    {/* + Widget */}
                    <button
                        onClick={() => setShowAddWidget(true)}
                        title="Add Widget"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all border bg-white/3 border-white/8 text-gray-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-600/10"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Widget</span>
                    </button>

                    {/* Customize / Done */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        title={isEditing ? 'Done Editing' : 'Customize Layout'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all border ${isEditing
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                : 'bg-white/3 border-white/8 text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {isEditing ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Done</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span>Layout</span>
                            </>
                        )}
                    </button>

                    {/* Clear All — only in edit mode */}
                    {isEditing && (
                        <button
                            onClick={resetLayout}
                            title="Clear all widgets"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/10 mx-1" />

                    {/* Settings */}
                    <button
                        onClick={() => router.push('/settings')}
                        title="Settings"
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Widget Grid */}
            <motion.main
                layout={settings.layoutMode !== 'window'}
                className={`relative z-10 flex-1 p-4 md:p-6 ${settings.layoutMode === 'list' ? 'flex flex-col gap-6' : (settings.layoutMode === 'window' ? 'block' : 'grid grid-cols-1 lg:grid-cols-12 auto-rows-[60px] gap-6')} pb-6 overflow-y-auto custom-scrollbar content-start`}
            >
                <AnimatePresence>
                    {layout.map((widget, index) => {
                        const config = settings.widgets[widget.id] || { visible: true };
                        if (!config.visible) return null;

                        // Window Mode Config
                        const winConfig = config.window || getDefaultWindowConfig(widget.id);

                        return (
                            <WidgetContainer
                                key={widget.id}
                                widgetId={widget.id}
                                settings={settings}
                                isEditing={isEditing}
                                isMobile={isMobile}
                                colSpan={widget.colSpan}
                                rowSpan={widget.rowSpan}
                                index={index}
                                activeWindow={activeWindow}
                                setActiveWindow={setActiveWindow}
                                updateWindowPosition={updateWindowPosition}
                                onRemove={removeWidget}
                                onResize={resizeWidget}
                            >
                                {(dragControls) => renderWidgetContent(widget.type, widget.id, dragControls)}
                            </WidgetContainer>
                        );
                    })}
                </AnimatePresence>

                {/* EMPTY STATE ONBOARDING — Shown when no widgets exist */}
                {layout.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="col-span-12 flex flex-col items-center justify-center h-full min-h-[70vh] text-center gap-8"
                    >
                        {/* Hero Icon */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center">
                                <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                        </div>

                        <div className="space-y-3 max-w-md">
                            <h2 className="text-3xl font-thin tracking-tight text-white">
                                Your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">workspace</span> is empty
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed">
                                Add your first widget to get started. You can customize your layout anytime from the toolbar above.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
                            {[
                                { icon: '📊', label: 'Widgets', desc: 'Add charts, news feeds, market data, AI chat, and more' },
                                { icon: '⚙️', label: 'Settings', desc: 'Change layout mode, theme, and global preferences' },
                                { icon: '🪟', label: 'Window Mode', desc: 'Freely drag and resize panels like a real OS' },
                            ].map(item => (
                                <div key={item.label} className="bg-white/3 border border-white/5 rounded-2xl p-4 text-left hover:border-white/10 hover:bg-white/5 transition-all">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                                    <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => setShowAddWidget(true)}
                            className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-widest uppercase rounded-full transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
                        >
                            + Add Your First Widget
                        </button>
                    </motion.div>
                )}

                {/* Inline "Add Widget" tile shown in edit mode (non-empty) */}
                {isEditing && layout.length > 0 && (
                    <div className="col-span-12 md:col-span-3 min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group cursor-pointer" onClick={() => setShowAddWidget(true)}>
                        <span className="text-3xl text-white/20 group-hover:text-blue-400 transition-colors">+</span>
                        <span className="text-xs text-gray-500 group-hover:text-blue-400 font-bold uppercase tracking-widest">Add Widget</span>
                    </div>
                )}
            </motion.main>

            {/* Floating Widget Picker Modal */}
            <AnimatePresence>
                {showAddWidget && (
                    <motion.div
                        key="widget-picker"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowAddWidget(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#111115] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold tracking-tight">Add Widget</h3>
                                <button onClick={() => setShowAddWidget(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {AVAILABLE_WIDGETS.map(w => (
                                    <button
                                        key={w.type}
                                        onClick={() => { addWidget(w.type); setShowAddWidget(false); }}
                                        className="group flex items-center gap-3 p-4 bg-white/3 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 rounded-xl text-left transition-all"
                                    >
                                        <span className="text-xl">{
                                            w.type === 'MARKET' ? '📈' :
                                                w.type === 'NEWS' ? '📰' :
                                                    w.type === 'LIVENEWS' ? '⚡' :
                                                        w.type === 'CHART' ? '📊' :
                                                            w.type === 'CHAT' ? '🤖' :
                                                                w.type === 'BROWSER' ? '🌐' : '💹'
                                        }</span>
                                        <div>
                                            <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{w.label}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
