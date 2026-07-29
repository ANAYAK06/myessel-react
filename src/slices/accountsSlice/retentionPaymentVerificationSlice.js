import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerificationRetentionPeyments,
    getTransactionInvoicebyRefno,
    getVerificationRetentionDetailsbyRefno,
    approveRetentionPayment,
    updateClientRetentionPayment,
} from '../../api/AccountsAPI/retentionPaymentVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchRPVList = createAsyncThunk(
    'retentionPaymentVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getVerificationRetentionPeyments(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchRPVDetail = createAsyncThunk(
    'retentionPaymentVerification/fetchDetail',
    async (transRefno, { rejectWithValue }) => {
        try {
            const res = await getVerificationRetentionDetailsbyRefno(transRefno);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchRPVInvoices = createAsyncThunk(
    'retentionPaymentVerification/fetchInvoices',
    async (transRefno, { rejectWithValue }) => {
        try {
            const res = await getTransactionInvoicebyRefno(transRefno);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveRPV = createAsyncThunk(
    'retentionPaymentVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveRetentionPayment(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const updateRPV = createAsyncThunk(
    'retentionPaymentVerification/update',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await updateClientRetentionPayment(payload);
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
    invoices:       [],
    approvalResult: null,
    updateResult:   null,
    loading: { list: false, detail: false, invoices: false, approve: false, update: false },
    errors:  { list: null, detail: null, invoices: null, approve: null, update: null },
};

const retentionPaymentVerificationSlice = createSlice({
    name: 'retentionPaymentVerification',
    initialState,
    reducers: {
        clearRPVDetail:        (s) => { s.detail = null; },
        clearRPVInvoices:      (s) => { s.invoices = []; },
        clearRPVApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        clearRPVUpdateResult:  (s) => { s.updateResult = null; s.errors.update = null; },
        resetRPVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRPVList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchRPVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchRPVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchRPVDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchRPVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchRPVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(fetchRPVInvoices.pending,   s => { s.loading.invoices = true;  s.errors.invoices = null; })
            .addCase(fetchRPVInvoices.fulfilled, (s, a) => { s.loading.invoices = false; s.invoices = a.payload; })
            .addCase(fetchRPVInvoices.rejected,  (s, a) => { s.loading.invoices = false; s.errors.invoices = a.payload; s.invoices = []; });

        builder
            .addCase(approveRPV.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveRPV.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveRPV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });

        builder
            .addCase(updateRPV.pending,   s => { s.loading.update = true;  s.errors.update = null; })
            .addCase(updateRPV.fulfilled, (s, a) => { s.loading.update = false; s.updateResult = a.payload; })
            .addCase(updateRPV.rejected,  (s, a) => { s.loading.update = false; s.errors.update = a.payload; });
    },
});

export const {
    clearRPVDetail,
    clearRPVInvoices,
    clearRPVApproveResult,
    clearRPVUpdateResult,
    resetRPVVerification,
} = retentionPaymentVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectRPVList           = s => s.retentionPaymentVerification.list;
export const selectRPVDetail         = s => s.retentionPaymentVerification.detail;
export const selectRPVInvoices       = s => s.retentionPaymentVerification.invoices;
export const selectRPVApprovalResult = s => s.retentionPaymentVerification.approvalResult;
export const selectRPVUpdateResult   = s => s.retentionPaymentVerification.updateResult;

export const selectRPVListLoading     = s => s.retentionPaymentVerification.loading.list;
export const selectRPVDetailLoading   = s => s.retentionPaymentVerification.loading.detail;
export const selectRPVInvoicesLoading = s => s.retentionPaymentVerification.loading.invoices;
export const selectRPVApproveLoading  = s => s.retentionPaymentVerification.loading.approve;
export const selectRPVUpdateLoading   = s => s.retentionPaymentVerification.loading.update;

export const selectRPVListError = s => s.retentionPaymentVerification.errors.list;

export default retentionPaymentVerificationSlice.reducer;
