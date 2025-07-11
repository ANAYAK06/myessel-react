import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as accountStatusAPI from '../../api/FinanceReportAPI/accountStatusAPI';

// Helper function to calculate years from Financial Year
const calculateYearsFromFY = (financialYear) => {
    if (!financialYear || !financialYear.includes('-')) {
        return { startYear: '', endYear: '', prevYear: '' };
    }
    
    const [startYear, endYear] = financialYear.split('-');
    const prevYear = (parseInt(startYear) - 1).toString();
    
    return {
        startYear,
        endYear,
        prevYear
    };
};

// =========================================

// 1. Fetch Consolidate IT Report Grid
export const fetchConsolidateITReportGrid = createAsyncThunk(
    'accountstatus/fetchConsolidateITReportGrid',
    async (financialYear, { rejectWithValue }) => {
        try {
            const { startYear, endYear, prevYear } = calculateYearsFromFY(financialYear);
            
            if (!startYear || !endYear || !prevYear) {
                throw new Error('Invalid Financial Year format. Expected format: 2025-26');
            }
            
            const params = {
                StartYear: startYear,
                EndYear: endYear,
                PrevYear: prevYear
            };
            
            const response = await accountStatusAPI.getConsolidateITReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Consolidate IT Report Grid');
        }
    }
);

// 2. Fetch Consolidate IT Report Detail
export const fetchConsolidateITReportDetail = createAsyncThunk(
    'accountstatus/fetchConsolidateITReportDetail',
    async (params, { rejectWithValue }) => {
        try {
            const response = await accountStatusAPI.getConsolidateITReportDetail(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Consolidate IT Report Detail');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    consolidateITReportGrid: [],
    consolidateITReportDetail: [],

    // Loading states for each API
    loading: {
        consolidateITReportGrid: false,
        consolidateITReportDetail: false,
    },

    // Error states for each API
    errors: {
        consolidateITReportGrid: null,
        consolidateITReportDetail: null,
    },

    // UI State - Only Financial Year filter needed
    filters: {
        financialYear: '', // Format: 2025-26
    }
};

// Account Status Slice
// ====================
const accountStatusSlice = createSlice({
    name: 'accountstatus',
    initialState,
    reducers: {
        // Action to set financial year filter
        setFinancialYear: (state, action) => {
            state.filters.financialYear = action.payload;
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                financialYear: ''
            };
        },
        
        // Action to reset report grid data
        resetReportGridData: (state) => {
            state.consolidateITReportGrid = [];
        },

        // Action to reset report detail data
        resetReportDetailData: (state) => {
            state.consolidateITReportDetail = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to clear all data (for page refresh/reset)
        clearAllData: (state) => {
            state.consolidateITReportGrid = [];
            state.consolidateITReportDetail = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Consolidate IT Report Grid
        builder
            .addCase(fetchConsolidateITReportGrid.pending, (state) => {
                state.loading.consolidateITReportGrid = true;
                state.errors.consolidateITReportGrid = null;
            })
            .addCase(fetchConsolidateITReportGrid.fulfilled, (state, action) => {
                state.loading.consolidateITReportGrid = false;
                state.consolidateITReportGrid = action.payload;
            })
            .addCase(fetchConsolidateITReportGrid.rejected, (state, action) => {
                state.loading.consolidateITReportGrid = false;
                state.errors.consolidateITReportGrid = action.payload;
            })

        // 2. Consolidate IT Report Detail
        builder
            .addCase(fetchConsolidateITReportDetail.pending, (state) => {
                state.loading.consolidateITReportDetail = true;
                state.errors.consolidateITReportDetail = null;
            })
            .addCase(fetchConsolidateITReportDetail.fulfilled, (state, action) => {
                state.loading.consolidateITReportDetail = false;
                state.consolidateITReportDetail = action.payload;
            })
            .addCase(fetchConsolidateITReportDetail.rejected, (state, action) => {
                state.loading.consolidateITReportDetail = false;
                state.errors.consolidateITReportDetail = action.payload;
            });
    },
});

// Export actions
export const { 
    setFinancialYear, 
    clearFilters, 
    resetReportGridData,
    resetReportDetailData,
    clearError,
    clearAllData 
} = accountStatusSlice.actions;

// Selectors
// =========

// Data selectors
export const selectConsolidateITReportGrid = (state) => state.accountstatus.consolidateITReportGrid;
export const selectConsolidateITReportDetail = (state) => state.accountstatus.consolidateITReportDetail;

// Loading selectors
export const selectLoading = (state) => state.accountstatus.loading;
export const selectConsolidateITReportGridLoading = (state) => state.accountstatus.loading.consolidateITReportGrid;
export const selectConsolidateITReportDetailLoading = (state) => state.accountstatus.loading.consolidateITReportDetail;

// Error selectors
export const selectErrors = (state) => state.accountstatus.errors;
export const selectConsolidateITReportGridError = (state) => state.accountstatus.errors.consolidateITReportGrid;
export const selectConsolidateITReportDetailError = (state) => state.accountstatus.errors.consolidateITReportDetail;

// Filter selectors
export const selectFilters = (state) => state.accountstatus.filters;
export const selectSelectedFinancialYear = (state) => state.accountstatus.filters.financialYear;

// Calculated selectors - derive start, end, and previous years from financial year
export const selectCalculatedYears = (state) => {
    const financialYear = state.accountstatus.filters.financialYear;
    return calculateYearsFromFY(financialYear);
};

export const selectStartYear = (state) => {
    const { startYear } = selectCalculatedYears(state);
    return startYear;
};

export const selectEndYear = (state) => {
    const { endYear } = selectCalculatedYears(state);
    return endYear;
};

export const selectPrevYear = (state) => {
    const { prevYear } = selectCalculatedYears(state);
    return prevYear;
};

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.accountstatus.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.accountstatus.errors).some(error => error !== null);

// Export helper function for external use
export { calculateYearsFromFY };

// Export reducer
export default accountStatusSlice.reducer;