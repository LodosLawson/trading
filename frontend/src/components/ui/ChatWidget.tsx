'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Hello. I am MarketMind. Ask me about the markets.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ message: userMsg.content }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Connection Error.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-black/90 backdrop-blur-xl border border-gray-700 w-80 h-96 mb-4 rounded-lg shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                            <span className="text-sm font-bold tracking-wider text-blue-400">MARKETMIND AI</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3" ref={scrollRef}>
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2 rounded text-xs ${m.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-200 border border-gray-700'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {loading && <div className="text-xs text-gray-500 animate-pulse">Analyzing...</div>}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-700 bg-gray-900/50 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a query..."
                                className="flex-1 bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={sendMessage}
                                className="text-blue-500 hover:text-blue-400 text-xs font-bold"
                            >
                                SEND
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-lg shadow-blue-900/20 border border-blue-400/30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
            </motion.button>
        </div>
    );
}
