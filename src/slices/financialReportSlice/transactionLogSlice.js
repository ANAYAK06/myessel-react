import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as transactionLogAPI from '../../api/FinanceReportAPI/transactionLogAPI';
import { getDateUtils, getIndianDateTime } from '../../utilities/dateUtils';

// ======================================
// HELPER FUNCTION FOR INDIAN TIMEZONE TIMESTAMP
// ======================================
const getIndianTimestamp = () => {
    const { datetime } = getIndianDateTime();
    return datetime;
};

// ======================================
// ASYNC THUNKS FOR TRANSACTION LOG APIs
// ======================================

// 1. Flexible Transaction Log Report (with custom params)
export const fetchTransactionLogReport = createAsyncThunk(
    'transactionlog/fetchTransactionLogReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Transaction Log Report');
        }
    }
);

// 2. Today's Transaction Log with 'Select All' (Indian timezone)
export const fetchTodayTransactionLog = createAsyncThunk(
    'transactionlog/fetchTodayTransactionLog',
    async (_, { rejectWithValue }) => {
        try {
            const { today } = getDateUtils();
            const params = {
                fromDate: today,
                toDate: today,
                tranType: 'Select All'
            };
            console.log('Today\'s Transaction Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Today\'s Transaction Log');
        }
    }
);

// 3. Yesterday's Transaction Log with 'Select All' (Indian timezone)
export const fetchYesterdayTransactionLog = createAsyncThunk(
    'transactionlog/fetchYesterdayTransactionLog',
    async (_, { rejectWithValue }) => {
        try {
            const { yesterday } = getDateUtils();
            const params = {
                fromDate: yesterday,
                toDate: yesterday,
                tranType: 'Select All'
            };
            console.log('Yesterday\'s Transaction Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Yesterday\'s Transaction Log');
        }
    }
);

// 4. This Month's Vendor Invoice Log (Indian timezone)
export const fetchMonthlyVendorInvoiceLog = createAsyncThunk(
    'transactionlog/fetchMonthlyVendorInvoiceLog',
    async (_, { rejectWithValue }) => {
        try {
            const { monthStart, monthEnd } = getDateUtils();
            const params = {
                fromDate: monthStart,
                toDate: monthEnd,
                tranType: 'Vendor Invoice'
            };
            console.log('Monthly Vendor Invoice Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Monthly Vendor Invoice Log');
        }
    }
);

// 5. This Month's Client Invoice Log (Indian timezone)
export const fetchMonthlyClientInvoiceLog = createAsyncThunk(
    'transactionlog/fetchMonthlyClientInvoiceLog',
    async (_, { rejectWithValue }) => {
        try {
            const { monthStart, monthEnd } = getDateUtils();
            const params = {
                fromDate: monthStart,
                toDate: monthEnd,
                tranType: 'Client Invoice'
            };
            console.log('Monthly Client Invoice Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Monthly Client Invoice Log');
        }
    }
);

// 6. Previous Month's Transaction Log with 'Select All' (Indian timezone)
export const fetchPreviousMonthTransactionLog = createAsyncThunk(
    'transactionlog/fetchPreviousMonthTransactionLog',
    async (_, { rejectWithValue }) => {
        try {
            const { previousMonthStart, previousMonthEnd } = getDateUtils();
            const params = {
                fromDate: previousMonthStart,
                toDate: previousMonthEnd,
                tranType: 'Select All'
            };
            console.log('Previous Month Transaction Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Previous Month\'s Transaction Log');
        }
    }
);

// 7. Previous Month's Vendor Invoice Log (Indian timezone)
export const fetchPreviousMonthVendorInvoiceLog = createAsyncThunk(
    'transactionlog/fetchPreviousMonthVendorInvoiceLog',
    async (_, { rejectWithValue }) => {
        try {
            const { previousMonthStart, previousMonthEnd } = getDateUtils();
            const params = {
                fromDate: previousMonthStart,
                toDate: previousMonthEnd,
                tranType: 'Vendor Invoice'
            };
            console.log('Previous Month Vendor Invoice Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Previous Month\'s Vendor Invoice Log');
        }
    }
);

