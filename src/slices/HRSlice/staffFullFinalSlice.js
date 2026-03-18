import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffFullFinalAPI from '../../api/HRAPI/staffFullFinalAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Get Employees For Final Salary (list — no search param)
export const fetchEmpForFinalSalary = createAsyncThunk(
    'staffFullFinal/fetchEmpForFinalSalary',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employees For Final Salary');
            const response = await staffFullFinalAPI.getEmpForFinalSalary();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employees for final salary');
        }
    }
);

// 2. Generate Final Salary (preview — does NOT persist)
export const generateFinalSalary = createAsyncThunk(
    'staffFullFinal/generateFinalSalary',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Generating Final Salary:', params);
            const response = await staffFullFinalAPI.generateFinalSalary(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to generate final salary');
        }
    }
);

// 3. Save Final Salary (final submission)
export const saveFinalSalary = createAsyncThunk(
    'staffFullFinal/saveFinalSalary',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Final Salary:', params);
            const response = await staffFullFinalAPI.saveFinalSalary(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save final salary');
        }
    }
);

// 4. Fetch Verify Final Salary Grid (inbox list by role)
export const fetchVerifyFinalSalary = createAsyncThunk(
    'staffFullFinal/fetchVerifyFinalSalary',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Final Salary Grid:', roleId);
            const response = await staffFullFinalAPI.getVerifyFinalSalary(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verify final salary grid');
        }
    }
);

// 5. Fetch Final Salary By ID (detail view)
export const fetchFinalSalaryById = createAsyncThunk(
    'staffFullFinal/fetchFinalSalaryById',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Final Salary By ID:', params);
            const response = await staffFullFinalAPI.getFinalSalaryById(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch final salary by id');
        }
    }
);

