import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/PurchaseAPI/indentVerificationAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchIndentInbox = createAsyncThunk(
    'indentVerification/fetchInbox',
    async ({ roleId, created, userId }, { rejectWithValue }) => {
        try {
            const res = await api.getIndentVerificationGrid(roleId, created, userId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch indent inbox');
        }
    }
);

export const fetchIndentItems = createAsyncThunk(
    'indentVerification/fetchItems',
    async (indno, { rejectWithValue }) => {
        try {
            const res = await api.viewIndentItemsDetails(indno);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch indent items');
        }
    }
);

export const fetchIndentRemarks = createAsyncThunk(
    'indentVerification/fetchRemarks',
    async (indno, { rejectWithValue }) => {
        try {
            const res = await api.viewIndentRemarks(indno);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch indent remarks');
        }
    }
);

export const submitIndentVerification = createAsyncThunk(
    'indentVerification/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.verifyIndent(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to verify indent');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    inbox: [],
    items: [],
    remarks: [],
    approvalResult: null,
    loading: {
        inbox: false,
        items: false,
        remarks: false,
        submit: false,
    },
    errors: {
        inbox: null,
        items: null,
        remarks: null,
        submit: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const indentVerificationSlice = createSlice({
    name: 'indentVerification',
    initialState,
    reducers: {
        clearDetail: (state) => {
            state.items = [];
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
            .addCase(fetchIndentInbox.pending,    (s) => { s.loading.inbox = true;  s.errors.inbox = null; })
            .addCase(fetchIndentInbox.fulfilled,  (s, a) => { s.loading.inbox = false; s.inbox = a.payload; })
            .addCase(fetchIndentInbox.rejected,   (s, a) => { s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = []; });

        // items
        builder
            .addCase(fetchIndentItems.pending,    (s) => { s.loading.items = true;  s.errors.items = null; s.items = []; })
            .addCase(fetchIndentItems.fulfilled,  (s, a) => { s.loading.items = false; s.items = a.payload; })
            .addCase(fetchIndentItems.rejected,   (s, a) => { s.loading.items = false; s.errors.items = a.payload; });

        // remarks
        builder
            .addCase(fetchIndentRemarks.pending,   (s) => { s.loading.remarks = true;  s.errors.remarks = null; })
            .addCase(fetchIndentRemarks.fulfilled, (s, a) => { s.loading.remarks = false; s.remarks = a.payload; })
            .addCase(fetchIndentRemarks.rejected,  (s, a) => { s.loading.remarks = false; s.errors.remarks = a.payload; s.remarks = []; });

        // submit
        builder
            .addCase(submitIndentVerification.pending,   (s) => { s.loading.submit = true;  s.errors.submit = null; })
            .addCase(submitIndentVerification.fulfilled, (s, a) => { s.loading.submit = false; s.approvalResult = a.payload; })
            .addCase(submitIndentVerification.rejected,  (s, a) => { s.loading.submit = false; s.errors.submit = a.payload; });
    },
});

export const { clearDetail, clearApprovalResult, resetAll } = indentVerificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectIndentInbox   = (s) => Array.isArray(s.indentVerification.inbox)   ? s.indentVerification.inbox   : [];
export const selectIndentItems   = (s) => Array.isArray(s.indentVerification.items)   ? s.indentVerification.items   : [];
export const selectIndentRemarks = (s) => Array.isArray(s.indentVerification.remarks) ? s.indentVerification.remarks : [];
export const selectIndentApprovalResult = (s) => s.indentVerification.approvalResult;
export const selectIndentLoading = (s) => s.indentVerification.loading;
export const selectIndentErrors  = (s) => s.indentVerification.errors;

export default indentVerificationSlice.reducer;