// 8. Previous Month's Client Invoice Log (Indian timezone)
export const fetchPreviousMonthClientInvoiceLog = createAsyncThunk(
    'transactionlog/fetchPreviousMonthClientInvoiceLog',
    async (_, { rejectWithValue }) => {
        try {
            const { previousMonthStart, previousMonthEnd } = getDateUtils();
            const params = {
                fromDate: previousMonthStart,
                toDate: previousMonthEnd,
                tranType: 'Client Invoice'
            };
            console.log('Previous Month Client Invoice Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Previous Month\'s Client Invoice Log');
        }
    }
);

// 9. Fetch This Week's Transaction Log (Indian timezone)
export const fetchThisWeekTransactionLog = createAsyncThunk(
    'transactionlog/fetchThisWeekTransactionLog',
    async (_, { rejectWithValue }) => {
        try {
            const { getCurrentWeekRange } = require('../../utilities/dateUtils');
            const { weekStart, weekEnd } = getCurrentWeekRange();
            const params = {
                fromDate: weekStart,
                toDate: weekEnd,
                tranType: 'Select All'
            };
            console.log('This Week Transaction Log params (IST):', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch This Week\'s Transaction Log');
        }
    }
);

// 10. Fetch Custom Date Range (for when you need specific dates)
export const fetchCustomDateRangeTransactionLog = createAsyncThunk(
    'transactionlog/fetchCustomDateRangeTransactionLog',
    async ({ fromDate, toDate, tranType = 'Select All' }, { rejectWithValue }) => {
        try {
            const params = {
                fromDate,
                toDate,
                tranType
            };
            console.log('Custom Date Range Transaction Log params:', params);
            const response = await transactionLogAPI.getTransactionLogGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Custom Date Range Transaction Log');
        }
    }
);

// ======================================
// INITIAL STATE
// ======================================
const initialState = {
    // Data from different API calls
    transactionLogReport: [],
    todayTransactionLog: [],
    yesterdayTransactionLog: [],
    monthlyVendorInvoiceLog: [],
    monthlyClientInvoiceLog: [],
    previousMonthTransactionLog: [],
    previousMonthVendorInvoiceLog: [],
    previousMonthClientInvoiceLog: [],
    thisWeekTransactionLog: [],
    customDateRangeTransactionLog: [],

    // Loading states for each API call
    loading: {
        transactionLogReport: false,
        todayTransactionLog: false,
        yesterdayTransactionLog: false,
        monthlyVendorInvoiceLog: false,
        monthlyClientInvoiceLog: false,
        previousMonthTransactionLog: false,
        previousMonthVendorInvoiceLog: false,
        previousMonthClientInvoiceLog: false,
        thisWeekTransactionLog: false,
        customDateRangeTransactionLog: false,
    },

    // Error states for each API call
    errors: {
        transactionLogReport: null,
        todayTransactionLog: null,
        yesterdayTransactionLog: null,
        monthlyVendorInvoiceLog: null,
        monthlyClientInvoiceLog: null,
        previousMonthTransactionLog: null,
        previousMonthVendorInvoiceLog: null,
        previousMonthClientInvoiceLog: null,
        thisWeekTransactionLog: null,
        customDateRangeTransactionLog: null,
    },

    // UI State for custom filters
    filters: {
        fromDate: '',
        toDate: '',
        tranType: ''
    },

    // Last updated timestamps (Indian timezone)
    lastUpdated: {
        transactionLogReport: null,
        todayTransactionLog: null,
        yesterdayTransactionLog: null,
        monthlyVendorInvoiceLog: null,
        monthlyClientInvoiceLog: null,
        previousMonthTransactionLog: null,
        previousMonthVendorInvoiceLog: null,
        previousMonthClientInvoiceLog: null,
        thisWeekTransactionLog: null,
        customDateRangeTransactionLog: null,
    },

    // Current date info (Indian timezone) - useful for UI display
    currentDateInfo: {
        today: '',
        yesterday: '',
        monthStart: '',
        monthEnd: '',
        previousMonthStart: '',
        previousMonthEnd: '',
        weekStart: '',
        weekEnd: '',
        lastRefreshed: null
    }
};

