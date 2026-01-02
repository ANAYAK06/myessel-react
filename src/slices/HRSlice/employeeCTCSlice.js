import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as employeeCTCAPI from '../../api/HRAPI/employeeCTCAPI';

// Async Thunks for 3 Employee CTC APIs
// =====================================

// 1. Fetch Verify New Emp CTC Inbox by Role ID
export const fetchVerifyNewEmpCTC = createAsyncThunk(
    'employeectc/fetchVerifyNewEmpCTC',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await employeeCTCAPI.getVerifyNewEmpCTC({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify New Emp CTC Inbox');
        }
    }
);

// 2. Fetch New Emp CTC Details by Transaction Reference Number
export const fetchNewEmpCTCbyRefno = createAsyncThunk(
    'employeectc/fetchNewEmpCTCbyRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching New Emp CTC Details for TransactionRefno:', transactionRefno);
            const response = await employeeCTCAPI.getNewEmpCTCbyRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch New Emp CTC Details');
        }
    }
);

// 3. Approve New Emp CTC
export const approveNewEmpCTC = createAsyncThunk(
    'employeectc/approveNewEmpCTC',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving New Emp CTC with data:', approvalData);
            const response = await employeeCTCAPI.approveNewEmpCTC(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve New Emp CTC');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyNewEmpCTCInbox: [],
    ctcDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyNewEmpCTC: false,
        ctcDetails: false,
        approveNewEmpCTC: false,
    },

    // Error states for each API
    errors: {
        verifyNewEmpCTC: null,
        ctcDetails: null,
        approveNewEmpCTC: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
};

// Employee CTC Slice
// ==================
const employeeCTCSlice = createSlice({
    name: 'employeectc',
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
        
        // Action to reset CTC details
        resetCTCDetails: (state) => {
            state.ctcDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all employee CTC data
        resetEmployeeCTCData: (state) => {
            state.verifyNewEmpCTCInbox = [];
            state.ctcDetails = null;
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
        // 1. Verify New Emp CTC Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyNewEmpCTC.pending, (state) => {
                state.loading.verifyNewEmpCTC = true;
                state.errors.verifyNewEmpCTC = null;
            })
            .addCase(fetchVerifyNewEmpCTC.fulfilled, (state, action) => {
                state.loading.verifyNewEmpCTC = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyNewEmpCTCInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyNewEmpCTC.rejected, (state, action) => {
                state.loading.verifyNewEmpCTC = false;
                state.errors.verifyNewEmpCTC = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyNewEmpCTCInbox = [];
            })

        // 2. New Emp CTC Details by Transaction Reference Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchNewEmpCTCbyRefno.pending, (state) => {
                state.loading.ctcDetails = true;
                state.errors.ctcDetails = null;
            })
            .addCase(fetchNewEmpCTCbyRefno.fulfilled, (state, action) => {
                state.loading.ctcDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.ctcDetails = action.payload?.Data || null;
            })
            .addCase(fetchNewEmpCTCbyRefno.rejected, (state, action) => {
                state.loading.ctcDetails = false;
                state.errors.ctcDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.ctcDetails = null;
            })

        // 3. Approve New Emp CTC
        builder
            .addCase(approveNewEmpCTC.pending, (state) => {
                state.loading.approveNewEmpCTC = true;
                state.errors.approveNewEmpCTC = null;
            })
            .addCase(approveNewEmpCTC.fulfilled, (state, action) => {
                state.loading.approveNewEmpCTC = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveNewEmpCTC.rejected, (state, action) => {
                state.loading.approveNewEmpCTC = false;
                state.errors.approveNewEmpCTC = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    resetCTCDetails,
    clearError,
    resetEmployeeCTCData,
    clearApprovalResult
} = employeeCTCSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyNewEmpCTCInbox = (state) => state.employeectc.verifyNewEmpCTCInbox;
export const selectCTCDetails = (state) => state.employeectc.ctcDetails;
export const selectApprovalResult = (state) => state.employeectc.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyNewEmpCTCInboxArray = (state) => {
    const inbox = state.employeectc.verifyNewEmpCTCInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.employeectc.loading;
export const selectVerifyNewEmpCTCLoading = (state) => state.employeectc.loading.verifyNewEmpCTC;
export const selectCTCDetailsLoading = (state) => state.employeectc.loading.ctcDetails;
export const selectApproveNewEmpCTCLoading = (state) => state.employeectc.loading.approveNewEmpCTC;

// Error selectors
export const selectErrors = (state) => state.employeectc.errors;
export const selectVerifyNewEmpCTCError = (state) => state.employeectc.errors.verifyNewEmpCTC;
export const selectCTCDetailsError = (state) => state.employeectc.errors.ctcDetails;
export const selectApproveNewEmpCTCError = (state) => state.employeectc.errors.approveNewEmpCTC;

// UI State selectors
export const selectSelectedRoleId = (state) => state.employeectc.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => state.employeectc.selectedTransactionRefno;
export const selectApprovalStatus = (state) => state.employeectc.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.employeectc.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.employeectc.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectEmployeeCTCSummary = (state) => {
    const inboxArray = Array.isArray(state.employeectc.verifyNewEmpCTCInbox) 
        ? state.employeectc.verifyNewEmpCTCInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedCTC: state.employeectc.ctcDetails,
        approvalStatus: state.employeectc.approvalStatus,
        isProcessing: state.employeectc.loading.approveNewEmpCTC,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.employeectc.loading.verifyNewEmpCTC
    };
};

// CTC Details specific selector
export const selectCTCDetailsSummary = (state) => {
    return {
        details: state.employeectc.ctcDetails,
        isLoading: state.employeectc.loading.ctcDetails,
        error: state.employeectc.errors.ctcDetails,
        hasDetails: state.employeectc.ctcDetails !== null,
        isEmpty: state.employeectc.ctcDetails === null 
            && !state.employeectc.loading.ctcDetails
    };
};

// Export reducer
export default employeeCTCSlice.reducer;