import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as accruedInterestAPI from '../../api/FinanceReportAPI/accruedInterestApi';

// Helper function to ensure dates are stored as strings
const convertDateToString = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) {
        return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    }
    return '';
};

// Helper function to sanitize filter payload
const sanitizeFilters = (filters) => {
    const sanitized = { ...filters };
    
    // Convert any Date objects to strings
    if (sanitized.fromDate) {
        sanitized.fromDate = convertDateToString(sanitized.fromDate);
    }
    if (sanitized.toDate) {
        sanitized.toDate = convertDateToString(sanitized.toDate);
    }
    
    // Remove any undefined or null values that might cause serialization issues
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === undefined || sanitized[key] === null) {
            sanitized[key] = '';
        }
    });
    
    return sanitized;
};

// Helper function to sanitize API parameters
const sanitizeAPIParams = (params) => {
    const sanitized = { ...params };
    
    // Convert any Date objects to strings for API calls
    if (sanitized.fromDate) {
        sanitized.fromDate = convertDateToString(sanitized.fromDate);
    }
    if (sanitized.toDate) {
        sanitized.toDate = convertDateToString(sanitized.toDate);
    }
    
    return sanitized;
};

// Async Thunks for Accrued Interest Report APIs
// =============================================

// 1. Fetch Accrued Interest Report (Detail View)
export const fetchAccruedInterestReport = createAsyncThunk(
    'accruedinterest/fetchAccruedInterestReport',
    async (params, { rejectWithValue }) => {
        try {
            // Sanitize params to ensure dates are strings
            const sanitizedParams = sanitizeAPIParams(params);
            const response = await accruedInterestAPI.getAccruedInterestReport(sanitizedParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Accrued Interest Report');
        }
    }
);

// 2. Fetch Accrued Interest Report Summary (Drill-down Modal)
export const fetchAccruedInterestReportSummary = createAsyncThunk(
    'accruedinterest/fetchAccruedInterestReportSummary',
    async (params, { rejectWithValue }) => {
        try {
            // No date sanitization needed for summary params (ccCode, date, type)
            const response = await accruedInterestAPI.getAccruedInterestReportSummary(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Accrued Interest Report Summary');
        }
    }
);

// 3. Fetch Liquidity Status Report (Summary View - Role 100 only)
export const fetchLiquidityStatusReport = createAsyncThunk(
    'accruedinterest/fetchLiquidityStatusReport',
    async (params, { rejectWithValue }) => {
        try {
            // Sanitize params to ensure dates are strings
            const sanitizedParams = sanitizeAPIParams(params);
            const response = await accruedInterestAPI.getLiquidityStatusReport(sanitizedParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Liquidity Status Report');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    accruedInterestReport: [],
    accruedInterestReportSummary: null,
    liquidityStatusReport: [],

    // Loading states for each API
    loading: {
        accruedInterestReport: false,
        accruedInterestReportSummary: false,
        liquidityStatusReport: false,
    },

    // Error states for each API
    errors: {
        accruedInterestReport: null,
        accruedInterestReportSummary: null,
        liquidityStatusReport: null,
    },

    // UI State & Filters - Store dates as strings to ensure serialization
    filters: {
        reportType: 'Detail', // 'Detail' or 'Summary'
        costCenterType: 'Performing', // Always 'Performing' as per requirement
        subType: '', // 'Manufacturing', 'Service', 'Trading'
        ccStatus: '', // 'Active', 'Closed'
        costCenter: '',
        fromDate: '', // String instead of Date object
        toDate: '',   // String instead of Date object
        roleId: ''
    },

    // Modal state for drill-down
    modalData: {
        isOpen: false,
        selectedDate: '',
        selectedCCCode: '',
        selectedType: '',
        selectedAmount: 0
    }
};

// Accrued Interest Report Slice
// =============================
const accruedInterestReportSlice = createSlice({
    name: 'accruedinterest',
    initialState,
    reducers: {
        // Action to set filters - with date sanitization
        setFilters: (state, action) => {
            // Sanitize the payload to ensure all dates are strings
            const sanitizedFilters = sanitizeFilters(action.payload);
            state.filters = { ...state.filters, ...sanitizedFilters };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                reportType: 'Detail',
                costCenterType: 'Performing',
                subType: '',
                ccStatus: '',
                costCenter: '',
                fromDate: '', // Reset as empty string
                toDate: '',   // Reset as empty string
                roleId: state.filters.roleId // Keep roleId
            };
        },

        // Action to set report type based on role
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },

        // Action to reset all report data
        resetReportData: (state) => {
            state.accruedInterestReport = [];
            state.accruedInterestReportSummary = null;
            state.liquidityStatusReport = [];
            // Clear errors when resetting data
            state.errors = {
                accruedInterestReport: null,
                accruedInterestReportSummary: null,
                liquidityStatusReport: null,
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Modal actions
        openModal: (state, action) => {
            const { date, ccCode, type, amount } = action.payload;
            state.modalData = {
                isOpen: true,
                selectedDate: date,
                selectedCCCode: ccCode,
                selectedType: type,
                selectedAmount: amount
            };
        },

        closeModal: (state) => {
            state.modalData = {
                isOpen: false,
                selectedDate: '',
                selectedCCCode: '',
                selectedType: '',
                selectedAmount: 0
            };
            // Clear modal data when closing
            state.accruedInterestReportSummary = null;
            state.errors.accruedInterestReportSummary = null;
        },

        // Action to reset selected cost center data
        resetSelectedCCData: (state) => {
            state.accruedInterestReport = [];
            state.liquidityStatusReport = [];
            // Clear related errors
            state.errors.accruedInterestReport = null;
            state.errors.liquidityStatusReport = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Accrued Interest Report (Detail View)
        builder
            .addCase(fetchAccruedInterestReport.pending, (state) => {
                state.loading.accruedInterestReport = true;
                state.errors.accruedInterestReport = null;
            })
            .addCase(fetchAccruedInterestReport.fulfilled, (state, action) => {
                state.loading.accruedInterestReport = false;
                state.accruedInterestReport = action.payload;
                state.errors.accruedInterestReport = null;
            })
            .addCase(fetchAccruedInterestReport.rejected, (state, action) => {
                state.loading.accruedInterestReport = false;
                state.errors.accruedInterestReport = action.payload;
            })

        // 2. Accrued Interest Report Summary (Modal)
        builder
            .addCase(fetchAccruedInterestReportSummary.pending, (state) => {
                state.loading.accruedInterestReportSummary = true;
                state.errors.accruedInterestReportSummary = null;
            })
            .addCase(fetchAccruedInterestReportSummary.fulfilled, (state, action) => {
                state.loading.accruedInterestReportSummary = false;
                state.accruedInterestReportSummary = action.payload;
                state.errors.accruedInterestReportSummary = null;
            })
            .addCase(fetchAccruedInterestReportSummary.rejected, (state, action) => {
                state.loading.accruedInterestReportSummary = false;
                state.errors.accruedInterestReportSummary = action.payload;
            })

        // 3. Liquidity Status Report (Summary View)
        builder
            .addCase(fetchLiquidityStatusReport.pending, (state) => {
                state.loading.liquidityStatusReport = true;
                state.errors.liquidityStatusReport = null;
            })
            .addCase(fetchLiquidityStatusReport.fulfilled, (state, action) => {
                state.loading.liquidityStatusReport = false;
                state.liquidityStatusReport = action.payload;
                state.errors.liquidityStatusReport = null;
            })
            .addCase(fetchLiquidityStatusReport.rejected, (state, action) => {
                state.loading.liquidityStatusReport = false;
                state.errors.liquidityStatusReport = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    setReportType,
    resetReportData, 
    clearError, 
    resetSelectedCCData,
    openModal,
    closeModal
} = accruedInterestReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAccruedInterestReport = (state) => state.accruedinterest.accruedInterestReport;
export const selectAccruedInterestReportSummary = (state) => state.accruedinterest.accruedInterestReportSummary;
export const selectLiquidityStatusReport = (state) => state.accruedinterest.liquidityStatusReport;

// Loading selectors
export const selectLoading = (state) => state.accruedinterest.loading;
export const selectAccruedInterestReportLoading = (state) => state.accruedinterest.loading.accruedInterestReport;
export const selectAccruedInterestReportSummaryLoading = (state) => state.accruedinterest.loading.accruedInterestReportSummary;
export const selectLiquidityStatusReportLoading = (state) => state.accruedinterest.loading.liquidityStatusReport;

// Error selectors
export const selectErrors = (state) => state.accruedinterest.errors;
export const selectAccruedInterestReportError = (state) => state.accruedinterest.errors.accruedInterestReport;
export const selectAccruedInterestReportSummaryError = (state) => state.accruedinterest.errors.accruedInterestReportSummary;
export const selectLiquidityStatusReportError = (state) => state.accruedinterest.errors.liquidityStatusReport;

// Filter selectors
export const selectFilters = (state) => state.accruedinterest.filters;
export const selectReportType = (state) => state.accruedinterest.filters.reportType;
export const selectSelectedCostCenter = (state) => state.accruedinterest.filters.costCenter;
export const selectSelectedCostCenterType = (state) => state.accruedinterest.filters.costCenterType;
export const selectSelectedSubType = (state) => state.accruedinterest.filters.subType;
export const selectSelectedCCStatus = (state) => state.accruedinterest.filters.ccStatus;
export const selectSelectedFromDate = (state) => state.accruedinterest.filters.fromDate;
export const selectSelectedToDate = (state) => state.accruedinterest.filters.toDate;
export const selectRoleId = (state) => state.accruedinterest.filters.roleId;

// Modal selectors
export const selectModalData = (state) => state.accruedinterest.modalData;
export const selectIsModalOpen = (state) => state.accruedinterest.modalData.isOpen;
export const selectModalSelectedDate = (state) => state.accruedinterest.modalData.selectedDate;
export const selectModalSelectedCCCode = (state) => state.accruedinterest.modalData.selectedCCCode;
export const selectModalSelectedType = (state) => state.accruedinterest.modalData.selectedType;
export const selectModalSelectedAmount = (state) => state.accruedinterest.modalData.selectedAmount;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.accruedinterest.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.accruedinterest.errors).some(error => error !== null);

// Business logic selectors
export const selectCanShowSummaryReport = (state) => {
    const roleId = state.accruedinterest.filters.roleId;
    return roleId === '100' || roleId === 100;
};

export const selectCurrentReportData = (state) => {
    const reportType = state.accruedinterest.filters.reportType;
    if (reportType === 'Summary') {
        return state.accruedinterest.liquidityStatusReport?.Data || 
               state.accruedinterest.liquidityStatusReport?.data || 
               state.accruedinterest.liquidityStatusReport || 
               [];
    }
    return state.accruedinterest.accruedInterestReport?.Data || 
           state.accruedinterest.accruedInterestReport?.data || 
           state.accruedinterest.accruedInterestReport || 
           [];
};

export const selectCurrentReportLoading = (state) => {
    const reportType = state.accruedinterest.filters.reportType;
    if (reportType === 'Summary') {
        return state.accruedinterest.loading.liquidityStatusReport;
    }
    return state.accruedinterest.loading.accruedInterestReport;
};

export const selectCurrentReportError = (state) => {
    const reportType = state.accruedinterest.filters.reportType;
    if (reportType === 'Summary') {
        return state.accruedinterest.errors.liquidityStatusReport;
    }
    return state.accruedinterest.errors.accruedInterestReport;
};

// Computed selectors for report summary
export const selectReportSummary = (state) => {
    const reportData = selectCurrentReportData(state);
    
    if (!Array.isArray(reportData) || reportData.length === 0) return null;
    
    // Calculate summary metrics from the report data
    const totalNetReceived = reportData.reduce((sum, item) => 
        sum + parseFloat(item.netrecieved || item.NetReceived || 0), 0);
    
    const totalNetPaid = reportData.reduce((sum, item) => 
        sum + parseFloat(item.netpaid || item.NetPaid || 0), 0);
    
    const finalCashStatus = reportData[reportData.length - 1]?.cashstatus || 
                           reportData[reportData.length - 1]?.CashStatus || 0;
    
    const totalAccumulatedInterest = reportData[reportData.length - 1]?.NewAccumulatedInterst || 
                                   reportData[reportData.length - 1]?.AccumulatedInterest || 0;
    
    return {
        totalNetReceived,
        totalNetPaid,
        finalCashStatus: parseFloat(finalCashStatus),
        totalAccumulatedInterest: parseFloat(totalAccumulatedInterest),
        recordCount: reportData.length,
        hasNegativeCashFlow: parseFloat(finalCashStatus) < 0
    };
};

// Export reducer
export default accruedInterestReportSlice.reducer;