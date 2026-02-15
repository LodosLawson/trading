'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WindowFrameProps {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    isMaximized?: boolean;
    className?: string;
}

export default function WindowFrame({ title, children, onClose, className = '' }: WindowFrameProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    return (
        <motion.div
            layout
            className={`flex flex-col bg-[#111115]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl relative group ${isMaximized ? 'fixed inset-4 z-50' : 'h-full w-full'} ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Window Header / Drag Handle */}
            <div className="h-9 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                    {/* Traffic Lights */}
                    <div className="flex gap-1.5 group-hover:opacity-100 opacity-50 transition-opacity">
                        <button onClick={onClose} className="w-2.5 h-2.5 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors" />
                        <button onClick={() => setIsMinimized(!isMinimized)} className="w-2.5 h-2.5 rounded-full bg-amber-500/50 hover:bg-amber-500 transition-colors" />
                        <button onClick={() => setIsMaximized(!isMaximized)} className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 hover:bg-emerald-500 transition-colors" />
                    </div>
                    {/* Title */}
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2 group-hover:text-white transition-colors">
                        {title}
                    </span>
                </div>

                {/* Window Controls (Visual Only for now, effectively handled by traffic lights) */}
                <div className="flex gap-2">
                    {/* Add more custom header controls here if needed */}
                </div>
            </div>

            {/* Window Content */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-1 overflow-hidden relative bg-black/20"
                    >
                        {children}

                        {/* Overlay Gradient (Subtle) */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
