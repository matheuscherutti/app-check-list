import { getAvailableMonths, formatMonthLabel } from '../../utils/dateHelper';

interface MonthTabsProps {
    selectedMonth: string;
    onSelectMonth: (month: string) => void;
}

export default function MonthTabs({ selectedMonth, onSelectMonth }: MonthTabsProps) {
    const months = getAvailableMonths();

    return (
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar">
            {months.map((month) => {
                const isSelected = selectedMonth === month;
                return (
                    <button
                        key={month}
                        onClick={() => onSelectMonth(month)}
                        className={`
                            px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap uppercase
                            ${isSelected
                                ? 'bg-white text-primary-600 shadow-sm ring-1 ring-slate-100'
                                : 'text-slate-400 hover:text-deep-navy'
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
