'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DailySnapshot, getSnapshots } from '../../lib/simulationService';

type PnlView = 'daily' | 'monthly';

interface PnlChartProps {
    userId: string;
    startBalance: number;
}

function groupByMonth(snaps: DailySnapshot[]): DailySnapshot[] {
    const map = new Map<string, DailySnapshot>();
    for (const s of snaps) {
        const month = s.date.substring(0, 7); // YYYY-MM
        const existing = map.get(month);
        if (!existing || s.date > existing.date) map.set(month, { ...s, date: month });
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export default function PnlChart({ userId, startBalance }: PnlChartProps) {
    const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
    const [view, setView] = useState<PnlView>('daily');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSnapshots(userId).then(s => { setSnapshots(s.reverse()); setLoading(false); });
    }, [userId]);

    const data = useMemo(() => {
        const src = view === 'daily' ? snapshots : groupByMonth(snapshots);
        return src.slice(-30); // last 30 points
    }, [snapshots, view]);

    const maxPnl = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

    if (loading) return <div className="flex items-center justify-center h-40 text-gray-600 text-xs">Yükleniyor…</div>;

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-600 text-xs p-4 text-center">
                <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <div>Henüz snapshot yok. İşlem yaptıkça PnL geçmişi burada görünür.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-white">PnL Grafiği</div>
                    <div className="text-[9px] text-gray-600">Başlangıç: ${startBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
                </div>
                <div className="flex rounded-lg overflow-hidden border border-white/8 bg-white/3">
                    {(['daily', 'monthly'] as PnlView[]).map(v => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-3 py-1 text-[9px] font-bold transition-all capitalize ${view === v ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >{v === 'daily' ? 'Günlük' : 'Aylık'}</button>
                    ))}
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1 h-28 bg-white/2 rounded-xl p-3 border border-white/5">
                {data.map((d, i) => {
                    const isPos = d.pnl >= 0;
                    const heightPct = Math.min(Math.abs(d.pnl) / maxPnl, 1) * 100;
                    return (
                        <motion.div
                            key={d.date}
                            title={`${d.date}: ${isPos ? '+' : ''}$${d.pnl.toFixed(2)}`}
                            className="flex-1 flex flex-col items-center justify-end group cursor-help"
                            style={{ minWidth: 4, maxWidth: 32 }}
                        >
                            <div className="text-[7px] text-gray-700 opacity-0 group-hover:opacity-100 mb-0.5 whitespace-nowrap">
                                {isPos ? '+' : ''}${d.pnl.toFixed(0)}
                            </div>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPct}%` }}
                                transition={{ duration: 0.4, delay: i * 0.01 }}
                                className="w-full rounded-sm"
                                style={{
                                    minHeight: 2,
                                    background: isPos
                                        ? 'linear-gradient(to top, #059669, #10b981)'
                                        : 'linear-gradient(to top, #dc2626, #ef4444)',
                                    opacity: 0.8
                                }}
                            />
                            {i % Math.ceil(data.length / 5) === 0 && (
                                <div className="text-[6px] text-gray-700 mt-0.5 text-center rotate-45 origin-left whitespace-nowrap overflow-hidden" style={{ maxWidth: 16 }}>
                                    {view === 'daily' ? d.date.slice(5) : d.date}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Toplam Kazanç', val: data.filter(d => d.pnl > 0).reduce((a, d) => a + d.pnl, 0), color: 'emerald' },
                    { label: 'Toplam Kayıp', val: data.filter(d => d.pnl < 0).reduce((a, d) => a + d.pnl, 0), color: 'red' },
                    { label: 'Net PnL', val: data.reduce((a, d) => a + d.pnl, 0), color: 'cyan' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl bg-white/3 border border-white/6 p-2.5 text-center">
                        <div className={`text-sm font-bold text-${s.color}-400`}>
                            {s.val >= 0 ? '+' : ''}${s.val.toFixed(2)}
                        </div>
                        <div className="text-[8px] text-gray-600 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
