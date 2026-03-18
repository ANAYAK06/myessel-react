import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffExitAPI from '../../api/HRAPI/staffExitAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Get Employees For Exit (search by prefix - autocomplete)
export const fetchEmployeesForExit = createAsyncThunk(
    'employeeExit/fetchEmployeesForExit',
    async (prefix, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employees For Exit:', prefix);
            const response = await staffExitAPI.getEmployeesForExit(prefix);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employees for exit');
        }
    }
);

// 2. Get Employee For Exit (fetch details for selected employee)
export const fetchEmployeeForExit = createAsyncThunk(
    'employeeExit/fetchEmployeeForExit',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee For Exit:', empRefNo);
            const response = await staffExitAPI.getEmployeeForExit(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee for exit');
        }
    }
);

// 3. Save Employee Exit
export const saveEmpExit = createAsyncThunk(
    'employeeExit/saveEmpExit',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Employee Exit:', params);
            const response = await staffExitAPI.saveEmpExit(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save employee exit');
        }
    }
);

// 4. Fetch Verify Employee Exit Grid (inbox list by role)
export const fetchVerifyEmpExit = createAsyncThunk(
    'employeeExit/fetchVerifyEmpExit',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Employee Exit Grid:', roleId);
            const response = await staffExitAPI.getVerifyEmpExit(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verify employee exit grid');
        }
    }
);

// 5. Fetch Employee Exit By ID (detail view for approval)
export const fetchEmpExitById = createAsyncThunk(
    'employeeExit/fetchEmpExitById',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Exit By ID:', params);
            const response = await staffExitAPI.getEmpExitById(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee exit by id');
        }
    }
);

// 6. Approve / Reject Employee Exit
export const approveEmpExit = createAsyncThunk(
    'employeeExit/approveEmpExit',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving/Rejecting Employee Exit:', params);
            const response = await staffExitAPI.approveEmpExit(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve/reject employee exit');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Form / Entry ───────────────────────────
    employeesForExitList: [],       // autocomplete suggestions
    employeeForExitData: null,      // details of the selected employee

    // ── Save Operation ─────────────────────────
    saveResult: null,
    saveStatus: null,               // null | 'pending' | 'success' | 'failed'

    // ── Inbox / Verification List ──────────────
    exitGridList: [],

    // ── Selected Exit Detail ───────────────────
    selectedId: null,
    exitViewData: null,

    // ── Approve Operation ──────────────────────
    approveResult: null,
    approveStatus: null,            // null | 'pending' | 'success' | 'failed'

    // ── Loading States ─────────────────────────
    loading: {
        employeesForExitList: false,
        employeeForExitData: false,
        save: false,
        exitGridList: false,
        exitViewData: false,
        approve: false,
    },

    // ── Error States ───────────────────────────
    errors: {
        employeesForExitList: null,
        employeeForExitData: null,
        save: null,
        exitGridList: null,
        exitViewData: null,
        approve: null,
    },
};

// ==============================================
// HELPERS
// ==============================================

// SP returns "Submited" (single t) on save success.
// IsSuccessful reflects HTTP-layer success (200 = true), NOT SP business logic.
// Business rule failures return IsSuccessful: true with Data: "<error message>".
// Only Data === "Submited" (case-insensitive) is a real success.
const resolveSaveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Save failed');
    const isSuccess = typeof responseStr === 'string' &&
        responseStr.toLowerCase() === 'submited';
    return { isSuccess, responseStr };
};

