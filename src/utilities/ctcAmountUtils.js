// Converts a CTC head's raw HeadAmount — denominated per its own ApplicableType
// ('Monthly', 'Yearly', or 'Daily') — into Monthly/Yearly equivalents.
// Daily uses a 26-working-day month, matching the legacy backend SP's convention
// (see spInsertNewEmployeeCTC: dailyAmount = monthly / 26).
const DAYS_PER_MONTH = 26;

export const toMonthlyYearly = (amount, applicableType) => {
    const value = parseFloat(amount) || 0;
    const type = (applicableType || 'Monthly').trim().toLowerCase();

    if (type === 'yearly') {
        return { monthly: value / 12, yearly: value };
    }
    if (type === 'daily') {
        const monthly = value * DAYS_PER_MONTH;
        return { monthly, yearly: monthly * 12 };
    }
    return { monthly: value, yearly: value * 12 };
};

export const toMonthlyEquivalent = (amount, applicableType) =>
    toMonthlyYearly(amount, applicableType).monthly;

// Inverse of toMonthlyEquivalent — used when a monthly-denominated value (e.g. a
// percentage of Basic Salary) needs to be stored into a head whose own
// ApplicableType may not be Monthly.
export const fromMonthlyEquivalent = (monthlyAmount, applicableType) => {
    const type = (applicableType || 'Monthly').trim().toLowerCase();
    if (type === 'yearly') return monthlyAmount * 12;
    if (type === 'daily')  return monthlyAmount / DAYS_PER_MONTH;
    return monthlyAmount;
};

// Picks the correct minimum-amount field for a head based on its ApplicableType.
export const minAmountForType = (head) => {
    const type = (head?.ApplicableType || 'Monthly').trim().toLowerCase();
    if (type === 'yearly') return parseFloat(head?.MinAnnualAmount) || 0;
    if (type === 'daily')  return parseFloat(head?.MinDialyAmount)  || 0;
    return parseFloat(head?.MinMonthAmount) || 0;
};
