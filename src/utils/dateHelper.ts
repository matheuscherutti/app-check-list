import { format, addMonths, subMonths } from 'date-fns';

export function getAvailableMonths() {
    const currentDate = new Date();
    const months: string[] = [];

    // 1 month before
    months.push(format(subMonths(currentDate, 1), 'yyyy-MM'));

    // Current month
    months.push(format(currentDate, 'yyyy-MM'));

    // 6 months after
    for (let i = 1; i <= 6; i++) {
        months.push(format(addMonths(currentDate, i), 'yyyy-MM'));
    }

    // Ensure they are sorted (they should be already)
    return months;
}

export function formatMonthLabel(monthId: string) {
    if (!monthId) return '';
    const [year, month] = monthId.split('-');

    const monthNamesDict: { [key: string]: string } = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
        '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
        '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    const monthLabel = monthNamesDict[month] || '';
    return `${monthLabel.toUpperCase()} ${year}`;
}
