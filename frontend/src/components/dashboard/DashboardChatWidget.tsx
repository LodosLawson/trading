'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface DashboardChatWidgetProps {
    symbol?: string; // e.g. "BINANCE:BTCUSDT"
}

export default function DashboardChatWidget({ symbol }: DashboardChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'MarketMind ready.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const cleanSymbol = symbol ? symbol.split(':')[1]?.replace('USDT', '') : '';

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msgText = text || input;
        if (!msgText.trim()) return;

        const userMsg: Message = { role: 'user', content: msgText };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msgText }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.reply || 'Analysis complete.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection lost.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden relative">
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Link</span>
                {cleanSymbol && (
                    <button
                        onClick={() => sendMessage(`Analyze technical structure of ${cleanSymbol} and give short term prediction.`)}
                        className="text-[9px] bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30 transition-colors"
                    >
                        ✨ Analyze {cleanSymbol}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 custom-scrollbar" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] px-3 py-2 rounded-lg text-xs leading-relaxed ${m.role === 'user'
                                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-br-none'
                                : 'bg-white/5 text-gray-300 border border-white/5 rounded-bl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg rounded-bl-none">
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-white/5 bg-[#0a0a0f]/30">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={`Ask about ${cleanSymbol || 'markets'}...`}
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg className="w-3 h-3 transform rotate-90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
