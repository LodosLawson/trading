'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { getUserSettings, saveUserSettings, UserSettings, DEFAULT_SETTINGS } from '@/lib/userSettings';
import WindowFrame from '@/components/ui/WindowFrame';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [configLoading, setConfigLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/auth/login');
            return;
        }

        getUserSettings(user.uid).then(s => {
            setSettings(s);
            setConfigLoading(false);
        });
    }, [user, authLoading, router]);

    const handleSave = async (newSettings: UserSettings) => {
        setSettings(newSettings);
        if (user) {
            await saveUserSettings(user.uid, newSettings);
        }
    };

    const toggleTheme = () => {
        const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
        handleSave({ ...settings, theme: newTheme });
    };

    const toggleWidgetEnabled = (widgetId: string) => {
        const current = settings.widgets[widgetId];
        handleSave({
            ...settings,
            widgets: {
                ...settings.widgets,
                [widgetId]: { ...current, visible: !current.visible }
            }
        });
    };

    if (authLoading || configLoading) return <div className="min-h-screen bg-[#030304] flex items-center justify-center text-gray-500 font-mono">Loading Config...</div>;

    return (
        <div className="min-h-screen bg-[#030304] text-white p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">SETTINGS</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-500 text-sm font-mono">SYSTEM CONFIGURATION</p>
                            {user ? (
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">CLOUD SYNC ACTIVE</span>
                            ) : (
                                <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">LOCAL STORAGE (GUEST)</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/terminal')}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 hover:text-blue-400 transition-colors"
                    >
                        RETURN TO TERMINAL
                    </button>
                </div>

                {/* Layout Selection */}
                <section className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full" />
                        Workspace Layout
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['grid', 'list', 'window', 'page'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleSave({ ...settings, layoutMode: mode as any })}
                                className={`p-4 rounded-xl border transition-all text-center group ${settings.layoutMode === mode ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400'}`}
                            >
                                <div className="text-sm font-bold uppercase tracking-wider mb-1">{mode}</div>
                                <div className="text-[10px] opacity-60">
                                    {mode === 'grid' && 'Structured Dashboard'}
                                    {mode === 'list' && 'Vertical Feed'}
                                    {mode === 'window' && 'Floating Windows'}
                                    {mode === 'page' && 'Focused Views'}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Visual Mode Selection */}
                <section className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Visual Mode
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleSave({ ...settings, theme: 'dark' })}
                            className={`p-6 rounded-xl border transition-all text-left group ${settings.theme === 'dark' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                        >
                            <div className="text-lg font-bold mb-2 group-hover:text-blue-400">Cyber Dark</div>
                            <p className="text-xs text-gray-500">High contrast, OLED optimized path tracing aesthetic.</p>
                        </button>
                        <button
                            onClick={() => handleSave({ ...settings, theme: 'light' })}
                            className={`p-6 rounded-xl border transition-all text-left group ${settings.theme === 'light' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent hover:border-white/10'}`}
                        >
                            <div className="text-lg font-bold mb-2 group-hover:text-blue-400">Corporate Light</div>
                            <p className="text-xs text-gray-500">Clean, professional styling for bright environments.</p>
                        </button>
                    </div>
                </section>

                {/* Widget Management */}
                <section className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                        Active Modules
                    </h2>
                    <p className="text-xs text-gray-500 mb-6">Enable or disable modules to appear in your Terminal Dock.</p>

                    <div className="space-y-3">
                        {Object.entries(settings.widgets).map(([id, config]) => (
                            <div key={id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="font-mono text-sm capitalize">{id.replace(/-/g, ' ')}</span>
                                <button
                                    onClick={() => toggleWidgetEnabled(id)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config.visible ? 'bg-green-500/20' : 'bg-gray-800'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.visible ? 'translate-x-6 bg-green-400' : 'translate-x-0 bg-gray-500'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="text-center text-xs text-gray-600 font-mono py-8">
                    CHANGES AUTO-SAVED TO CLOUD
                </div>

            </div>
        </div>
    );
}
