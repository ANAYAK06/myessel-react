import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/empBankChangeAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchEmployeeBanks = createAsyncThunk(
    'empBankChange/fetchEmployeeBanks',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getEmployeeBanks();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch banks list');
        }
    }
);

export const fetchEmpBankDetails = createAsyncThunk(
    'empBankChange/fetchBankDetails',
    async ({ empRefNo }, { rejectWithValue }) => {
        try {
            const res = await api.getEmpBankDetails({ empRefNo });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch bank details');
        }
    }
);

export const submitEmpBankChange = createAsyncThunk(
    'empBankChange/submit',
    async (bankData, { rejectWithValue }) => {
        try {
            const res = await api.editEmpBank(bankData);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit bank change');
        }
    }
);

export const fetchVerifyEmpBankChange = createAsyncThunk(
    'empBankChange/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getVerifyEmpBankChange({ roleId });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inbox');
        }
    }
);

export const fetchEmpBankChangeById = createAsyncThunk(
    'empBankChange/fetchDetail',
    async ({ empRefNo, id }, { rejectWithValue }) => {
        try {
            const res = await api.getEmpBankChangeById({ empRefNo, id });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch bank change details');
        }
    }
);

export const approveEmpBankChange = createAsyncThunk(
    'empBankChange/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.approveEmpBankChange(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to process approval');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    employeeBanks: [],
    currentBankDetails: null,
    submitResult: null,

    inbox: [],
    changeDetail: null,
    approvalResult: null,

    loading: {
        employeeBanks: false,
        bankDetails: false,
        submit: false,
        inbox: false,
        detail: false,
        approval: false,
    },
    errors: {
        employeeBanks: null,
        bankDetails: null,
        submit: null,
        inbox: null,
        detail: null,
        approval: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const empBankChangeSlice = createSlice({
    name: 'empBankChange',
    initialState,
    reducers: {
        clearBankDetails: (state) => {
            state.currentBankDetails = null;
        },
        clearSubmitResult: (state) => {
            state.submitResult = null;
            state.errors.submit = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
            state.errors.approval = null;
        },
        resetChangeDetail: (state) => {
            state.changeDetail = null;
            state.approvalResult = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {
        // employee banks list
        builder
            .addCase(fetchEmployeeBanks.pending, (s) => {
                s.loading.employeeBanks = true; s.errors.employeeBanks = null;
            })
            .addCase(fetchEmployeeBanks.fulfilled, (s, a) => {
                s.loading.employeeBanks = false; s.employeeBanks = a.payload;
            })
            .addCase(fetchEmployeeBanks.rejected, (s, a) => {
                s.loading.employeeBanks = false; s.errors.employeeBanks = a.payload;
            });

        // bank details
        builder
            .addCase(fetchEmpBankDetails.pending, (s) => {
                s.loading.bankDetails = true; s.errors.bankDetails = null;
                s.currentBankDetails = null;
            })
            .addCase(fetchEmpBankDetails.fulfilled, (s, a) => {
                s.loading.bankDetails = false; s.currentBankDetails = a.payload;
            })
            .addCase(fetchEmpBankDetails.rejected, (s, a) => {
                s.loading.bankDetails = false; s.errors.bankDetails = a.payload;
            });

        // submit
        builder
            .addCase(submitEmpBankChange.pending, (s) => {
                s.loading.submit = true; s.errors.submit = null; s.submitResult = null;
            })
            .addCase(submitEmpBankChange.fulfilled, (s, a) => {
                s.loading.submit = false; s.submitResult = a.payload;
            })
            .addCase(submitEmpBankChange.rejected, (s, a) => {
                s.loading.submit = false; s.errors.submit = a.payload;
            });

        // inbox
        builder
            .addCase(fetchVerifyEmpBankChange.pending, (s) => {
                s.loading.inbox = true; s.errors.inbox = null;
            })
            .addCase(fetchVerifyEmpBankChange.fulfilled, (s, a) => {
                s.loading.inbox = false; s.inbox = a.payload;
            })
            .addCase(fetchVerifyEmpBankChange.rejected, (s, a) => {
                s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = [];
            });

        // detail
        builder
            .addCase(fetchEmpBankChangeById.pending, (s) => {
                s.loading.detail = true; s.errors.detail = null; s.changeDetail = null;
            })
            .addCase(fetchEmpBankChangeById.fulfilled, (s, a) => {
                s.loading.detail = false; s.changeDetail = a.payload;
            })
            .addCase(fetchEmpBankChangeById.rejected, (s, a) => {
                s.loading.detail = false; s.errors.detail = a.payload;
            });

        // approval
        builder
            .addCase(approveEmpBankChange.pending, (s) => {
                s.loading.approval = true; s.errors.approval = null;
            })
            .addCase(approveEmpBankChange.fulfilled, (s, a) => {
                s.loading.approval = false; s.approvalResult = a.payload;
            })
            .addCase(approveEmpBankChange.rejected, (s, a) => {
                s.loading.approval = false; s.errors.approval = a.payload;
            });
    },
});

export const {
    clearBankDetails,
    clearSubmitResult,
    clearApprovalResult,
    resetChangeDetail,
    resetAll,
} = empBankChangeSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectEmployeeBanks  = (s) => Array.isArray(s.empBankChange.employeeBanks) ? s.empBankChange.employeeBanks : [];
export const selectCurrentBank    = (s) => s.empBankChange.currentBankDetails;
export const selectSubmitResult   = (s) => s.empBankChange.submitResult;
export const selectInbox          = (s) => Array.isArray(s.empBankChange.inbox) ? s.empBankChange.inbox : [];
export const selectChangeDetail   = (s) => s.empBankChange.changeDetail;
export const selectApprovalResult = (s) => s.empBankChange.approvalResult;

export const selectLoading = (s) => s.empBankChange.loading;
export const selectErrors  = (s) => s.empBankChange.errors;

export default empBankChangeSlice.reducer;
