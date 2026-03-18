import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffVerifyAPI from '../../api/HRAPI/StaffRegistrationVerificationAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Fetch Verification Staff List by Role
export const fetchVerificationStaff = createAsyncThunk(
    'staffVerify/fetchVerificationStaff',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verification Staff List:', roleId);
            const response = await staffVerifyAPI.getVerificationStaff(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verification staff list');
        }
    }
);

// 2. Fetch Staff Main Data by EmpRefNo
export const fetchStaffMainDataById = createAsyncThunk(
    'staffVerify/fetchStaffMainDataById',
    async ({ empRefNo, roleId }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Staff Main Data:', { empRefNo, roleId });
            const response = await staffVerifyAPI.getStaffMainDataById({ empRefNo, roleId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch staff main data');
        }
    }
);

// 3. Fetch Employee Documents by EmpRefNo
export const fetchEmployeeDocuments = createAsyncThunk(
    'staffVerify/fetchEmployeeDocuments',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Documents:', empRefNo);
            const response = await staffVerifyAPI.getEmployeeDocuments(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee documents');
        }
    }
);

// 4. Approve / Reject Staff Registration
export const approveStaffRegistration = createAsyncThunk(
    'staffVerify/approveStaffRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving/Rejecting Staff Registration:', params);
            const response = await staffVerifyAPI.approveStaffRegistration(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve/reject staff registration');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Inbox / List ───────────────────────────
    verificationStaffList: [],

    // ── Selected Staff Detail ──────────────────
    selectedEmpRefNo: null,
    staffMainData: null,
    employeeDocuments: [],

    // ── Approval Operation ─────────────────────
    approveResult: null,
    approveStatus: null,    // null | 'pending' | 'success' | 'failed'

    // ── Loading States ─────────────────────────
    loading: {
        verificationStaffList: false,
        staffMainData: false,
        employeeDocuments: false,
        approve: false,
    },

    // ── Error States ───────────────────────────
    errors: {
        verificationStaffList: null,
        staffMainData: null,
        employeeDocuments: null,
        approve: null,
    },
};

// ==============================================
// HELPERS
// ==============================================

