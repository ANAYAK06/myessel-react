import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as closingStockReportAPI from '../../api/Stock/closingStockReportAPI';

// Async Thunks for Closing Stock Report APIs
// ===========================================

// 1. Fetch Stock Close Update CC
export const fetchStockCloseUpdateCC = createAsyncThunk(
    'closingstockreport/fetchStockCloseUpdateCC',
    async (params, { rejectWithValue }) => {
        try {
            const response = await closingStockReportAPI.getStockCloseUpdateCC(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Close Update CC');
        }
    }
);

// 2. Fetch CC Financial Years
export const fetchCCFinancialYears = createAsyncThunk(
    'closingstockreport/fetchCCFinancialYears',
    async (params, { rejectWithValue }) => {
        try {
            const response = await closingStockReportAPI.getCCFinancialYears(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC Financial Years');
        }
    }
);

// 3. Fetch Stock Close Report Data
export const fetchStockCloseReportData = createAsyncThunk(
    'closingstockreport/fetchStockCloseReportData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await closingStockReportAPI.getStockCloseReportData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Close Report Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    stockCloseUpdateCC: [],
    ccFinancialYears: [],
    stockCloseReportData: [],

    // Loading states for each API
    loading: {
        stockCloseUpdateCC: false,
        ccFinancialYears: false,
        stockCloseReportData: false,
    },

    // Error states for each API
    errors: {
        stockCloseUpdateCC: null,
        ccFinancialYears: null,
        stockCloseReportData: null,
    },

    // UI State / Filters
    filters: {
        // For Stock Close Update CC
        UserId: '',
        Roleid: '',
        
        // For CC Financial Years & Stock Close Report Data
        CCCode: '',
        Year: ''
    }
};

// Closing Stock Report Slice
// ===========================
const closingStockReportSlice = createSlice({
    name: 'closingstockreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                UserId: '',
                Roleid: '',
                CCCode: '',
                Year: ''
            };
        },
        
        // Action to reset ONLY report data (preserve dropdowns) - for normal operations
        resetReportData: (state) => {
            state.stockCloseReportData = [];
            // ✅ DON'T clear stockCloseUpdateCC and ccFinancialYears - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.stockCloseUpdateCC = [];
            state.ccFinancialYears = [];
            state.stockCloseReportData = [];
            
            state.filters = {
                UserId: '',
                Roleid: '',
                CCCode: '',
                Year: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset stock close update CC data
        resetStockCloseUpdateCCData: (state) => {
            state.stockCloseUpdateCC = [];
        },

        // Action to reset CC financial years data
        resetCCFinancialYearsData: (state) => {
            state.ccFinancialYears = [];
        },

        // Action to reset stock close report data
        resetStockCloseReportData: (state) => {
            state.stockCloseReportData = [];
        },

        // Action to reset all closing stock data
        resetAllClosingStockData: (state) => {
            state.stockCloseUpdateCC = [];
            state.ccFinancialYears = [];
            state.stockCloseReportData = [];
        },

        // Action to set CC Code filter
        setCCCode: (state, action) => {
            state.filters.CCCode = action.payload;
        },

        // Action to clear CC Code filter
        clearCCCode: (state) => {
            state.filters.CCCode = '';
        },

        // Action to set Year filter
        setYear: (state, action) => {
            state.filters.Year = action.payload;
        },

        // Action to clear Year filter
        clearYear: (state) => {
            state.filters.Year = '';
        },

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UserId, Roleid } = action.payload;
            state.filters.UserId = UserId || state.filters.UserId;
            state.filters.Roleid = Roleid || state.filters.Roleid;
        },

        // Action to clear user credentials
        clearUserCredentials: (state) => {
            state.filters.UserId = '';
            state.filters.Roleid = '';
        },

        // Action to set CC Code and Year together
        setCCCodeAndYear: (state, action) => {
            const { CCCode, Year } = action.payload;
            state.filters.CCCode = CCCode || state.filters.CCCode;
            state.filters.Year = Year || state.filters.Year;
        },

        // Action to clear CC Code and Year together
        clearCCCodeAndYear: (state) => {
            state.filters.CCCode = '';
            state.filters.Year = '';
        }
    },
    extraReducers: (builder) => {
        // 1. Stock Close Update CC
        builder
            .addCase(fetchStockCloseUpdateCC.pending, (state) => {
                state.loading.stockCloseUpdateCC = true;
                state.errors.stockCloseUpdateCC = null;
            })
            .addCase(fetchStockCloseUpdateCC.fulfilled, (state, action) => {
                state.loading.stockCloseUpdateCC = false;
                state.stockCloseUpdateCC = action.payload;
            })
            .addCase(fetchStockCloseUpdateCC.rejected, (state, action) => {
                state.loading.stockCloseUpdateCC = false;
                state.errors.stockCloseUpdateCC = action.payload;
            })

        // 2. CC Financial Years
        builder
            .addCase(fetchCCFinancialYears.pending, (state) => {
                state.loading.ccFinancialYears = true;
                state.errors.ccFinancialYears = null;
            })
            .addCase(fetchCCFinancialYears.fulfilled, (state, action) => {
                state.loading.ccFinancialYears = false;
                state.ccFinancialYears = action.payload;
            })
            .addCase(fetchCCFinancialYears.rejected, (state, action) => {
                state.loading.ccFinancialYears = false;
                state.errors.ccFinancialYears = action.payload;
            })

        // 3. Stock Close Report Data
        builder
            .addCase(fetchStockCloseReportData.pending, (state) => {
                state.loading.stockCloseReportData = true;
                state.errors.stockCloseReportData = null;
            })
            .addCase(fetchStockCloseReportData.fulfilled, (state, action) => {
                state.loading.stockCloseReportData = false;
                state.stockCloseReportData = action.payload;
            })
            .addCase(fetchStockCloseReportData.rejected, (state, action) => {
                state.loading.stockCloseReportData = false;
                state.errors.stockCloseReportData = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetReportData,                          // ✅ Only resets report data (preserves dropdowns)
    resetAllData,                             // ✅ Resets everything (for Reset button only)
    clearError, 
    resetStockCloseUpdateCCData,
    resetCCFinancialYearsData,
    resetStockCloseReportData,
    resetAllClosingStockData,
    setCCCode,                                // ✅ Helper for CC Code
    clearCCCode,                              // ✅ Helper for clearing CC Code
    setYear,                                  // ✅ Helper for Year
    clearYear,                                // ✅ Helper for clearing Year
    setUserCredentials,                       // ✅ Helper for setting user credentials
    clearUserCredentials,                     // ✅ Helper for clearing user credentials
    setCCCodeAndYear,                         // ✅ Helper for setting both CC Code and Year
    clearCCCodeAndYear                        // ✅ Helper for clearing both CC Code and Year
} = closingStockReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectStockCloseUpdateCC = (state) => state.closingstockreport.stockCloseUpdateCC;
export const selectCCFinancialYears = (state) => state.closingstockreport.ccFinancialYears;
export const selectStockCloseReportData = (state) => state.closingstockreport.stockCloseReportData;

// Loading selectors
export const selectLoading = (state) => state.closingstockreport.loading;
export const selectStockCloseUpdateCCLoading = (state) => state.closingstockreport.loading.stockCloseUpdateCC;
export const selectCCFinancialYearsLoading = (state) => state.closingstockreport.loading.ccFinancialYears;
export const selectStockCloseReportDataLoading = (state) => state.closingstockreport.loading.stockCloseReportData;

// Error selectors
export const selectErrors = (state) => state.closingstockreport.errors;
export const selectStockCloseUpdateCCError = (state) => state.closingstockreport.errors.stockCloseUpdateCC;
export const selectCCFinancialYearsError = (state) => state.closingstockreport.errors.ccFinancialYears;
export const selectStockCloseReportDataError = (state) => state.closingstockreport.errors.stockCloseReportData;

// Filter selectors
export const selectFilters = (state) => state.closingstockreport.filters;
export const selectSelectedUserId = (state) => state.closingstockreport.filters.UserId;
export const selectSelectedRoleid = (state) => state.closingstockreport.filters.Roleid;
export const selectSelectedCCCode = (state) => state.closingstockreport.filters.CCCode;
export const selectSelectedYear = (state) => state.closingstockreport.filters.Year;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.closingstockreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.closingstockreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasStockCloseUpdateCCData = (state) => {
    return Array.isArray(state.closingstockreport.stockCloseUpdateCC?.Data) && 
           state.closingstockreport.stockCloseUpdateCC.Data.length > 0;
};

export const selectHasCCFinancialYearsData = (state) => {
    return Array.isArray(state.closingstockreport.ccFinancialYears?.Data) && 
           state.closingstockreport.ccFinancialYears.Data.length > 0;
};

export const selectHasStockCloseReportData = (state) => {
    return Array.isArray(state.closingstockreport.stockCloseReportData?.Data) && 
           state.closingstockreport.stockCloseReportData.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.closingstockreport.stockCloseUpdateCC.length > 0 || 
           state.closingstockreport.ccFinancialYears.length > 0 || 
           state.closingstockreport.stockCloseReportData.length > 0;
};

// Closing Stock summary selector based on the data structure you provided
export const selectClosingStockSummary = (state) => {
    const reportData = state.closingstockreport.stockCloseReportData?.Data || [];
    
    if (!Array.isArray(reportData) || reportData.length === 0) {
        return {
            totalRecords: 0,
            totalAmount: 0,
            totalPurchaseAmount: 0,
            totalNewStockAmount: 0,
            totalOldStockAmount: 0,
            totalClosingAmount: 0,
            totalCurrentValue: 0,
            approvedRecords: 0,
            pendingRecords: 0
        };
    }

    return reportData.reduce((summary, record) => {
        const amount = parseFloat(record.Amount || 0);
        const purchaseAmount = parseFloat(record.TotalPurchaseAmt || 0);
        const newStockAmount = parseFloat(record.NewStockAmt || 0);
        const oldStockAmount = parseFloat(record.OldStockAmt || 0);
        const closingAmount = parseFloat(record.ClosingAmount || 0);
        const currentValue = parseFloat(record.CurrentValue || 0);
        
        summary.totalRecords += 1;
        summary.totalAmount += amount;
        summary.totalPurchaseAmount += purchaseAmount;
        summary.totalNewStockAmount += newStockAmount;
        summary.totalOldStockAmount += oldStockAmount;
        summary.totalClosingAmount += closingAmount;
        summary.totalCurrentValue += currentValue;
        
        if (record.Status === 'Approved') {
            summary.approvedRecords += 1;
        } else {
            summary.pendingRecords += 1;
        }
        
        return summary;
    }, {
        totalRecords: 0,
        totalAmount: 0,
        totalPurchaseAmount: 0,
        totalNewStockAmount: 0,
        totalOldStockAmount: 0,
        totalClosingAmount: 0,
        totalCurrentValue: 0,
        approvedRecords: 0,
        pendingRecords: 0
    });
};

// Filter validation selectors
export const selectStockCloseUpdateCCFiltersValid = (state) => {
    const { UserId, Roleid } = state.closingstockreport.filters;
    return !!(UserId && Roleid); // UserId and Roleid are required for stock close update CC
};

export const selectCCFinancialYearsFiltersValid = (state) => {
    const { CCCode } = state.closingstockreport.filters;
    return !!CCCode; // CCCode is required for CC financial years
};

export const selectStockCloseReportFiltersValid = (state) => {
    const { CCCode, Year } = state.closingstockreport.filters;
    return !!(CCCode && Year); // Both CCCode and Year are required for stock close report data
};

// User credentials selector
export const selectUserCredentials = (state) => ({
    UserId: state.closingstockreport.filters.UserId,
    Roleid: state.closingstockreport.filters.Roleid
});

// CC Code and Year combined selector
export const selectCCCodeAndYear = (state) => ({
    CCCode: state.closingstockreport.filters.CCCode,
    Year: state.closingstockreport.filters.Year
});

// Stock Close Update CC params selector
export const selectStockCloseUpdateCCParams = (state) => ({
    UserId: state.closingstockreport.filters.UserId,
    Roleid: state.closingstockreport.filters.Roleid
});

// CC Financial Years params selector
export const selectCCFinancialYearsParams = (state) => ({
    CCCode: state.closingstockreport.filters.CCCode
});

// Stock Close Report Data params selector
export const selectStockCloseReportDataParams = (state) => ({
    CCCode: state.closingstockreport.filters.CCCode,
    Year: state.closingstockreport.filters.Year
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.closingstockreport.filters;

// Export reducer
export default closingStockReportSlice.reducer;