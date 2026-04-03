import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/generalInvoicePaymentAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchGenInvList = createAsyncThunk(
    'genInvPayment/fetchList',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await api.getGeneralInvoiceList(ccCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch invoice list');
        }
    }
);

export const fetchGenInvDetail = createAsyncThunk(
    'genInvPayment/fetchDetail',
    async (invNo, { rejectWithValue }) => {
        try {
            const res = await api.getGeneralInvoiceByNo(invNo);
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch invoice detail');
        }
    }
);

export const submitGenInvBankPayment = createAsyncThunk(
    'genInvPayment/submit',
    async (payload, { rejectWithValue }) => {
        try {
            return await api.saveGenInvBankPayment(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save payment');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    invoiceList:    [],
    invoiceDetail:  null,
    saveResult:     null,
    saveStatus:     null, // null | 'pending' | 'success' | 'failed'
    listLoading:    false,
    detailLoading:  false,
    saveLoading:    false,
    listError:      null,
    detailError:    null,
    saveError:      null,
};

const genInvPaymentSlice = createSlice({
    name: 'genInvPayment',
    initialState,
    reducers: {
        clearInvoiceDetail: (state) => {
            state.invoiceDetail = null;
            state.detailError   = null;
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.saveError  = null;
        },
        resetGenInvPayment: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch list
        builder
            .addCase(fetchGenInvList.pending,    (s) => { s.listLoading = true;  s.listError = null; })
            .addCase(fetchGenInvList.fulfilled,  (s, a) => { s.listLoading = false; s.invoiceList = a.payload; })
            .addCase(fetchGenInvList.rejected,   (s, a) => { s.listLoading = false; s.listError = a.payload; });

        // Fetch detail
        builder
            .addCase(fetchGenInvDetail.pending,   (s) => { s.detailLoading = true;  s.detailError = null; s.invoiceDetail = null; })
            .addCase(fetchGenInvDetail.fulfilled, (s, a) => { s.detailLoading = false; s.invoiceDetail = a.payload; })
            .addCase(fetchGenInvDetail.rejected,  (s, a) => { s.detailLoading = false; s.detailError = a.payload; });

        // Submit payment
        builder
            .addCase(submitGenInvBankPayment.pending,   (s) => { s.saveLoading = true;  s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitGenInvBankPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                // Backend returns a string like "Submited$..." — check first segment
                const raw = a.payload?.Data || a.payload || '';
                const ok  = (typeof raw === 'string' && raw.split('$')[0].trim() === 'Submited') ||
                            a.payload?.IsSuccessful === true;
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.saveError = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitGenInvBankPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearInvoiceDetail,
    clearSaveResult,
    resetGenInvPayment,
} = genInvPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectGenInvList          = (s) => s.genInvPayment.invoiceList;
export const selectGenInvDetail        = (s) => s.genInvPayment.invoiceDetail;
export const selectGenInvSaveResult    = (s) => s.genInvPayment.saveResult;
export const selectGenInvSaveStatus    = (s) => s.genInvPayment.saveStatus;
export const selectGenInvListLoading   = (s) => s.genInvPayment.listLoading;
export const selectGenInvDetailLoading = (s) => s.genInvPayment.detailLoading;
export const selectGenInvSaveLoading   = (s) => s.genInvPayment.saveLoading;
export const selectGenInvListError     = (s) => s.genInvPayment.listError;
export const selectGenInvDetailError   = (s) => s.genInvPayment.detailError;
export const selectGenInvSaveError     = (s) => s.genInvPayment.saveError;

export default genInvPaymentSlice.reducer;
