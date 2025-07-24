import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as unsecuredLoanAPI from '../../api/LoanAPI/unsecuredLoanReportAPI';

// =========================================

// 1. Fetch All Unsecured Loans by Role ID
export const fetchAllUnsecuredLoans = createAsyncThunk(
    'unsecuredloanreport/fetchAllUnsecuredLoans',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await unsecuredLoanAPI.getAllUnsecuredLoans(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Unsecured Loans');
        }
    }
);

// 2. Fetch Unsecured Loan Years by Loan Number
export const fetchUnsecuredLoanYears = createAsyncThunk(
    'unsecuredloanreport/fetchUnsecuredLoanYears',
    async (loanNo, { rejectWithValue }) => {
        try {
            const response = await unsecuredLoanAPI.getUnsecuredLoanYears(loanNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Loan Years');
        }
    }
);

// 3. Fetch Unsecured Loan Months by Loan Number and Year
export const fetchUnsecuredLoanMonths = createAsyncThunk(
    'unsecuredloanreport/fetchUnsecuredLoanMonths',
    async ({ loanNo, year }, { rejectWithValue }) => {
        try {
            const response = await unsecuredLoanAPI.getUnsecuredLoanMonths(loanNo, year);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Loan Months');
        }
    }
);

// 4. Fetch Unsecured Loan Banks
export const fetchUnsecuredLoanBanks = createAsyncThunk(
    'unsecuredloanreport/fetchUnsecuredLoanBanks',
    async (unsLoan, { rejectWithValue }) => {
        try {
            const response = await unsecuredLoanAPI.getUnsecuredLoanBanks(unsLoan);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Loan Banks');
        }
    }
);

// 5. Fetch Unsecured Loan Report Data
export const fetchUnsecuredLoanReportData = createAsyncThunk(
    'unsecuredloanreport/fetchUnsecuredLoanReportData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await unsecuredLoanAPI.getUnsecuredLoanReportData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Unsecured Loan Report');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    unsecuredLoans: [],
    loanYears: [],
    loanMonths: [],
    loanBanks: [],
    unsecuredLoanReportData: [],

    // Loading states for each API
    loading: {
        unsecuredLoans: false,
        loanYears: false,
        loanMonths: false,
        loanBanks: false,
        unsecuredLoanReportData: false,
    },

    // Error states for each API
    errors: {
        unsecuredLoans: null,
        loanYears: null,
        loanMonths: null,
        loanBanks: null,
        unsecuredLoanReportData: null,
    },

    // UI State
    filters: {
        roleId: '',
        loanNo: '',
        year: '',
        month: '',
        bankId: ''
    }
};