// Same logic for approve — SP returns "Submited" on success
const resolveApproveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Approve failed');
    const isSuccess = typeof responseStr === 'string' &&
        responseStr.toLowerCase() === 'submited';
    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const employeeExitSlice = createSlice({
    name: 'employeeExit',
    initialState,
    reducers: {
        // ── UI selection ───────────────────────────────────────────────────────
        setSelectedId: (state, action) => {
            state.selectedId = action.payload;
            state.exitViewData = null;
            state.errors.exitViewData = null;
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        // ── Clear employee autocomplete on input reset ─────────────────────────
        clearEmployeesForExitList: (state) => {
            state.employeesForExitList = [];
            state.errors.employeesForExitList = null;
        },

        // ── Clear employee detail when selection is reset ──────────────────────
        clearEmployeeForExitData: (state) => {
            state.employeeForExitData = null;
            state.errors.employeeForExitData = null;
        },

        // ── Clear save result ──────────────────────────────────────────────────
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },

        // ── Clear approve result ───────────────────────────────────────────────
        clearApproveResult: (state) => {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        // ── Clear exit detail ──────────────────────────────────────────────────
        clearExitDetail: (state) => {
            state.selectedId = null;
            state.exitViewData = null;
            state.errors.exitViewData = null;
        },

        // ── Clear individual error ─────────────────────────────────────────────
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {
        // ── 1. Fetch Employees For Exit ───────────────────────────────────────
        builder
            .addCase(fetchEmployeesForExit.pending, (state) => {
                state.loading.employeesForExitList = true;
                state.errors.employeesForExitList = null;
            })
            .addCase(fetchEmployeesForExit.fulfilled, (state, action) => {
                state.loading.employeesForExitList = false;
                console.log('✅ Employees For Exit fulfilled:', action.payload);
                state.employeesForExitList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmployeesForExit.rejected, (state, action) => {
                state.loading.employeesForExitList = false;
                state.errors.employeesForExitList = action.payload;
                state.employeesForExitList = [];
            });

        // ── 2. Fetch Employee For Exit ────────────────────────────────────────
        builder
            .addCase(fetchEmployeeForExit.pending, (state) => {
                state.loading.employeeForExitData = true;
                state.errors.employeeForExitData = null;
                state.employeeForExitData = null;
            })
            .addCase(fetchEmployeeForExit.fulfilled, (state, action) => {
                state.loading.employeeForExitData = false;
                console.log('✅ Employee For Exit fulfilled:', action.payload);
                const raw = action.payload?.Data || action.payload;
                state.employeeForExitData = Array.isArray(raw) ? (raw[0] || null) : raw;
            })
            .addCase(fetchEmployeeForExit.rejected, (state, action) => {
                state.loading.employeeForExitData = false;
                state.errors.employeeForExitData = action.payload;
                state.employeeForExitData = null;
            });

        // ── 3. Save Employee Exit ─────────────────────────────────────────────
        builder
            .addCase(saveEmpExit.pending, (state) => {
                state.loading.save = true;
                state.errors.save = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveEmpExit.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save Employee Exit fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.save = responseStr || 'Save employee exit failed';
                }
            })
            .addCase(saveEmpExit.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });

        // ── 4. Fetch Verify Employee Exit Grid ────────────────────────────────
        builder
            .addCase(fetchVerifyEmpExit.pending, (state) => {
                state.loading.exitGridList = true;
                state.errors.exitGridList = null;
            })
            .addCase(fetchVerifyEmpExit.fulfilled, (state, action) => {
                state.loading.exitGridList = false;
                console.log('✅ Verify Employee Exit Grid fulfilled:', action.payload);
                state.exitGridList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifyEmpExit.rejected, (state, action) => {
                state.loading.exitGridList = false;
                state.errors.exitGridList = action.payload;
                state.exitGridList = [];
            });

        // ── 5. Fetch Employee Exit By ID ──────────────────────────────────────
        builder
            .addCase(fetchEmpExitById.pending, (state) => {
                state.loading.exitViewData = true;
                state.errors.exitViewData = null;
                state.exitViewData = null;
            })
            .addCase(fetchEmpExitById.fulfilled, (state, action) => {
                state.loading.exitViewData = false;
                console.log('✅ Employee Exit By ID fulfilled:', action.payload);
                state.exitViewData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchEmpExitById.rejected, (state, action) => {
                state.loading.exitViewData = false;
                state.errors.exitViewData = action.payload;
                state.exitViewData = null;
            });

        // ── 6. Approve / Reject Employee Exit ─────────────────────────────────
        builder
            .addCase(approveEmpExit.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
                state.approveStatus = 'pending';
            })
            .addCase(approveEmpExit.fulfilled, (state, action) => {
                state.loading.approve = false;
                console.log('✅ Approve Employee Exit fulfilled - Raw Response:', action.payload);
                state.approveResult = action.payload;
                const { isSuccess, responseStr } = resolveApproveStatus(action.payload);
                if (isSuccess) {
                    state.approveStatus = 'success';
                } else {
                    state.approveStatus = 'failed';
                    state.errors.approve = responseStr || 'Approve/Reject employee exit failed';
                }
            })
            .addCase(approveEmpExit.rejected, (state, action) => {
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
    setSelectedId,
    clearEmployeesForExitList,
    clearEmployeeForExitData,
    clearSaveResult,
    clearApproveResult,
    clearExitDetail,
    clearError,
    resetAll,
} = employeeExitSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Form / Entry Selectors ────────────────────────────────────────────────────
export const selectEmployeesForExitList = (state) => state.employeeExit.employeesForExitList;
export const selectEmployeesForExitListArray = (state) => {
    const data = state.employeeExit.employeesForExitList;
    return Array.isArray(data) ? data : [];
};

export const selectEmployeeForExitData = (state) => state.employeeExit.employeeForExitData;

// ── Save Operation Selectors ──────────────────────────────────────────────────
export const selectSaveResult = (state) => state.employeeExit.saveResult;
export const selectSaveStatus = (state) => state.employeeExit.saveStatus;

// ── Inbox / Verification Selectors ───────────────────────────────────────────
export const selectExitGridList = (state) => state.employeeExit.exitGridList;
export const selectExitGridListArray = (state) => {
    const data = state.employeeExit.exitGridList;
    return Array.isArray(data) ? data : [];
};

// ── Detail Selectors ──────────────────────────────────────────────────────────
export const selectSelectedId     = (state) => state.employeeExit.selectedId;
export const selectExitViewData   = (state) => state.employeeExit.exitViewData;

// ── Approve Operation Selectors ───────────────────────────────────────────────
export const selectApproveResult = (state) => state.employeeExit.approveResult;
export const selectApproveStatus = (state) => state.employeeExit.approveStatus;

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                       = (state) => state.employeeExit.loading;
export const selectEmployeesForExitListLoading   = (state) => state.employeeExit.loading.employeesForExitList;
export const selectEmployeeForExitDataLoading    = (state) => state.employeeExit.loading.employeeForExitData;
export const selectSaveLoading                   = (state) => state.employeeExit.loading.save;
export const selectExitGridListLoading           = (state) => state.employeeExit.loading.exitGridList;
export const selectExitViewDataLoading           = (state) => state.employeeExit.loading.exitViewData;
export const selectApproveLoading                = (state) => state.employeeExit.loading.approve;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                        = (state) => state.employeeExit.errors;
export const selectEmployeesForExitListError     = (state) => state.employeeExit.errors.employeesForExitList;
export const selectEmployeeForExitDataError      = (state) => state.employeeExit.errors.employeeForExitData;
export const selectSaveError                     = (state) => state.employeeExit.errors.save;
export const selectExitGridListError             = (state) => state.employeeExit.errors.exitGridList;
export const selectExitViewDataError             = (state) => state.employeeExit.errors.exitViewData;
export const selectApproveError                  = (state) => state.employeeExit.errors.approve;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.employeeExit.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.employeeExit.errors).some((e) => e !== null);

export const selectIsDetailLoading = (state) =>
    state.employeeExit.loading.exitViewData;

export const selectIsFormLoading = (state) =>
    state.employeeExit.loading.employeesForExitList ||
    state.employeeExit.loading.employeeForExitData;

// Inbox summary — drives StatsCards / header badges
export const selectExitSummary = (state) => {
    const list = Array.isArray(state.employeeExit.exitGridList)
        ? state.employeeExit.exitGridList
        : [];

    return {
        total:         list.length,
        pending:       list.filter((e) => e.Status === 'Pending' || e.Status === 'New').length,
        approved:      list.filter((e) => e.Status === 'Approved').length,
        rejected:      list.filter((e) => e.Status === 'Rejected').length,
        selectedId:    state.employeeExit.selectedId,
        hasSelection:  state.employeeExit.selectedId !== null,
        approveStatus: state.employeeExit.approveStatus,
        isApproving:   state.employeeExit.loading.approve,
        saveStatus:    state.employeeExit.saveStatus,
        isSaving:      state.employeeExit.loading.save,
    };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default employeeExitSlice.reducer;
