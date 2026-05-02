import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getNoteClients, getNoteVendors, getNoteVendorCC, getNoteSubClients,
    getNoteClientInvoices, getNoteVendorInvoices,
    getNoteClientInvoiceDetails, getNoteVendorInvoiceDetails,
    getReasons, getClientReasonDCA, getVendorReasonDCA,
    getClientReasonSDCA, getVendorReasonSDCA, saveCreditDebitNote,
} from '../../api/PurchaseAPI/creditDebitNoteAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchNoteClients = createAsyncThunk(
    'creditDebitNote/fetchClients',
    async (_, { rejectWithValue }) => {
        try { return await getNoteClients(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch clients'); }
    }
);

export const fetchNoteVendors = createAsyncThunk(
    'creditDebitNote/fetchVendors',
    async (_, { rejectWithValue }) => {
        try { return await getNoteVendors(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendors'); }
    }
);

export const fetchNoteVendorCC = createAsyncThunk(
    'creditDebitNote/fetchVendorCC',
    async (params, { rejectWithValue }) => {
        try { return await getNoteVendorCC(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor CCs'); }
    }
);

export const fetchNoteSubClients = createAsyncThunk(
    'creditDebitNote/fetchSubClients',
    async (params, { rejectWithValue }) => {
        try { return await getNoteSubClients(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch sub-clients'); }
    }
);

export const fetchNoteClientInvoices = createAsyncThunk(
    'creditDebitNote/fetchClientInvoices',
    async (params, { rejectWithValue }) => {
        try { return await getNoteClientInvoices(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch client invoices'); }
    }
);

export const fetchNoteVendorInvoices = createAsyncThunk(
    'creditDebitNote/fetchVendorInvoices',
    async (params, { rejectWithValue }) => {
        try { return await getNoteVendorInvoices(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor invoices'); }
    }
);

export const fetchNoteClientInvoiceDetails = createAsyncThunk(
    'creditDebitNote/fetchClientInvoiceDetails',
    async (params, { rejectWithValue }) => {
        try { return await getNoteClientInvoiceDetails(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch client invoice details'); }
    }
);

export const fetchNoteVendorInvoiceDetails = createAsyncThunk(
    'creditDebitNote/fetchVendorInvoiceDetails',
    async (params, { rejectWithValue }) => {
        try { return await getNoteVendorInvoiceDetails(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor invoice details'); }
    }
);

export const fetchReasons = createAsyncThunk(
    'creditDebitNote/fetchReasons',
    async (params, { rejectWithValue }) => {
        try { return await getReasons(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch reasons'); }
    }
);

export const fetchClientReasonDCA = createAsyncThunk(
    'creditDebitNote/fetchClientReasonDCA',
    async (_, { rejectWithValue }) => {
        try { return await getClientReasonDCA(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch client DCA'); }
    }
);

export const fetchVendorReasonDCA = createAsyncThunk(
    'creditDebitNote/fetchVendorReasonDCA',
    async (_, { rejectWithValue }) => {
        try { return await getVendorReasonDCA(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor DCA'); }
    }
);

export const fetchClientReasonSDCA = createAsyncThunk(
    'creditDebitNote/fetchClientReasonSDCA',
    async (params, { rejectWithValue }) => {
        try { return await getClientReasonSDCA(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch client SDCA'); }
    }
);

export const fetchVendorReasonSDCA = createAsyncThunk(
    'creditDebitNote/fetchVendorReasonSDCA',
    async (params, { rejectWithValue }) => {
        try { return await getVendorReasonSDCA(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor SDCA'); }
    }
);

export const submitCreditDebitNote = createAsyncThunk(
    'creditDebitNote/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveCreditDebitNote(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save note'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    clients:        [], clientsLoading:  false,
    vendors:        [], vendorsLoading:  false,
    vendorCCs:      [], vendorCCsLoading: false,
    subClients:     [], subClientsLoading: false,
    clientInvoices: [], clientInvoicesLoading: false,
    vendorInvoices: [], vendorInvoicesLoading: false,

    clientInvDetails: null, clientInvDetailsLoading: false,
    vendorInvDetails: null, vendorInvDetailsLoading: false,

    reasons:          [], reasonsLoading:      false,
    clientDCAs:       [], clientDCAsLoading:   false,
    vendorDCAs:       [], vendorDCAsLoading:   false,
    clientSDCAs:      [], clientSDCAsLoading:  false,
    vendorSDCAs:      [], vendorSDCAsLoading:  false,

    saveStatus:  null,   // null | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
    saveRefNo:   null,
};

const creditDebitNoteSlice = createSlice({
    name: 'creditDebitNote',
    initialState,
    reducers: {
        clearVendorCC:      (s) => { s.vendorCCs = []; },
        clearSubClients:    (s) => { s.subClients = []; },
        clearClientInvoices:(s) => { s.clientInvoices = []; s.clientInvDetails = null; },
        clearVendorInvoices:(s) => { s.vendorInvoices = []; s.vendorInvDetails = null; },
        clearInvDetails:    (s) => { s.clientInvDetails = null; s.vendorInvDetails = null; },
        clearReasons:       (s) => { s.reasons = []; },
        clearClientSDCAs:   (s) => { s.clientSDCAs = []; },
        clearVendorSDCAs:   (s) => { s.vendorSDCAs = []; },
        clearSaveResult:    (s) => { s.saveStatus = null; s.saveError = null; s.saveRefNo = null; },
        resetCreditDebitNote: () => initialState,
    },
    extraReducers: (builder) => {
        const loading = (key) => (s) => { s[`${key}Loading`] = true; };
        const done    = (key) => (s) => { s[`${key}Loading`] = false; };

        builder
            .addCase(fetchNoteClients.pending,   loading('clients'))
            .addCase(fetchNoteClients.fulfilled, (s, a) => { s.clientsLoading = false; s.clients = a.payload?.Data || []; })
            .addCase(fetchNoteClients.rejected,  done('clients'));

        builder
            .addCase(fetchNoteVendors.pending,   loading('vendors'))
            .addCase(fetchNoteVendors.fulfilled, (s, a) => { s.vendorsLoading = false; s.vendors = a.payload?.Data || []; })
            .addCase(fetchNoteVendors.rejected,  done('vendors'));

        builder
            .addCase(fetchNoteVendorCC.pending,   loading('vendorCCs'))
            .addCase(fetchNoteVendorCC.fulfilled, (s, a) => { s.vendorCCsLoading = false; s.vendorCCs = a.payload?.Data || []; })
            .addCase(fetchNoteVendorCC.rejected,  done('vendorCCs'));

        builder
            .addCase(fetchNoteSubClients.pending,   loading('subClients'))
            .addCase(fetchNoteSubClients.fulfilled, (s, a) => { s.subClientsLoading = false; s.subClients = a.payload?.Data || []; })
            .addCase(fetchNoteSubClients.rejected,  done('subClients'));

        builder
            .addCase(fetchNoteClientInvoices.pending,   loading('clientInvoices'))
            .addCase(fetchNoteClientInvoices.fulfilled, (s, a) => { s.clientInvoicesLoading = false; s.clientInvoices = a.payload?.Data || []; })
            .addCase(fetchNoteClientInvoices.rejected,  done('clientInvoices'));

        builder
            .addCase(fetchNoteVendorInvoices.pending,   loading('vendorInvoices'))
            .addCase(fetchNoteVendorInvoices.fulfilled, (s, a) => { s.vendorInvoicesLoading = false; s.vendorInvoices = a.payload?.Data || []; })
            .addCase(fetchNoteVendorInvoices.rejected,  done('vendorInvoices'));

        builder
            .addCase(fetchNoteClientInvoiceDetails.pending,   loading('clientInvDetails'))
            .addCase(fetchNoteClientInvoiceDetails.fulfilled, (s, a) => { s.clientInvDetailsLoading = false; s.clientInvDetails = a.payload?.Data || null; })
            .addCase(fetchNoteClientInvoiceDetails.rejected,  done('clientInvDetails'));

        builder
            .addCase(fetchNoteVendorInvoiceDetails.pending,   loading('vendorInvDetails'))
            .addCase(fetchNoteVendorInvoiceDetails.fulfilled, (s, a) => { s.vendorInvDetailsLoading = false; s.vendorInvDetails = a.payload?.Data || null; })
            .addCase(fetchNoteVendorInvoiceDetails.rejected,  done('vendorInvDetails'));

        builder
            .addCase(fetchReasons.pending,   loading('reasons'))
            .addCase(fetchReasons.fulfilled, (s, a) => { s.reasonsLoading = false; s.reasons = a.payload?.Data || []; })
            .addCase(fetchReasons.rejected,  done('reasons'));

        builder
            .addCase(fetchClientReasonDCA.pending,   loading('clientDCAs'))
            .addCase(fetchClientReasonDCA.fulfilled, (s, a) => { s.clientDCAsLoading = false; s.clientDCAs = a.payload?.Data || []; })
            .addCase(fetchClientReasonDCA.rejected,  done('clientDCAs'));

        builder
            .addCase(fetchVendorReasonDCA.pending,   loading('vendorDCAs'))
            .addCase(fetchVendorReasonDCA.fulfilled, (s, a) => { s.vendorDCAsLoading = false; s.vendorDCAs = a.payload?.Data || []; })
            .addCase(fetchVendorReasonDCA.rejected,  done('vendorDCAs'));

        builder
            .addCase(fetchClientReasonSDCA.pending,   loading('clientSDCAs'))
            .addCase(fetchClientReasonSDCA.fulfilled, (s, a) => { s.clientSDCAsLoading = false; s.clientSDCAs = a.payload?.Data || []; })
            .addCase(fetchClientReasonSDCA.rejected,  done('clientSDCAs'));

        builder
            .addCase(fetchVendorReasonSDCA.pending,   loading('vendorSDCAs'))
            .addCase(fetchVendorReasonSDCA.fulfilled, (s, a) => { s.vendorSDCAsLoading = false; s.vendorSDCAs = a.payload?.Data || []; })
            .addCase(fetchVendorReasonSDCA.rejected,  done('vendorSDCAs'));

        builder
            .addCase(submitCreditDebitNote.pending, (s) => {
                s.saveLoading = true; s.saveStatus = null; s.saveError = null; s.saveRefNo = null;
            })
            .addCase(submitCreditDebitNote.fulfilled, (s, { payload }) => {
                s.saveLoading = false;
                const raw = typeof payload === 'string' ? payload : (payload?.Data || '');
                if (typeof raw === 'string' && raw.startsWith('Submited')) {
                    s.saveStatus = 'success';
                    s.saveRefNo  = raw.split(',')[1] || null;
                } else {
                    s.saveStatus = 'failed';
                    s.saveError  = raw || 'Save failed';
                }
            })
            .addCase(submitCreditDebitNote.rejected, (s, { payload }) => {
                s.saveLoading = false; s.saveStatus = 'failed'; s.saveError = payload;
            });
    },
});

export const {
    clearVendorCC, clearSubClients, clearClientInvoices, clearVendorInvoices,
    clearInvDetails, clearReasons, clearClientSDCAs, clearVendorSDCAs,
    clearSaveResult, resetCreditDebitNote,
} = creditDebitNoteSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectNoteClients             = (s) => s.creditDebitNote.clients;
export const selectNoteClientsLoading      = (s) => s.creditDebitNote.clientsLoading;
export const selectNoteVendors             = (s) => s.creditDebitNote.vendors;
export const selectNoteVendorsLoading      = (s) => s.creditDebitNote.vendorsLoading;
export const selectNoteVendorCCs           = (s) => s.creditDebitNote.vendorCCs;
export const selectNoteVendorCCsLoading    = (s) => s.creditDebitNote.vendorCCsLoading;
export const selectNoteSubClients          = (s) => s.creditDebitNote.subClients;
export const selectNoteSubClientsLoading   = (s) => s.creditDebitNote.subClientsLoading;
export const selectNoteClientInvoices      = (s) => s.creditDebitNote.clientInvoices;
export const selectNoteClientInvoicesLoading = (s) => s.creditDebitNote.clientInvoicesLoading;
export const selectNoteVendorInvoices      = (s) => s.creditDebitNote.vendorInvoices;
export const selectNoteVendorInvoicesLoading = (s) => s.creditDebitNote.vendorInvoicesLoading;
export const selectClientInvDetails        = (s) => s.creditDebitNote.clientInvDetails;
export const selectClientInvDetailsLoading = (s) => s.creditDebitNote.clientInvDetailsLoading;
export const selectVendorInvDetails        = (s) => s.creditDebitNote.vendorInvDetails;
export const selectVendorInvDetailsLoading = (s) => s.creditDebitNote.vendorInvDetailsLoading;
export const selectNoteReasons             = (s) => s.creditDebitNote.reasons;
export const selectNoteReasonsLoading      = (s) => s.creditDebitNote.reasonsLoading;
export const selectClientDCAs              = (s) => s.creditDebitNote.clientDCAs;
export const selectClientDCAsLoading       = (s) => s.creditDebitNote.clientDCAsLoading;
export const selectVendorDCAs              = (s) => s.creditDebitNote.vendorDCAs;
export const selectVendorDCAsLoading       = (s) => s.creditDebitNote.vendorDCAsLoading;
export const selectClientSDCAs             = (s) => s.creditDebitNote.clientSDCAs;
export const selectClientSDCAsLoading      = (s) => s.creditDebitNote.clientSDCAsLoading;
export const selectVendorSDCAs             = (s) => s.creditDebitNote.vendorSDCAs;
export const selectVendorSDCAsLoading      = (s) => s.creditDebitNote.vendorSDCAsLoading;
export const selectNoteSaveStatus          = (s) => s.creditDebitNote.saveStatus;
export const selectNoteSaveLoading         = (s) => s.creditDebitNote.saveLoading;
export const selectNoteSaveError           = (s) => s.creditDebitNote.saveError;
export const selectNoteSaveRefNo           = (s) => s.creditDebitNote.saveRefNo;

export default creditDebitNoteSlice.reducer;
