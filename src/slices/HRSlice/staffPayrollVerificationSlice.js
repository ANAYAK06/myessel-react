import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffPayrollVerificationAPI from '../../api/HRAPI/staffPayrollVerificationAPI';

// Async Thunks
// ============

// 1. Fetch Verification CC Payroll List
export const fetchVerificationCCPayroll = createAsyncThunk(
    'staffpayrollverification/fetchVerificationCCPayroll',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verification CC Payroll List:', params);
            const response = await staffPayrollVerificationAPI.getVerificationCCPayroll(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verification CC Payroll List');
        }
    }
);

// 2. Fetch Verification CC Payroll Details by RefNo
export const fetchVerificationCCPayrollByRefNo = createAsyncThunk(
    'staffpayrollverification/fetchVerificationCCPayrollByRefNo',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verification CC Payroll by RefNo:', params);
            const response = await staffPayrollVerificationAPI.getVerificationCCPayrollByRefNo(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verification CC Payroll Details');
        }
    }
);

// 3. Approve / Verify Payroll - Multi (Bulk)
export const approvePayRollMulti = createAsyncThunk(
    'staffpayrollverification/approvePayRollMulti',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approve/Verify Payroll Multi:', params);
            const response = await staffPayrollVerificationAPI.approvePayRollMulti(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Payroll Multi action');
        }
    }
);