// ======================================
// TRANSACTION LOG SLICE
// ======================================
const transactionLogSlice = createSlice({
    name: 'transactionlog',
    initialState,
    reducers: {
        // Action to set custom filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear custom filters
        clearFilters: (state) => {
            state.filters = {
                fromDate: '',
                toDate: '',
                tranType: ''
            };
        },
        
        // Action to reset all transaction data
        resetAllTransactionData: (state) => {
            state.transactionLogReport = [];
            state.todayTransactionLog = [];
            state.yesterdayTransactionLog = [];
            state.monthlyVendorInvoiceLog = [];
            state.monthlyClientInvoiceLog = [];
            state.previousMonthTransactionLog = [];
            state.previousMonthVendorInvoiceLog = [];
            state.previousMonthClientInvoiceLog = [];
            state.thisWeekTransactionLog = [];
            state.customDateRangeTransactionLog = [];
        },

        // Action to reset specific transaction data
        resetTransactionData: (state, action) => {
            const { dataType } = action.payload;
            if (state[dataType]) {
                state[dataType] = [];
            }
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to clear all errors
        clearAllErrors: (state) => {
            Object.keys(state.errors).forEach(key => {
                state.errors[key] = null;
            });
        },

        // Action to refresh current date info (Indian timezone)
        refreshCurrentDateInfo: (state) => {
            const dateUtils = getDateUtils();
            const { getCurrentWeekRange } = require('../../utilities/dateUtils');
            const weekRange = getCurrentWeekRange();
            
            state.currentDateInfo = {
                today: dateUtils.today,
                yesterday: dateUtils.yesterday,
                monthStart: dateUtils.monthStart,
                monthEnd: dateUtils.monthEnd,
                previousMonthStart: dateUtils.previousMonthStart,
                previousMonthEnd: dateUtils.previousMonthEnd,
                weekStart: weekRange.weekStart,
                weekEnd: weekRange.weekEnd,
                lastRefreshed: getIndianTimestamp()
            };
        }
    },
    extraReducers: (builder) => {
        // 1. Flexible Transaction Log Report
        builder
            .addCase(fetchTransactionLogReport.pending, (state) => {
                state.loading.transactionLogReport = true;
                state.errors.transactionLogReport = null;
            })
            .addCase(fetchTransactionLogReport.fulfilled, (state, action) => {
                state.loading.transactionLogReport = false;
                state.transactionLogReport = action.payload;
                state.lastUpdated.transactionLogReport = getIndianTimestamp();
            })
            .addCase(fetchTransactionLogReport.rejected, (state, action) => {
                state.loading.transactionLogReport = false;
                state.errors.transactionLogReport = action.payload;
            })

        // 2. Today's Transaction Log
        builder
            .addCase(fetchTodayTransactionLog.pending, (state) => {
                state.loading.todayTransactionLog = true;
                state.errors.todayTransactionLog = null;
            })
            .addCase(fetchTodayTransactionLog.fulfilled, (state, action) => {
                state.loading.todayTransactionLog = false;
                state.todayTransactionLog = action.payload;
                state.lastUpdated.todayTransactionLog = getIndianTimestamp();
            })
            .addCase(fetchTodayTransactionLog.rejected, (state, action) => {
                state.loading.todayTransactionLog = false;
                state.errors.todayTransactionLog = action.payload;
            })

        // 3. Yesterday's Transaction Log
        builder
            .addCase(fetchYesterdayTransactionLog.pending, (state) => {
                state.loading.yesterdayTransactionLog = true;
                state.errors.yesterdayTransactionLog = null;
            })
            .addCase(fetchYesterdayTransactionLog.fulfilled, (state, action) => {
                state.loading.yesterdayTransactionLog = false;
                state.yesterdayTransactionLog = action.payload;
                state.lastUpdated.yesterdayTransactionLog = getIndianTimestamp();
            })
            .addCase(fetchYesterdayTransactionLog.rejected, (state, action) => {
                state.loading.yesterdayTransactionLog = false;
                state.errors.yesterdayTransactionLog = action.payload;
            })

        // 4. Monthly Vendor Invoice Log
        builder
            .addCase(fetchMonthlyVendorInvoiceLog.pending, (state) => {
                state.loading.monthlyVendorInvoiceLog = true;
                state.errors.monthlyVendorInvoiceLog = null;
            })
            .addCase(fetchMonthlyVendorInvoiceLog.fulfilled, (state, action) => {
                state.loading.monthlyVendorInvoiceLog = false;
                state.monthlyVendorInvoiceLog = action.payload;
                state.lastUpdated.monthlyVendorInvoiceLog = getIndianTimestamp();
            })
            .addCase(fetchMonthlyVendorInvoiceLog.rejected, (state, action) => {
                state.loading.monthlyVendorInvoiceLog = false;
                state.errors.monthlyVendorInvoiceLog = action.payload;
            })

        // 5. Monthly Client Invoice Log
        builder
            .addCase(fetchMonthlyClientInvoiceLog.pending, (state) => {
                state.loading.monthlyClientInvoiceLog = true;
                state.errors.monthlyClientInvoiceLog = null;
            })
            .addCase(fetchMonthlyClientInvoiceLog.fulfilled, (state, action) => {
                state.loading.monthlyClientInvoiceLog = false;
                state.monthlyClientInvoiceLog = action.payload;
                state.lastUpdated.monthlyClientInvoiceLog = getIndianTimestamp();
            })
            .addCase(fetchMonthlyClientInvoiceLog.rejected, (state, action) => {
                state.loading.monthlyClientInvoiceLog = false;
                state.errors.monthlyClientInvoiceLog = action.payload;
            })

        // 6. Previous Month Transaction Log
        builder
            .addCase(fetchPreviousMonthTransactionLog.pending, (state) => {
                state.loading.previousMonthTransactionLog = true;
                state.errors.previousMonthTransactionLog = null;
            })
            .addCase(fetchPreviousMonthTransactionLog.fulfilled, (state, action) => {
                state.loading.previousMonthTransactionLog = false;
                state.previousMonthTransactionLog = action.payload;
                state.lastUpdated.previousMonthTransactionLog = getIndianTimestamp();
            })
            .addCase(fetchPreviousMonthTransactionLog.rejected, (state, action) => {
                state.loading.previousMonthTransactionLog = false;
                state.errors.previousMonthTransactionLog = action.payload;
            })

        // 7. Previous Month Vendor Invoice Log
        builder
            .addCase(fetchPreviousMonthVendorInvoiceLog.pending, (state) => {
                state.loading.previousMonthVendorInvoiceLog = true;
                state.errors.previousMonthVendorInvoiceLog = null;
            })
            .addCase(fetchPreviousMonthVendorInvoiceLog.fulfilled, (state, action) => {
                state.loading.previousMonthVendorInvoiceLog = false;
                state.previousMonthVendorInvoiceLog = action.payload;
                state.lastUpdated.previousMonthVendorInvoiceLog = getIndianTimestamp();
            })
            .addCase(fetchPreviousMonthVendorInvoiceLog.rejected, (state, action) => {
                state.loading.previousMonthVendorInvoiceLog = false;
                state.errors.previousMonthVendorInvoiceLog = action.payload;
            })

        // 8. Previous Month Client Invoice Log
        builder
            .addCase(fetchPreviousMonthClientInvoiceLog.pending, (state) => {
                state.loading.previousMonthClientInvoiceLog = true;
                state.errors.previousMonthClientInvoiceLog = null;
            })
            .addCase(fetchPreviousMonthClientInvoiceLog.fulfilled, (state, action) => {
                state.loading.previousMonthClientInvoiceLog = false;
                state.previousMonthClientInvoiceLog = action.payload;
                state.lastUpdated.previousMonthClientInvoiceLog = getIndianTimestamp();
            })
            .addCase(fetchPreviousMonthClientInvoiceLog.rejected, (state, action) => {
                state.loading.previousMonthClientInvoiceLog = false;
                state.errors.previousMonthClientInvoiceLog = action.payload;
            })

        // 9. This Week Transaction Log
        builder
            .addCase(fetchThisWeekTransactionLog.pending, (state) => {
                state.loading.thisWeekTransactionLog = true;
                state.errors.thisWeekTransactionLog = null;
            })
            .addCase(fetchThisWeekTransactionLog.fulfilled, (state, action) => {
                state.loading.thisWeekTransactionLog = false;
                state.thisWeekTransactionLog = action.payload;
                state.lastUpdated.thisWeekTransactionLog = getIndianTimestamp();
            })
            .addCase(fetchThisWeekTransactionLog.rejected, (state, action) => {
                state.loading.thisWeekTransactionLog = false;
                state.errors.thisWeekTransactionLog = action.payload;
            })

        // 10. Custom Date Range Transaction Log
        builder
            .addCase(fetchCustomDateRangeTransactionLog.pending, (state) => {
                state.loading.customDateRangeTransactionLog = true;
                state.errors.customDateRangeTransactionLog = null;
            })
            .addCase(fetchCustomDateRangeTransactionLog.fulfilled, (state, action) => {
                state.loading.customDateRangeTransactionLog = false;
                state.customDateRangeTransactionLog = action.payload;
                state.lastUpdated.customDateRangeTransactionLog = getIndianTimestamp();
            })
            .addCase(fetchCustomDateRangeTransactionLog.rejected, (state, action) => {
                state.loading.customDateRangeTransactionLog = false;
                state.errors.customDateRangeTransactionLog = action.payload;
            });
    },
});

// ======================================
// EXPORT ACTIONS
// ======================================
export const { 
    setFilters, 
    clearFilters, 
    resetAllTransactionData,
    resetTransactionData,
    clearError,
    clearAllErrors,
    refreshCurrentDateInfo
} = transactionLogSlice.actions;

// ======================================
// SELECTORS
// ======================================

// Data selectors
export const selectTransactionLogReport = (state) => state.transactionlog.transactionLogReport;
export const selectTodayTransactionLog = (state) => state.transactionlog.todayTransactionLog;
export const selectYesterdayTransactionLog = (state) => state.transactionlog.yesterdayTransactionLog;
export const selectMonthlyVendorInvoiceLog = (state) => state.transactionlog.monthlyVendorInvoiceLog;
export const selectMonthlyClientInvoiceLog = (state) => state.transactionlog.monthlyClientInvoiceLog;
export const selectPreviousMonthTransactionLog = (state) => state.transactionlog.previousMonthTransactionLog;
export const selectPreviousMonthVendorInvoiceLog = (state) => state.transactionlog.previousMonthVendorInvoiceLog;
export const selectPreviousMonthClientInvoiceLog = (state) => state.transactionlog.previousMonthClientInvoiceLog;
export const selectThisWeekTransactionLog = (state) => state.transactionlog.thisWeekTransactionLog;
export const selectCustomDateRangeTransactionLog = (state) => state.transactionlog.customDateRangeTransactionLog;

// Loading selectors
export const selectLoading = (state) => state.transactionlog.loading;
export const selectTransactionLogReportLoading = (state) => state.transactionlog.loading.transactionLogReport;
export const selectTodayTransactionLogLoading = (state) => state.transactionlog.loading.todayTransactionLog;
export const selectYesterdayTransactionLogLoading = (state) => state.transactionlog.loading.yesterdayTransactionLog;
export const selectMonthlyVendorInvoiceLogLoading = (state) => state.transactionlog.loading.monthlyVendorInvoiceLog;
export const selectMonthlyClientInvoiceLogLoading = (state) => state.transactionlog.loading.monthlyClientInvoiceLog;
export const selectPreviousMonthTransactionLogLoading = (state) => state.transactionlog.loading.previousMonthTransactionLog;
export const selectPreviousMonthVendorInvoiceLogLoading = (state) => state.transactionlog.loading.previousMonthVendorInvoiceLog;
export const selectPreviousMonthClientInvoiceLogLoading = (state) => state.transactionlog.loading.previousMonthClientInvoiceLog;
export const selectThisWeekTransactionLogLoading = (state) => state.transactionlog.loading.thisWeekTransactionLog;
export const selectCustomDateRangeTransactionLogLoading = (state) => state.transactionlog.loading.customDateRangeTransactionLog;

// Error selectors
export const selectErrors = (state) => state.transactionlog.errors;
export const selectTransactionLogReportError = (state) => state.transactionlog.errors.transactionLogReport;
export const selectTodayTransactionLogError = (state) => state.transactionlog.errors.todayTransactionLog;
export const selectYesterdayTransactionLogError = (state) => state.transactionlog.errors.yesterdayTransactionLog;
export const selectMonthlyVendorInvoiceLogError = (state) => state.transactionlog.errors.monthlyVendorInvoiceLog;
export const selectMonthlyClientInvoiceLogError = (state) => state.transactionlog.errors.monthlyClientInvoiceLog;
export const selectPreviousMonthTransactionLogError = (state) => state.transactionlog.errors.previousMonthTransactionLog;
export const selectPreviousMonthVendorInvoiceLogError = (state) => state.transactionlog.errors.previousMonthVendorInvoiceLog;
export const selectPreviousMonthClientInvoiceLogError = (state) => state.transactionlog.errors.previousMonthClientInvoiceLog;
export const selectThisWeekTransactionLogError = (state) => state.transactionlog.errors.thisWeekTransactionLog;
export const selectCustomDateRangeTransactionLogError = (state) => state.transactionlog.errors.customDateRangeTransactionLog;

// Filter selectors
export const selectFilters = (state) => state.transactionlog.filters;
export const selectSelectedFromDate = (state) => state.transactionlog.filters.fromDate;
export const selectSelectedToDate = (state) => state.transactionlog.filters.toDate;
export const selectSelectedTranType = (state) => state.transactionlog.filters.tranType;

// Current date info selectors (Indian timezone)
export const selectCurrentDateInfo = (state) => state.transactionlog.currentDateInfo;
export const selectCurrentIndianDate = (state) => state.transactionlog.currentDateInfo.today;
export const selectCurrentIndianTime = (state) => state.transactionlog.currentDateInfo.lastRefreshed;

// Last updated selectors
export const selectLastUpdated = (state) => state.transactionlog.lastUpdated;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.transactionlog.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.transactionlog.errors).some(error => error !== null);

