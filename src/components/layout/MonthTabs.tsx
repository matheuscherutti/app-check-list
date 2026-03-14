import { getAvailableMonths, formatMonthLabel } from '../../utils/dateHelper';

interface MonthTabsProps {
    selectedMonth: string;
    onSelectMonth: (month: string) => void;
}

export default function MonthTabs({ selectedMonth, onSelectMonth }: MonthTabsProps) {
    const months = getAvailableMonths();

    return (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/70">
            {months.map((month) => {
                const isSelected = selectedMonth === month;
                return (
                    <button
                        key={month}
                        onClick={() => onSelectMonth(month)}
                        className={`
                            px-5 py-2 rounded-lg text-[12px] transition-all whitespace-nowrap uppercase tracking-wider
                            ${isSelected
                                ? 'bg-white text-blue-600 font-extrabold shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-400 font-bold hover:text-slate-500 hover:bg-slate-200/50'
                            }
                        `}
                    >
                        {formatMonthLabel(month)}
                    </button>
                );
            })}
        </div>
    );
}
