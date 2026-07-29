import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerificationClientRecievable,
    getVerificationClientRecievablebyTransId,
    getClientDeductions,
    getClientRecievablebyId,
    approveClientRecievable,
    updateClientInvoiceRecievable,
} from '../../api/AccountsAPI/clientRecievableVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCRVList = createAsyncThunk(
    'clientRecievableVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getVerificationClientRecievable(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCRVDetail = createAsyncThunk(
    'clientRecievableVerification/fetchDetail',
    async (transactionId, { rejectWithValue }) => {
        try {
            const res = await getVerificationClientRecievablebyTransId(transactionId);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCRVDeductions = createAsyncThunk(
    'clientRecievableVerification/fetchDeductions',
    async (invoiceNo, { rejectWithValue }) => {
        try {
            const res = await getClientDeductions(invoiceNo);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCRVEditDetail = createAsyncThunk(
    'clientRecievableVerification/fetchEditDetail',
    async (transactionId, { rejectWithValue }) => {
        try {
            const res = await getClientRecievablebyId(transactionId);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveCRV = createAsyncThunk(
    'clientRecievableVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveClientRecievable(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const updateCRV = createAsyncThunk(
    'clientRecievableVerification/update',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await updateClientInvoiceRecievable(payload);
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
        list:       false,
        detail:     false,
        editDetail: false,
        deductions: false,
        approve:    false,
        update:     false,
    },
    errors: {
        list:       null,
        detail:     null,
        editDetail: null,
        deductions: null,
        approve:    null,
        update:     null,
    },
};

const clientRecievableVerificationSlice = createSlice({
    name: 'clientRecievableVerification',
    initialState,
    reducers: {
        clearCRVDetail:        (s) => { s.detail = null; },
        clearCRVEditDetail:    (s) => { s.editDetail = null; },
        clearCRVDeductions:    (s) => { s.deductions = []; },
        clearCRVApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        clearCRVUpdateResult:  (s) => { s.updateResult = null; s.errors.update = null; },
        resetCRVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCRVList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchCRVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchCRVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchCRVDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchCRVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchCRVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(fetchCRVDeductions.pending,   s => { s.loading.deductions = true;  s.errors.deductions = null; })
            .addCase(fetchCRVDeductions.fulfilled, (s, a) => { s.loading.deductions = false; s.deductions = a.payload; })
            .addCase(fetchCRVDeductions.rejected,  (s, a) => { s.loading.deductions = false; s.errors.deductions = a.payload; s.deductions = []; });

        builder
            .addCase(fetchCRVEditDetail.pending,   s => { s.loading.editDetail = true;  s.errors.editDetail = null; s.editDetail = null; })
            .addCase(fetchCRVEditDetail.fulfilled, (s, a) => { s.loading.editDetail = false; s.editDetail = a.payload; })
            .addCase(fetchCRVEditDetail.rejected,  (s, a) => { s.loading.editDetail = false; s.errors.editDetail = a.payload; });

        builder
            .addCase(approveCRV.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveCRV.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveCRV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });

        builder
            .addCase(updateCRV.pending,   s => { s.loading.update = true;  s.errors.update = null; })
            .addCase(updateCRV.fulfilled, (s, a) => { s.loading.update = false; s.updateResult = a.payload; })
            .addCase(updateCRV.rejected,  (s, a) => { s.loading.update = false; s.errors.update = a.payload; });
    },
});

export const {
    clearCRVDetail,
    clearCRVEditDetail,
    clearCRVDeductions,
    clearCRVApproveResult,
    clearCRVUpdateResult,
    resetCRVVerification,
} = clientRecievableVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCRVList           = s => s.clientRecievableVerification.list;
export const selectCRVDetail         = s => s.clientRecievableVerification.detail;
export const selectCRVEditDetail     = s => s.clientRecievableVerification.editDetail;
export const selectCRVDeductions     = s => s.clientRecievableVerification.deductions;
export const selectCRVApprovalResult = s => s.clientRecievableVerification.approvalResult;
export const selectCRVUpdateResult   = s => s.clientRecievableVerification.updateResult;

export const selectCRVListLoading       = s => s.clientRecievableVerification.loading.list;
export const selectCRVDetailLoading     = s => s.clientRecievableVerification.loading.detail;
export const selectCRVEditDetailLoading = s => s.clientRecievableVerification.loading.editDetail;
export const selectCRVDeductionsLoading = s => s.clientRecievableVerification.loading.deductions;
export const selectCRVApproveLoading    = s => s.clientRecievableVerification.loading.approve;
export const selectCRVUpdateLoading     = s => s.clientRecievableVerification.loading.update;

export const selectCRVListError = s => s.clientRecievableVerification.errors.list;

export default clientRecievableVerificationSlice.reducer;
