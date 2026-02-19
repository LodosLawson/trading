'use client';

import React from 'react';
import { motion, DragControls, useDragControls, PanInfo } from 'framer-motion';
import { WidgetConfig } from '@/lib/userSettings';

interface WidgetContainerProps {
    widgetId: string;
    settings: any; // UserSettings type
    isEditing: boolean;
    isMobile: boolean;
    colSpan: number;
    rowSpan: number;
    index: number;
    activeWindow: string | null;
    setActiveWindow: (id: string) => void;
    updateWindowPosition: (id: string, dx: number, dy: number) => void;
    onRemove: (id: string) => void;
    onResize: (id: string, dx: number, dy: number) => void;
    children: (dragControls: DragControls) => React.ReactNode;
}

export default function WidgetContainer({
    widgetId,
    settings,
    isEditing,
    isMobile,
    colSpan,
    rowSpan,
    index,
    activeWindow,
    setActiveWindow,
    updateWindowPosition,
    onRemove,
    onResize,
    children
}: WidgetContainerProps) {
    const dragControls = useDragControls();

    const config = settings.widgets[widgetId] || { visible: true };
    const winConfig = config.window || {
        x: 100 + (index * 40),
        y: 100 + (index * 40),
        w: 500,
        h: 400,
        z: 10 + index
    };

    return (
        <motion.div
            layout={settings.layoutMode !== 'window'}
            key={widgetId}
            onMouseDown={() => setActiveWindow(widgetId)}

            // Drag Configuration
            drag={settings.layoutMode === 'window'}
            dragListener={false} // Enable drag only via controls
            dragControls={dragControls}
            dragMomentum={false}
            onDragEnd={(_, info: PanInfo) => {
                if (settings.layoutMode !== 'window') return;
                updateWindowPosition(widgetId, info.offset.x, info.offset.y);
            }}

            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                zIndex: activeWindow === widgetId ? 50 : winConfig.z,
                x: settings.layoutMode === 'window' ? winConfig.x : 0,
                y: settings.layoutMode === 'window' ? winConfig.y : 0,
                width: settings.layoutMode === 'window' ? winConfig.w : 'auto',
                height: settings.layoutMode === 'window' ? winConfig.h : 'auto',
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}

            className={`
                relative group rounded-2xl transition-shadow shadow-lg
                ${isEditing ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/5'}
                ${settings.layoutMode === 'window' ? 'absolute border bg-[#121218]' : ''}
                ${!isMobile && settings.layoutMode === 'grid' ? '' : 'w-full min-h-[400px]'}
            `}
            style={
                !isMobile && settings.layoutMode === 'grid'
                    ? { gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }
                    : {}
            }
        >
            {/* Render Widget Content with DragControls */}
            <div className={`h-full w-full ${isEditing ? 'pointer-events-none opacity-50 blur-[1px]' : ''}`}>
                {children(dragControls)}
            </div>

            {/* Edit Overlay (Only for Grid/List mode editing) */}
            {isEditing && settings.layoutMode !== 'window' && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm border-2 border-dashed border-blue-500/50 rounded-2xl">
                    <button
                        onClick={() => onRemove(widgetId)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-gray-400 uppercase">Width</span>
                            <div className="flex gap-1">
                                <button onClick={() => onResize(widgetId, -1, 0)} className="p-1 hover:text-blue-400 font-mono text-lg">-</button>
                                <span className="font-mono text-xs w-4 text-center">{colSpan}</span>
                                <button onClick={() => onResize(widgetId, 1, 0)} className="p-1 hover:text-blue-400 font-mono text-lg">+</button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 border-l border-white/10 pl-4">
                            <span className="text-[9px] text-gray-400 uppercase">Height</span>
                            <div className="flex gap-1">
                                <button onClick={() => onResize(widgetId, 0, -1)} className="p-1 hover:text-blue-400 font-mono text-lg">-</button>
                                <span className="font-mono text-xs w-4 text-center">{rowSpan}</span>
                                <button onClick={() => onResize(widgetId, 0, 1)} className="p-1 hover:text-blue-400 font-mono text-lg">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
