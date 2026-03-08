import { useMemo } from 'react';
import type { Card } from '../../types';

interface DashboardsProps {
    cards: Card[];
}

export default function Dashboards({ cards }: DashboardsProps) {
    const calculations = useMemo(() => {
        const WEIGHTS: Record<string, number> = {
            'Jeppesen': 50,
            'Pré Assigment': 33.33,
            'CAE': 16.95
        };

        const calculateWeightedProgress = (cardsToCalc: Card[]) => {
            if (cardsToCalc.length === 0) return 0;
            let earned = 0;
            let possible = 0;
            const teamsInCards = Array.from(new Set(cardsToCalc.map(c => c.team)));

            teamsInCards.forEach(team => {
                const teamCards = cardsToCalc.filter(c => c.team === team);
                const weight = WEIGHTS[team] || 0;
                if (weight > 0 && teamCards.length > 0) {
                    const completedCount = teamCards.filter(c => c.status === 'Concluído').length;
                    const completionRate = completedCount / teamCards.length;
                    earned += completionRate * weight;
                    possible += weight;
                }
            });
            if (possible === 0) return 0;
            return Math.min(100, Math.round((earned / possible) * 100));
        };

        const total = cards.length;
        const progressTotal = calculateWeightedProgress(cards);
        const groups = ['A320', 'A330', 'ATR', 'ERJ', 'Cmros'];
        const byEquipment = groups.map(group => {
            const groupCards = cards.filter(c => c.equipment === group);
            const progress = calculateWeightedProgress(groupCards);
            return { group, progress, total: groupCards.length };
        });

        return { progressTotal, total, byEquipment };
    }, [cards]);

    return (
        <div className="bg-white border-b border-slate-200 py-3 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
                {/* Compact Global Progress */}
                <div className="flex items-center gap-6 shrink-0 border-r border-slate-100 pr-10">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg width="80" height="80" className="transform -rotate-90">
                            <circle cx="40" cy="40" r="34" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                            <circle
                                cx="40" cy="40" r="34" fill="transparent" stroke="#2563eb" strokeWidth="8"
                                strokeDasharray={213.6}
                                strokeDashoffset={213.6 - (calculations.progressTotal / 100) * 213.6}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-sm font-black text-slate-800">{calculations.progressTotal}%</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Global</h4>
                        <p className="text-sm font-bold text-deep-navy">{calculations.total} Cards Ativos</p>
                    </div>
                </div>

                {/* Horizontal Equipment Progress */}
                <div className="flex-1 flex gap-8 items-center py-2">
                    {calculations.byEquipment.map((eq) => (
                        <div key={eq.group} className="min-w-[140px] flex-1">
                            <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">
                                <span>{eq.group}</span>
                                <span className="text-primary-600 font-black">{eq.progress}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-primary-600 rounded-full transition-all duration-700 shadow-sm"
                                    style={{ width: `${eq.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

