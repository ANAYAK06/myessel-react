import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerificationAdvancePeyments,
    getVerificationAdvancePaybyId,
    approveAdvancePayment,
    getAdvancePaybyId,
    updateClientAdvancePayment,
    getClientDeductions,
} from '../../api/AccountsAPI/advancePaymentVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchAPVList = createAsyncThunk(
    'advancePaymentVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getVerificationAdvancePeyments(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchAPVDetail = createAsyncThunk(
    'advancePaymentVerification/fetchDetail',
    async (transactionId, { rejectWithValue }) => {
        try {
            const res = await getVerificationAdvancePaybyId(transactionId);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchAPVDeductions = createAsyncThunk(
    'advancePaymentVerification/fetchDeductions',
    async (transRefno, { rejectWithValue }) => {
        try {
            const res = await getClientDeductions(transRefno);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchAPVEditDetail = createAsyncThunk(
    'advancePaymentVerification/fetchEditDetail',
    async (transactionId, { rejectWithValue }) => {
        try {
            const res = await getAdvancePaybyId(transactionId);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveAPV = createAsyncThunk(
    'advancePaymentVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveAdvancePayment(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const updateAPV = createAsyncThunk(
    'advancePaymentVerification/update',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await updateClientAdvancePayment(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    list:           [],
    detail:         null,
    editDetail:     null,
    deductions:     [],
    approvalResult: null,
    updateResult:   null,
    loading: {
        list: false, detail: false, editDetail: false, deductions: false, approve: false, update: false,
    },
    errors: {
        list: null, detail: null, editDetail: null, deductions: null, approve: null, update: null,
    },
};

const advancePaymentVerificationSlice = createSlice({
    name: 'advancePaymentVerification',
    initialState,
    reducers: {
        clearAPVDetail:        (s) => { s.detail = null; },
        clearAPVEditDetail:    (s) => { s.editDetail = null; },
        clearAPVDeductions:    (s) => { s.deductions = []; },
        clearAPVApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        clearAPVUpdateResult:  (s) => { s.updateResult = null; s.errors.update = null; },
        resetAPVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAPVList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchAPVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchAPVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchAPVDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchAPVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchAPVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(fetchAPVDeductions.pending,   s => { s.loading.deductions = true;  s.errors.deductions = null; })
            .addCase(fetchAPVDeductions.fulfilled, (s, a) => { s.loading.deductions = false; s.deductions = a.payload; })
            .addCase(fetchAPVDeductions.rejected,  (s, a) => { s.loading.deductions = false; s.errors.deductions = a.payload; s.deductions = []; });

        builder
            .addCase(fetchAPVEditDetail.pending,   s => { s.loading.editDetail = true;  s.errors.editDetail = null; s.editDetail = null; })
            .addCase(fetchAPVEditDetail.fulfilled, (s, a) => { s.loading.editDetail = false; s.editDetail = a.payload; })
            .addCase(fetchAPVEditDetail.rejected,  (s, a) => { s.loading.editDetail = false; s.errors.editDetail = a.payload; });

        builder
            .addCase(approveAPV.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveAPV.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveAPV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });

        builder
            .addCase(updateAPV.pending,   s => { s.loading.update = true;  s.errors.update = null; })
            .addCase(updateAPV.fulfilled, (s, a) => { s.loading.update = false; s.updateResult = a.payload; })
            .addCase(updateAPV.rejected,  (s, a) => { s.loading.update = false; s.errors.update = a.payload; });
    },
});

export const {
    clearAPVDetail,
    clearAPVEditDetail,
    clearAPVDeductions,
    clearAPVApproveResult,
    clearAPVUpdateResult,
    resetAPVVerification,
} = advancePaymentVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectAPVList           = s => s.advancePaymentVerification.list;
export const selectAPVDetail         = s => s.advancePaymentVerification.detail;
export const selectAPVEditDetail     = s => s.advancePaymentVerification.editDetail;
export const selectAPVDeductions     = s => s.advancePaymentVerification.deductions;
export const selectAPVApprovalResult = s => s.advancePaymentVerification.approvalResult;
export const selectAPVUpdateResult   = s => s.advancePaymentVerification.updateResult;

export const selectAPVListLoading       = s => s.advancePaymentVerification.loading.list;
export const selectAPVDetailLoading     = s => s.advancePaymentVerification.loading.detail;
export const selectAPVEditDetailLoading = s => s.advancePaymentVerification.loading.editDetail;
export const selectAPVDeductionsLoading = s => s.advancePaymentVerification.loading.deductions;
export const selectAPVApproveLoading    = s => s.advancePaymentVerification.loading.approve;
export const selectAPVUpdateLoading     = s => s.advancePaymentVerification.loading.update;

export const selectAPVListError = s => s.advancePaymentVerification.errors.list;

export default advancePaymentVerificationSlice.reducer;
