import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getBOELCNos,
    getBOETrans,
    getBOEPaymentData,
    getBOEPaymentInnerData,
    getLCDetails,
    saveBOESettlementPayment,
} from '../../api/PurchaseAPI/boeSettlementAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchBOELCNos = createAsyncThunk(
    'boeSettlement/fetchLCNos',
    async (_, { rejectWithValue }) => {
        try { return await getBOELCNos(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch LC numbers'); }
    }
);

export const fetchBOETrans = createAsyncThunk(
    'boeSettlement/fetchBOETrans',
    async (params, { rejectWithValue }) => {
        try { return await getBOETrans(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch BOE transactions'); }
    }
);

export const fetchBOEPaymentData = createAsyncThunk(
    'boeSettlement/fetchPaymentData',
    async (params, { rejectWithValue }) => {
        try { return await getBOEPaymentData(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch BOE payment data'); }
    }
);

export const fetchBOEPaymentInnerData = createAsyncThunk(
    'boeSettlement/fetchInnerData',
    async (params, { rejectWithValue }) => {
        try { return await getBOEPaymentInnerData(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch BOE inner data'); }
    }
);

export const fetchLCDetails = createAsyncThunk(
    'boeSettlement/fetchLCDetails',
    async (params, { rejectWithValue }) => {
        try { return await getLCDetails(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch LC details'); }
    }
);

export const submitBOESettlementPayment = createAsyncThunk(
    'boeSettlement/save',
    async (payload, { rejectWithValue }) => {
        try { return await saveBOESettlementPayment(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save BOE settlement payment'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    lcNos:         [],
    lcNosLoading:  false,

    boeTrans:         [],
    boeTransLoading:  false,

    // Main payment header info
    paymentData:        null,
    paymentDataLoading: false,
    paymentDataError:   null,

    // Inner detail rows (CC code, invoice, PO, amount)
    innerData:        [],
    innerDataLoading: false,

    // LC details for payment amount + date range
    lcDetails:        null,
    lcDetailsLoading: false,

    // Save
    saveResult:  null,
    saveStatus:  null,   // null | 'pending' | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const boeSettlementSlice = createSlice({
    name: 'boeSettlement',
    initialState,
    reducers: {
        clearBOETrans:      (s) => { s.boeTrans = []; },
        clearPaymentData:   (s) => { s.paymentData = null; s.paymentDataError = null; },
        clearInnerData:     (s) => { s.innerData = []; },
        clearLCDetails:     (s) => { s.lcDetails = null; },
        clearSaveResult:    (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetBOESettlement: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBOELCNos.pending,   (s) => { s.lcNosLoading = true; })
            .addCase(fetchBOELCNos.fulfilled, (s, a) => { s.lcNosLoading = false; s.lcNos = a.payload?.Data || []; })
            .addCase(fetchBOELCNos.rejected,  (s) => { s.lcNosLoading = false; });

        builder
            .addCase(fetchBOETrans.pending,   (s) => { s.boeTransLoading = true; s.boeTrans = []; })
            .addCase(fetchBOETrans.fulfilled, (s, a) => { s.boeTransLoading = false; s.boeTrans = a.payload?.Data || []; })
            .addCase(fetchBOETrans.rejected,  (s) => { s.boeTransLoading = false; });

        builder
            .addCase(fetchBOEPaymentData.pending,   (s) => { s.paymentDataLoading = true; s.paymentData = null; s.paymentDataError = null; })
            .addCase(fetchBOEPaymentData.fulfilled, (s, a) => {
                s.paymentDataLoading = false;
                s.paymentData = a.payload?.Data?.[0] || null;
            })
            .addCase(fetchBOEPaymentData.rejected,  (s, a) => { s.paymentDataLoading = false; s.paymentDataError = a.payload; });

        builder
            .addCase(fetchBOEPaymentInnerData.pending,   (s) => { s.innerDataLoading = true; s.innerData = []; })
            .addCase(fetchBOEPaymentInnerData.fulfilled, (s, a) => { s.innerDataLoading = false; s.innerData = a.payload?.Data || []; })
            .addCase(fetchBOEPaymentInnerData.rejected,  (s) => { s.innerDataLoading = false; });

        builder
            .addCase(fetchLCDetails.pending,   (s) => { s.lcDetailsLoading = true; s.lcDetails = null; })
            .addCase(fetchLCDetails.fulfilled, (s, a) => { s.lcDetailsLoading = false; s.lcDetails = a.payload?.Data?.[0] || null; })
            .addCase(fetchLCDetails.rejected,  (s) => { s.lcDetailsLoading = false; });

        builder
            .addCase(submitBOESettlementPayment.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitBOESettlementPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.split('$')[0] : '';
                s.saveStatus = (msg === 'Submited' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = (typeof raw === 'string' && raw) || 'Payment save failed';
            })
            .addCase(submitBOESettlementPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearBOETrans, clearPaymentData, clearInnerData, clearLCDetails,
    clearSaveResult, resetBOESettlement,
} = boeSettlementSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectBOELCNos            = (s) => s.boeSettlement.lcNos;
export const selectBOELCNosLoading     = (s) => s.boeSettlement.lcNosLoading;
export const selectBOETrans            = (s) => s.boeSettlement.boeTrans;
export const selectBOETransLoading     = (s) => s.boeSettlement.boeTransLoading;
export const selectBOEPaymentData        = (s) => s.boeSettlement.paymentData;
export const selectBOEPaymentDataLoading = (s) => s.boeSettlement.paymentDataLoading;
export const selectBOEPaymentDataError = (s) => s.boeSettlement.paymentDataError;
export const selectBOEInnerData        = (s) => s.boeSettlement.innerData;
export const selectBOEInnerDataLoading = (s) => s.boeSettlement.innerDataLoading;
export const selectLCDetails           = (s) => s.boeSettlement.lcDetails;
export const selectLCDetailsLoading    = (s) => s.boeSettlement.lcDetailsLoading;
export const selectBOESaveStatus       = (s) => s.boeSettlement.saveStatus;
export const selectBOESaveLoading      = (s) => s.boeSettlement.saveLoading;
export const selectBOESaveError        = (s) => s.boeSettlement.saveError;

export default boeSettlementSlice.reducer;