// SP returns "Submited$..." (single t) on success
const resolveApproveStatus = (payload) => {
    const responseStr = typeof payload === 'string'
        ? payload
        : (payload?.Data || payload?.Message || '');

    const isSuccess =
        (typeof responseStr === 'string' && (
            responseStr.toLowerCase().includes('submit') ||
            responseStr.toLowerCase().includes('success') ||
            responseStr.toLowerCase().includes('approved') ||
            responseStr.toLowerCase().includes('rejected')
        )) ||
        payload?.IsSuccessful === true ||
        payload?.ResponseCode === 200;

    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const staffVerifySlice = createSlice({
    name: 'staffVerify',
    initialState,
    reducers: {
        // ── UI selection ───────────────────────────────────────────────────────
        setSelectedEmpRefNo: (state, action) => {
            state.selectedEmpRefNo = action.payload;
            // Clear previous detail data when switching selection
            state.staffMainData = null;
            state.employeeDocuments = [];
            state.errors.staffMainData = null;
            state.errors.employeeDocuments = null;
            // Reset approve state on new selection
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        // ── Clear actions ──────────────────────────────────────────────────────
        clearApproveResult: (state) => {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        clearStaffDetail: (state) => {
            state.selectedEmpRefNo = null;
            state.staffMainData = null;
            state.employeeDocuments = [];
            state.errors.staffMainData = null;
            state.errors.employeeDocuments = null;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        clearAllResults: (state) => {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {
        // ── 1. Fetch Verification Staff List ──────────────────────────────────
        builder
            .addCase(fetchVerificationStaff.pending, (state) => {
                state.loading.verificationStaffList = true;
                state.errors.verificationStaffList = null;
            })
            .addCase(fetchVerificationStaff.fulfilled, (state, action) => {
                state.loading.verificationStaffList = false;
                console.log('✅ Verification Staff List fulfilled:', action.payload);
                state.verificationStaffList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerificationStaff.rejected, (state, action) => {
                state.loading.verificationStaffList = false;
                state.errors.verificationStaffList = action.payload;
                state.verificationStaffList = [];
            });

        // ── 2. Fetch Staff Main Data ───────────────────────────────────────────
        builder
            .addCase(fetchStaffMainDataById.pending, (state) => {
                state.loading.staffMainData = true;
                state.errors.staffMainData = null;
                state.staffMainData = null;
            })
            .addCase(fetchStaffMainDataById.fulfilled, (state, action) => {
                state.loading.staffMainData = false;
                console.log('✅ Staff Main Data fulfilled:', action.payload);
                state.staffMainData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchStaffMainDataById.rejected, (state, action) => {
                state.loading.staffMainData = false;
                state.errors.staffMainData = action.payload;
                state.staffMainData = null;
            });

        // ── 3. Fetch Employee Documents ───────────────────────────────────────
        builder
            .addCase(fetchEmployeeDocuments.pending, (state) => {
                state.loading.employeeDocuments = true;
                state.errors.employeeDocuments = null;
                state.employeeDocuments = [];
            })
            .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
                state.loading.employeeDocuments = false;
                console.log('✅ Employee Documents fulfilled:', action.payload);
                state.employeeDocuments = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmployeeDocuments.rejected, (state, action) => {
                state.loading.employeeDocuments = false;
                state.errors.employeeDocuments = action.payload;
                state.employeeDocuments = [];
            });

        // ── 4. Approve / Reject Staff Registration ────────────────────────────
        builder
            .addCase(approveStaffRegistration.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
                state.approveStatus = 'pending';
            })
            .addCase(approveStaffRegistration.fulfilled, (state, action) => {
                state.loading.approve = false;
                console.log('✅ Approve Staff Registration fulfilled - Raw Response:', action.payload);
                state.approveResult = action.payload;
                const { isSuccess, responseStr } = resolveApproveStatus(action.payload);
                if (isSuccess) {
                    state.approveStatus = 'success';
                } else {
                    state.approveStatus = 'failed';
                    state.errors.approve = responseStr || 'Approve/Reject Staff Registration failed';
                }
            })
            .addCase(approveStaffRegistration.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve = action.payload;
                state.approveStatus = 'failed';
                state.approveResult = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedEmpRefNo,
    clearApproveResult,
    clearStaffDetail,
    clearError,
    clearAllResults,
    resetAll,
} = staffVerifySlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── List Selectors ────────────────────────────────────────────────────────────
export const selectVerificationStaffList = (state) => state.staffVerify.verificationStaffList;

export const selectVerificationStaffListArray = (state) => {
    const data = state.staffVerify.verificationStaffList;
    return Array.isArray(data) ? data : [];
};

// ── Detail Selectors ──────────────────────────────────────────────────────────
export const selectSelectedEmpRefNo   = (state) => state.staffVerify.selectedEmpRefNo;
export const selectStaffMainData      = (state) => state.staffVerify.staffMainData;
export const selectEmployeeDocuments  = (state) => state.staffVerify.employeeDocuments;

export const selectEmployeeDocumentsArray = (state) => {
    const data = state.staffVerify.employeeDocuments;
    return Array.isArray(data) ? data : [];
};

// ── Approve Operation Selectors ───────────────────────────────────────────────
export const selectApproveResult  = (state) => state.staffVerify.approveResult;
export const selectApproveStatus  = (state) => state.staffVerify.approveStatus;

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                       = (state) => state.staffVerify.loading;
export const selectVerificationStaffListLoading  = (state) => state.staffVerify.loading.verificationStaffList;
export const selectStaffMainDataLoading          = (state) => state.staffVerify.loading.staffMainData;
export const selectEmployeeDocumentsLoading      = (state) => state.staffVerify.loading.employeeDocuments;
export const selectApproveLoading                = (state) => state.staffVerify.loading.approve;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                        = (state) => state.staffVerify.errors;
export const selectVerificationStaffListError    = (state) => state.staffVerify.errors.verificationStaffList;
export const selectStaffMainDataError            = (state) => state.staffVerify.errors.staffMainData;
export const selectEmployeeDocumentsError        = (state) => state.staffVerify.errors.employeeDocuments;
export const selectApproveError                  = (state) => state.staffVerify.errors.approve;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.staffVerify.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.staffVerify.errors).some((e) => e !== null);

export const selectIsDetailLoading = (state) =>
    state.staffVerify.loading.staffMainData ||
    state.staffVerify.loading.employeeDocuments;

// Inbox summary — drives StatsCards / header badges
export const selectVerificationSummary = (state) => {
    const list = Array.isArray(state.staffVerify.verificationStaffList)
        ? state.staffVerify.verificationStaffList
        : [];

    return {
        total:              list.length,
        pending:            list.filter((e) => e.Status === 'Pending' || e.Status === 'New').length,
        approved:           list.filter((e) => e.Status === 'Approved').length,
        rejected:           list.filter((e) => e.Status === 'Rejected').length,
        selectedEmpRefNo:   state.staffVerify.selectedEmpRefNo,
        hasSelection:       state.staffVerify.selectedEmpRefNo !== null,
        approveStatus:      state.staffVerify.approveStatus,
        isApproving:        state.staffVerify.loading.approve,
    };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffVerifySlice.reducer;