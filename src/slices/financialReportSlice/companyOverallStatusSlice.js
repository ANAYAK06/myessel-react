import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as companyOverallStatusAPI from '../../api/FinanceReportAPI/companyOverallStatusAPI';

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

// 1. Fetch Consolidate Company Overflow Report Grid
export const fetchConsolidateCompanyOverflowReportGrid = createAsyncThunk(
    'companyoverallstatus/fetchConsolidateCompanyOverflowReportGrid',
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
            
            const response = await companyOverallStatusAPI.getConsolidateCompanyOverflowReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Consolidate Company Overflow Report Grid');
        }
    }
);

// 2. Fetch Consolidate Company Overflow Report Detail
export const fetchConsolidateCompanyOverflowReportDetail = createAsyncThunk(
    'companyoverallstatus/fetchConsolidateCompanyOverflowReportDetail',
    async (params, { rejectWithValue }) => {
        try {
            const response = await companyOverallStatusAPI.getConsolidateCompanyOverflowReportDetail(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Consolidate Company Overflow Report Detail');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    consolidateCompanyOverflowReportGrid: [],
    consolidateCompanyOverflowReportDetail: [],

    // Loading states for each API
    loading: {
        consolidateCompanyOverflowReportGrid: false,
        consolidateCompanyOverflowReportDetail: false,
    },

    // Error states for each API
    errors: {
        consolidateCompanyOverflowReportGrid: null,
        consolidateCompanyOverflowReportDetail: null,
    },

    // UI State - Only Financial Year filter needed
    filters: {
        financialYear: '', // Format: 2025-26
    }
};

// Company Overall Status Slice
// =============================
const companyOverallStatusSlice = createSlice({
    name: 'companyoverallstatus',
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
            state.consolidateCompanyOverflowReportGrid = [];
        },

        // Action to reset report detail data
        resetReportDetailData: (state) => {
            state.consolidateCompanyOverflowReportDetail = [];
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
            state.consolidateCompanyOverflowReportGrid = [];
            state.consolidateCompanyOverflowReportDetail = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Consolidate Company Overflow Report Grid
        builder
            .addCase(fetchConsolidateCompanyOverflowReportGrid.pending, (state) => {
                state.loading.consolidateCompanyOverflowReportGrid = true;
                state.errors.consolidateCompanyOverflowReportGrid = null;
            })
            .addCase(fetchConsolidateCompanyOverflowReportGrid.fulfilled, (state, action) => {
                state.loading.consolidateCompanyOverflowReportGrid = false;
                state.consolidateCompanyOverflowReportGrid = action.payload;
            })
            .addCase(fetchConsolidateCompanyOverflowReportGrid.rejected, (state, action) => {
                state.loading.consolidateCompanyOverflowReportGrid = false;
                state.errors.consolidateCompanyOverflowReportGrid = action.payload;
            })

        // 2. Consolidate Company Overflow Report Detail
        builder
            .addCase(fetchConsolidateCompanyOverflowReportDetail.pending, (state) => {
                state.loading.consolidateCompanyOverflowReportDetail = true;
                state.errors.consolidateCompanyOverflowReportDetail = null;
            })
            .addCase(fetchConsolidateCompanyOverflowReportDetail.fulfilled, (state, action) => {
                state.loading.consolidateCompanyOverflowReportDetail = false;
                state.consolidateCompanyOverflowReportDetail = action.payload;
            })
            .addCase(fetchConsolidateCompanyOverflowReportDetail.rejected, (state, action) => {
                state.loading.consolidateCompanyOverflowReportDetail = false;
                state.errors.consolidateCompanyOverflowReportDetail = action.payload;
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
} = companyOverallStatusSlice.actions;

// Selectors
// =========

// Data selectors
export const selectConsolidateCompanyOverflowReportGrid = (state) => state.companyoverallstatus.consolidateCompanyOverflowReportGrid;
export const selectConsolidateCompanyOverflowReportDetail = (state) => state.companyoverallstatus.consolidateCompanyOverflowReportDetail;

// Loading selectors
export const selectLoading = (state) => state.companyoverallstatus.loading;
export const selectConsolidateCompanyOverflowReportGridLoading = (state) => state.companyoverallstatus.loading.consolidateCompanyOverflowReportGrid;
export const selectConsolidateCompanyOverflowReportDetailLoading = (state) => state.companyoverallstatus.loading.consolidateCompanyOverflowReportDetail;

// Error selectors
export const selectErrors = (state) => state.companyoverallstatus.errors;
export const selectConsolidateCompanyOverflowReportGridError = (state) => state.companyoverallstatus.errors.consolidateCompanyOverflowReportGrid;
export const selectConsolidateCompanyOverflowReportDetailError = (state) => state.companyoverallstatus.errors.consolidateCompanyOverflowReportDetail;

// Filter selectors
export const selectFilters = (state) => state.companyoverallstatus.filters;
export const selectSelectedFinancialYear = (state) => state.companyoverallstatus.filters.financialYear;

// Calculated selectors - derive start, end, and previous years from financial year
export const selectCalculatedYears = (state) => {
    const financialYear = state.companyoverallstatus.filters.financialYear;
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
export const selectIsAnyLoading = (state) => Object.values(state.companyoverallstatus.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.companyoverallstatus.errors).some(error => error !== null);

// Export helper function for external use
export { calculateYearsFromFY };

// Export reducer
export default companyOverallStatusSlice.reducer;