// Unsecured Loan Report Slice
// ============================
const unsecuredLoanReportSlice = createSlice({
    name: 'unsecuredloanreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                roleId: '',
                loanNo: '',
                year: '',
                month: '',
                bankId: ''
            };
        },
        
        // Action to reset unsecured loan report data
        resetUnsecuredLoanReportData: (state) => {
            state.unsecuredLoanReportData = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset dependent dropdowns when parent changes
        resetLoanYears: (state) => {
            state.loanYears = [];
            state.loanMonths = [];
            state.filters.year = '';
            state.filters.month = '';
        },

        resetLoanMonths: (state) => {
            state.loanMonths = [];
            state.filters.month = '';
        },

        resetLoanBanks: (state) => {
            state.loanBanks = [];
            state.filters.bankId = '';
        },

        // Action to clear all data (for page refresh/reset)
        clearAllData: (state) => {
            state.unsecuredLoanReportData = [];
            state.loanYears = [];
            state.loanMonths = [];
            state.loanBanks = [];
        }
    },
    extraReducers: (builder) => {
        // 1. All Unsecured Loans
        builder
            .addCase(fetchAllUnsecuredLoans.pending, (state) => {
                state.loading.unsecuredLoans = true;
                state.errors.unsecuredLoans = null;
            })
            .addCase(fetchAllUnsecuredLoans.fulfilled, (state, action) => {
                state.loading.unsecuredLoans = false;
                state.unsecuredLoans = action.payload;
            })
            .addCase(fetchAllUnsecuredLoans.rejected, (state, action) => {
                state.loading.unsecuredLoans = false;
                state.errors.unsecuredLoans = action.payload;
            })

        // 2. Loan Years
        builder
            .addCase(fetchUnsecuredLoanYears.pending, (state) => {
                state.loading.loanYears = true;
                state.errors.loanYears = null;
            })
            .addCase(fetchUnsecuredLoanYears.fulfilled, (state, action) => {
                state.loading.loanYears = false;
                state.loanYears = action.payload;
            })
            .addCase(fetchUnsecuredLoanYears.rejected, (state, action) => {
                state.loading.loanYears = false;
                state.errors.loanYears = action.payload;
            })

        // 3. Loan Months
        builder
            .addCase(fetchUnsecuredLoanMonths.pending, (state) => {
                state.loading.loanMonths = true;
                state.errors.loanMonths = null;
            })
            .addCase(fetchUnsecuredLoanMonths.fulfilled, (state, action) => {
                state.loading.loanMonths = false;
                state.loanMonths = action.payload;
            })
            .addCase(fetchUnsecuredLoanMonths.rejected, (state, action) => {
                state.loading.loanMonths = false;
                state.errors.loanMonths = action.payload;
            })

        // 4. Loan Banks
        builder
            .addCase(fetchUnsecuredLoanBanks.pending, (state) => {
                state.loading.loanBanks = true;
                state.errors.loanBanks = null;
            })
            .addCase(fetchUnsecuredLoanBanks.fulfilled, (state, action) => {
                state.loading.loanBanks = false;
                state.loanBanks = action.payload;
            })
            .addCase(fetchUnsecuredLoanBanks.rejected, (state, action) => {
                state.loading.loanBanks = false;
                state.errors.loanBanks = action.payload;
            })

        // 5. Unsecured Loan Report Data
        builder
            .addCase(fetchUnsecuredLoanReportData.pending, (state) => {
                state.loading.unsecuredLoanReportData = true;
                state.errors.unsecuredLoanReportData = null;
            })
            .addCase(fetchUnsecuredLoanReportData.fulfilled, (state, action) => {
                state.loading.unsecuredLoanReportData = false;
                state.unsecuredLoanReportData = action.payload;
            })
            .addCase(fetchUnsecuredLoanReportData.rejected, (state, action) => {
                state.loading.unsecuredLoanReportData = false;
                state.errors.unsecuredLoanReportData = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetUnsecuredLoanReportData, 
    clearError, 
    resetLoanYears,
    resetLoanMonths,
    resetLoanBanks,
    clearAllData 
} = unsecuredLoanReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectUnsecuredLoans = (state) => state.unsecuredloanreport.unsecuredLoans;
export const selectLoanYears = (state) => state.unsecuredloanreport.loanYears;
export const selectLoanMonths = (state) => state.unsecuredloanreport.loanMonths;
export const selectLoanBanks = (state) => state.unsecuredloanreport.loanBanks;
export const selectUnsecuredLoanReportData = (state) => state.unsecuredloanreport.unsecuredLoanReportData;

// Loading selectors
export const selectLoading = (state) => state.unsecuredloanreport.loading;
export const selectUnsecuredLoansLoading = (state) => state.unsecuredloanreport.loading.unsecuredLoans;
export const selectLoanYearsLoading = (state) => state.unsecuredloanreport.loading.loanYears;
export const selectLoanMonthsLoading = (state) => state.unsecuredloanreport.loading.loanMonths;
export const selectLoanBanksLoading = (state) => state.unsecuredloanreport.loading.loanBanks;
export const selectUnsecuredLoanReportDataLoading = (state) => state.unsecuredloanreport.loading.unsecuredLoanReportData;

// Error selectors
export const selectErrors = (state) => state.unsecuredloanreport.errors;
export const selectUnsecuredLoansError = (state) => state.unsecuredloanreport.errors.unsecuredLoans;
export const selectLoanYearsError = (state) => state.unsecuredloanreport.errors.loanYears;
export const selectLoanMonthsError = (state) => state.unsecuredloanreport.errors.loanMonths;
export const selectLoanBanksError = (state) => state.unsecuredloanreport.errors.loanBanks;
export const selectUnsecuredLoanReportDataError = (state) => state.unsecuredloanreport.errors.unsecuredLoanReportData;

// Filter selectors
export const selectFilters = (state) => state.unsecuredloanreport.filters;
export const selectSelectedRoleId = (state) => state.unsecuredloanreport.filters.roleId;
export const selectSelectedLoanNo = (state) => state.unsecuredloanreport.filters.loanNo;
export const selectSelectedYear = (state) => state.unsecuredloanreport.filters.year;
export const selectSelectedMonth = (state) => state.unsecuredloanreport.filters.month;
export const selectSelectedBankId = (state) => state.unsecuredloanreport.filters.bankId;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.unsecuredloanreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.unsecuredloanreport.errors).some(error => error !== null);

// Export reducer
export default unsecuredLoanReportSlice.reducer;