import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as advanceAPI from '../../api/HRAPI/staffAdvanceAPI';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSalaryEmpForAdvance = createAsyncThunk(
    'staffadvance/fetchSalaryEmpForAdvance',
    async (_, { rejectWithValue }) => {
        try {
            return await advanceAPI.getSalaryEmpForAdvance();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch employee list');
        }
    }
);

export const fetchEmpWorkingCC = createAsyncThunk(
    'staffadvance/fetchEmpWorkingCC',
    async (empRefno, { rejectWithValue }) => {
        try {
            return await advanceAPI.getEmpWorkingCC(empRefno);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch cost center');
        }
    }
);

export const saveAdvanceRequest = createAsyncThunk(
    'staffadvance/saveAdvanceRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await advanceAPI.saveHRAdvanceRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save advance request');
        }
    }
);

export const fetchAdvanceVerifyInbox = createAsyncThunk(
    'staffadvance/fetchAdvanceVerifyInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            return await advanceAPI.getHRAdvanceRequestDataForVerify(roleId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch advance inbox');
        }
    }
);

export const fetchAdvanceDetail = createAsyncThunk(
    'staffadvance/fetchAdvanceDetail',
    async ({ transNo, empRefno }, { rejectWithValue }) => {
        try {
            return await advanceAPI.getHRAdvanceRequestData(transNo, empRefno);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch advance detail');
        }
    }
);

export const approveAdvanceRequest = createAsyncThunk(
    'staffadvance/approveAdvanceRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await advanceAPI.approveHRAdvanceRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to approve advance request');
        }
    }
);

