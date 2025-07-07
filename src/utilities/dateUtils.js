// ======================================
// DATE UTILITY FUNCTIONS (INDIAN TIMEZONE)
// ======================================

/**
 * Get current date in Indian Standard Time (IST)
 * More reliable method using UTC offset calculation
 * @returns {Date} - Date object adjusted to IST
 */
const getIndianDate = () => {
    // Get current UTC time
    const now = new Date();
    // IST is UTC + 5:30 (5.5 hours)
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);
    return istTime;
};

/**
 * Alternative method using Intl.DateTimeFormat for more accuracy
 * @returns {Date} - Date object in IST
 */
const getIndianDateIntl = () => {
    const now = new Date();
    
    // Get IST date parts
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const istDateString = formatter.format(now);
    
    // Get IST time parts
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const istTimeString = timeFormatter.format(now);
    
    // Combine date and time
    const istDateTime = new Date(`${istDateString}T${istTimeString}`);
    return istDateTime;
};

/**
 * Get formatted date string in YYYY-MM-DD format (IST)
 * @param {Date} date - Date object to format (optional, defaults to current IST)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date = null) => {
    const targetDate = date || getIndianDateIntl();
    
    // Extract year, month, day in IST
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return formatter.format(targetDate);
};

/**
 * Get today's date in YYYY-MM-DD format (IST)
 * @returns {string} - Today's date in IST
 */
export const getTodayDate = () => {
    return formatDate();
};

/**
 * Get yesterday's date in YYYY-MM-DD format (IST)
 * @returns {string} - Yesterday's date in IST
 */
export const getYesterdayDate = () => {
    const today = getIndianDateIntl();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return formatter.format(yesterday);
};

/**
 * Get the first day of current month in YYYY-MM-DD format (IST)
 * @returns {string} - First day of current month in IST
 */
export const getMonthStartDate = () => {
    const today = getIndianDateIntl();
    
    // Get current year and month in IST
    const year = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric'
    }));
    
    const month = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }));
    
    // Create first day of current month
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    return firstDay;
};

/**
 * Get the last day of current month in YYYY-MM-DD format (IST)
 * @returns {string} - Last day of current month in IST
 */
export const getMonthEndDate = () => {
    const today = getIndianDateIntl();
    
    // Get current year and month in IST
    const year = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric'
    }));
    
    const month = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }));
    
    // Create last day of current month
    const lastDay = new Date(year, month, 0); // month is 1-indexed, so this gives last day of current month
    const lastDayFormatted = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;
    return lastDayFormatted;
};

/**
 * Get the first day of previous month in YYYY-MM-DD format (IST)
 * @returns {string} - First day of previous month in IST
 */
export const getPreviousMonthStartDate = () => {
    const today = getIndianDateIntl();
    
    // Get current year and month in IST
    let year = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric'
    }));
    
    let month = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }));
    
    // Go to previous month
    month--;
    if (month === 0) {
        month = 12;
        year--;
    }
    
    const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
    return firstDay;
};

/**
 * Get the last day of previous month in YYYY-MM-DD format (IST)
 * @returns {string} - Last day of previous month in IST
 */
export const getPreviousMonthEndDate = () => {
    const today = getIndianDateIntl();
    
    // Get current year and month in IST
    let year = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric'
    }));
    
    let month = parseInt(today.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }));
    
    // Go to previous month
    month--;
    if (month === 0) {
        month = 12;
        year--;
    }
    
    // Get last day of previous month
    const lastDay = new Date(year, month, 0); // This gives last day of the month
    const lastDayFormatted = `${year}-${month.toString().padStart(2, '0')}-${lastDay.getDate().toString().padStart(2, '0')}`;
    return lastDayFormatted;
};

/**
 * Get previous month's date range (IST)
 * @returns {object} - Object with previousMonthStart and previousMonthEnd
 */
export const getPreviousMonthRange = () => {
    return {
        previousMonthStart: getPreviousMonthStartDate(),
        previousMonthEnd: getPreviousMonthEndDate()
    };
};

/**
 * Get current month's date range (IST)
 * @returns {object} - Object with monthStart and monthEnd
 */
export const getCurrentMonthRange = () => {
    return {
        monthStart: getMonthStartDate(),
        monthEnd: getMonthEndDate()
    };
};

/**
 * Get all commonly used dates (IST)
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
 * Get date range for a specific number of days back (IST)
 * @param {number} daysBack - Number of days to go back
 * @returns {object} - Object with fromDate and toDate
 */
export const getDateRangeFromDaysBack = (daysBack) => {
    const toDate = getIndianDateIntl();
    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - daysBack);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return {
        fromDate: formatter.format(fromDate),
        toDate: formatter.format(toDate)
    };
};

/**
 * Get date range for current week (Monday to Sunday) in IST
 * @returns {object} - Object with weekStart and weekEnd
 */
export const getCurrentWeekRange = () => {
    const today = getIndianDateIntl();
    const dayOfWeek = today.getDay();
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    return {
        weekStart: formatter.format(monday),
        weekEnd: formatter.format(sunday)
    };
};

/**
 * Check if a date string is today (IST)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is today in IST
 */
export const isToday = (dateString) => {
    return dateString === getTodayDate();
};

/**
 * Check if a date string is yesterday (IST)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is yesterday in IST
 */
export const isYesterday = (dateString) => {
    return dateString === getYesterdayDate();
};

/**
 * Get human readable date format (IST)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Human readable date
 */
export const getHumanReadableDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

/**
 * Get current Indian date and time
 * @returns {object} - Object with date, time, and datetime in IST
 */
export const getIndianDateTime = () => {
    const now = new Date();
    
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const datetimeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    return {
        date: dateFormatter.format(now),
        time: timeFormatter.format(now),
        datetime: datetimeFormatter.format(now),
        timestamp: now.getTime()
    };
};

/**
 * Convert any date to Indian timezone
 * @param {Date|string} inputDate - Date to convert
 * @returns {Date} - Date object in Indian timezone
 */
export const convertToIndianTime = (inputDate) => {
    const date = new Date(inputDate);
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const dateStr = formatter.format(date);
    const timeStr = timeFormatter.format(date);
    
    return new Date(`${dateStr}T${timeStr}`);
};

/**
 * Debug function to see current date calculations
 * @returns {object} - Debug information about current dates
 */
export const debugDateCalculations = () => {
    const today = getIndianDateIntl();
    const utils = getDateUtils();
    
    console.log('=== DATE DEBUG INFO (IST) ===');
    console.log('Current IST Date Object:', today);
    console.log('Current Date Utils:', utils);
    console.log('==============================');
    
    return {
        currentISTDate: today,
        dateUtils: utils,
        currentTimestamp: new Date().getTime(),
        istTimestamp: today.getTime()
    };
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
    getHumanReadableDate,
    getIndianDateTime,
    convertToIndianTime,
    getIndianDate: getIndianDateIntl,
    debugDateCalculations
};

export default dateUtilities;