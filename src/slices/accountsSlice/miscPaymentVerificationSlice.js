import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerifyMiscPaymentList,
    getVerifyMiscPaymentView,
    approveMiscPayment,
} from '../../api/AccountsAPI/miscPaymentVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchMPVList = createAsyncThunk(
    'miscPaymentVerification/fetchList',
    async ({ roleId, uid, pType }, { rejectWithValue }) => {
        try {
            const res = await getVerifyMiscPaymentList({ roleId, uid, pType });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMPVDetail = createAsyncThunk(
    'miscPaymentVerification/fetchDetail',
    async (refNo, { rejectWithValue }) => {
        try {
            const res = await getVerifyMiscPaymentView(refNo);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveMPV = createAsyncThunk(
    'miscPaymentVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveMiscPayment(payload);
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
    approveResult:  null,
    loading: {
        list:    false,
        detail:  false,
        approve: false,
    },
    errors: {
        list:    null,
        detail:  null,
        approve: null,
    },
};

const miscPaymentVerificationSlice = createSlice({
    name: 'miscPaymentVerification',
    initialState,
    reducers: {
        clearMPVDetail:        (s) => { s.detail = null; s.errors.detail = null; },
        clearMPVApproveResult: (s) => { s.approveResult = null; s.errors.approve = null; },
        resetMPVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMPVList.pending,   (s) => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchMPVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchMPVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchMPVDetail.pending,   (s) => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchMPVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchMPVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveMPV.pending,   (s) => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveMPV.fulfilled, (s, a) => { s.loading.approve = false; s.approveResult = a.payload; })
            .addCase(approveMPV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });
    },
});

export const {
    clearMPVDetail,
    clearMPVApproveResult,
    resetMPVVerification,
} = miscPaymentVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectMPVList          = (s) => s.miscPaymentVerification.list;
export const selectMPVDetail        = (s) => s.miscPaymentVerification.detail;
export const selectMPVApproveResult = (s) => s.miscPaymentVerification.approveResult;

export const selectMPVListLoading    = (s) => s.miscPaymentVerification.loading.list;
export const selectMPVDetailLoading  = (s) => s.miscPaymentVerification.loading.detail;
export const selectMPVApproveLoading = (s) => s.miscPaymentVerification.loading.approve;

export const selectMPVListError = (s) => s.miscPaymentVerification.errors.list;

export default miscPaymentVerificationSlice.reducer;
