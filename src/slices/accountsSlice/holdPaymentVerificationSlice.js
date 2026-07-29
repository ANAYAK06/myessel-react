import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerificationholdPeyments,
    getVerificationHoldDetailsbyRefno,
    approveHoldPayment,
    updateClientHoldPayment,
} from '../../api/AccountsAPI/holdPaymentVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchHPVList = createAsyncThunk(
    'holdPaymentVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getVerificationholdPeyments(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchHPVDetail = createAsyncThunk(
    'holdPaymentVerification/fetchDetail',
    async (transRefno, { rejectWithValue }) => {
        try {
            const res = await getVerificationHoldDetailsbyRefno(transRefno);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveHPV = createAsyncThunk(
    'holdPaymentVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveHoldPayment(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const updateHPV = createAsyncThunk(
    'holdPaymentVerification/update',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await updateClientHoldPayment(payload);
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
    approvalResult: null,
    updateResult:   null,
    loading: { list: false, detail: false, approve: false, update: false },
    errors:  { list: null, detail: null, approve: null, update: null },
};

const holdPaymentVerificationSlice = createSlice({
    name: 'holdPaymentVerification',
    initialState,
    reducers: {
        clearHPVDetail:        (s) => { s.detail = null; },
        clearHPVApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        clearHPVUpdateResult:  (s) => { s.updateResult = null; s.errors.update = null; },
        resetHPVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHPVList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchHPVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchHPVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchHPVDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchHPVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchHPVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveHPV.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveHPV.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveHPV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });

        builder
            .addCase(updateHPV.pending,   s => { s.loading.update = true;  s.errors.update = null; })
            .addCase(updateHPV.fulfilled, (s, a) => { s.loading.update = false; s.updateResult = a.payload; })
            .addCase(updateHPV.rejected,  (s, a) => { s.loading.update = false; s.errors.update = a.payload; });
    },
});

export const {
    clearHPVDetail,
    clearHPVApproveResult,
    clearHPVUpdateResult,
    resetHPVVerification,
} = holdPaymentVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectHPVList           = s => s.holdPaymentVerification.list;
export const selectHPVDetail         = s => s.holdPaymentVerification.detail;
export const selectHPVApprovalResult = s => s.holdPaymentVerification.approvalResult;
export const selectHPVUpdateResult   = s => s.holdPaymentVerification.updateResult;

export const selectHPVListLoading    = s => s.holdPaymentVerification.loading.list;
export const selectHPVDetailLoading  = s => s.holdPaymentVerification.loading.detail;
export const selectHPVApproveLoading = s => s.holdPaymentVerification.loading.approve;
export const selectHPVUpdateLoading  = s => s.holdPaymentVerification.loading.update;

export const selectHPVListError = s => s.holdPaymentVerification.errors.list;

export default holdPaymentVerificationSlice.reducer;
