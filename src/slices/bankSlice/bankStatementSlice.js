import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bankAPI from '../../api/BankAPI/bankStatementAPI';

// Async Thunks for 4 Bank Statement APIs
// ======================================

// 1. Fetch All Bank Details
export const fetchAllBankDetails = createAsyncThunk(
    'bankstatement/fetchAllBankDetails',
    async (_, { rejectWithValue }) => {
        try {
            const response = await bankAPI.getAllBankDetails();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch All Bank Details');
        }
    }
);

// 2. Fetch Transaction Types
export const fetchTransactionTypes = createAsyncThunk(
    'bankstatement/fetchTransactionTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await bankAPI.getTransactionTypes();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Transaction Types');
        }
    }
);

// 3. Fetch Bank Statement Grid
export const fetchBankStatementGrid = createAsyncThunk(
    'bankstatement/fetchBankStatementGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await bankAPI.viewBankStatementGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Bank Statement Grid');
        }
    }
);

// 4. Fetch Bank Transaction Details
export const fetchBankTranDetails = createAsyncThunk(
    'bankstatement/fetchBankTranDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await bankAPI.getBankTranDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Bank Transaction Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    allBankDetails: [],
    transactionTypes: [],
    bankStatementGrid: [],
    bankTranDetails: null,

    // Loading states for each API
    loading: {
        allBankDetails: false,
        transactionTypes: false,
        bankStatementGrid: false,
        bankTranDetails: false,
    },

    // Error states for each API
    errors: {
        allBankDetails: null,
        transactionTypes: null,
        bankStatementGrid: null,
        bankTranDetails: null,
    },

    // UI State
    filters: {
        bankVal: '',
        fromDate: '',
        toDate: '',
        tranType: ''
    }
};

// Bank Statement Slice
// ===================
const bankStatementSlice = createSlice({
    name: 'bankstatement',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                bankVal: '',
                fromDate: '',
                toDate: '',
                tranType: ''
            };
        },
        
        // Action to reset bank statement data
        resetBankStatementData: (state) => {
            state.bankStatementGrid = [];
            state.bankTranDetails = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected bank data
        resetSelectedBankData: (state) => {
            state.bankStatementGrid = [];
            state.bankTranDetails = null;
        }
    },
    extraReducers: (builder) => {
        // 1. All Bank Details
        builder
            .addCase(fetchAllBankDetails.pending, (state) => {
                state.loading.allBankDetails = true;
                state.errors.allBankDetails = null;
            })
            .addCase(fetchAllBankDetails.fulfilled, (state, action) => {
                state.loading.allBankDetails = false;
                state.allBankDetails = action.payload;
            })
            .addCase(fetchAllBankDetails.rejected, (state, action) => {
                state.loading.allBankDetails = false;
                state.errors.allBankDetails = action.payload;
            })

        // 2. Transaction Types
        builder
            .addCase(fetchTransactionTypes.pending, (state) => {
                state.loading.transactionTypes = true;
                state.errors.transactionTypes = null;
            })
            .addCase(fetchTransactionTypes.fulfilled, (state, action) => {
                state.loading.transactionTypes = false;
                state.transactionTypes = action.payload;
            })
            .addCase(fetchTransactionTypes.rejected, (state, action) => {
                state.loading.transactionTypes = false;
                state.errors.transactionTypes = action.payload;
            })

        // 3. Bank Statement Grid
        builder
            .addCase(fetchBankStatementGrid.pending, (state) => {
                state.loading.bankStatementGrid = true;
                state.errors.bankStatementGrid = null;
            })
            .addCase(fetchBankStatementGrid.fulfilled, (state, action) => {
                state.loading.bankStatementGrid = false;
                state.bankStatementGrid = action.payload;
            })
            .addCase(fetchBankStatementGrid.rejected, (state, action) => {
                state.loading.bankStatementGrid = false;
                state.errors.bankStatementGrid = action.payload;
            })

        // 4. Bank Transaction Details
        builder
            .addCase(fetchBankTranDetails.pending, (state) => {
                state.loading.bankTranDetails = true;
                state.errors.bankTranDetails = null;
            })
            .addCase(fetchBankTranDetails.fulfilled, (state, action) => {
                state.loading.bankTranDetails = false;
                state.bankTranDetails = action.payload;
            })
            .addCase(fetchBankTranDetails.rejected, (state, action) => {
                state.loading.bankTranDetails = false;
                state.errors.bankTranDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetBankStatementData, 
    clearError, 
    resetSelectedBankData 
} = bankStatementSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAllBankDetails = (state) => state.bankstatement.allBankDetails;
export const selectTransactionTypes = (state) => state.bankstatement.transactionTypes;
export const selectBankStatementGrid = (state) => state.bankstatement.bankStatementGrid;
export const selectBankTranDetails = (state) => state.bankstatement.bankTranDetails;

// Loading selectors
export const selectLoading = (state) => state.bankstatement.loading;
export const selectAllBankDetailsLoading = (state) => state.bankstatement.loading.allBankDetails;
export const selectTransactionTypesLoading = (state) => state.bankstatement.loading.transactionTypes;
export const selectBankStatementGridLoading = (state) => state.bankstatement.loading.bankStatementGrid;
export const selectBankTranDetailsLoading = (state) => state.bankstatement.loading.bankTranDetails;

// Error selectors
export const selectErrors = (state) => state.bankstatement.errors;
export const selectAllBankDetailsError = (state) => state.bankstatement.errors.allBankDetails;
export const selectTransactionTypesError = (state) => state.bankstatement.errors.transactionTypes;
export const selectBankStatementGridError = (state) => state.bankstatement.errors.bankStatementGrid;
export const selectBankTranDetailsError = (state) => state.bankstatement.errors.bankTranDetails;

// Filter selectors
export const selectFilters = (state) => state.bankstatement.filters;
export const selectSelectedBank = (state) => state.bankstatement.filters.bankVal;
export const selectSelectedFromDate = (state) => state.bankstatement.filters.fromDate;
export const selectSelectedToDate = (state) => state.bankstatement.filters.toDate;
export const selectSelectedTranType = (state) => state.bankstatement.filters.tranType;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.bankstatement.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.bankstatement.errors).some(error => error !== null);

// Export reducer
export default bankStatementSlice.reducer;