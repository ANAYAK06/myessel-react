import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getMiscVerificationList,
    getMiscVerificationById,
    verifyMiscInvoice,
    updateMiscInvoice,
} from '../../api/AccountsAPI/miscInvoiceVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchMiscVerificationList = createAsyncThunk(
    'miscInvoiceVerification/fetchList',
    async ({ roleId, type }, { rejectWithValue }) => {
        try {
            const res = await getMiscVerificationList({ roleId, type });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscVerificationById = createAsyncThunk(
    'miscInvoiceVerification/fetchById',
    async (refNo, { rejectWithValue }) => {
        try {
            const res = await getMiscVerificationById(refNo);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const verifyMisc = createAsyncThunk(
    'miscInvoiceVerification/verify',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await verifyMiscInvoice(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const updateMisc = createAsyncThunk(
    'miscInvoiceVerification/update',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await updateMiscInvoice(payload);
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
    selectedRefNo:  null,
    loading: {
        list:   false,
        detail: false,
        verify: false,
        update: false,
    },
    errors: {
        list:   null,
        detail: null,
        verify: null,
        update: null,
    },
};

const miscInvoiceVerificationSlice = createSlice({
    name: 'miscInvoiceVerification',
    initialState,
    reducers: {
        setMiscSelectedRefNo:  (s, a) => { s.selectedRefNo = a.payload; },
        clearMiscDetail:       (s) => { s.detail = null; },
        clearMiscVerifyResult: (s) => { s.approvalResult = null; s.errors.verify = null; },
        clearMiscUpdateResult: (s) => { s.updateResult = null; s.errors.update = null; },
        resetMiscVerification: () => initialState,
    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchMiscVerificationList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchMiscVerificationList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchMiscVerificationList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchMiscVerificationById.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchMiscVerificationById.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchMiscVerificationById.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(verifyMisc.pending,   s => { s.loading.verify = true;  s.errors.verify = null; })
            .addCase(verifyMisc.fulfilled, (s, a) => { s.loading.verify = false; s.approvalResult = a.payload; })
            .addCase(verifyMisc.rejected,  (s, a) => { s.loading.verify = false; s.errors.verify = a.payload; });

        builder
            .addCase(updateMisc.pending,   s => { s.loading.update = true;  s.errors.update = null; })
            .addCase(updateMisc.fulfilled, (s, a) => { s.loading.update = false; s.updateResult = a.payload; })
            .addCase(updateMisc.rejected,  (s, a) => { s.loading.update = false; s.errors.update = a.payload; });
    },
});

export const {
    setMiscSelectedRefNo,
    clearMiscDetail,
    clearMiscVerifyResult,
    clearMiscUpdateResult,
    resetMiscVerification,
} = miscInvoiceVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectMiscVerificationList = s => s.miscInvoiceVerification.list;
export const selectMiscDetail           = s => s.miscInvoiceVerification.detail;
export const selectMiscApprovalResult   = s => s.miscInvoiceVerification.approvalResult;
export const selectMiscUpdateResult     = s => s.miscInvoiceVerification.updateResult;
export const selectMiscSelectedRefNo    = s => s.miscInvoiceVerification.selectedRefNo;

export const selectMiscListLoading   = s => s.miscInvoiceVerification.loading.list;
export const selectMiscDetailLoading = s => s.miscInvoiceVerification.loading.detail;
export const selectMiscVerifyLoading = s => s.miscInvoiceVerification.loading.verify;
export const selectMiscUpdateLoading = s => s.miscInvoiceVerification.loading.update;

export const selectMiscListError   = s => s.miscInvoiceVerification.errors.list;
export const selectMiscDetailError = s => s.miscInvoiceVerification.errors.detail;
export const selectMiscVerifyError = s => s.miscInvoiceVerification.errors.verify;
export const selectMiscUpdateError = s => s.miscInvoiceVerification.errors.update;

export default miscInvoiceVerificationSlice.reducer;
