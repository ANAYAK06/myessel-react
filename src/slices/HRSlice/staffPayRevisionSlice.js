import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffPayRevisionAPI from '../../api/HRAPI/staffPayRevisionAPI';

// Async Thunks for 3 Staff Pay Revision APIs
// ===========================================

// 1. Fetch Verify Staff Pay Revision Inbox by Role ID
export const fetchVerifyPayRevision = createAsyncThunk(
    'staffpayrevision/fetchVerifyPayRevision',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await staffPayRevisionAPI.getVerifyPayRevision({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify Staff Pay Revision Inbox');
        }
    }
);

// 2. Fetch Staff Pay Revision Details by Transaction Reference Number
export const fetchPayRevisionbyRefno = createAsyncThunk(
    'staffpayrevision/fetchPayRevisionbyRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Staff Pay Revision Details for TransactionRefno:', transactionRefno);
            const response = await staffPayRevisionAPI.getPayRevisionbyRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Staff Pay Revision Details');
        }
    }
);

// 3. Approve Staff Pay Revision
export const approvePayRevision = createAsyncThunk(
    'staffpayrevision/approvePayRevision',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving Staff Pay Revision with data:', approvalData);
            const response = await staffPayRevisionAPI.approvePayRevision(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Staff Pay Revision');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyPayRevisionInbox: [],
    payRevisionDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyPayRevision: false,
        payRevisionDetails: false,
        approvePayRevision: false,
    },

    // Error states for each API
    errors: {
        verifyPayRevision: null,
        payRevisionDetails: null,
        approvePayRevision: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
};

// Staff Pay Revision Slice
// =========================
const staffPayRevisionSlice = createSlice({
    name: 'staffpayrevision',
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

        // Action to reset all staff pay revision data
        resetStaffPayRevisionData: (state) => {
            state.verifyPayRevisionInbox = [];
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
        // 1. Verify Staff Pay Revision Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyPayRevision.pending, (state) => {
                state.loading.verifyPayRevision = true;
                state.errors.verifyPayRevision = null;
            })
            .addCase(fetchVerifyPayRevision.fulfilled, (state, action) => {
                state.loading.verifyPayRevision = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyPayRevisionInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyPayRevision.rejected, (state, action) => {
                state.loading.verifyPayRevision = false;
                state.errors.verifyPayRevision = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyPayRevisionInbox = [];
            })

        // 2. Staff Pay Revision Details by Transaction Reference Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchPayRevisionbyRefno.pending, (state) => {
                state.loading.payRevisionDetails = true;
                state.errors.payRevisionDetails = null;
            })
            .addCase(fetchPayRevisionbyRefno.fulfilled, (state, action) => {
                state.loading.payRevisionDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.payRevisionDetails = action.payload?.Data || null;
            })
            .addCase(fetchPayRevisionbyRefno.rejected, (state, action) => {
                state.loading.payRevisionDetails = false;
                state.errors.payRevisionDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.payRevisionDetails = null;
            })

        // 3. Approve Staff Pay Revision
        builder
            .addCase(approvePayRevision.pending, (state) => {
                state.loading.approvePayRevision = true;
                state.errors.approvePayRevision = null;
            })
            .addCase(approvePayRevision.fulfilled, (state, action) => {
                state.loading.approvePayRevision = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approvePayRevision.rejected, (state, action) => {
                state.loading.approvePayRevision = false;
                state.errors.approvePayRevision = action.payload;
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
    resetStaffPayRevisionData,
    clearApprovalResult
} = staffPayRevisionSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyPayRevisionInbox = (state) => state.staffpayrevision.verifyPayRevisionInbox;
export const selectPayRevisionDetails = (state) => state.staffpayrevision.payRevisionDetails;
export const selectApprovalResult = (state) => state.staffpayrevision.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyPayRevisionInboxArray = (state) => {
    const inbox = state.staffpayrevision.verifyPayRevisionInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffpayrevision.loading;
export const selectVerifyPayRevisionLoading = (state) => state.staffpayrevision.loading.verifyPayRevision;
export const selectPayRevisionDetailsLoading = (state) => state.staffpayrevision.loading.payRevisionDetails;
export const selectApprovePayRevisionLoading = (state) => state.staffpayrevision.loading.approvePayRevision;

// Error selectors
export const selectErrors = (state) => state.staffpayrevision.errors;
export const selectVerifyPayRevisionError = (state) => state.staffpayrevision.errors.verifyPayRevision;
export const selectPayRevisionDetailsError = (state) => state.staffpayrevision.errors.payRevisionDetails;
export const selectApprovePayRevisionError = (state) => state.staffpayrevision.errors.approvePayRevision;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffpayrevision.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => state.staffpayrevision.selectedTransactionRefno;
export const selectApprovalStatus = (state) => state.staffpayrevision.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffpayrevision.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffpayrevision.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectStaffPayRevisionSummary = (state) => {
    const inboxArray = Array.isArray(state.staffpayrevision.verifyPayRevisionInbox) 
        ? state.staffpayrevision.verifyPayRevisionInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedRevision: state.staffpayrevision.payRevisionDetails,
        approvalStatus: state.staffpayrevision.approvalStatus,
        isProcessing: state.staffpayrevision.loading.approvePayRevision,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.staffpayrevision.loading.verifyPayRevision
    };
};

// Pay Revision Details specific selector
export const selectPayRevisionDetailsSummary = (state) => {
    return {
        details: state.staffpayrevision.payRevisionDetails,
        isLoading: state.staffpayrevision.loading.payRevisionDetails,
        error: state.staffpayrevision.errors.payRevisionDetails,
        hasDetails: state.staffpayrevision.payRevisionDetails !== null,
        isEmpty: state.staffpayrevision.payRevisionDetails === null 
            && !state.staffpayrevision.loading.payRevisionDetails
    };
};

// Export reducer
export default staffPayRevisionSlice.reducer;