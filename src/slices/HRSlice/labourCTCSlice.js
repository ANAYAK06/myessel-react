import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as labourCTCAPI from '../../api/HRAPI/labourCTCVerificationAPI';

// Async Thunks for 3 Labour CTC APIs
// ===================================

// 1. Fetch Verify New Labour CTC Inbox by Role ID
export const fetchVerifyNewLabourCTC = createAsyncThunk(
    'labourctc/fetchVerifyNewLabourCTC',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await labourCTCAPI.getVerifyNewLabourCTC({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify New Labour CTC Inbox');
        }
    }
);

// 2. Fetch New Labour CTC Details by Transaction Reference Number
export const fetchNewLabourCTCbyRefno = createAsyncThunk(
    'labourctc/fetchNewLabourCTCbyRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching New Labour CTC Details for TransactionRefno:', transactionRefno);
            const response = await labourCTCAPI.getNewLabourCTCbyRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch New Labour CTC Details');
        }
    }
);

// 3. Approve New Labour CTC
export const approveNewLabourCTC = createAsyncThunk(
    'labourctc/approveNewLabourCTC',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving New Labour CTC with data:', approvalData);
            const response = await labourCTCAPI.approveNewLabourCTC(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve New Labour CTC');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyNewLabourCTCInbox: [],
    labourCTCDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyNewLabourCTC: false,
        labourCTCDetails: false,
        approveNewLabourCTC: false,
    },

    // Error states for each API
    errors: {
        verifyNewLabourCTC: null,
        labourCTCDetails: null,
        approveNewLabourCTC: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
};

// Labour CTC Slice
// ================
const labourCTCSlice = createSlice({
    name: 'labourctc',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected transaction reference number
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset Labour CTC details
        resetLabourCTCDetails: (state) => {
            state.labourCTCDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all labour CTC data
        resetLabourCTCData: (state) => {
            state.verifyNewLabourCTCInbox = [];
            state.labourCTCDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verify New Labour CTC Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyNewLabourCTC.pending, (state) => {
                state.loading.verifyNewLabourCTC = true;
                state.errors.verifyNewLabourCTC = null;
            })
            .addCase(fetchVerifyNewLabourCTC.fulfilled, (state, action) => {
                state.loading.verifyNewLabourCTC = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyNewLabourCTCInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyNewLabourCTC.rejected, (state, action) => {
                state.loading.verifyNewLabourCTC = false;
                state.errors.verifyNewLabourCTC = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyNewLabourCTCInbox = [];
            })

        // 2. New Labour CTC Details by Transaction Reference Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchNewLabourCTCbyRefno.pending, (state) => {
                state.loading.labourCTCDetails = true;
                state.errors.labourCTCDetails = null;
            })
            .addCase(fetchNewLabourCTCbyRefno.fulfilled, (state, action) => {
                state.loading.labourCTCDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.labourCTCDetails = action.payload?.Data || null;
            })
            .addCase(fetchNewLabourCTCbyRefno.rejected, (state, action) => {
                state.loading.labourCTCDetails = false;
                state.errors.labourCTCDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.labourCTCDetails = null;
            })

        // 3. Approve New Labour CTC
        builder
            .addCase(approveNewLabourCTC.pending, (state) => {
                state.loading.approveNewLabourCTC = true;
                state.errors.approveNewLabourCTC = null;
            })
            .addCase(approveNewLabourCTC.fulfilled, (state, action) => {
                state.loading.approveNewLabourCTC = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveNewLabourCTC.rejected, (state, action) => {
                state.loading.approveNewLabourCTC = false;
                state.errors.approveNewLabourCTC = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    resetLabourCTCDetails,
    clearError,
    resetLabourCTCData,
    clearApprovalResult
} = labourCTCSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyNewLabourCTCInbox = (state) => state.labourctc.verifyNewLabourCTCInbox;
export const selectLabourCTCDetails = (state) => state.labourctc.labourCTCDetails;
export const selectApprovalResult = (state) => state.labourctc.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyNewLabourCTCInboxArray = (state) => {
    const inbox = state.labourctc.verifyNewLabourCTCInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.labourctc.loading;
export const selectVerifyNewLabourCTCLoading = (state) => state.labourctc.loading.verifyNewLabourCTC;
export const selectLabourCTCDetailsLoading = (state) => state.labourctc.loading.labourCTCDetails;
export const selectApproveNewLabourCTCLoading = (state) => state.labourctc.loading.approveNewLabourCTC;

// Error selectors
export const selectErrors = (state) => state.labourctc.errors;
export const selectVerifyNewLabourCTCError = (state) => state.labourctc.errors.verifyNewLabourCTC;
export const selectLabourCTCDetailsError = (state) => state.labourctc.errors.labourCTCDetails;
export const selectApproveNewLabourCTCError = (state) => state.labourctc.errors.approveNewLabourCTC;

// UI State selectors
export const selectSelectedRoleId = (state) => state.labourctc.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => state.labourctc.selectedTransactionRefno;
export const selectApprovalStatus = (state) => state.labourctc.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.labourctc.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.labourctc.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectLabourCTCSummary = (state) => {
    const inboxArray = Array.isArray(state.labourctc.verifyNewLabourCTCInbox) 
        ? state.labourctc.verifyNewLabourCTCInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedCTC: state.labourctc.labourCTCDetails,
        approvalStatus: state.labourctc.approvalStatus,
        isProcessing: state.labourctc.loading.approveNewLabourCTC,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.labourctc.loading.verifyNewLabourCTC
    };
};

// Labour CTC Details specific selector
export const selectLabourCTCDetailsSummary = (state) => {
    return {
        details: state.labourctc.labourCTCDetails,
        isLoading: state.labourctc.loading.labourCTCDetails,
        error: state.labourctc.errors.labourCTCDetails,
        hasDetails: state.labourctc.labourCTCDetails !== null,
        isEmpty: state.labourctc.labourCTCDetails === null 
            && !state.labourctc.loading.labourCTCDetails
    };
};

// Export reducer
export default labourCTCSlice.reducer;