// 4. Approve / Verify / Reject Payroll - Single
export const approvePayRollSingle = createAsyncThunk(
    'staffpayrollverification/approvePayRollSingle',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approve/Verify/Reject Payroll Single:', params);
            const response = await staffPayrollVerificationAPI.approvePayRollSingle(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Payroll Single action');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationCCPayrollList: [],
    verificationCCPayrollDetails: null,
    actionResult: null,

    // Loading states
    loading: {
        verificationList: false,
        verificationDetails: false,
        actionMulti: false,
        actionSingle: false,
    },

    // Error states
    errors: {
        verificationList: null,
        verificationDetails: null,
        actionMulti: null,
        actionSingle: null,
    },

    // UI State
    selectedItem: null,
    actionStatus: null,     // 'pending' | 'success' | 'failed'
    lastAction: null,       // 'Verify' | 'Approve' | 'Reject'
};

// Slice
// =====
const staffPayrollVerificationSlice = createSlice({
    name: 'staffpayrollverification',
    initialState,
    reducers: {
        setSelectedItem: (state, action) => {
            state.selectedItem = action.payload;
            state.verificationCCPayrollDetails = null;
            state.errors.verificationDetails = null;
        },

        setActionStatus: (state, action) => {
            state.actionStatus = action.payload;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        clearActionResult: (state) => {
            state.actionResult = null;
            state.actionStatus = null;
            state.lastAction = null;
            state.errors.actionMulti = null;
            state.errors.actionSingle = null;
        },

        resetVerificationData: (state) => {
            state.verificationCCPayrollList = [];
            state.verificationCCPayrollDetails = null;
            state.actionResult = null;
            state.selectedItem = null;
            state.actionStatus = null;
            state.lastAction = null;

            Object.keys(state.errors).forEach(key => { state.errors[key] = null; });
            Object.keys(state.loading).forEach(key => { state.loading[key] = false; });
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch Verification CC Payroll List
        builder
            .addCase(fetchVerificationCCPayroll.pending, (state) => {
                state.loading.verificationList = true;
                state.errors.verificationList = null;
            })
            .addCase(fetchVerificationCCPayroll.fulfilled, (state, action) => {
                state.loading.verificationList = false;
                console.log('✅ Verification CC Payroll List fulfilled:', action.payload);
                state.verificationCCPayrollList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerificationCCPayroll.rejected, (state, action) => {
                state.loading.verificationList = false;
                state.errors.verificationList = action.payload;
                state.verificationCCPayrollList = [];
            });

        // 2. Fetch Verification CC Payroll Details by RefNo
        builder
            .addCase(fetchVerificationCCPayrollByRefNo.pending, (state) => {
                state.loading.verificationDetails = true;
                state.errors.verificationDetails = null;
            })
            .addCase(fetchVerificationCCPayrollByRefNo.fulfilled, (state, action) => {
                state.loading.verificationDetails = false;
                console.log('✅ Verification CC Payroll Details fulfilled:', action.payload);
                state.verificationCCPayrollDetails = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchVerificationCCPayrollByRefNo.rejected, (state, action) => {
                state.loading.verificationDetails = false;
                state.errors.verificationDetails = action.payload;
                state.verificationCCPayrollDetails = null;
            });

        // 3. Approve / Verify Payroll - Multi
        builder
            .addCase(approvePayRollMulti.pending, (state) => {
                state.loading.actionMulti = true;
                state.errors.actionMulti = null;
                state.actionStatus = 'pending';
            })
            .addCase(approvePayRollMulti.fulfilled, (state, action) => {
                state.loading.actionMulti = false;
                console.log('✅ Approve Payroll Multi fulfilled:', action.payload);

                state.actionResult = action.payload;

                const responseStr = typeof action.payload === 'string'
                    ? action.payload
                    : (action.payload?.Data || action.payload?.Message || '');

                const isSuccess =
                    (typeof responseStr === 'string' && (
                        responseStr.toLowerCase().includes('success') ||
                        responseStr.toLowerCase().includes('submitted') ||
                        responseStr.toLowerCase().includes('submited')
                    )) ||
                    action.payload?.IsSuccessful === true ||
                    action.payload?.ResponseCode === 200;

                state.actionStatus = isSuccess ? 'success' : 'failed';
                if (!isSuccess) state.errors.actionMulti = responseStr || 'Action failed';
            })
            .addCase(approvePayRollMulti.rejected, (state, action) => {
                state.loading.actionMulti = false;
                state.errors.actionMulti = action.payload;
                state.actionStatus = 'failed';
                state.actionResult = null;
            });

        // 4. Approve / Verify / Reject Payroll - Single
        builder
            .addCase(approvePayRollSingle.pending, (state) => {
                state.loading.actionSingle = true;
                state.errors.actionSingle = null;
                state.actionStatus = 'pending';
            })
            .addCase(approvePayRollSingle.fulfilled, (state, action) => {
                state.loading.actionSingle = false;
                console.log('✅ Approve Payroll Single fulfilled:', action.payload);

                state.actionResult = action.payload;

                const responseStr = typeof action.payload === 'string'
                    ? action.payload
                    : (action.payload?.Data || action.payload?.Message || '');

                const isSuccess =
                    (typeof responseStr === 'string' && (
                        responseStr.toLowerCase().includes('success') ||
                        responseStr.toLowerCase().includes('submitted') ||
                        responseStr.toLowerCase().includes('submited')
                    )) ||
                    action.payload?.IsSuccessful === true ||
                    action.payload?.ResponseCode === 200;

                state.actionStatus = isSuccess ? 'success' : 'failed';
                if (!isSuccess) state.errors.actionSingle = responseStr || 'Action failed';
            })
            .addCase(approvePayRollSingle.rejected, (state, action) => {
                state.loading.actionSingle = false;
                state.errors.actionSingle = action.payload;
                state.actionStatus = 'failed';
                state.actionResult = null;
            });
    },
});

// Export actions
export const {
    setSelectedItem,
    setActionStatus,
    clearError,
    clearActionResult,
    resetVerificationData,
} = staffPayrollVerificationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationCCPayrollList = (state) => state.staffpayrollverification.verificationCCPayrollList;
export const selectVerificationCCPayrollDetails = (state) => state.staffpayrollverification.verificationCCPayrollDetails;
export const selectActionResult = (state) => state.staffpayrollverification.actionResult;

// Safe array selectors
export const selectVerificationCCPayrollListArray = (state) => {
    const list = state.staffpayrollverification.verificationCCPayrollList;
    return Array.isArray(list) ? list : [];
};

export const selectVerificationDetailsArray = (state) => {
    const details = state.staffpayrollverification.verificationCCPayrollDetails;
    return Array.isArray(details) ? details : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffpayrollverification.loading;
export const selectVerificationListLoading = (state) => state.staffpayrollverification.loading.verificationList;
export const selectVerificationDetailsLoading = (state) => state.staffpayrollverification.loading.verificationDetails;
export const selectActionMultiLoading = (state) => state.staffpayrollverification.loading.actionMulti;
export const selectActionSingleLoading = (state) => state.staffpayrollverification.loading.actionSingle;

// Error selectors
export const selectErrors = (state) => state.staffpayrollverification.errors;
export const selectVerificationListError = (state) => state.staffpayrollverification.errors.verificationList;
export const selectVerificationDetailsError = (state) => state.staffpayrollverification.errors.verificationDetails;
export const selectActionMultiError = (state) => state.staffpayrollverification.errors.actionMulti;
export const selectActionSingleError = (state) => state.staffpayrollverification.errors.actionSingle;

// UI state selectors
export const selectSelectedItem = (state) => state.staffpayrollverification.selectedItem;
export const selectActionStatus = (state) => state.staffpayrollverification.actionStatus;
export const selectLastAction = (state) => state.staffpayrollverification.lastAction;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffpayrollverification.loading).some(Boolean);
export const selectHasAnyError = (state) => Object.values(state.staffpayrollverification.errors).some(error => error !== null);
export const selectIsActionLoading = (state) =>
    state.staffpayrollverification.loading.actionMulti || state.staffpayrollverification.loading.actionSingle;

// Verification summary selector
export const selectVerificationSummary = (state) => {
    const list = state.staffpayrollverification.verificationCCPayrollList;
    const listArray = Array.isArray(list) ? list : [];

    return {
        totalPending: listArray.length,
        hasDetails: state.staffpayrollverification.verificationCCPayrollDetails !== null,
        hasSelectedItem: state.staffpayrollverification.selectedItem !== null,
        actionStatus: state.staffpayrollverification.actionStatus,
        isProcessing:
            state.staffpayrollverification.loading.actionMulti ||
            state.staffpayrollverification.loading.actionSingle,
    };
};

// Export reducer
export default staffPayrollVerificationSlice.reducer;