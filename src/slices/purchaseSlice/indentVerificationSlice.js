import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/PurchaseAPI/indentVerificationAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchIndentInbox = createAsyncThunk(
    'indentVerification/fetchInbox',
    async ({ roleId, created = '', userId = '' }, { rejectWithValue }) => {
        try {
            const res = await api.getIndentVerificationGrid(roleId, created, userId);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch inbox'); }
    }
);

// Returns { MOID, Indentno, Rowid, CCApplicable, IndentTypeDefine, Status }
export const fetchIndentDetail = createAsyncThunk(
    'indentVerification/fetchDetail',
    async ({ indentno, roleId }, { rejectWithValue }) => {
        try {
            const res = await api.getVerificationIndentByCode(indentno, roleId);
            const data = res?.Data;
            return Array.isArray(data) ? data[0] : data;
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch indent detail'); }
    }
);

// Returns { IndentPresentLevel, IndentDefineLevel, NewItemDefineLevel }
export const fetchIndentLevels = createAsyncThunk(
    'indentVerification/fetchLevels',
    async ({ MOID, roleId }, { rejectWithValue }) => {
        try {
            const res = await api.getIndentLevels(MOID, roleId);
            const data = res?.Data;
            return Array.isArray(data) ? data[0] : data;
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch levels'); }
    }
);

export const fetchIndentDefineTypes = createAsyncThunk(
    'indentVerification/fetchDefineTypes',
    async (CCode, { rejectWithValue }) => {
        try {
            const res = await api.getIndentDefineType(CCode);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch define types'); }
    }
);

// CSK role items (PresentLevel == DefineLevel)
export const fetchItemsByCSKRole = createAsyncThunk(
    'indentVerification/fetchItemsCSK',
    async ({ Indent, Role }, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodesByCSKDetails(Indent, Role);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch CSK items'); }
    }
);

// PUM role items (PresentLevel == NewItemDefineLevel)
export const fetchItemsByPUMRole = createAsyncThunk(
    'indentVerification/fetchItemsPUM',
    async ({ Indent, CCCode = '', CType = '' }, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodesByPUMDetails(Indent, CCCode, CType);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch PUM items'); }
    }
);

// All other roles — CC early levels AND higher management levels
export const fetchItemsByOtherRole = createAsyncThunk(
    'indentVerification/fetchItemsOther',
    async ({ Indent, Role }, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodesByOtherDetails(Indent, Role);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch items'); }
    }
);

export const fetchIndentRemarks = createAsyncThunk(
    'indentVerification/fetchRemarks',
    async (Indent, { rejectWithValue }) => {
        try {
            const res = await api.getRemarksByCCDetails(Indent);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch remarks'); }
    }
);

export const fetchIndentSubtotal = createAsyncThunk(
    'indentVerification/fetchSubtotal',
    async (Indent, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodesSubtotalDetails(Indent);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch subtotal'); }
    }
);

export const submitIndentVerification = createAsyncThunk(
    'indentVerification/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.verifyIndent(payload);
            return res?.Data ?? res;
        } catch (err) { return rejectWithValue(err.message || 'Failed to verify indent'); }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    inbox:        [],
    indentDetail: null,   // { MOID, Indentno, Rowid, CCApplicable, IndentTypeDefine, Status }
    levels:       null,   // { IndentPresentLevel, IndentDefineLevel, NewItemDefineLevel }
    items:        [],     // role-specific line items
    remarks:      [],
    subtotal:     [],
    defineTypes:  [],
    approvalResult: null,
    loading: {
        inbox:       false,
        detail:      false,
        levels:      false,
        items:       false,
        remarks:     false,
        subtotal:    false,
        defineTypes: false,
        submit:      false,
    },
    errors: {
        inbox:       null,
        detail:      null,
        levels:      null,
        items:       null,
        remarks:     null,
        subtotal:    null,
        defineTypes: null,
        submit:      null,
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const itemsPending   = (s) => { s.loading.items = true;  s.errors.items = null; s.items = []; };
const itemsFulfilled = (s, a) => { s.loading.items = false; s.items = a.payload; };
const itemsRejected  = (s, a) => { s.loading.items = false; s.errors.items = a.payload; };

// ── Slice ─────────────────────────────────────────────────────────────────────

const indentVerificationSlice = createSlice({
    name: 'indentVerification',
    initialState,
    reducers: {
        clearDetail: (state) => {
            state.indentDetail  = null;
            state.levels        = null;
            state.items         = [];
            state.remarks       = [];
            state.subtotal      = [];
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

        // indent detail
        builder
            .addCase(fetchIndentDetail.pending,   (s) => { s.loading.detail = true;  s.errors.detail = null; })
            .addCase(fetchIndentDetail.fulfilled, (s, a) => { s.loading.detail = false; s.indentDetail = a.payload; })
            .addCase(fetchIndentDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        // levels
        builder
            .addCase(fetchIndentLevels.pending,   (s) => { s.loading.levels = true;  s.errors.levels = null; s.levels = null; })
            .addCase(fetchIndentLevels.fulfilled, (s, a) => { s.loading.levels = false; s.levels = a.payload; })
            .addCase(fetchIndentLevels.rejected,  (s, a) => { s.loading.levels = false; s.errors.levels = a.payload; });

        // define types
        builder
            .addCase(fetchIndentDefineTypes.pending,   (s) => { s.loading.defineTypes = true;  s.errors.defineTypes = null; })
            .addCase(fetchIndentDefineTypes.fulfilled, (s, a) => { s.loading.defineTypes = false; s.defineTypes = a.payload; })
            .addCase(fetchIndentDefineTypes.rejected,  (s, a) => { s.loading.defineTypes = false; s.errors.defineTypes = a.payload; });

        // role-based items — all three thunks write to state.items
        builder
            .addCase(fetchItemsByCSKRole.pending,    itemsPending)
            .addCase(fetchItemsByCSKRole.fulfilled,  itemsFulfilled)
            .addCase(fetchItemsByCSKRole.rejected,   itemsRejected)
            .addCase(fetchItemsByPUMRole.pending,    itemsPending)
            .addCase(fetchItemsByPUMRole.fulfilled,  itemsFulfilled)
            .addCase(fetchItemsByPUMRole.rejected,   itemsRejected)
            .addCase(fetchItemsByOtherRole.pending,   itemsPending)
            .addCase(fetchItemsByOtherRole.fulfilled, itemsFulfilled)
            .addCase(fetchItemsByOtherRole.rejected,  itemsRejected);

        // remarks
        builder
            .addCase(fetchIndentRemarks.pending,   (s) => { s.loading.remarks = true;  s.errors.remarks = null; })
            .addCase(fetchIndentRemarks.fulfilled, (s, a) => { s.loading.remarks = false; s.remarks = a.payload; })
            .addCase(fetchIndentRemarks.rejected,  (s, a) => { s.loading.remarks = false; s.errors.remarks = a.payload; s.remarks = []; });

        // subtotal
        builder
            .addCase(fetchIndentSubtotal.pending,   (s) => { s.loading.subtotal = true;  s.errors.subtotal = null; })
            .addCase(fetchIndentSubtotal.fulfilled, (s, a) => { s.loading.subtotal = false; s.subtotal = a.payload; })
            .addCase(fetchIndentSubtotal.rejected,  (s, a) => { s.loading.subtotal = false; s.errors.subtotal = a.payload; });

        // submit
        builder
            .addCase(submitIndentVerification.pending,   (s) => { s.loading.submit = true;  s.errors.submit = null; })
            .addCase(submitIndentVerification.fulfilled, (s, a) => { s.loading.submit = false; s.approvalResult = a.payload; })
            .addCase(submitIndentVerification.rejected,  (s, a) => { s.loading.submit = false; s.errors.submit = a.payload; });
    },
});

export const { clearDetail, resetAll } = indentVerificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectIndentInbox      = (s) => Array.isArray(s.indentVerification.inbox)       ? s.indentVerification.inbox       : [];
export const selectIndentDetail     = (s) => s.indentVerification.indentDetail;
export const selectIndentLevels     = (s) => s.indentVerification.levels;
export const selectIndentItems      = (s) => Array.isArray(s.indentVerification.items)       ? s.indentVerification.items       : [];
export const selectIndentRemarks    = (s) => Array.isArray(s.indentVerification.remarks)     ? s.indentVerification.remarks     : [];
export const selectIndentSubtotal   = (s) => Array.isArray(s.indentVerification.subtotal)    ? s.indentVerification.subtotal    : [];
export const selectIndentDefineTypes = (s) => Array.isArray(s.indentVerification.defineTypes) ? s.indentVerification.defineTypes : [];
export const selectIndentLoading    = (s) => s.indentVerification.loading;
export const selectIndentErrors     = (s) => s.indentVerification.errors;

// Derives 'CSK' | 'PUM' | 'CC' | 'OTHER' | null from level data
export const selectRoleType = (s) => {
    const lv = s.indentVerification.levels;
    if (!lv) return null;
    const p = lv.IndentPresentLevel;
    const d = lv.IndentDefineLevel;
    const n = lv.NewItemDefineLevel;
    if (!p || !d) return null;
    if (p === d) return 'CSK';
    if (n && p === n) return 'PUM';
    if (p < d) return 'CC';
    return 'OTHER';
};

export default indentVerificationSlice.reducer;