// Enhanced dashboard summary selectors (for quick overview)
export const selectDashboardSummary = (state) => ({
    todayCount: state.transactionlog.todayTransactionLog?.Data?.length || state.transactionlog.todayTransactionLog?.length || 0,
    yesterdayCount: state.transactionlog.yesterdayTransactionLog?.Data?.length || state.transactionlog.yesterdayTransactionLog?.length || 0,
    thisWeekCount: state.transactionlog.thisWeekTransactionLog?.Data?.length || state.transactionlog.thisWeekTransactionLog?.length || 0,
    vendorInvoiceCount: state.transactionlog.monthlyVendorInvoiceLog?.Data?.length || state.transactionlog.monthlyVendorInvoiceLog?.length || 0,
    clientInvoiceCount: state.transactionlog.monthlyClientInvoiceLog?.Data?.length || state.transactionlog.monthlyClientInvoiceLog?.length || 0,
    previousMonthCount: state.transactionlog.previousMonthTransactionLog?.Data?.length || state.transactionlog.previousMonthTransactionLog?.length || 0,
    previousMonthVendorCount: state.transactionlog.previousMonthVendorInvoiceLog?.Data?.length || state.transactionlog.previousMonthVendorInvoiceLog?.length || 0,
    previousMonthClientCount: state.transactionlog.previousMonthClientInvoiceLog?.Data?.length || state.transactionlog.previousMonthClientInvoiceLog?.length || 0,
    customDateRangeCount: state.transactionlog.customDateRangeTransactionLog?.Data?.length || state.transactionlog.customDateRangeTransactionLog?.length || 0,
    isLoading: Object.values(state.transactionlog.loading).some(loading => loading),
    hasError: Object.values(state.transactionlog.errors).some(error => error !== null),
    currentDateInfo: state.transactionlog.currentDateInfo
});

// ======================================
// EXPORT REDUCER
// ======================================
export default transactionLogSlice.reducer;