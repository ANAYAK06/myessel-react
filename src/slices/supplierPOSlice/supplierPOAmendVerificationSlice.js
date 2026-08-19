import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerifySupplierPOAmend,
    getSupplierPOAmendByPO,
    approveSupplierPOAmend as approveSupplierPOAmendAPI,
    getPOUploadedDocs,
} from '../../api/PurchaseAPI/supplierPOAmendVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchSupplierPOAmendList = createAsyncThunk(
    'supplierPOAmendVerification/fetchList',
    async ({ roleId, userId, ccType }, { rejectWithValue }) => {
        try {
            const res = await getVerifySupplierPOAmend(roleId, userId, ccType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchSupplierPOAmendDetail = createAsyncThunk(
    'supplierPOAmendVerification/fetchDetail',
    async ({ amendPONO, poNo, indentNo }, { rejectWithValue }) => {
        try {
            const res = await getSupplierPOAmendByPO(amendPONO, poNo, indentNo);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveSupplierPOAmend = createAsyncThunk(
    'supplierPOAmendVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveSupplierPOAmendAPI(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchSupplierPOAmendUploadedDocs = createAsyncThunk(
    'supplierPOAmendVerification/fetchUploadedDocs',
    async ({ poNo, forType }, { rejectWithValue }) => {
        try {
            const res = await getPOUploadedDocs(poNo, forType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    list:           [],
    detail:         null,
    uploadedDocs:   [],
    approvalResult: null,
    loading: {
        list:    false,
        detail:  false,
        approve: false,
        docs:    false,
    },
    errors: {
        list:    null,
        detail:  null,
        approve: null,
        docs:    null,
    },
};

const supplierPOAmendVerificationSlice = createSlice({
    name: 'supplierPOAmendVerification',
    initialState,
    reducers: {
        clearSupplierPOAmendDetail:        (s) => { s.detail = null; },
        clearSupplierPOAmendUploadedDocs:  (s) => { s.uploadedDocs = []; },
        clearSupplierPOAmendApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        resetSupplierPOAmendVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSupplierPOAmendList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchSupplierPOAmendList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchSupplierPOAmendList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchSupplierPOAmendDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchSupplierPOAmendDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchSupplierPOAmendDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveSupplierPOAmend.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveSupplierPOAmend.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveSupplierPOAmend.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });

        builder
            .addCase(fetchSupplierPOAmendUploadedDocs.pending,   s => { s.loading.docs = true;  s.errors.docs = null; })
            .addCase(fetchSupplierPOAmendUploadedDocs.fulfilled, (s, a) => { s.loading.docs = false; s.uploadedDocs = a.payload; })
            .addCase(fetchSupplierPOAmendUploadedDocs.rejected,  (s, a) => { s.loading.docs = false; s.errors.docs = a.payload; s.uploadedDocs = []; });
    },
});

export const {
    clearSupplierPOAmendDetail,
    clearSupplierPOAmendUploadedDocs,
    clearSupplierPOAmendApproveResult,
    resetSupplierPOAmendVerification,
} = supplierPOAmendVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectSupplierPOAmendList          = s => s.supplierPOAmendVerification.list;
export const selectSupplierPOAmendDetail        = s => s.supplierPOAmendVerification.detail;
export const selectSupplierPOAmendUploadedDocs  = s => s.supplierPOAmendVerification.uploadedDocs;
export const selectSupplierPOAmendApproveResult = s => s.supplierPOAmendVerification.approvalResult;

export const selectSupplierPOAmendListLoading    = s => s.supplierPOAmendVerification.loading.list;
export const selectSupplierPOAmendDetailLoading  = s => s.supplierPOAmendVerification.loading.detail;
export const selectSupplierPOAmendApproveLoading = s => s.supplierPOAmendVerification.loading.approve;
export const selectSupplierPOAmendDocsLoading    = s => s.supplierPOAmendVerification.loading.docs;

export const selectSupplierPOAmendListError = s => s.supplierPOAmendVerification.errors.list;

export default supplierPOAmendVerificationSlice.reducer;
