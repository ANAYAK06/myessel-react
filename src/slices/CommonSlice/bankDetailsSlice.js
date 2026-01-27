import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as accountsStatusAPI from '../../api/commonAPI/getStatusAPI';

// Async Thunk for Bank Details with Available Balance API
// ========================================================

// Fetch Bank Details with Available Balance
export const fetchBankDetailsWithAvailableBalance = createAsyncThunk(
    'bankDetails/fetchBankDetailsWithAvailableBalance',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Bank Details with Available Balance');
            const response = await accountsStatusAPI.getBankDetailsWithAvailableBalance();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Bank Details with Available Balance');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from API
    bankDetails: [],

    // Loading state
    loading: false,

    // Error state
    error: null,

    // UI State
    selectedBankId: null,
    lastFetchedAt: null,
};

// Bank Details Slice
// ==================
const bankDetailsSlice = createSlice({
    name: 'bankDetails',
    initialState,
    reducers: {
        // Action to set selected bank ID
        setSelectedBankId: (state, action) => {
            state.selectedBankId = action.payload;
        },

        // Action to clear selected bank ID
        clearSelectedBankId: (state) => {
            state.selectedBankId = null;
        },

        // Action to clear bank details
        clearBankDetails: (state) => {
            state.bankDetails = [];
            state.lastFetchedAt = null;
        },

        // Action to clear error
        clearError: (state) => {
            state.error = null;
        },

        // Action to reset all bank details data
        resetBankDetailsData: (state) => {
            state.bankDetails = [];
            state.loading = false;
            state.error = null;
            state.selectedBankId = null;
            state.lastFetchedAt = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Bank Details with Available Balance - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchBankDetailsWithAvailableBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankDetailsWithAvailableBalance.fulfilled, (state, action) => {
                state.loading = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.bankDetails = action.payload?.Data || [];
                state.lastFetchedAt = new Date().toISOString();
            })
            .addCase(fetchBankDetailsWithAvailableBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.bankDetails = [];
            });
    },
});

// Export actions
export const { 
    setSelectedBankId,
    clearSelectedBankId,
    clearBankDetails,
    clearError,
    resetBankDetailsData,
} = bankDetailsSlice.actions;

// Selectors
// =========

// Data selectors
export const selectBankDetails = (state) => 
    state.bankDetails.bankDetails;

export const selectSelectedBankId = (state) => 
    state.bankDetails.selectedBankId;

export const selectLastFetchedAt = (state) => 
    state.bankDetails.lastFetchedAt;

// 🔧 Helper selector to get array safely - PREVENTS FILTER ERRORS
export const selectBankDetailsArray = (state) => {
    const details = state.bankDetails.bankDetails;
    return Array.isArray(details) ? details : [];
};

// Loading selector
export const selectBankDetailsLoading = (state) => 
    state.bankDetails.loading;

// Error selector
export const selectBankDetailsError = (state) => 
    state.bankDetails.error;

// Combined selectors
export const selectBankDetailsSummary = (state) => {
    const detailsArray = Array.isArray(state.bankDetails.bankDetails) 
        ? state.bankDetails.bankDetails 
        : [];
    
    return {
        bankDetails: detailsArray,
        totalBanks: detailsArray.length,
        selectedBankId: state.bankDetails.selectedBankId,
        isLoading: state.bankDetails.loading,
        error: state.bankDetails.error,
        hasData: detailsArray.length > 0,
        isEmpty: detailsArray.length === 0 && !state.bankDetails.loading,
        lastFetchedAt: state.bankDetails.lastFetchedAt
    };
};

// Selector to get selected bank details
export const selectSelectedBankDetails = (state) => {
    const detailsArray = Array.isArray(state.bankDetails.bankDetails) 
        ? state.bankDetails.bankDetails 
        : [];
    
    const selectedBankId = state.bankDetails.selectedBankId;
    
    if (!selectedBankId) return null;
    
    return detailsArray.find(bank => bank.BankId === selectedBankId) || null;
};

// Selector to get banks with positive available balance
export const selectBanksWithAvailableBalance = (state) => {
    const detailsArray = Array.isArray(state.bankDetails.bankDetails) 
        ? state.bankDetails.bankDetails 
        : [];
    
    return detailsArray.filter(bank => (bank.AvailableBalance || 0) > 0);
};

// Selector to get total available balance across all banks
export const selectTotalAvailableBalance = (state) => {
    const detailsArray = Array.isArray(state.bankDetails.bankDetails) 
        ? state.bankDetails.bankDetails 
        : [];
    
    return detailsArray.reduce((total, bank) => {
        return total + (bank.AvailableBalance || 0);
    }, 0);
};

// Selector for fetch operation status
export const selectFetchOperationStatus = (state) => {
    return {
        isLoading: state.bankDetails.loading,
        error: state.bankDetails.error,
        hasData: state.bankDetails.bankDetails.length > 0,
        isFailed: state.bankDetails.error !== null,
        lastFetchedAt: state.bankDetails.lastFetchedAt
    };
};

// Export reducer
export default bankDetailsSlice.reducer;