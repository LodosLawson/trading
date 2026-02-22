'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WidgetSettings {
    theme: 'dark' | 'glass' | 'minimal' | 'neon';
    accent: string;
    customTitle: string;
    colSpan: number;
    rowSpan: number;
}

const ACCENT_COLORS = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Cyan', value: '#06b6d4' },
];

const THEMES = [
    { id: 'dark', label: 'Dark', desc: 'Default dark', cls: 'bg-[#111115] border-white/10' },
    { id: 'glass', label: 'Glass', desc: 'Frosted glass', cls: 'bg-white/5 border-white/20 backdrop-blur-md' },
    { id: 'minimal', label: 'Minimal', desc: 'No border', cls: 'bg-transparent border-transparent' },
    { id: 'neon', label: 'Neon', desc: 'Glowing accent', cls: 'bg-[#080810] border-blue-500/40' },
] as const;

const SIZE_PRESETS = [
    { label: 'Small', col: 3, row: 4 },
    { label: 'Medium', col: 6, row: 6 },
    { label: 'Wide', col: 9, row: 6 },
    { label: 'Full', col: 12, row: 8 },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    defaultTitle: string;
    current: Partial<WidgetSettings>;
    onChange: (s: Partial<WidgetSettings>) => void;
    isMobile: boolean;
}

export default function WidgetSettingsPopup({
    isOpen,
    onClose,
    defaultTitle,
    current,
    onChange,
    isMobile,
}: Props) {
    const [title, setTitle] = useState(current.customTitle ?? defaultTitle);
    const theme = current.theme ?? 'dark';
    const accent = current.accent ?? '#3b82f6';

    const apply = (patch: Partial<WidgetSettings>) => onChange(patch);

    const handleTitleBlur = () => {
        apply({ customTitle: title });
    };

    if (!isOpen) return null;

    const content = (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-wider uppercase">Widget Settings</h3>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Title */}
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none transition-colors"
                    placeholder={defaultTitle}
                />
            </div>

            {/* Theme */}
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => apply({ theme: t.id })}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                                ${theme === t.id
                                    ? 'border-blue-500 bg-blue-500/10 text-white'
                                    : 'border-white/8 bg-white/3 text-gray-400 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            <span className={`w-4 h-4 rounded-md shrink-0 border ${t.cls}`} />
                            <div>
                                <div className="text-xs font-bold">{t.label}</div>
                                <div className="text-[10px] text-gray-500">{t.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Accent Color */}
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Accent Color</label>
                <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map((c) => (
                        <button
                            key={c.value}
                            title={c.label}
                            onClick={() => apply({ accent: c.value })}
                            className={`w-8 h-8 rounded-full transition-all border-2 ${accent === c.value ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
                            style={{ backgroundColor: c.value }}
                        />
                    ))}
                </div>
            </div>

            {/* Size Presets */}
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Size</label>
                <div className="grid grid-cols-4 gap-2">
                    {SIZE_PRESETS.map((s) => (
                        <button
                            key={s.label}
                            onClick={() => apply({ colSpan: s.col, rowSpan: s.row })}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all
                                ${current.colSpan === s.col
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-white/3 border-white/8 text-gray-400 hover:text-white hover:border-white/20'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Mobile: bottom sheet
    if (isMobile) {
        return (
            <AnimatePresence>
                <motion.div
                    key="ws-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    key="ws-sheet"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[201] bg-[#13131a] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl"
                    style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag handle */}
                    <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                    {content}
                </motion.div>
            </AnimatePresence>
        );
    }

    // Desktop: floating dropdown
    return (
        <AnimatePresence>
            <motion.div
                key="ws-overlay-d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200]"
                onClick={onClose}
            />
            <motion.div
                key="ws-panel-d"
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-10 right-0 z-[201] w-72 bg-[#13131a] border border-white/10 rounded-2xl p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {content}
            </motion.div>
        </AnimatePresence>
    );
}
