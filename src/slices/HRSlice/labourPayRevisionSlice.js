import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as labourPayRevisionAPI from '../../api/HRAPI/labourPayrevisionAPI';

// Async Thunks for 3 Labour Pay Revision APIs
// ============================================

// 1. Fetch Verify Labour Pay Revision Inbox by Role ID
export const fetchVerifyLBPayRevision = createAsyncThunk(
    'labourpayrevision/fetchVerifyLBPayRevision',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await labourPayRevisionAPI.getVerifyLBPayRevision({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify Labour Pay Revision Inbox');
        }
    }
);

// 2. Fetch Labour Pay Revision Details by Transaction Reference Number
export const fetchLBPayRevisionbyRefno = createAsyncThunk(
    'labourpayrevision/fetchLBPayRevisionbyRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Labour Pay Revision Details for TransactionRefno:', transactionRefno);
            const response = await labourPayRevisionAPI.getLBPayRevisionbyRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Labour Pay Revision Details');
        }
    }
);

// 3. Approve Labour Pay Revision
export const approveLBPayRevision = createAsyncThunk(
    'labourpayrevision/approveLBPayRevision',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving Labour Pay Revision with data:', approvalData);
            const response = await labourPayRevisionAPI.approveLBPayRevision(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Labour Pay Revision');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyLBPayRevisionInbox: [],
    payRevisionDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyLBPayRevision: false,
        payRevisionDetails: false,
        approveLBPayRevision: false,
    },

    // Error states for each API
    errors: {
        verifyLBPayRevision: null,
        payRevisionDetails: null,
        approveLBPayRevision: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
};

// Labour Pay Revision Slice
// ==========================
const labourPayRevisionSlice = createSlice({
    name: 'labourpayrevision',
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
        
        // Action to reset pay revision details
        resetPayRevisionDetails: (state) => {
            state.payRevisionDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all labour pay revision data
        resetLabourPayRevisionData: (state) => {
            state.verifyLBPayRevisionInbox = [];
            state.payRevisionDetails = null;
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
        // 1. Verify Labour Pay Revision Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyLBPayRevision.pending, (state) => {
                state.loading.verifyLBPayRevision = true;
                state.errors.verifyLBPayRevision = null;
            })
            .addCase(fetchVerifyLBPayRevision.fulfilled, (state, action) => {
                state.loading.verifyLBPayRevision = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyLBPayRevisionInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyLBPayRevision.rejected, (state, action) => {
                state.loading.verifyLBPayRevision = false;
                state.errors.verifyLBPayRevision = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyLBPayRevisionInbox = [];
            })

        // 2. Labour Pay Revision Details by Transaction Reference Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchLBPayRevisionbyRefno.pending, (state) => {
                state.loading.payRevisionDetails = true;
                state.errors.payRevisionDetails = null;
            })
            .addCase(fetchLBPayRevisionbyRefno.fulfilled, (state, action) => {
                state.loading.payRevisionDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.payRevisionDetails = action.payload?.Data || null;
            })
            .addCase(fetchLBPayRevisionbyRefno.rejected, (state, action) => {
                state.loading.payRevisionDetails = false;
                state.errors.payRevisionDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.payRevisionDetails = null;
            })

        // 3. Approve Labour Pay Revision
        builder
            .addCase(approveLBPayRevision.pending, (state) => {
                state.loading.approveLBPayRevision = true;
                state.errors.approveLBPayRevision = null;
            })
            .addCase(approveLBPayRevision.fulfilled, (state, action) => {
                state.loading.approveLBPayRevision = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveLBPayRevision.rejected, (state, action) => {
                state.loading.approveLBPayRevision = false;
                state.errors.approveLBPayRevision = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    resetPayRevisionDetails,
    clearError,
    resetLabourPayRevisionData,
    clearApprovalResult
} = labourPayRevisionSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyLBPayRevisionInbox = (state) => state.labourpayrevision.verifyLBPayRevisionInbox;
export const selectPayRevisionDetails = (state) => state.labourpayrevision.payRevisionDetails;
export const selectApprovalResult = (state) => state.labourpayrevision.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyLBPayRevisionInboxArray = (state) => {
    const inbox = state.labourpayrevision.verifyLBPayRevisionInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.labourpayrevision.loading;
export const selectVerifyLBPayRevisionLoading = (state) => state.labourpayrevision.loading.verifyLBPayRevision;
export const selectPayRevisionDetailsLoading = (state) => state.labourpayrevision.loading.payRevisionDetails;
export const selectApproveLBPayRevisionLoading = (state) => state.labourpayrevision.loading.approveLBPayRevision;

// Error selectors
export const selectErrors = (state) => state.labourpayrevision.errors;
export const selectVerifyLBPayRevisionError = (state) => state.labourpayrevision.errors.verifyLBPayRevision;
export const selectPayRevisionDetailsError = (state) => state.labourpayrevision.errors.payRevisionDetails;
export const selectApproveLBPayRevisionError = (state) => state.labourpayrevision.errors.approveLBPayRevision;

// UI State selectors
export const selectSelectedRoleId = (state) => state.labourpayrevision.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => state.labourpayrevision.selectedTransactionRefno;
export const selectApprovalStatus = (state) => state.labourpayrevision.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.labourpayrevision.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.labourpayrevision.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectLabourPayRevisionSummary = (state) => {
    const inboxArray = Array.isArray(state.labourpayrevision.verifyLBPayRevisionInbox) 
        ? state.labourpayrevision.verifyLBPayRevisionInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedRevision: state.labourpayrevision.payRevisionDetails,
        approvalStatus: state.labourpayrevision.approvalStatus,
        isProcessing: state.labourpayrevision.loading.approveLBPayRevision,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.labourpayrevision.loading.verifyLBPayRevision
    };
};

// Pay Revision Details specific selector
export const selectPayRevisionDetailsSummary = (state) => {
    return {
        details: state.labourpayrevision.payRevisionDetails,
        isLoading: state.labourpayrevision.loading.payRevisionDetails,
        error: state.labourpayrevision.errors.payRevisionDetails,
        hasDetails: state.labourpayrevision.payRevisionDetails !== null,
        isEmpty: state.labourpayrevision.payRevisionDetails === null 
            && !state.labourpayrevision.loading.payRevisionDetails
    };
};

// Export reducer
export default labourPayRevisionSlice.reducer;