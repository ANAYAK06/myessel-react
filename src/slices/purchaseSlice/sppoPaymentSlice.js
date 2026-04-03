import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getSPPOPaymentTypes,
    getSPPOPaymentVendors,
    getPOForPayment,
    getVenLCCodes,
    getInvoiceDataForPayment,
    checkSupplierTransactionType,
    checkVendorInvPayDates,
    saveNewSPPOInvoicePayment,
    saveNewSPPOAdvancePayment,
    saveNewSPPORetentionPayment,
    saveNewSPPOHoldPayment,
} from '../../api/PurchaseAPI/sppoPaymentAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchPaymentTypes = createAsyncThunk(
    'sppoPayment/fetchPaymentTypes',
    async (params, { rejectWithValue }) => {
        try { return await getSPPOPaymentTypes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch payment types'); }
    }
);

export const fetchPaymentVendors = createAsyncThunk(
    'sppoPayment/fetchVendors',
    async (params, { rejectWithValue }) => {
        try { return await getSPPOPaymentVendors(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendors'); }
    }
);

// Fetches the PO list for a vendor (GetPOForPayment → returns SPPONo rows)
export const fetchPOList = createAsyncThunk(
    'sppoPayment/fetchPOList',
    async (params, { rejectWithValue }) => {
        try { return await getPOForPayment(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch PO list'); }
    }
);

// Fetches invoice rows for the selected POs (GetInvoiceDataForPayment)
// PONo should be a comma-joined string with trailing comma: "CC-001/1,CC-001/2,"
export const fetchInvoiceData = createAsyncThunk(
    'sppoPayment/fetchInvoiceData',
    async (params, { rejectWithValue }) => {
        try { return await getInvoiceDataForPayment(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch invoice data'); }
    }
);

export const fetchVenLCCodes = createAsyncThunk(
    'sppoPayment/fetchLCCodes',
    async (params, { rejectWithValue }) => {
        try { return await getVenLCCodes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch LC codes'); }
    }
);

export const validateTransactionType = createAsyncThunk(
    'sppoPayment/validateTransactionType',
    async (params, { rejectWithValue }) => {
        try { return await checkSupplierTransactionType(params); }
        catch (err) { return rejectWithValue(err.message || 'Validation failed'); }
    }
);

export const validatePaymentDates = createAsyncThunk(
    'sppoPayment/validateDates',
    async (params, { rejectWithValue }) => {
        try { return await checkVendorInvPayDates(params); }
        catch (err) { return rejectWithValue(err.message || 'Date validation failed'); }
    }
);

// Routes to the correct save API based on paymentTypeDesc
// paymentTypeDesc should match: 'Vendor Invoice' | 'Vendor Advance' | 'Vendor Retention' | 'Vendor Hold'
export const submitSPPOPayment = createAsyncThunk(
    'sppoPayment/submit',
    async ({ paymentTypeDesc, payload }, { rejectWithValue }) => {
        try {
            const key = (paymentTypeDesc || '').toLowerCase();
            let fn = saveNewSPPOInvoicePayment; // default fallback
            if (key.includes('advance'))   fn = saveNewSPPOAdvancePayment;
            else if (key.includes('retention')) fn = saveNewSPPORetentionPayment;
            else if (key.includes('hold'))      fn = saveNewSPPOHoldPayment;
            return await fn(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save payment');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    paymentTypes:         [],
    paymentTypesLoading:  false,
    paymentTypesError:    null,

    vendors:              [],
    vendorsLoading:       false,
    vendorsError:         null,

    poList:               [],   // PO numbers from GetPOForPayment (SPPONo rows)
    poLoading:            false,
    poError:              null,

    invoiceData:          [],   // Invoice rows from GetInvoiceDataForPayment
    invoiceDataLoading:   false,
    invoiceDataError:     null,

    lcCodes:              [],
    lcCodesLoading:       false,
    lcCodesError:         null,

    txnCheckResult:       null,
    txnCheckLoading:      false,
    txnCheckError:        null,

    dateCheckResult:      null,
    dateCheckLoading:     false,
    dateCheckError:       null,

    saveResult:           null,
    saveStatus:           null,  // null | 'pending' | 'success' | 'failed'
    saveLoading:          false,
    saveError:            null,
};

const sppoPaymentSlice = createSlice({
    name: 'sppoPayment',
    initialState,
    reducers: {
        clearVendors:       (s) => { s.vendors = []; s.vendorsError = null; },
        clearPOList:        (s) => { s.poList = []; s.poError = null; },
        clearInvoiceData:   (s) => { s.invoiceData = []; s.invoiceDataError = null; },
        clearLCCodes:       (s) => { s.lcCodes = []; s.lcCodesError = null; },
        clearTxnCheck:      (s) => { s.txnCheckResult = null; s.txnCheckError = null; },
        clearDateCheck:     (s) => { s.dateCheckResult = null; s.dateCheckError = null; },
        clearSaveResult:    (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetSPPOPayment:   () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentTypes.pending,   (s) => { s.paymentTypesLoading = true;  s.paymentTypesError = null; })
            .addCase(fetchPaymentTypes.fulfilled, (s, a) => { s.paymentTypesLoading = false; s.paymentTypes = a.payload?.Data || []; })
            .addCase(fetchPaymentTypes.rejected,  (s, a) => { s.paymentTypesLoading = false; s.paymentTypesError = a.payload; });

        builder
            .addCase(fetchPaymentVendors.pending,   (s) => { s.vendorsLoading = true;  s.vendorsError = null; s.vendors = []; })
            .addCase(fetchPaymentVendors.fulfilled, (s, a) => { s.vendorsLoading = false; s.vendors = a.payload?.Data || []; })
            .addCase(fetchPaymentVendors.rejected,  (s, a) => { s.vendorsLoading = false; s.vendorsError = a.payload; });

        builder
            .addCase(fetchPOList.pending,   (s) => { s.poLoading = true;  s.poError = null; s.poList = []; })
            .addCase(fetchPOList.fulfilled, (s, a) => { s.poLoading = false; s.poList = a.payload?.Data || []; })
            .addCase(fetchPOList.rejected,  (s, a) => { s.poLoading = false; s.poError = a.payload; });

        builder
            .addCase(fetchInvoiceData.pending,   (s) => { s.invoiceDataLoading = true;  s.invoiceDataError = null; s.invoiceData = []; })
            .addCase(fetchInvoiceData.fulfilled, (s, a) => { s.invoiceDataLoading = false; s.invoiceData = a.payload?.Data || []; })
            .addCase(fetchInvoiceData.rejected,  (s, a) => { s.invoiceDataLoading = false; s.invoiceDataError = a.payload; });

        builder
            .addCase(fetchVenLCCodes.pending,   (s) => { s.lcCodesLoading = true;  s.lcCodesError = null; s.lcCodes = []; })
            .addCase(fetchVenLCCodes.fulfilled, (s, a) => { s.lcCodesLoading = false; s.lcCodes = a.payload?.Data || []; })
            .addCase(fetchVenLCCodes.rejected,  (s, a) => { s.lcCodesLoading = false; s.lcCodesError = a.payload; });

        builder
            .addCase(validateTransactionType.pending,   (s) => { s.txnCheckLoading = true;  s.txnCheckError = null; })
            .addCase(validateTransactionType.fulfilled, (s, a) => { s.txnCheckLoading = false; s.txnCheckResult = a.payload; })
            .addCase(validateTransactionType.rejected,  (s, a) => { s.txnCheckLoading = false; s.txnCheckError = a.payload; });

        builder
            .addCase(validatePaymentDates.pending,   (s) => { s.dateCheckLoading = true;  s.dateCheckError = null; })
            .addCase(validatePaymentDates.fulfilled, (s, a) => { s.dateCheckLoading = false; s.dateCheckResult = a.payload; })
            .addCase(validatePaymentDates.rejected,  (s, a) => { s.dateCheckLoading = false; s.dateCheckError = a.payload; });

        builder
            .addCase(submitSPPOPayment.pending,   (s) => { s.saveLoading = true;  s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitSPPOPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.split('$')[0] : '';
                s.saveStatus = (msg === 'Submited' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = (typeof raw === 'string' && raw) || 'Payment save failed';
            })
            .addCase(submitSPPOPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearVendors, clearPOList, clearInvoiceData, clearLCCodes,
    clearTxnCheck, clearDateCheck, clearSaveResult, resetSPPOPayment,
} = sppoPaymentSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectPaymentTypes          = (s) => s.sppoPayment.paymentTypes;
export const selectPaymentTypesLoading   = (s) => s.sppoPayment.paymentTypesLoading;
export const selectSPPOVendors           = (s) => s.sppoPayment.vendors;
export const selectSPPOVendorsLoading    = (s) => s.sppoPayment.vendorsLoading;
export const selectSPPOPOList            = (s) => s.sppoPayment.poList;
export const selectSPPOPOLoading         = (s) => s.sppoPayment.poLoading;
export const selectSPPOInvoiceData       = (s) => s.sppoPayment.invoiceData;
export const selectSPPOInvoiceDataLoading = (s) => s.sppoPayment.invoiceDataLoading;
export const selectLCCodes               = (s) => s.sppoPayment.lcCodes;
export const selectLCCodesLoading        = (s) => s.sppoPayment.lcCodesLoading;
export const selectTxnCheckLoading       = (s) => s.sppoPayment.txnCheckLoading;
export const selectDateCheckResult       = (s) => s.sppoPayment.dateCheckResult;
export const selectDateCheckLoading      = (s) => s.sppoPayment.dateCheckLoading;
export const selectSPPOSaveStatus        = (s) => s.sppoPayment.saveStatus;
export const selectSPPOSaveLoading       = (s) => s.sppoPayment.saveLoading;
export const selectSPPOSaveError         = (s) => s.sppoPayment.saveError;

export default sppoPaymentSlice.reducer;
