// ======================================
// DATE UTILITY FUNCTIONS
// ======================================

/**
 * Get formatted date string in YYYY-MM-DD format
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
export const getTodayDate = () => {
    return formatDate(new Date());
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 * @returns {string} - Yesterday's date
 */
export const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
};

/**
 * Get the first day of current month in YYYY-MM-DD format
 * @returns {string} - First day of current month
 */
export const getMonthStartDate = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return formatDate(firstDay);
};

/**
 * Get the last day of current month in YYYY-MM-DD format
 * @returns {string} - Last day of current month
 */
export const getMonthEndDate = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return formatDate(lastDay);
};

/**
 * Get the first day of previous month in YYYY-MM-DD format
 * @returns {string} - First day of previous month
 */
export const getPreviousMonthStartDate = () => {
    const today = new Date();
    const firstDayPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return formatDate(firstDayPreviousMonth);
};

/**
 * Get the last day of previous month in YYYY-MM-DD format
 * @returns {string} - Last day of previous month
 */
export const getPreviousMonthEndDate = () => {
    const today = new Date();
    const lastDayPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return formatDate(lastDayPreviousMonth);
};

/**
 * Get previous month's date range
 * @returns {object} - Object with previousMonthStart and previousMonthEnd
 */
export const getPreviousMonthRange = () => {
    return {
        previousMonthStart: getPreviousMonthStartDate(),
        previousMonthEnd: getPreviousMonthEndDate()
    };
};

/**
 * Get current month's date range
 * @returns {object} - Object with monthStart and monthEnd
 */
export const getCurrentMonthRange = () => {
    return {
        monthStart: getMonthStartDate(),
        monthEnd: getMonthEndDate()
    };
};

/**
 * Get all commonly used dates
 * @returns {object} - Object with all date utilities
 */
export const getDateUtils = () => {
    return {
        today: getTodayDate(),
        yesterday: getYesterdayDate(),
        monthStart: getMonthStartDate(),
        monthEnd: getMonthEndDate(),
        previousMonthStart: getPreviousMonthStartDate(),
        previousMonthEnd: getPreviousMonthEndDate(),
        currentMonthRange: getCurrentMonthRange(),
        previousMonthRange: getPreviousMonthRange()
    };
};

/**
 * Get date range for a specific number of days back
 * @param {number} daysBack - Number of days to go back
 * @returns {object} - Object with fromDate and toDate
 */
export const getDateRangeFromDaysBack = (daysBack) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    
    return {
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate)
    };
};

/**
 * Get date range for current week (Monday to Sunday)
 * @returns {object} - Object with weekStart and weekEnd
 */
export const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
        weekStart: formatDate(monday),
        weekEnd: formatDate(sunday)
    };
};

/**
 * Check if a date string is today
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is today
 */
export const isToday = (dateString) => {
    return dateString === getTodayDate();
};

/**
 * Check if a date string is yesterday
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is yesterday
 */
export const isYesterday = (dateString) => {
    return dateString === getYesterdayDate();
};

/**
 * Get human readable date format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Human readable date
 */
export const getHumanReadableDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

// Export all functions as default object for convenience
const dateUtilities = {
    formatDate,
    getTodayDate,
    getYesterdayDate,
    getMonthStartDate,
    getMonthEndDate,
    getPreviousMonthStartDate,
    getPreviousMonthEndDate,
    getCurrentMonthRange,
    getPreviousMonthRange,
    getDateUtils,
    getDateRangeFromDaysBack,
    getCurrentWeekRange,
    isToday,
    isYesterday,
    getHumanReadableDate
};

export default dateUtilities;