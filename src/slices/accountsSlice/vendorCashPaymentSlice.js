import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/vendorCashPaymentAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchSppoPaymentTypes = createAsyncThunk(
    'vendorCashPayment/fetchPaymentTypes',
    async (vendorType, { rejectWithValue }) => {
        try { return await api.getSppoPaymentTypes(vendorType); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch payment types'); }
    }
);

export const fetchSppoVendors = createAsyncThunk(
    'vendorCashPayment/fetchVendors',
    async ({ vendorType, ccCode, paymentType }, { rejectWithValue }) => {
        try { return await api.getSppoVendorsByCC(vendorType, ccCode, paymentType); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendors'); }
    }
);

export const fetchSppoPOs = createAsyncThunk(
    'vendorCashPayment/fetchPOs',
    async ({ vendorCode, vendorType, ccCode, paymentType }, { rejectWithValue }) => {
        try { return await api.getPOsForCashPayment(vendorCode, vendorType, ccCode, paymentType); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch POs'); }
    }
);

export const fetchSppoInvoices = createAsyncThunk(
    'vendorCashPayment/fetchInvoices',
    async ({ vendorCode, poNos, payType }, { rejectWithValue }) => {
        try { return await api.getInvoiceDataForPayment(vendorCode, poNos, payType); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch invoices'); }
    }
);

export const saveVendorCashPayment = createAsyncThunk(
    'vendorCashPayment/save',
    async ({ paymentType, payload }, { rejectWithValue }) => {
        try {
            const apiMap = {
                'Vendor Invoice':   api.saveVendorInvoicePayment,
                'Vendor Advance':   api.saveVendorAdvancePayment,
                'Vendor Retention': api.saveVendorRetentionPayment,
                'Vendor Hold':      api.saveVendorHoldPayment,
            };
            const fn = apiMap[paymentType];
            if (!fn) throw new Error(`Unknown payment type: ${paymentType}`);
            return await fn(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Save failed');
        }
    }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    paymentTypes: [],
    vendors:      [],
    poList:       [],
    invoiceList:  [],
    saveResult:   null,
    saveStatus:   null,

    loading: {
        paymentTypes: false,
        vendors:      false,
        poList:       false,
        invoiceList:  false,
        save:         false,
    },
    errors: {
        paymentTypes: null,
        vendors:      null,
        poList:       null,
        invoiceList:  null,
        save:         null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const vendorCashPaymentSlice = createSlice({
    name: 'vendorCashPayment',
    initialState,
    reducers: {
        clearVendors:      (state) => { state.vendors = [];     state.errors.vendors = null; },
        clearPOs:          (state) => { state.poList = [];      state.errors.poList = null; },
        clearInvoices:     (state) => { state.invoiceList = []; state.errors.invoiceList = null; },
        clearSaveResult:   (state) => { state.saveResult = null; state.saveStatus = null; state.errors.save = null; },
        resetVendorCash:   (state) => { Object.assign(state, initialState); },
    },
    extraReducers: (builder) => {

        // Payment Types
        builder
            .addCase(fetchSppoPaymentTypes.pending, (s) => { s.loading.paymentTypes = true; s.errors.paymentTypes = null; })
            .addCase(fetchSppoPaymentTypes.fulfilled, (s, a) => { s.loading.paymentTypes = false; s.paymentTypes = a.payload?.Data || []; })
            .addCase(fetchSppoPaymentTypes.rejected, (s, a) => { s.loading.paymentTypes = false; s.errors.paymentTypes = a.payload; s.paymentTypes = []; });

        // Vendors
        builder
            .addCase(fetchSppoVendors.pending, (s) => { s.loading.vendors = true; s.errors.vendors = null; s.vendors = []; })
            .addCase(fetchSppoVendors.fulfilled, (s, a) => { s.loading.vendors = false; s.vendors = a.payload?.Data || []; })
            .addCase(fetchSppoVendors.rejected, (s, a) => { s.loading.vendors = false; s.errors.vendors = a.payload; s.vendors = []; });

        // POs
        builder
            .addCase(fetchSppoPOs.pending, (s) => { s.loading.poList = true; s.errors.poList = null; s.poList = []; })
            .addCase(fetchSppoPOs.fulfilled, (s, a) => { s.loading.poList = false; s.poList = a.payload?.Data || []; })
            .addCase(fetchSppoPOs.rejected, (s, a) => { s.loading.poList = false; s.errors.poList = a.payload; s.poList = []; });

        // Invoices
        builder
            .addCase(fetchSppoInvoices.pending, (s) => { s.loading.invoiceList = true; s.errors.invoiceList = null; s.invoiceList = []; })
            .addCase(fetchSppoInvoices.fulfilled, (s, a) => { s.loading.invoiceList = false; s.invoiceList = a.payload?.Data || []; })
            .addCase(fetchSppoInvoices.rejected, (s, a) => { s.loading.invoiceList = false; s.errors.invoiceList = a.payload; s.invoiceList = []; });

        // Save
        builder
            .addCase(saveVendorCashPayment.pending, (s) => { s.loading.save = true; s.errors.save = null; s.saveStatus = 'pending'; })
            .addCase(saveVendorCashPayment.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const ok  = a.payload?.IsSuccessful === true ||
                            (typeof raw === 'string' && raw.split(/[,$]/)[0].trim().toLowerCase() === 'submited');
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.errors.save = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(saveVendorCashPayment.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; s.saveStatus = 'failed'; });
    },
});

export const { clearVendors, clearPOs, clearInvoices, clearSaveResult, resetVendorCash } = vendorCashPaymentSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectPaymentTypes        = (s) => s.vendorCashPayment.paymentTypes;
export const selectVcpVendors          = (s) => s.vendorCashPayment.vendors;
export const selectVcpPOList           = (s) => s.vendorCashPayment.poList;
export const selectVcpInvoiceList      = (s) => s.vendorCashPayment.invoiceList;
export const selectVcpSaveResult       = (s) => s.vendorCashPayment.saveResult;
export const selectVcpSaveStatus       = (s) => s.vendorCashPayment.saveStatus;

export const selectPaymentTypesLoading = (s) => s.vendorCashPayment.loading.paymentTypes;
export const selectVcpVendorsLoading   = (s) => s.vendorCashPayment.loading.vendors;
export const selectVcpPOLoading        = (s) => s.vendorCashPayment.loading.poList;
export const selectVcpInvoiceLoading   = (s) => s.vendorCashPayment.loading.invoiceList;
export const selectVcpSaveLoading      = (s) => s.vendorCashPayment.loading.save;

export const selectPaymentTypesError   = (s) => s.vendorCashPayment.errors.paymentTypes;
export const selectVcpVendorsError     = (s) => s.vendorCashPayment.errors.vendors;
export const selectVcpPOError          = (s) => s.vendorCashPayment.errors.poList;
export const selectVcpInvoiceError     = (s) => s.vendorCashPayment.errors.invoiceList;
export const selectVcpSaveError        = (s) => s.vendorCashPayment.errors.save;

export default vendorCashPaymentSlice.reducer;
