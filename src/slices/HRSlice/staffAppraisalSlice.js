import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as appraisalAPI from '../../api/HRAPI/staffAppraisalObjectiveAPI';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllEmployees = createAsyncThunk(
    'staffappraisal/fetchAllEmployees',
    async (_, { rejectWithValue }) => {
        try {
            return await appraisalAPI.getAllEmployees();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch employees');
        }
    }
);

export const fetchEmpDetails = createAsyncThunk(
    'staffappraisal/fetchEmpDetails',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await appraisalAPI.getEmpDetailsByRefNo(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch employee details');
        }
    }
);

export const saveAppraisalObjective = createAsyncThunk(
    'staffappraisal/saveAppraisalObjective',
    async (data, { rejectWithValue }) => {
        try {
            return await appraisalAPI.saveEmpObjectAndGoals(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save appraisal objective');
        }
    }
);

export const fetchAppraisalVerifyInbox = createAsyncThunk(
    'staffappraisal/fetchAppraisalVerifyInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            return await appraisalAPI.getVerifyObjectsAndGoals(roleId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch appraisal inbox');
        }
    }
);

export const fetchAppraisalDetail = createAsyncThunk(
    'staffappraisal/fetchAppraisalDetail',
    async ({ id, empRefNo }, { rejectWithValue }) => {
        try {
            return await appraisalAPI.getAppraisalById(id, empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch appraisal detail');
        }
    }
);

export const approveAppraisalObjective = createAsyncThunk(
    'staffappraisal/approveAppraisalObjective',
    async (data, { rejectWithValue }) => {
        try {
            return await appraisalAPI.approveEmpObjects(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to approve appraisal objective');
        }
    }
);

// ─── Helper ───────────────────────────────────────────────────────────────────
const isSubmitSuccess = (dataVal) => {
    if (typeof dataVal !== 'string' || !dataVal) return false;
    return dataVal.toLowerCase().includes('submit');
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
    // Creation flow
    empList:    [],
    empDetails: null,
    saveResult: null,
    saveStatus: null, // null | 'pending' | 'success' | 'failed'

    // Verification flow
    verifyInbox:    [],
    selectedId:     null,
    appraisalDetail: null,
    approveResult:  null,
    approveStatus:  null, // null | 'pending' | 'success' | 'failed'

    loading: {
        empList:         false,
        empDetails:      false,
        save:            false,
        verifyInbox:     false,
        appraisalDetail: false,
        approve:         false,
    },
    errors: {
        empList:         null,
        empDetails:      null,
        save:            null,
        verifyInbox:     null,
        appraisalDetail: null,
        approve:         null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const staffAppraisalSlice = createSlice({
    name: 'staffappraisal',
    initialState,
    reducers: {
        setSelectedId(state, action) {
            state.selectedId = action.payload;
        },
        clearSaveResult(state) {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },
        clearApproveResult(state) {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },
        clearEmpDetails(state) {
            state.empDetails = null;
            state.errors.empDetails = null;
        },
        clearAppraisalDetail(state) {
            state.appraisalDetail = null;
            state.selectedId = null;
            state.errors.appraisalDetail = null;
        },
        resetCreationFlow(state) {
            state.empDetails = null;
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
            state.errors.empDetails = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {

        // fetchAllEmployees
        builder
            .addCase(fetchAllEmployees.pending, (state) => {
                state.loading.empList = true;
                state.errors.empList  = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading.empList = false;
                state.empList = Array.isArray(action.payload?.Data)
                    ? action.payload.Data
                    : Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                state.loading.empList = false;
                state.errors.empList  = action.payload;
                state.empList = [];
            });

        // fetchEmpDetails
        builder
            .addCase(fetchEmpDetails.pending, (state) => {
                state.loading.empDetails = true;
                state.errors.empDetails  = null;
                state.empDetails = null;
            })
            .addCase(fetchEmpDetails.fulfilled, (state, action) => {
                state.loading.empDetails = false;
                state.empDetails = action.payload?.Data ?? action.payload ?? null;
            })
            .addCase(fetchEmpDetails.rejected, (state, action) => {
                state.loading.empDetails = false;
                state.errors.empDetails  = action.payload;
            });

        // saveAppraisalObjective
        builder
            .addCase(saveAppraisalObjective.pending, (state) => {
                state.loading.save = true;
                state.errors.save  = null;
                state.saveStatus   = 'pending';
            })
            .addCase(saveAppraisalObjective.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult   = action.payload;
                const dataVal = action.payload?.Data ?? '';
                if (isSubmitSuccess(dataVal)) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus  = 'failed';
                    state.errors.save = typeof dataVal === 'string' && dataVal
                        ? dataVal : 'Save failed. Please try again.';
                }
            })
            .addCase(saveAppraisalObjective.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
            });

        // fetchAppraisalVerifyInbox
        builder
            .addCase(fetchAppraisalVerifyInbox.pending, (state) => {
                state.loading.verifyInbox = true;
                state.errors.verifyInbox  = null;
            })
            .addCase(fetchAppraisalVerifyInbox.fulfilled, (state, action) => {
                state.loading.verifyInbox = false;
                state.verifyInbox = Array.isArray(action.payload?.Data)
                    ? action.payload.Data : [];
            })
            .addCase(fetchAppraisalVerifyInbox.rejected, (state, action) => {
                state.loading.verifyInbox = false;
                state.errors.verifyInbox  = action.payload;
                state.verifyInbox = [];
            });

        // fetchAppraisalDetail
        builder
            .addCase(fetchAppraisalDetail.pending, (state) => {
                state.loading.appraisalDetail = true;
                state.errors.appraisalDetail  = null;
                state.appraisalDetail = null;
            })
            .addCase(fetchAppraisalDetail.fulfilled, (state, action) => {
                state.loading.appraisalDetail = false;
                state.appraisalDetail = action.payload?.Data ?? action.payload ?? null;
            })
            .addCase(fetchAppraisalDetail.rejected, (state, action) => {
                state.loading.appraisalDetail = false;
                state.errors.appraisalDetail  = action.payload;
            });

        // approveAppraisalObjective
        builder
            .addCase(approveAppraisalObjective.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve  = null;
                state.approveStatus   = 'pending';
            })
            .addCase(approveAppraisalObjective.fulfilled, (state, action) => {
                state.loading.approve = false;
                state.approveResult   = action.payload;
                const dataVal = action.payload?.Data ?? '';
                if (isSubmitSuccess(dataVal)) {
                    state.approveStatus = 'success';
                } else {
                    state.approveStatus  = 'failed';
                    state.errors.approve = typeof dataVal === 'string' && dataVal
                        ? dataVal : 'Approval failed. Please try again.';
                }
            })
            .addCase(approveAppraisalObjective.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve  = action.payload;
                state.approveStatus   = 'failed';
            });
    },
});

export const {
    setSelectedId,
    clearSaveResult,
    clearApproveResult,
    clearEmpDetails,
    clearAppraisalDetail,
    resetCreationFlow,
    resetAll,
} = staffAppraisalSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectEmpList            = (s) => s.staffappraisal.empList;
export const selectEmpDetails         = (s) => s.staffappraisal.empDetails;
export const selectSaveStatus         = (s) => s.staffappraisal.saveStatus;
export const selectSaveError          = (s) => s.staffappraisal.errors.save;
export const selectSaveLoading        = (s) => s.staffappraisal.loading.save;
export const selectEmpListLoading     = (s) => s.staffappraisal.loading.empList;
export const selectEmpDetailsLoading  = (s) => s.staffappraisal.loading.empDetails;

export const selectVerifyInbox        = (s) => s.staffappraisal.verifyInbox;
export const selectSelectedId         = (s) => s.staffappraisal.selectedId;
export const selectAppraisalDetail    = (s) => s.staffappraisal.appraisalDetail;
export const selectAppraisalDetailLoading = (s) => s.staffappraisal.loading.appraisalDetail;
export const selectVerifyInboxLoading = (s) => s.staffappraisal.loading.verifyInbox;

export const selectApproveStatus      = (s) => s.staffappraisal.approveStatus;
export const selectApproveError       = (s) => s.staffappraisal.errors.approve;
export const selectApproveLoading     = (s) => s.staffappraisal.loading.approve;

export default staffAppraisalSlice.reducer;
