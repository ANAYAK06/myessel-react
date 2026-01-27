import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as accountsStatusAPI from '../../api/BankAPI/chequeNumbersAPI';

// Async Thunk for Cheque Numbers API
// ===================================

// Fetch Cheque Numbers by Bank Name
export const fetchChequeNumbers = createAsyncThunk(
    'chequeNumbers/fetchChequeNumbers',
    async (bankname, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Cheque Numbers for Bank:', bankname);
            const response = await accountsStatusAPI.getChequeNos({ bankname });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Cheque Numbers');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from API
    chequeNumbers: [],

    // Loading state
    loading: false,

    // Error state
    error: null,

    // UI State
    selectedBankName: null,
    selectedChequeNo: null,
    lastFetchedAt: null,
};

// Cheque Numbers Slice
// ====================
const chequeNumbersSlice = createSlice({
    name: 'chequeNumbers',
    initialState,
    reducers: {
        // Action to set selected bank name
        setSelectedBankName: (state, action) => {
            state.selectedBankName = action.payload;
        },

        // Action to set selected cheque number
        setSelectedChequeNo: (state, action) => {
            state.selectedChequeNo = action.payload;
        },

        // Action to clear selected bank name
        clearSelectedBankName: (state) => {
            state.selectedBankName = null;
        },

        // Action to clear selected cheque number
        clearSelectedChequeNo: (state) => {
            state.selectedChequeNo = null;
        },

        // Action to clear cheque numbers
        clearChequeNumbers: (state) => {
            state.chequeNumbers = [];
            state.lastFetchedAt = null;
        },

        // Action to clear error
        clearError: (state) => {
            state.error = null;
        },

        // Action to reset all cheque numbers data
        resetChequeNumbersData: (state) => {
            state.chequeNumbers = [];
            state.loading = false;
            state.error = null;
            state.selectedBankName = null;
            state.selectedChequeNo = null;
            state.lastFetchedAt = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Cheque Numbers - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchChequeNumbers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChequeNumbers.fulfilled, (state, action) => {
                state.loading = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.chequeNumbers = action.payload?.Data || [];
                state.lastFetchedAt = new Date().toISOString();
            })
            .addCase(fetchChequeNumbers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.chequeNumbers = [];
            });
    },
});

// Export actions
export const { 
    setSelectedBankName,
    setSelectedChequeNo,
    clearSelectedBankName,
    clearSelectedChequeNo,
    clearChequeNumbers,
    clearError,
    resetChequeNumbersData,
} = chequeNumbersSlice.actions;

// Selectors
// =========

// Data selectors
export const selectChequeNumbers = (state) => 
    state.chequeNumbers.chequeNumbers;

export const selectSelectedBankName = (state) => 
    state.chequeNumbers.selectedBankName;

export const selectSelectedChequeNo = (state) => 
    state.chequeNumbers.selectedChequeNo;

export const selectLastFetchedAt = (state) => 
    state.chequeNumbers.lastFetchedAt;

// 🔧 Helper selector to get array safely - PREVENTS FILTER ERRORS
export const selectChequeNumbersArray = (state) => {
    const chequeNos = state.chequeNumbers.chequeNumbers;
    return Array.isArray(chequeNos) ? chequeNos : [];
};

// Loading selector
export const selectChequeNumbersLoading = (state) => 
    state.chequeNumbers.loading;

// Error selector
export const selectChequeNumbersError = (state) => 
    state.chequeNumbers.error;

// Combined selectors
export const selectChequeNumbersSummary = (state) => {
    const chequeNosArray = Array.isArray(state.chequeNumbers.chequeNumbers) 
        ? state.chequeNumbers.chequeNumbers 
        : [];
    
    return {
        chequeNumbers: chequeNosArray,
        totalCheques: chequeNosArray.length,
        selectedBankName: state.chequeNumbers.selectedBankName,
        selectedChequeNo: state.chequeNumbers.selectedChequeNo,
        isLoading: state.chequeNumbers.loading,
        error: state.chequeNumbers.error,
        hasData: chequeNosArray.length > 0,
        isEmpty: chequeNosArray.length === 0 && !state.chequeNumbers.loading,
        lastFetchedAt: state.chequeNumbers.lastFetchedAt
    };
};

// Selector to get cheque number details by cheque number
export const selectChequeNumberDetails = (state) => {
    const chequeNosArray = Array.isArray(state.chequeNumbers.chequeNumbers) 
        ? state.chequeNumbers.chequeNumbers 
        : [];
    
    const selectedChequeNo = state.chequeNumbers.selectedChequeNo;
    
    if (!selectedChequeNo) return null;
    
    return chequeNosArray.find(cheque => cheque.ChequeNo === selectedChequeNo) || null;
};

// Selector to get available (unused) cheque numbers
export const selectAvailableChequeNumbers = (state) => {
    const chequeNosArray = Array.isArray(state.chequeNumbers.chequeNumbers) 
        ? state.chequeNumbers.chequeNumbers 
        : [];
    
    // Filter for available/unused cheques (adjust the property name based on your API response)
    return chequeNosArray.filter(cheque => cheque.IsUsed === false || cheque.Status === 'Available');
};

// Selector to get used cheque numbers
export const selectUsedChequeNumbers = (state) => {
    const chequeNosArray = Array.isArray(state.chequeNumbers.chequeNumbers) 
        ? state.chequeNumbers.chequeNumbers 
        : [];
    
    // Filter for used cheques (adjust the property name based on your API response)
    return chequeNosArray.filter(cheque => cheque.IsUsed === true || cheque.Status === 'Used');
};

// Selector for fetch operation status
export const selectFetchOperationStatus = (state) => {
    return {
        isLoading: state.chequeNumbers.loading,
        error: state.chequeNumbers.error,
        hasData: state.chequeNumbers.chequeNumbers.length > 0,
        isFailed: state.chequeNumbers.error !== null,
        lastFetchedAt: state.chequeNumbers.lastFetchedAt
    };
};

// Export reducer
export default chequeNumbersSlice.reducer;