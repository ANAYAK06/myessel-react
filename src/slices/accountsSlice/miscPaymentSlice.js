import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getMiscPaymentRefnos,
    viewMiscPaymentDetails,
    saveMiscPayment,
} from '../../api/AccountsAPI/miscPaymentAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchMiscPaymentRefnos = createAsyncThunk(
    'miscPayment/fetchRefnos',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMiscPaymentRefnos();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscPaymentDetail = createAsyncThunk(
    'miscPayment/fetchDetail',
    async (tranRefno, { rejectWithValue }) => {
        try {
            const res = await viewMiscPaymentDetails(tranRefno);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitMiscPayment = createAsyncThunk(
    'miscPayment/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveMiscPayment(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    refnos:      [],
    detail:      null,
    saveResult:  null,
    saveStatus:  null, // null | 'pending' | 'success' | 'failed'
    loading: {
        refnos: false,
        detail: false,
        save:   false,
    },
    errors: {
        refnos: null,
        detail: null,
        save:   null,
    },
};

const miscPaymentSlice = createSlice({
    name: 'miscPayment',
    initialState,
    reducers: {
        clearMiscPaymentDetail: (s) => { s.detail = null; s.errors.detail = null; },
        clearMiscPaymentSaveResult: (s) => { s.saveResult = null; s.saveStatus = null; s.errors.save = null; },
        resetMiscPayment: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMiscPaymentRefnos.pending,   (s) => { s.loading.refnos = true;  s.errors.refnos = null; })
            .addCase(fetchMiscPaymentRefnos.fulfilled, (s, a) => { s.loading.refnos = false; s.refnos = a.payload; })
            .addCase(fetchMiscPaymentRefnos.rejected,  (s, a) => { s.loading.refnos = false; s.errors.refnos = a.payload; s.refnos = []; });

        builder
            .addCase(fetchMiscPaymentDetail.pending,   (s) => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchMiscPaymentDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchMiscPaymentDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(submitMiscPayment.pending,   (s) => { s.loading.save = true;  s.errors.save = null; s.saveStatus = 'pending'; })
            .addCase(submitMiscPayment.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult   = a.payload;
                const raw = (typeof a.payload === 'string' ? a.payload : (a.payload?.Message || '')) || '';
                const ok  = raw.toLowerCase().includes('success');
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.errors.save = raw || 'Save failed';
            })
            .addCase(submitMiscPayment.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearMiscPaymentDetail,
    clearMiscPaymentSaveResult,
    resetMiscPayment,
} = miscPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectMiscPaymentRefnos      = (s) => s.miscPayment.refnos;
export const selectMiscPaymentDetail      = (s) => s.miscPayment.detail;
export const selectMiscPaymentSaveResult  = (s) => s.miscPayment.saveResult;
export const selectMiscPaymentSaveStatus  = (s) => s.miscPayment.saveStatus;

export const selectMiscPaymentRefnosLoading = (s) => s.miscPayment.loading.refnos;
export const selectMiscPaymentDetailLoading = (s) => s.miscPayment.loading.detail;
export const selectMiscPaymentSaveLoading   = (s) => s.miscPayment.loading.save;

export const selectMiscPaymentRefnosError = (s) => s.miscPayment.errors.refnos;
export const selectMiscPaymentDetailError = (s) => s.miscPayment.errors.detail;
export const selectMiscPaymentSaveError   = (s) => s.miscPayment.errors.save;

export default miscPaymentSlice.reducer;
