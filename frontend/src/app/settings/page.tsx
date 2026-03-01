'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { getUserSettings, saveUserSettings, UserSettings, DEFAULT_SETTINGS } from '@/lib/userSettings';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [configLoading, setConfigLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        const uid = user?.uid || 'guest';
        getUserSettings(uid).then(s => {
            setSettings(s);
            setConfigLoading(false);
        });
    }, [user, authLoading]);

    const handleSave = async (newSettings: UserSettings) => {
        setSettings(newSettings);
        const uid = user?.uid || 'guest';
        await saveUserSettings(uid, newSettings);
    };

    if (authLoading || configLoading) return (
        <div className="min-h-screen bg-[#030304] flex items-center justify-center">
            <div className="animate-pulse text-xs font-mono tracking-widest text-gray-500">SYSTEM_INIT...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030304] text-white font-sans selection:bg-blue-500 selection:text-black overflow-y-auto">
            {/* Background FX */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 space-y-12">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                            SYSTEM <span className="text-gray-600">CONFIG</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${user ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500'}`}>
                                {user ? 'Cloud Sync Active' : 'Local Guest Mode'}
                            </span>
                            <span className="text-gray-600 text-[10px] uppercase tracking-wider">v2.4.0-Stable</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/terminal')}
                        className="group flex items-center gap-3 pl-4 pr-5 py-3 bg-white text-black hover:bg-blue-500 hover:text-white rounded-full transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="text-xs font-bold uppercase tracking-widest">Return to Terminal</span>
                    </button>
                </header>

                {/* Main Config Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 1. Interface Mode (Navigation) */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Interface Mode</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => handleSave({ ...settings, navigationMode: 'sidebar' })}
                                className={`group relative p-6 rounded-2xl border text-left transition-all ${settings.navigationMode === 'sidebar' ? 'bg-blue-600/5 border-blue-500' : 'bg-[#0a0a0f] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="absolute top-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${settings.navigationMode === 'sidebar' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Standard Menu</h3>
                                <p className="text-sm text-gray-500 group-hover:text-gray-400">
                                    Traditional sidebar navigation with quick access to pages and tools.
                                </p>
                            </button>

                            <button
                                onClick={() => handleSave({ ...settings, navigationMode: 'hidden' })}
                                className={`group relative p-6 rounded-2xl border text-left transition-all ${settings.navigationMode === 'hidden' ? 'bg-purple-600/5 border-purple-500' : 'bg-[#0a0a0f] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="absolute top-4 right-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className={`text-lg font-bold mb-1 ${settings.navigationMode === 'hidden' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>Focus Terminal</h3>
                                <p className="text-sm text-gray-500 group-hover:text-gray-400">
                                    Minimalist "Immersive" mode. Sidebar is hidden for maximum screen real estate.
                                </p>
                            </button>
                        </div>
                    </section>

                    {/* 2. Workspace Layout */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Workspace Layout</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 h-full">
                            <button
                                onClick={() => handleSave({ ...settings, layoutMode: 'grid' })}
                                className={`p-4 flex flex-col justify-center items-center text-center rounded-2xl border transition-all ${settings.layoutMode === 'grid' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#0a0a0f] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
                            >
                                <svg className="w-8 h-8 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Grid Dashboard</span>
                            </button>

                            <button
                                onClick={() => handleSave({ ...settings, layoutMode: 'list' })}
                                className={`p-4 flex flex-col justify-center items-center text-center rounded-2xl border transition-all ${settings.layoutMode === 'list' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#0a0a0f] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
                            >
                                <svg className="w-8 h-8 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Vertical Feed</span>
                            </button>

                            <button
                                onClick={() => handleSave({ ...settings, layoutMode: 'window' })}
                                className={`p-4 flex flex-col justify-center items-center text-center rounded-2xl border transition-all ${settings.layoutMode === 'window' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-[#0a0a0f] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
                            >
                                <svg className="w-8 h-8 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Floating Win</span>
                            </button>
                        </div>
                    </section>

                    {/* 3. Server Configuration */}
                    <section className="space-y-6 md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Backend Server Connection</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleSave({ ...settings, serverUrl: '' })}
                                className={`p-4 flex flex-col justify-center items-start rounded-2xl border transition-all ${!settings.serverUrl ? 'bg-pink-500/10 border-pink-500' : 'bg-[#0a0a0f] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${!settings.serverUrl ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-gray-600'}`} />
                                    <span className={`text-sm font-bold ${!settings.serverUrl ? 'text-pink-500' : 'text-gray-400'}`}>Pulse Cloud (Default)</span>
                                </div>
                                <p className="text-xs text-gray-500 text-left">Connects to the official LockTrace cloud servers via environment variables.</p>
                            </button>

                            <button
                                onClick={() => handleSave({ ...settings, serverUrl: 'http://localhost:8000' })}
                                className={`p-4 flex flex-col justify-center items-start rounded-2xl border transition-all ${settings.serverUrl === 'http://localhost:8000' ? 'bg-pink-500/10 border-pink-500' : 'bg-[#0a0a0f] border-white/5 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${settings.serverUrl === 'http://localhost:8000' ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-gray-600'}`} />
                                    <span className={`text-sm font-bold ${settings.serverUrl === 'http://localhost:8000' ? 'text-pink-500' : 'text-gray-400'}`}>Local Node</span>
                                </div>
                                <p className="text-xs text-gray-500 text-left">Connects to a backend running on port 8000 of your current device.</p>
                            </button>

                            <div className={`p-4 flex flex-col justify-center items-start rounded-2xl border transition-all ${(settings.serverUrl && settings.serverUrl !== 'http://localhost:8000') ? 'bg-pink-500/10 border-pink-500' : 'bg-[#0a0a0f] border-white/5 focus-within:border-white/20'}`}>
                                <div className="flex items-center gap-2 mb-2 w-full">
                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${(settings.serverUrl && settings.serverUrl !== 'http://localhost:8000') ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]' : 'bg-gray-600'}`} />
                                    <span className={`text-sm font-bold w-full ${(settings.serverUrl && settings.serverUrl !== 'http://localhost:8000') ? 'text-pink-500' : 'text-gray-400'}`}>Custom Remote</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://your-ngrok.url"
                                    value={(settings.serverUrl && settings.serverUrl !== 'http://localhost:8000') ? settings.serverUrl : ''}
                                    onChange={(e) => handleSave({ ...settings, serverUrl: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50 transition-colors mt-1 font-mono"
                                />
                            </div>
                        </div>
                    </section>

                </div>

                {/* 4. Module Visibility */}
                <section className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Active Modules</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(settings.widgets).map(([id, config]) => (
                            <div key={id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <div>
                                    <div className="text-sm font-bold text-gray-200 capitalize">{id.replace(/-/g, ' ')}</div>
                                    <div className="text-[10px] text-gray-600 font-mono mt-1">ID: {id.split('-')[0].toUpperCase()}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        const newWidgets = { ...settings.widgets, [id]: { ...config, visible: !config.visible } };
                                        handleSave({ ...settings, widgets: newWidgets });
                                    }}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config.visible ? 'bg-green-500' : 'bg-white/10'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${config.visible ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