export const saveAdvancePayment = createAsyncThunk(
    'staffadvance/saveAdvancePayment',
    async (data, { rejectWithValue }) => {
        try {
            return await advanceAPI.saveSalaryAdvancePayment(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save advance payment');
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
    empCC:      null,   // raw string "CC-12,Raipur Office"
    saveResult: null,
    saveStatus: null,   // null | 'pending' | 'success' | 'failed'

    // Verification flow
    verifyInbox:    [],
    selectedTransNo: null,
    advanceDetail:  null,
    approveResult:  null,
    approveStatus:  null, // null | 'pending' | 'success' | 'failed'

    // Payment flow
    paymentResult: null,
    paymentStatus: null, // null | 'pending' | 'success' | 'failed'

    loading: {
        empList:       false,
        empCC:         false,
        save:          false,
        verifyInbox:   false,
        advanceDetail: false,
        approve:       false,
        payment:       false,
    },
    errors: {
        empList:       null,
        empCC:         null,
        save:          null,
        verifyInbox:   null,
        advanceDetail: null,
        approve:       null,
        payment:       null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const staffAdvanceSlice = createSlice({
    name: 'staffadvance',
    initialState,
    reducers: {
        setSelectedTransNo(state, action) {
            state.selectedTransNo = action.payload;
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
        clearPaymentResult(state) {
            state.paymentResult = null;
            state.paymentStatus = null;
            state.errors.payment = null;
        },
        clearAdvanceDetail(state) {
            state.advanceDetail = null;
            state.selectedTransNo = null;
            state.errors.advanceDetail = null;
        },
        clearEmpCC(state) {
            state.empCC = null;
            state.errors.empCC = null;
        },
        resetCreationFlow(state) {
            state.empCC      = null;
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save   = null;
            state.errors.empCC  = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {

        // 1. fetchSalaryEmpForAdvance
        builder
            .addCase(fetchSalaryEmpForAdvance.pending, (state) => {
                state.loading.empList = true;
                state.errors.empList  = null;
            })
            .addCase(fetchSalaryEmpForAdvance.fulfilled, (state, action) => {
                state.loading.empList = false;
                state.empList = Array.isArray(action.payload?.Data)
                    ? action.payload.Data
                    : Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchSalaryEmpForAdvance.rejected, (state, action) => {
                state.loading.empList = false;
                state.errors.empList  = action.payload;
                state.empList = [];
            });

        // 2. fetchEmpWorkingCC
        builder
            .addCase(fetchEmpWorkingCC.pending, (state) => {
                state.loading.empCC = true;
                state.errors.empCC  = null;
                state.empCC = null;
            })
            .addCase(fetchEmpWorkingCC.fulfilled, (state, action) => {
                state.loading.empCC = false;
                state.empCC = action.payload?.Data ?? null;
            })
            .addCase(fetchEmpWorkingCC.rejected, (state, action) => {
                state.loading.empCC = false;
                state.errors.empCC  = action.payload;
            });

        // 3. saveAdvanceRequest
        builder
            .addCase(saveAdvanceRequest.pending, (state) => {
                state.loading.save = true;
                state.errors.save  = null;
                state.saveStatus   = 'pending';
            })
            .addCase(saveAdvanceRequest.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult   = action.payload;
                const dataVal = action.payload?.Data ?? '';
                if (isSubmitSuccess(dataVal)) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus    = 'failed';
                    state.errors.save   = typeof dataVal === 'string' && dataVal
                        ? dataVal
                        : 'Save failed. Please try again.';
                }
            })
            .addCase(saveAdvanceRequest.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
            });

        // 4. fetchAdvanceVerifyInbox
        builder
            .addCase(fetchAdvanceVerifyInbox.pending, (state) => {
                state.loading.verifyInbox = true;
                state.errors.verifyInbox  = null;
            })
            .addCase(fetchAdvanceVerifyInbox.fulfilled, (state, action) => {
                state.loading.verifyInbox = false;
                state.verifyInbox = Array.isArray(action.payload?.Data)
                    ? action.payload.Data : [];
            })
            .addCase(fetchAdvanceVerifyInbox.rejected, (state, action) => {
                state.loading.verifyInbox = false;
                state.errors.verifyInbox  = action.payload;
                state.verifyInbox = [];
            });

        // 5. fetchAdvanceDetail
        builder
            .addCase(fetchAdvanceDetail.pending, (state) => {
                state.loading.advanceDetail = true;
                state.errors.advanceDetail  = null;
                state.advanceDetail = null;
            })
            .addCase(fetchAdvanceDetail.fulfilled, (state, action) => {
                state.loading.advanceDetail = false;
                state.advanceDetail = action.payload?.Data ?? action.payload ?? null;
            })
            .addCase(fetchAdvanceDetail.rejected, (state, action) => {
                state.loading.advanceDetail = false;
                state.errors.advanceDetail  = action.payload;
            });

        // 6. approveAdvanceRequest
        builder
            .addCase(approveAdvanceRequest.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve  = null;
                state.approveStatus   = 'pending';
            })
            .addCase(approveAdvanceRequest.fulfilled, (state, action) => {
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
            .addCase(approveAdvanceRequest.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve  = action.payload;
                state.approveStatus   = 'failed';
            });

        // 7. saveAdvancePayment
        builder
            .addCase(saveAdvancePayment.pending, (state) => {
                state.loading.payment = true;
                state.errors.payment  = null;
                state.paymentStatus   = 'pending';
            })
            .addCase(saveAdvancePayment.fulfilled, (state, action) => {
                state.loading.payment = false;
                state.paymentResult   = action.payload;
                const dataVal = action.payload?.Data ?? '';
                if (isSubmitSuccess(dataVal)) {
                    state.paymentStatus = 'success';
                } else {
                    state.paymentStatus  = 'failed';
                    state.errors.payment = typeof dataVal === 'string' && dataVal
                        ? dataVal : 'Payment save failed. Please try again.';
                }
            })
            .addCase(saveAdvancePayment.rejected, (state, action) => {
                state.loading.payment = false;
                state.errors.payment  = action.payload;
                state.paymentStatus   = 'failed';
            });
    },
});

export const {
    setSelectedTransNo,
    clearSaveResult,
    clearApproveResult,
    clearPaymentResult,
    clearAdvanceDetail,
    clearEmpCC,
    resetCreationFlow,
    resetAll,
} = staffAdvanceSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectEmpList           = (s) => s.staffadvance.empList;
export const selectEmpCC             = (s) => s.staffadvance.empCC;
export const selectSaveStatus        = (s) => s.staffadvance.saveStatus;
export const selectSaveError         = (s) => s.staffadvance.errors.save;
export const selectSaveLoading       = (s) => s.staffadvance.loading.save;

export const selectVerifyInbox       = (s) => s.staffadvance.verifyInbox;
export const selectSelectedTransNo   = (s) => s.staffadvance.selectedTransNo;
export const selectAdvanceDetail     = (s) => s.staffadvance.advanceDetail;
export const selectAdvanceDetailLoading = (s) => s.staffadvance.loading.advanceDetail;
export const selectVerifyInboxLoading   = (s) => s.staffadvance.loading.verifyInbox;

export const selectApproveStatus     = (s) => s.staffadvance.approveStatus;
export const selectApproveError      = (s) => s.staffadvance.errors.approve;
export const selectApproveLoading    = (s) => s.staffadvance.loading.approve;

export const selectPaymentStatus     = (s) => s.staffadvance.paymentStatus;
export const selectPaymentError      = (s) => s.staffadvance.errors.payment;
export const selectPaymentLoading    = (s) => s.staffadvance.loading.payment;

export const selectEmpListLoading    = (s) => s.staffadvance.loading.empList;
export const selectEmpCCLoading      = (s) => s.staffadvance.loading.empCC;

export default staffAdvanceSlice.reducer;
