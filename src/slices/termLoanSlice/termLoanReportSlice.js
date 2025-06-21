import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as termLoanAPI from '../../api/LoanAPI/termLoanReportAPI';


// =========================================

// 1. Fetch Agency Codes
export const fetchAgencyCodes = createAsyncThunk(
    'termloanreport/fetchAgencyCodes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await termLoanAPI.getAgencyCodes();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Agency Codes');
        }
    }
);

// 2. Fetch Loan Numbers by Agency
export const fetchLoanNumbersByAgency = createAsyncThunk(
    'termloanreport/fetchLoanNumbersByAgency',
    async (agencyCode, { rejectWithValue }) => {
        try {
            const response = await termLoanAPI.getLoanNumbersByAgency(agencyCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Loan Numbers');
        }
    }
);

// 3. Fetch Term Loan Report Grid
export const fetchTermLoanReportGrid = createAsyncThunk(
    'termloanreport/fetchTermLoanReportGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await termLoanAPI.getTermLoanReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Term Loan Report');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    agencyCodes: [],
    loanNumbers: [],
    termLoanReportGrid: [],

    // Loading states for each API
    loading: {
        agencyCodes: false,
        loanNumbers: false,
        termLoanReportGrid: false,
    },

    // Error states for each API
    errors: {
        agencyCodes: null,
        loanNumbers: null,
        termLoanReportGrid: null,
    },

    // UI State
    filters: {
        agency: '',
        loanNo: '',
        fromDate: '',
        toDate: ''
    }
};

// Term Loan Report Slice
// =======================
const termLoanReportSlice = createSlice({
    name: 'termloanreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                agency: '',
                loanNo: '',
                fromDate: '',
                toDate: ''
            };
        },
        
        // Action to reset term loan report data
        resetTermLoanReportData: (state) => {
            state.termLoanReportGrid = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset loan numbers when agency changes
        resetLoanNumbers: (state) => {
            state.loanNumbers = [];
            state.filters.loanNo = '';
        },

        // Action to clear all data (for page refresh/reset)
        clearAllData: (state) => {
            state.termLoanReportGrid = [];
            state.loanNumbers = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Agency Codes
        builder
            .addCase(fetchAgencyCodes.pending, (state) => {
                state.loading.agencyCodes = true;
                state.errors.agencyCodes = null;
            })
            .addCase(fetchAgencyCodes.fulfilled, (state, action) => {
                state.loading.agencyCodes = false;
                state.agencyCodes = action.payload;
            })
            .addCase(fetchAgencyCodes.rejected, (state, action) => {
                state.loading.agencyCodes = false;
                state.errors.agencyCodes = action.payload;
            })

        // 2. Loan Numbers
        builder
            .addCase(fetchLoanNumbersByAgency.pending, (state) => {
                state.loading.loanNumbers = true;
                state.errors.loanNumbers = null;
            })
            .addCase(fetchLoanNumbersByAgency.fulfilled, (state, action) => {
                state.loading.loanNumbers = false;
                state.loanNumbers = action.payload;
            })
            .addCase(fetchLoanNumbersByAgency.rejected, (state, action) => {
                state.loading.loanNumbers = false;
                state.errors.loanNumbers = action.payload;
            })

        // 3. Term Loan Report Grid
        builder
            .addCase(fetchTermLoanReportGrid.pending, (state) => {
                state.loading.termLoanReportGrid = true;
                state.errors.termLoanReportGrid = null;
            })
            .addCase(fetchTermLoanReportGrid.fulfilled, (state, action) => {
                state.loading.termLoanReportGrid = false;
                state.termLoanReportGrid = action.payload;
            })
            .addCase(fetchTermLoanReportGrid.rejected, (state, action) => {
                state.loading.termLoanReportGrid = false;
                state.errors.termLoanReportGrid = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetTermLoanReportData, 
    clearError, 
    resetLoanNumbers,
    clearAllData 
} = termLoanReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAgencyCodes = (state) => state.termloanreport.agencyCodes;
export const selectLoanNumbers = (state) => state.termloanreport.loanNumbers;
export const selectTermLoanReportGrid = (state) => state.termloanreport.termLoanReportGrid;

// Loading selectors
export const selectLoading = (state) => state.termloanreport.loading;
export const selectAgencyCodesLoading = (state) => state.termloanreport.loading.agencyCodes;
export const selectLoanNumbersLoading = (state) => state.termloanreport.loading.loanNumbers;
export const selectTermLoanReportGridLoading = (state) => state.termloanreport.loading.termLoanReportGrid;

// Error selectors
export const selectErrors = (state) => state.termloanreport.errors;
export const selectAgencyCodesError = (state) => state.termloanreport.errors.agencyCodes;
export const selectLoanNumbersError = (state) => state.termloanreport.errors.loanNumbers;
export const selectTermLoanReportGridError = (state) => state.termloanreport.errors.termLoanReportGrid;

// Filter selectors
export const selectFilters = (state) => state.termloanreport.filters;
export const selectSelectedAgency = (state) => state.termloanreport.filters.agency;
export const selectSelectedLoanNo = (state) => state.termloanreport.filters.loanNo;
export const selectSelectedFromDate = (state) => state.termloanreport.filters.fromDate;
export const selectSelectedToDate = (state) => state.termloanreport.filters.toDate;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.termloanreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.termloanreport.errors).some(error => error !== null);

// Export reducer
export default termLoanReportSlice.reducer;