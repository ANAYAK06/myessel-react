import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getScrapCostCenters,
    getScrapClientsByCostCenter,
    getScrapSubClientsByClient,
    getScrapRequestNumbers,
    getScrapRequestDetails,
    saveClientScrapInvoice,
} from '../../api/AccountsAPI/clientScrapSaleInvoiceAPI';
import {
    getClientGSTNos,
    getCompanyGSTNos,
    getTCSDCASDCAS,
} from '../../api/AccountsAPI/clientInvoiceAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchScrapCostCenters = createAsyncThunk(
    'clientScrapInvoice/fetchScrapCostCenters',
    async (subType, { rejectWithValue }) => {
        try {
            const res = await getScrapCostCenters(subType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load cost centers');
        }
    }
);

export const fetchScrapClients = createAsyncThunk(
    'clientScrapInvoice/fetchScrapClients',
    async ({ invType, ccCode }, { rejectWithValue }) => {
        try {
            const res = await getScrapClientsByCostCenter({ invType, ccCode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load clients');
        }
    }
);

export const fetchScrapSubClients = createAsyncThunk(
    'clientScrapInvoice/fetchScrapSubClients',
    async ({ invType, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getScrapSubClientsByClient({ invType, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load sub-clients');
        }
    }
);

export const fetchScrapRequestNumbers = createAsyncThunk(
    'clientScrapInvoice/fetchScrapRequestNumbers',
    async ({ subClient, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getScrapRequestNumbers({ subClient, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load request numbers');
        }
    }
);

export const fetchScrapRequestDetails = createAsyncThunk(
    'clientScrapInvoice/fetchScrapRequestDetails',
    async (id, { rejectWithValue }) => {
        try {
            const res = await getScrapRequestDetails(id);
            return res.data?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load request details');
        }
    }
);

export const fetchScrapClientGSTNos = createAsyncThunk(
    'clientScrapInvoice/fetchScrapClientGSTNos',
    async ({ taxtype, taxfor }, { rejectWithValue }) => {
        try {
            const res = await getClientGSTNos({ taxtype, taxfor });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load client GST numbers');
        }
    }
);

export const fetchScrapCompanyGSTNos = createAsyncThunk(
    'clientScrapInvoice/fetchScrapCompanyGSTNos',
    async (taxtype, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos(taxtype);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load company GST numbers');
        }
    }
);

export const fetchScrapTCSDCASDCAS = createAsyncThunk(
    'clientScrapInvoice/fetchScrapTCSDCASDCAS',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getTCSDCASDCAS();
            return res.data?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load TCS DCA/SDCA');
        }
    }
);

export const submitScrapInvoice = createAsyncThunk(
    'clientScrapInvoice/submitScrapInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveClientScrapInvoice(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save invoice');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:      [],
    clients:          [],
    subClients:       [],
    requestNumbers:   [],
    requestDetails:   null,
    clientGSTNos:     [],
    companyGSTNos:    [],
    tcsDCASDCAS:      null,
    saveResult:       null,

    loading: {
        costCenters:    false,
        clients:        false,
        subClients:     false,
        requestNumbers: false,
        requestDetails: false,
        gst:            false,
        tcs:            false,
        save:           false,
    },
    errors: {
        costCenters:    null,
        clients:        null,
        subClients:     null,
        requestNumbers: null,
        requestDetails: null,
        gst:            null,
        tcs:            null,
        save:           null,
    },
};

const clientScrapSaleInvoiceSlice = createSlice({
    name: 'clientScrapInvoice',
    initialState,
    reducers: {
        clearScrapSaveResult:     (s) => { s.saveResult = null; s.errors.save = null; },
        clearScrapRequestDetails: (s) => { s.requestDetails = null; },
        clearScrapSubClients:     (s) => { s.subClients = []; s.requestNumbers = []; s.requestDetails = null; },
        clearScrapRequestNumbers: (s) => { s.requestNumbers = []; s.requestDetails = null; },
        resetScrapInvoice:        () => initialState,
    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchScrapCostCenters.pending,   s => { s.loading.costCenters = true;  s.errors.costCenters = null; s.costCenters = []; })
            .addCase(fetchScrapCostCenters.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchScrapCostCenters.rejected,  (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        builder
            .addCase(fetchScrapClients.pending,   s => { s.loading.clients = true;  s.errors.clients = null; s.clients = []; })
            .addCase(fetchScrapClients.fulfilled, (s, a) => { s.loading.clients = false; s.clients = a.payload; })
            .addCase(fetchScrapClients.rejected,  (s, a) => { s.loading.clients = false; s.errors.clients = a.payload; });

        builder
            .addCase(fetchScrapSubClients.pending,   s => { s.loading.subClients = true;  s.errors.subClients = null; s.subClients = []; })
            .addCase(fetchScrapSubClients.fulfilled, (s, a) => { s.loading.subClients = false; s.subClients = a.payload; })
            .addCase(fetchScrapSubClients.rejected,  (s, a) => { s.loading.subClients = false; s.errors.subClients = a.payload; });

        builder
            .addCase(fetchScrapRequestNumbers.pending,   s => { s.loading.requestNumbers = true;  s.errors.requestNumbers = null; s.requestNumbers = []; })
            .addCase(fetchScrapRequestNumbers.fulfilled, (s, a) => { s.loading.requestNumbers = false; s.requestNumbers = a.payload; })
            .addCase(fetchScrapRequestNumbers.rejected,  (s, a) => { s.loading.requestNumbers = false; s.errors.requestNumbers = a.payload; });

        builder
            .addCase(fetchScrapRequestDetails.pending,   s => { s.loading.requestDetails = true;  s.errors.requestDetails = null; s.requestDetails = null; })
            .addCase(fetchScrapRequestDetails.fulfilled, (s, a) => { s.loading.requestDetails = false; s.requestDetails = a.payload; })
            .addCase(fetchScrapRequestDetails.rejected,  (s, a) => { s.loading.requestDetails = false; s.errors.requestDetails = a.payload; });

        builder
            .addCase(fetchScrapClientGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.clientGSTNos = []; })
            .addCase(fetchScrapClientGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.clientGSTNos = a.payload; })
            .addCase(fetchScrapClientGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        builder
            .addCase(fetchScrapCompanyGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.companyGSTNos = []; })
            .addCase(fetchScrapCompanyGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.companyGSTNos = a.payload; })
            .addCase(fetchScrapCompanyGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        builder
            .addCase(fetchScrapTCSDCASDCAS.pending,   s => { s.loading.tcs = true;  s.errors.tcs = null; })
            .addCase(fetchScrapTCSDCASDCAS.fulfilled, (s, a) => { s.loading.tcs = false; s.tcsDCASDCAS = a.payload; })
            .addCase(fetchScrapTCSDCASDCAS.rejected,  (s, a) => { s.loading.tcs = false; s.errors.tcs = a.payload; });

        builder
            .addCase(submitScrapInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitScrapInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitScrapInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearScrapSaveResult,
    clearScrapRequestDetails,
    clearScrapSubClients,
    clearScrapRequestNumbers,
    resetScrapInvoice,
} = clientScrapSaleInvoiceSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectScrapCostCenters      = s => s.clientScrapInvoice.costCenters;
export const selectScrapClients          = s => s.clientScrapInvoice.clients;
export const selectScrapSubClients       = s => s.clientScrapInvoice.subClients;
export const selectScrapRequestNumbers   = s => s.clientScrapInvoice.requestNumbers;
export const selectScrapRequestDetails   = s => s.clientScrapInvoice.requestDetails;
export const selectScrapClientGSTNos     = s => s.clientScrapInvoice.clientGSTNos;
export const selectScrapCompanyGSTNos    = s => s.clientScrapInvoice.companyGSTNos;
export const selectScrapTCSDCASDCAS      = s => s.clientScrapInvoice.tcsDCASDCAS;
export const selectScrapSaveResult       = s => s.clientScrapInvoice.saveResult;

export const selectScrapCCLoading        = s => s.clientScrapInvoice.loading.costCenters;
export const selectScrapClientsLoading   = s => s.clientScrapInvoice.loading.clients;
export const selectScrapSubCliLoading    = s => s.clientScrapInvoice.loading.subClients;
export const selectScrapReqNosLoading    = s => s.clientScrapInvoice.loading.requestNumbers;
export const selectScrapReqDetailsLoading= s => s.clientScrapInvoice.loading.requestDetails;
export const selectScrapGSTLoading       = s => s.clientScrapInvoice.loading.gst;
export const selectScrapSaveLoading      = s => s.clientScrapInvoice.loading.save;

export const selectScrapSaveError        = s => s.clientScrapInvoice.errors.save;

export default clientScrapSaleInvoiceSlice.reducer;
