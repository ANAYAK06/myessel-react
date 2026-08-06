import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getScrapSaleRefnos,
    getScrapSaleReceiptDetails,
    saveScrapSaleReceiptValue,
} from '../../api/AccountsAPI/scrapSaleReceiptAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchScrapSaleRefnos = createAsyncThunk(
    'scrapSaleReceipt/fetchRefnos',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getScrapSaleRefnos();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load reference numbers');
        }
    }
);

export const fetchScrapSaleReceiptDetails = createAsyncThunk(
    'scrapSaleReceipt/fetchDetails',
    async (id, { rejectWithValue }) => {
        try {
            const res = await getScrapSaleReceiptDetails(id);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load receipt details');
        }
    }
);

export const submitScrapSaleReceipt = createAsyncThunk(
    'scrapSaleReceipt/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveScrapSaleReceiptValue(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save receipt');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    refnos:     [],
    details:    null,
    saveResult: null,

    loading: {
        refnos:  false,
        details: false,
        save:    false,
    },
    errors: {
        refnos:  null,
        details: null,
        save:    null,
    },
};

const scrapSaleReceiptSlice = createSlice({
    name: 'scrapSaleReceipt',
    initialState,
    reducers: {
        clearScrapSaleReceiptDetails: (s) => { s.details = null; },
        clearScrapSaleReceiptSaveResult: (s) => { s.saveResult = null; s.errors.save = null; },
        resetScrapSaleReceipt: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchScrapSaleRefnos.pending,   s => { s.loading.refnos = true;  s.errors.refnos = null; })
            .addCase(fetchScrapSaleRefnos.fulfilled, (s, a) => { s.loading.refnos = false; s.refnos = a.payload; })
            .addCase(fetchScrapSaleRefnos.rejected,  (s, a) => { s.loading.refnos = false; s.errors.refnos = a.payload; s.refnos = []; });

        builder
            .addCase(fetchScrapSaleReceiptDetails.pending,   s => { s.loading.details = true;  s.errors.details = null; s.details = null; })
            .addCase(fetchScrapSaleReceiptDetails.fulfilled, (s, a) => { s.loading.details = false; s.details = a.payload; })
            .addCase(fetchScrapSaleReceiptDetails.rejected,  (s, a) => { s.loading.details = false; s.errors.details = a.payload; });

        builder
            .addCase(submitScrapSaleReceipt.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitScrapSaleReceipt.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitScrapSaleReceipt.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearScrapSaleReceiptDetails,
    clearScrapSaleReceiptSaveResult,
    resetScrapSaleReceipt,
} = scrapSaleReceiptSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectScrapSaleRefnos     = s => s.scrapSaleReceipt.refnos;
export const selectScrapSaleDetails    = s => s.scrapSaleReceipt.details;
export const selectScrapSaleSaveResult = s => s.scrapSaleReceipt.saveResult;

export const selectScrapSaleRefnosLoading  = s => s.scrapSaleReceipt.loading.refnos;
export const selectScrapSaleDetailsLoading = s => s.scrapSaleReceipt.loading.details;
export const selectScrapSaleSaveLoading    = s => s.scrapSaleReceipt.loading.save;

export const selectScrapSaleSaveError = s => s.scrapSaleReceipt.errors.save;

export default scrapSaleReceiptSlice.reducer;
