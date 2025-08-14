import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as purchaseHelperAPI from '../../api/SupplierPOAPI/supplierPOHelperAPI';

// Async Thunks for Purchase Helper APIs
// =====================================

// 1. Fetch Remarks by Transaction Number and MO ID
export const fetchRemarks = createAsyncThunk(
    'purchaseHelper/fetchRemarks',
    async ({ trno, moid }, { rejectWithValue }) => {
        try {
            const response = await purchaseHelperAPI.getRemarks(trno, moid);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Remarks');
        }
    }
);

// 2. Fetch Previous PO Details by Item Code
export const fetchPreviousPODetails = createAsyncThunk(
    'purchaseHelper/fetchPreviousPODetails',
    async ({ itemcode }, { rejectWithValue }) => {
        try {
            const response = await purchaseHelperAPI.getPreviousPODetails(itemcode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Previous PO Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    remarks: [],
    previousPODetails: [],

    // Loading states for each API
    loading: {
        remarks: false,
        previousPODetails: false,
    },

    // Error states for each API
    errors: {
        remarks: null,
        previousPODetails: null,
    },

    // UI State
    selectedTrno: null,
    selectedMOID: null,
    selectedItemCode: null,
};

// Purchase Helper Slice
// =====================
const purchaseHelperSlice = createSlice({
    name: 'purchaseHelper',
    initialState,
    reducers: {
        // Action to set selected transaction number
        setSelectedTrno: (state, action) => {
            state.selectedTrno = action.payload;
        },
        
        // Action to set selected MO ID
        setSelectedMOID: (state, action) => {
            state.selectedMOID = action.payload;
        },
        
        // Action to set selected item code
        setSelectedItemCode: (state, action) => {
            state.selectedItemCode = action.payload;
        },
        
        // Action to reset remarks data
        resetRemarksData: (state) => {
            state.remarks = [];
        },

        // Action to reset previous PO details data
        resetPreviousPODetailsData: (state) => {
            state.previousPODetails = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all purchase helper data
        resetPurchaseHelperState: (state) => {
            state.remarks = [];
            state.previousPODetails = [];
            state.selectedTrno = null;
            state.selectedMOID = null;
            state.selectedItemCode = null;
        },
    },
    extraReducers: (builder) => {
        // 1. Remarks - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchRemarks.pending, (state) => {
                state.loading.remarks = true;
                state.errors.remarks = null;
            })
            .addCase(fetchRemarks.fulfilled, (state, action) => {
                state.loading.remarks = false;
                // Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.remarks = action.payload?.Data || [];
            })
            .addCase(fetchRemarks.rejected, (state, action) => {
                state.loading.remarks = false;
                state.errors.remarks = action.payload;
                // Reset to empty array on error to prevent filter issues
                state.remarks = [];
            })

        // 2. Previous PO Details - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchPreviousPODetails.pending, (state) => {
                state.loading.previousPODetails = true;
                state.errors.previousPODetails = null;
            })
            .addCase(fetchPreviousPODetails.fulfilled, (state, action) => {
                state.loading.previousPODetails = false;
                // Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.previousPODetails = action.payload?.Data || [];
            })
            .addCase(fetchPreviousPODetails.rejected, (state, action) => {
                state.loading.previousPODetails = false;
                state.errors.previousPODetails = action.payload;
                // Reset to empty array on error to prevent filter issues
                state.previousPODetails = [];
            });
    },
});

// Export actions
export const { 
    setSelectedTrno,
    setSelectedMOID,
    setSelectedItemCode,
    resetRemarksData,
    resetPreviousPODetailsData,
    clearError,
    resetPurchaseHelperState
} = purchaseHelperSlice.actions;

// Selectors
// =========

// Data selectors
export const selectRemarks = (state) => state.purchaseHelper.remarks;
export const selectPreviousPODetails = (state) => state.purchaseHelper.previousPODetails;

// Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectRemarksArray = (state) => {
    const remarks = state.purchaseHelper.remarks;
    return Array.isArray(remarks) ? remarks : [];
};

export const selectPreviousPODetailsArray = (state) => {
    const poDetails = state.purchaseHelper.previousPODetails;
    return Array.isArray(poDetails) ? poDetails : [];
};

// Loading selectors
export const selectLoading = (state) => state.purchaseHelper.loading;
export const selectRemarksLoading = (state) => state.purchaseHelper.loading.remarks;
export const selectPreviousPODetailsLoading = (state) => state.purchaseHelper.loading.previousPODetails;

// Error selectors
export const selectErrors = (state) => state.purchaseHelper.errors;
export const selectRemarksError = (state) => state.purchaseHelper.errors.remarks;
export const selectPreviousPODetailsError = (state) => state.purchaseHelper.errors.previousPODetails;

// UI State selectors
export const selectSelectedTrno = (state) => state.purchaseHelper.selectedTrno;
export const selectSelectedMOID = (state) => state.purchaseHelper.selectedMOID;
export const selectSelectedItemCode = (state) => state.purchaseHelper.selectedItemCode;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.purchaseHelper.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.purchaseHelper.errors).some(error => error !== null);

// Specific combined selectors with safe array handling
export const selectPurchaseHelperSummary = (state) => {
    const remarksArray = Array.isArray(state.purchaseHelper.remarks) ? state.purchaseHelper.remarks : [];
    const poDetailsArray = Array.isArray(state.purchaseHelper.previousPODetails) ? state.purchaseHelper.previousPODetails : [];
    
    return {
        totalRemarks: remarksArray.length,
        totalPODetails: poDetailsArray.length,
        hasRemarks: remarksArray.length > 0,
        hasPODetails: poDetailsArray.length > 0,
        isLoading: state.purchaseHelper.loading.remarks || state.purchaseHelper.loading.previousPODetails
    };
};

// Purchase Helper specific selectors
export const selectPurchaseHelperDetails = (state) => {
    const remarksArray = Array.isArray(state.purchaseHelper.remarks) ? state.purchaseHelper.remarks : [];
    const poDetailsArray = Array.isArray(state.purchaseHelper.previousPODetails) ? state.purchaseHelper.previousPODetails : [];
    
    return {
        remarks: remarksArray,
        previousPODetails: poDetailsArray,
        totalRemarks: remarksArray.length,
        totalPODetails: poDetailsArray.length,
        isRemarksLoading: state.purchaseHelper.loading.remarks,
        isPODetailsLoading: state.purchaseHelper.loading.previousPODetails,
        remarksError: state.purchaseHelper.errors.remarks,
        poDetailsError: state.purchaseHelper.errors.previousPODetails,
        hasRemarks: remarksArray.length > 0,
        hasPODetails: poDetailsArray.length > 0,
        isRemarksEmpty: remarksArray.length === 0 && !state.purchaseHelper.loading.remarks,
        isPODetailsEmpty: poDetailsArray.length === 0 && !state.purchaseHelper.loading.previousPODetails
    };
};

// Export reducer
export default purchaseHelperSlice.reducer;