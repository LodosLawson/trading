'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls, DragControls } from 'framer-motion';

interface WindowFrameProps {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onFocus?: () => void;
    onResize?: (deltaW: number, deltaH: number) => void;
    onResizeEnd?: () => void;
    isMaximized?: boolean;
    className?: string;
    dragEnabled?: boolean;
    dragControls?: DragControls;
}

export default function WindowFrame({
    title,
    children,
    onClose,
    onFocus,
    onResize,
    onResizeEnd,
    className = '',
    dragEnabled = false,
    dragControls
}: WindowFrameProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Internal controls if none provided (legacy support)
    const internalDragControls = useDragControls();
    const activeControls = dragControls || internalDragControls;
    const resizeControls = useDragControls();

    return (
        <motion.div
            layout
            drag={dragEnabled && !isMaximized}
            dragControls={dragEnabled ? internalDragControls : undefined}
            dragListener={false}
            dragMomentum={false}
            onPointerDown={onFocus}
            className={`flex flex-col bg-[#111115]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl relative group ${isMaximized ? 'fixed inset-4 z-50' : 'h-full w-full'} ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Window Header / Drag Handle */}
            <div
                onPointerDown={(e) => {
                    if ((dragEnabled || dragControls) && !isMaximized) {
                        activeControls.start(e);
                    }
                }}
                className="window-header h-9 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing touch-none"
            >
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

                        {/* Resize Handle */}
                        {dragEnabled && !isMaximized && (
                            <motion.div
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0}
                                dragMomentum={false}
                                onDrag={(_, info) => onResize && onResize(info.delta.x, info.delta.y)}
                                onDragEnd={onResizeEnd}
                                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 flex items-center justify-center group/handle"
                            >
                                <div className="w-2 h-2 border-r-2 border-b-2 border-white/20 group-hover/handle:border-blue-500 transition-colors" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
