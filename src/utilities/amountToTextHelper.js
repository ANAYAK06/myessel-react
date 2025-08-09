// amountToTextHelper.js - Reusable utility for converting numbers to text using to-words library
// =====================================================

import { ToWords } from 'to-words';

// Initialize ToWords with Indian locale and currency settings
const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
            name: 'Rupee',
            plural: 'Rupees',
            symbol: '₹',
            fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: ''
            }
        }
    }
});

// Initialize basic number converter (without currency)
const toWordsBasic = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: false,
        ignoreDecimal: false,
        doNotAddOnly: true
    }
});

/**
 * Converts a number to words in Indian currency format using to-words library
 * @param {number|string} amount - The amount to convert
 * @returns {string} - Amount in words (e.g., "Rupees Ten Thousand Forty Five Only")
 */
export const convertAmountToWords = (amount) => {
    try {
        // Convert to number and handle edge cases
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
        
        if (isNaN(num) || num < 0) {
            return 'Invalid Amount';
        }
        
        if (num === 0) {
            return 'Rupees Zero Only';
        }

        // Use to-words library with currency options
        const result = toWords.convert(num);
        
        // The library returns format like "Ten Thousand Rupees", we want "Rupees Ten Thousand Only"
        // Let's clean it up to match Indian banking format
        let cleanResult = result;
        
        // Handle the format returned by to-words and make it consistent
        if (cleanResult.includes('Rupee') && !cleanResult.startsWith('Rupees')) {
            cleanResult = cleanResult.replace(/(\d+\.?\d*)\s*(Rupee|Rupees)/i, 'Rupees $1');
        }
        
        // Ensure it ends with "Only"
        if (!cleanResult.endsWith('Only')) {
            cleanResult += ' Only';
        }
        
        return cleanResult;
        
    } catch (error) {
        console.error('Error converting amount to words:', error);
        return 'Amount conversion error';
    }
};

/**
 * Converts a number to words without currency (for quantities, etc.)
 * @param {number|string} number - The number to convert
 * @returns {string} - Number in words (e.g., "Ten Thousand Forty Five")
 */
export const convertNumberToWords = (number) => {
    try {
        const num = typeof number === 'string' ? parseFloat(number.replace(/,/g, '')) : Number(number);
        
        if (isNaN(num) || num < 0) {
            return 'Invalid Number';
        }
        
        return toWordsBasic.convert(num);
        
    } catch (error) {
        console.error('Error converting number to words:', error);
        return 'Number conversion error';
    }
};

/**
 * Formats amount with Indian comma separation
 * @param {number|string} amount - Amount to format
 * @returns {string} - Formatted amount (e.g., "1,23,456.78")
 */
export const formatIndianCurrency = (amount) => {
    try {
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
        
        if (isNaN(num)) {
            return '0.00';
        }
        
        const [integerPart, decimalPart] = num.toFixed(2).split('.');
        
        // Add commas in Indian format
        let formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Indian numbering system adjustment
        if (integerPart.length > 3) {
            formatted = integerPart.replace(/(\d+?)(\d{2})(\d{3})$/, (match, p1, p2, p3) => {
                if (p1.length > 0) {
                    p1 = p1.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
                }
                return p1 + ',' + p2 + ',' + p3;
            });
        }
        
        return formatted + '.' + decimalPart;
        
    } catch (error) {
        console.error('Error formatting currency:', error);
        return '0.00';
    }
};

/**
 * Validates if a string/number is a valid amount
 * @param {any} amount - Amount to validate
 * @returns {boolean} - True if valid amount
 */
export const isValidAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') {
        return false;
    }
    
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
    return !isNaN(num) && num >= 0;
};

/**
 * Gets amount display with both formatted number and words
 * @param {number|string} amount - Amount to display
 * @returns {object} - {formatted: string, words: string, isValid: boolean}
 */
export const getAmountDisplay = (amount) => {
    const isValid = isValidAmount(amount);
    
    if (!isValid) {
        return {
            formatted: '0.00',
            words: 'Invalid Amount',
            isValid: false
        };
    }
    
    return {
        formatted: formatIndianCurrency(amount),
        words: convertAmountToWords(amount),
        isValid: true
    };
};