// 6. Approve / Verify / Reject Final Salary
export const approveFinalSalary = createAsyncThunk(
    'staffFullFinal/approveFinalSalary',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving/Rejecting Final Salary:', params);
            const response = await staffFullFinalAPI.approveFinalSalary(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve/reject final salary');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Employee List ───────────────────────────────────────────────────────────
    empList: [],                    // all employees eligible for full & final

    // ── Generate Operation ──────────────────────────────────────────────────────
    generatedData: null,            // FinalSalary + nested heads / advances / optional
    generateStatus: null,           // null | 'pending' | 'success' | 'failed'

    // ── Save Operation ──────────────────────────────────────────────────────────
    saveResult: null,
    saveStatus: null,               // null | 'pending' | 'success' | 'failed'

    // ── Inbox / Verification List ───────────────────────────────────────────────
    verifyGridList: [],

    // ── Selected Detail ─────────────────────────────────────────────────────────
    selectedId: null,
    finalSalaryViewData: null,

    // ── Approve Operation ───────────────────────────────────────────────────────
    approveResult: null,
    approveStatus: null,            // null | 'pending' | 'success' | 'failed'

    // ── Loading States ──────────────────────────────────────────────────────────
    loading: {
        empList:             false,
        generate:            false,
        save:                false,
        verifyGridList:      false,
        finalSalaryViewData: false,
        approve:             false,
    },

    // ── Error States ────────────────────────────────────────────────────────────
    errors: {
        empList:             null,
        generate:            null,
        save:                null,
        verifyGridList:      null,
        finalSalaryViewData: null,
        approve:             null,
    },
};

// ==============================================
// HELPERS
// ==============================================

// GenerateFinalSalary and SaveFinalSalary succeed when
// the SP returns GenerateStatus = "Generated"
const resolveGenerateStatus = (payload) => {
    const data = payload?.Data ?? payload;
    const generateStatus = data?.GenerateStatus || '';
    const errorStatus    = data?.ErrorStatus    || '';
    const isSuccess = generateStatus === 'Generated';
    const responseStr = isSuccess
        ? 'Generated'
        : (errorStatus || generateStatus || payload?.Message || 'Operation failed');
    return { isSuccess, responseStr, data: isSuccess ? data : null };
};

// ApproveFinalSalary succeeds when Data === "Submited" (SP output param)
const resolveApproveStatus = (payload) => {
    const dataVal     = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Approve failed');
    const isSuccess   = typeof responseStr === 'string' &&
        responseStr.toLowerCase() === 'submited';
    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const staffFullFinalSlice = createSlice({
    name: 'staffFullFinal',
    initialState,
    reducers: {
        // ── UI selection ────────────────────────────────────────────────────────
        setSelectedId: (state, action) => {
            state.selectedId         = action.payload;
            state.finalSalaryViewData = null;
            state.errors.finalSalaryViewData = null;
            state.approveResult      = null;
            state.approveStatus      = null;
            state.errors.approve     = null;
        },

        // ── Clear generated data ────────────────────────────────────────────────
        clearGeneratedData: (state) => {
            state.generatedData   = null;
            state.generateStatus  = null;
            state.errors.generate = null;
        },

        // ── Clear save result ───────────────────────────────────────────────────
        clearSaveResult: (state) => {
            state.saveResult    = null;
            state.saveStatus    = null;
            state.errors.save   = null;
        },

        // ── Clear approve result ────────────────────────────────────────────────
        clearApproveResult: (state) => {
            state.approveResult  = null;
            state.approveStatus  = null;
            state.errors.approve = null;
        },

        // ── Clear detail ────────────────────────────────────────────────────────
        clearFinalSalaryDetail: (state) => {
            state.selectedId              = null;
            state.finalSalaryViewData     = null;
            state.errors.finalSalaryViewData = null;
        },

        // ── Clear individual error ──────────────────────────────────────────────
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {

        // ── 1. Fetch Employees For Final Salary ──────────────────────────────────
        builder
            .addCase(fetchEmpForFinalSalary.pending, (state) => {
                state.loading.empList = true;
                state.errors.empList  = null;
            })
            .addCase(fetchEmpForFinalSalary.fulfilled, (state, action) => {
                state.loading.empList = false;
                console.log('✅ Employees For Final Salary fulfilled:', action.payload);
                state.empList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmpForFinalSalary.rejected, (state, action) => {
                state.loading.empList = false;
                state.errors.empList  = action.payload;
                state.empList         = [];
            });

        // ── 2. Generate Final Salary ─────────────────────────────────────────────
        builder
            .addCase(generateFinalSalary.pending, (state) => {
                state.loading.generate = true;
                state.errors.generate  = null;
                state.generateStatus   = 'pending';
                state.generatedData    = null;
            })
            .addCase(generateFinalSalary.fulfilled, (state, action) => {
                state.loading.generate = false;
                console.log('✅ Generate Final Salary fulfilled - Raw Response:', action.payload);
                const { isSuccess, responseStr, data } = resolveGenerateStatus(action.payload);
                if (isSuccess) {
                    state.generateStatus = 'success';
                    state.generatedData  = data;
                } else {
                    state.generateStatus  = 'failed';
                    state.errors.generate = responseStr;
                    state.generatedData   = null;
                }
            })
            .addCase(generateFinalSalary.rejected, (state, action) => {
                state.loading.generate = false;
                state.errors.generate  = action.payload;
                state.generateStatus   = 'failed';
                state.generatedData    = null;
            });

        // ── 3. Save Final Salary ─────────────────────────────────────────────────
        builder
            .addCase(saveFinalSalary.pending, (state) => {
                state.loading.save = true;
                state.errors.save  = null;
                state.saveStatus   = 'pending';
            })
            .addCase(saveFinalSalary.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save Final Salary fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveGenerateStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus   = 'failed';
                    state.errors.save  = responseStr || 'Save final salary failed';
                }
            })
            .addCase(saveFinalSalary.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
                state.saveResult   = null;
            });

        // ── 4. Fetch Verify Final Salary Grid ────────────────────────────────────
        builder
            .addCase(fetchVerifyFinalSalary.pending, (state) => {
                state.loading.verifyGridList = true;
                state.errors.verifyGridList  = null;
            })
            .addCase(fetchVerifyFinalSalary.fulfilled, (state, action) => {
                state.loading.verifyGridList = false;
                console.log('✅ Verify Final Salary Grid fulfilled:', action.payload);
                state.verifyGridList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifyFinalSalary.rejected, (state, action) => {
                state.loading.verifyGridList = false;
                state.errors.verifyGridList  = action.payload;
                state.verifyGridList         = [];
            });

        // ── 5. Fetch Final Salary By ID ──────────────────────────────────────────
        builder
            .addCase(fetchFinalSalaryById.pending, (state) => {
                state.loading.finalSalaryViewData = true;
                state.errors.finalSalaryViewData  = null;
                state.finalSalaryViewData         = null;
            })
            .addCase(fetchFinalSalaryById.fulfilled, (state, action) => {
                state.loading.finalSalaryViewData = false;
                console.log('✅ Final Salary By ID fulfilled:', action.payload);
                state.finalSalaryViewData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchFinalSalaryById.rejected, (state, action) => {
                state.loading.finalSalaryViewData = false;
                state.errors.finalSalaryViewData  = action.payload;
                state.finalSalaryViewData         = null;
            });

        // ── 6. Approve / Reject Final Salary ─────────────────────────────────────
        builder
            .addCase(approveFinalSalary.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve  = null;
                state.approveStatus   = 'pending';
            })
            .addCase(approveFinalSalary.fulfilled, (state, action) => {
                state.loading.approve = false;
                console.log('✅ Approve Final Salary fulfilled - Raw Response:', action.payload);
                state.approveResult = action.payload;
                const { isSuccess, responseStr } = resolveApproveStatus(action.payload);
                if (isSuccess) {
                    state.approveStatus = 'success';
                } else {
                    state.approveStatus   = 'failed';
                    state.errors.approve  = responseStr || 'Approve/Reject final salary failed';
                }
            })
            .addCase(approveFinalSalary.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve  = action.payload;
                state.approveStatus   = 'failed';
                state.approveResult   = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedId,
    clearGeneratedData,
    clearSaveResult,
    clearApproveResult,
    clearFinalSalaryDetail,
    clearError,
    resetAll,
} = staffFullFinalSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Employee List Selectors ───────────────────────────────────────────────────
export const selectEmpList = (state) => state.staffFullFinal.empList;
export const selectEmpListArray = (state) => {
    const data = state.staffFullFinal.empList;
    return Array.isArray(data) ? data : [];
};

// ── Generate Operation Selectors ──────────────────────────────────────────────
export const selectGeneratedData   = (state) => state.staffFullFinal.generatedData;
export const selectGenerateStatus  = (state) => state.staffFullFinal.generateStatus;
export const selectGenerateLoading = (state) => state.staffFullFinal.loading.generate;
export const selectGenerateError   = (state) => state.staffFullFinal.errors.generate;

// ── Save Operation Selectors ──────────────────────────────────────────────────
export const selectSaveResult  = (state) => state.staffFullFinal.saveResult;
export const selectSaveStatus  = (state) => state.staffFullFinal.saveStatus;
export const selectSaveLoading = (state) => state.staffFullFinal.loading.save;
export const selectSaveError   = (state) => state.staffFullFinal.errors.save;

// ── Inbox / Verification Selectors ───────────────────────────────────────────
export const selectVerifyGridList = (state) => state.staffFullFinal.verifyGridList;
export const selectVerifyGridListArray = (state) => {
    const data = state.staffFullFinal.verifyGridList;
    return Array.isArray(data) ? data : [];
};

// ── Detail Selectors ──────────────────────────────────────────────────────────
export const selectSelectedId          = (state) => state.staffFullFinal.selectedId;
export const selectFinalSalaryViewData = (state) => state.staffFullFinal.finalSalaryViewData;

// ── Approve Operation Selectors ───────────────────────────────────────────────
export const selectApproveResult  = (state) => state.staffFullFinal.approveResult;
export const selectApproveStatus  = (state) => state.staffFullFinal.approveStatus;
export const selectApproveLoading = (state) => state.staffFullFinal.loading.approve;
export const selectApproveError   = (state) => state.staffFullFinal.errors.approve;

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                   = (state) => state.staffFullFinal.loading;
export const selectEmpListLoading            = (state) => state.staffFullFinal.loading.empList;
export const selectVerifyGridListLoading     = (state) => state.staffFullFinal.loading.verifyGridList;
export const selectFinalSalaryViewDataLoading = (state) => state.staffFullFinal.loading.finalSalaryViewData;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                    = (state) => state.staffFullFinal.errors;
export const selectEmpListError              = (state) => state.staffFullFinal.errors.empList;
export const selectVerifyGridListError       = (state) => state.staffFullFinal.errors.verifyGridList;
export const selectFinalSalaryViewDataError  = (state) => state.staffFullFinal.errors.finalSalaryViewData;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.staffFullFinal.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.staffFullFinal.errors).some((e) => e !== null);

// Inbox summary — drives StatsCards / header badges in the verification page
export const selectVerifySummary = (state) => {
    const list = Array.isArray(state.staffFullFinal.verifyGridList)
        ? state.staffFullFinal.verifyGridList
        : [];

    return {
        total:         list.length,
        pending:       list.filter((e) => e.Status === 'Pending' || e.Status === 'New').length,
        approved:      list.filter((e) => e.Status === 'Approved').length,
        rejected:      list.filter((e) => e.Status === 'Rejected').length,
        selectedId:    state.staffFullFinal.selectedId,
        hasSelection:  state.staffFullFinal.selectedId !== null,
        approveStatus: state.staffFullFinal.approveStatus,
        isApproving:   state.staffFullFinal.loading.approve,
        saveStatus:    state.staffFullFinal.saveStatus,
        isSaving:      state.staffFullFinal.loading.save,
        generateStatus: state.staffFullFinal.generateStatus,
        isGenerating:   state.staffFullFinal.loading.generate,
    };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffFullFinalSlice.reducer;
