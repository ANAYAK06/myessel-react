import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCostCentersBySubType,
    getClientsByCostCenter,
    getSubClientsByClient,
    getSubClientPO,
    getClientGSTNos,
    getCompanyGSTNos,
    getTCSDCASDCAS,
    saveClientInvoice,
} from '../../api/AccountsAPI/clientInvoiceAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCostCentersBySubType = createAsyncThunk(
    'clientInvoice/fetchCostCentersBySubType',
    async (subType, { rejectWithValue }) => {
        try {
            const res = await getCostCentersBySubType(subType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load cost centers');
        }
    }
);

export const fetchClientsByCostCenter = createAsyncThunk(
    'clientInvoice/fetchClientsByCostCenter',
    async ({ invType, ccCode }, { rejectWithValue }) => {
        try {
            const res = await getClientsByCostCenter({ invType, ccCode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load clients');
        }
    }
);

export const fetchSubClientsByClient = createAsyncThunk(
    'clientInvoice/fetchSubClientsByClient',
    async ({ invType, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getSubClientsByClient({ invType, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load sub-clients');
        }
    }
);

export const fetchSubClientPO = createAsyncThunk(
    'clientInvoice/fetchSubClientPO',
    async ({ subClient, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getSubClientPO({ subClient, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load PO numbers');
        }
    }
);

export const fetchClientGSTNos = createAsyncThunk(
    'clientInvoice/fetchClientGSTNos',
    async ({ taxtype, taxfor }, { rejectWithValue }) => {
        try {
            const res = await getClientGSTNos({ taxtype, taxfor });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load client GST numbers');
        }
    }
);

export const fetchCompanyGSTNos = createAsyncThunk(
    'clientInvoice/fetchCompanyGSTNos',
    async (taxtype, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos(taxtype);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load company GST numbers');
        }
    }
);

export const fetchTCSDCASDCAS = createAsyncThunk(
    'clientInvoice/fetchTCSDCASDCAS',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getTCSDCASDCAS();
            return res.data?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load TCS DCA/SDCA');
        }
    }
);

export const submitClientInvoice = createAsyncThunk(
    'clientInvoice/submitClientInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveClientInvoice(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save invoice');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:     [],
    clients:         [],
    subClients:      [],
    poNumbers:       [],
    clientGSTNos:    [],
    companyGSTNos:   [],
    tcsDCASDCAS:     null,
    saveResult:      null,

    loading: {
        costCenters:    false,
        clients:        false,
        subClients:     false,
        poNumbers:      false,
        gst:            false,
        tcs:            false,
        save:           false,
    },
    errors: {
        costCenters:    null,
        clients:        null,
        subClients:     null,
        poNumbers:      null,
        gst:            null,
        tcs:            null,
        save:           null,
    },
};

const clientInvoiceSlice = createSlice({
    name: 'clientInvoice',
    initialState,
    reducers: {
        clearSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        clearCostCenters: (state) => { state.costCenters = []; },
        clearClients: (state) => { state.clients = []; state.subClients = []; state.poNumbers = []; },
        clearSubClients: (state) => { state.subClients = []; state.poNumbers = []; },
        clearPONumbers: (state) => { state.poNumbers = []; },
        clearGSTData: (state) => { state.clientGSTNos = []; state.companyGSTNos = []; },
        resetClientInvoice: () => initialState,
    },
    extraReducers: (builder) => {
       

        // Cost centers
        builder
            .addCase(fetchCostCentersBySubType.pending, s => { s.loading.costCenters = true; s.errors.costCenters = null; s.costCenters = []; })
            .addCase(fetchCostCentersBySubType.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchCostCentersBySubType.rejected, (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        // Clients
        builder
            .addCase(fetchClientsByCostCenter.pending, s => { s.loading.clients = true; s.errors.clients = null; s.clients = []; })
            .addCase(fetchClientsByCostCenter.fulfilled, (s, a) => { s.loading.clients = false; s.clients = a.payload; })
            .addCase(fetchClientsByCostCenter.rejected, (s, a) => { s.loading.clients = false; s.errors.clients = a.payload; });

        // Sub-clients
        builder
            .addCase(fetchSubClientsByClient.pending, s => { s.loading.subClients = true; s.errors.subClients = null; s.subClients = []; })
            .addCase(fetchSubClientsByClient.fulfilled, (s, a) => { s.loading.subClients = false; s.subClients = a.payload; })
            .addCase(fetchSubClientsByClient.rejected, (s, a) => { s.loading.subClients = false; s.errors.subClients = a.payload; });

        // PO numbers
        builder
            .addCase(fetchSubClientPO.pending, s => { s.loading.poNumbers = true; s.errors.poNumbers = null; s.poNumbers = []; })
            .addCase(fetchSubClientPO.fulfilled, (s, a) => { s.loading.poNumbers = false; s.poNumbers = a.payload; })
            .addCase(fetchSubClientPO.rejected, (s, a) => { s.loading.poNumbers = false; s.errors.poNumbers = a.payload; });

        // Client GST
        builder
            .addCase(fetchClientGSTNos.pending, s => { s.loading.gst = true; s.errors.gst = null; s.clientGSTNos = []; })
            .addCase(fetchClientGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.clientGSTNos = a.payload; })
            .addCase(fetchClientGSTNos.rejected, (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        // Company GST
        builder
            .addCase(fetchCompanyGSTNos.pending, s => { s.loading.gst = true; s.errors.gst = null; s.companyGSTNos = []; })
            .addCase(fetchCompanyGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.companyGSTNos = a.payload; })
            .addCase(fetchCompanyGSTNos.rejected, (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        // TCS DCA/SDCA
        builder
            .addCase(fetchTCSDCASDCAS.pending, s => { s.loading.tcs = true; s.errors.tcs = null; })
            .addCase(fetchTCSDCASDCAS.fulfilled, (s, a) => { s.loading.tcs = false; s.tcsDCASDCAS = a.payload; })
            .addCase(fetchTCSDCASDCAS.rejected, (s, a) => { s.loading.tcs = false; s.errors.tcs = a.payload; });

        // Save
        builder
            .addCase(submitClientInvoice.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitClientInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitClientInvoice.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearSaveResult,
    clearCostCenters,
    clearClients,
    clearSubClients,
    clearPONumbers,
    clearGSTData,
    resetClientInvoice,
} = clientInvoiceSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCostCenters     = s => s.clientInvoice.costCenters;
export const selectClients         = s => s.clientInvoice.clients;
export const selectSubClients      = s => s.clientInvoice.subClients;
export const selectPONumbers       = s => s.clientInvoice.poNumbers;
export const selectClientGSTNos    = s => s.clientInvoice.clientGSTNos;
export const selectCompanyGSTNos   = s => s.clientInvoice.companyGSTNos;
export const selectTCSDCASDCAS     = s => s.clientInvoice.tcsDCASDCAS;
export const selectSaveResult      = s => s.clientInvoice.saveResult;

export const selectCostCentersLoading  = s => s.clientInvoice.loading.costCenters;
export const selectClientsLoading      = s => s.clientInvoice.loading.clients;
export const selectSubClientsLoading   = s => s.clientInvoice.loading.subClients;
export const selectPONumbersLoading    = s => s.clientInvoice.loading.poNumbers;
export const selectGSTLoading          = s => s.clientInvoice.loading.gst;
export const selectSaveLoading         = s => s.clientInvoice.loading.save;

export const selectSaveError           = s => s.clientInvoice.errors.save;

export default clientInvoiceSlice.reducer;
