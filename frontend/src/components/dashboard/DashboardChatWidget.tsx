'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function DashboardChatWidget() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'MarketMind ready.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
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
        <div className="h-full flex flex-col bg-[#1a1a20] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#0a0a0f]/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Link</span>
                <span className={`block w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-violet-500'}`}></span>
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
                        placeholder="Ask..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                        onClick={sendMessage}
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
