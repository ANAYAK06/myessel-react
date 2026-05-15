import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/PurchaseAPI/itemCodeVerificationAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchItemCodeInbox = createAsyncThunk(
    'itemCodeVerification/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodeVerificationGrid(roleId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inbox');
        }
    }
);

export const fetchItemCodeDetail = createAsyncThunk(
    'itemCodeVerification/fetchDetail',
    async (rowid, { rejectWithValue }) => {
        try {
            const res = await api.getVerificationItemCodeById(rowid);
            return res?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch item code detail');
        }
    }
);

export const submitItemCodeVerification = createAsyncThunk(
    'itemCodeVerification/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.verifyItemCode(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to verify item code');
        }
    }
);

export const fetchItemCodeTraders = createAsyncThunk(
    'itemCodeVerification/fetchTraders',
    async (tranNo, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodeTradersGrid(tranNo);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch traders');
        }
    }
);

export const fetchItemCodeLinks = createAsyncThunk(
    'itemCodeVerification/fetchLinks',
    async (tranNo, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodeLinkDataGrid(tranNo);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch link data');
        }
    }
);

export const fetchItemCodeRemarks = createAsyncThunk(
    'itemCodeVerification/fetchRemarks',
    async (tranNo, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodeRemarks(tranNo);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch remarks');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    inbox: [],
    detail: null,
    traders: [],
    links: [],
    remarks: [],
    approvalResult: null,
    loading: {
        inbox: false,
        detail: false,
        submit: false,
        traders: false,
        links: false,
        remarks: false,
    },
    errors: {
        inbox: null,
        detail: null,
        submit: null,
        traders: null,
        links: null,
        remarks: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const itemCodeVerificationSlice = createSlice({
    name: 'itemCodeVerification',
    initialState,
    reducers: {
        clearDetail: (state) => {
            state.detail = null;
            state.traders = [];
            state.links = [];
            state.remarks = [];
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
            state.errors.submit = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {
        // inbox
        builder
            .addCase(fetchItemCodeInbox.pending, (s) => { s.loading.inbox = true; s.errors.inbox = null; })
            .addCase(fetchItemCodeInbox.fulfilled, (s, a) => { s.loading.inbox = false; s.inbox = a.payload; })
            .addCase(fetchItemCodeInbox.rejected, (s, a) => { s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = []; });

        // detail
        builder
            .addCase(fetchItemCodeDetail.pending, (s) => { s.loading.detail = true; s.errors.detail = null; s.detail = null; })
            .addCase(fetchItemCodeDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchItemCodeDetail.rejected, (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        // submit
        builder
            .addCase(submitItemCodeVerification.pending, (s) => { s.loading.submit = true; s.errors.submit = null; })
            .addCase(submitItemCodeVerification.fulfilled, (s, a) => { s.loading.submit = false; s.approvalResult = a.payload; })
            .addCase(submitItemCodeVerification.rejected, (s, a) => { s.loading.submit = false; s.errors.submit = a.payload; });

        // traders
        builder
            .addCase(fetchItemCodeTraders.pending, (s) => { s.loading.traders = true; s.errors.traders = null; })
            .addCase(fetchItemCodeTraders.fulfilled, (s, a) => { s.loading.traders = false; s.traders = a.payload; })
            .addCase(fetchItemCodeTraders.rejected, (s, a) => { s.loading.traders = false; s.errors.traders = a.payload; s.traders = []; });

        // links
        builder
            .addCase(fetchItemCodeLinks.pending, (s) => { s.loading.links = true; s.errors.links = null; })
            .addCase(fetchItemCodeLinks.fulfilled, (s, a) => { s.loading.links = false; s.links = a.payload; })
            .addCase(fetchItemCodeLinks.rejected, (s, a) => { s.loading.links = false; s.errors.links = a.payload; s.links = []; });

        // remarks
        builder
            .addCase(fetchItemCodeRemarks.pending, (s) => { s.loading.remarks = true; s.errors.remarks = null; })
            .addCase(fetchItemCodeRemarks.fulfilled, (s, a) => { s.loading.remarks = false; s.remarks = a.payload; })
            .addCase(fetchItemCodeRemarks.rejected, (s, a) => { s.loading.remarks = false; s.errors.remarks = a.payload; s.remarks = []; });
    },
});

export const { clearDetail, clearApprovalResult, resetAll } = itemCodeVerificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectItemCodeInbox   = (s) => Array.isArray(s.itemCodeVerification.inbox) ? s.itemCodeVerification.inbox : [];
export const selectItemCodeDetail  = (s) => s.itemCodeVerification.detail;
export const selectItemCodeTraders = (s) => Array.isArray(s.itemCodeVerification.traders) ? s.itemCodeVerification.traders : [];
export const selectItemCodeLinks   = (s) => Array.isArray(s.itemCodeVerification.links) ? s.itemCodeVerification.links : [];
export const selectItemCodeRemarks = (s) => Array.isArray(s.itemCodeVerification.remarks) ? s.itemCodeVerification.remarks : [];
export const selectApprovalResult  = (s) => s.itemCodeVerification.approvalResult;
export const selectICLoading       = (s) => s.itemCodeVerification.loading;
export const selectICErrors        = (s) => s.itemCodeVerification.errors;

export default itemCodeVerificationSlice.reducer;
