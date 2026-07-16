import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getMiscCostCenters,
    getMiscClients,
    getMiscSubClients,
    getMiscTaxDCA,
    getMiscTaxSubDCA,
    getMiscDedCC,
    saveMiscellaneous,
} from '../../api/AccountsAPI/miscInvoiceAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchMiscCostCenters = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMiscCostCenters();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscClients = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscClients',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getMiscClients();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscSubClients = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscSubClients',
    async (clientid, { rejectWithValue }) => {
        try {
            const res = await getMiscSubClients(clientid);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscDCA = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscDCA',
    async ({ ccCode, invdate }, { rejectWithValue }) => {
        try {
            const res = await getMiscTaxDCA({ ccCode, invdate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscSubDCA = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscSubDCA',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await getMiscTaxSubDCA(dcaCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscDedCC = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscDedCC',
    async (value, { rejectWithValue }) => {
        try {
            const res = await getMiscDedCC(value);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscDedDCA = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscDedDCA',
    async ({ ccCode, invdate }, { rejectWithValue }) => {
        try {
            const res = await getMiscTaxDCA({ ccCode, invdate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchMiscDedSubDCA = createAsyncThunk(
    'miscInvoiceCreation/fetchMiscDedSubDCA',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await getMiscTaxSubDCA(dcaCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitMiscInvoice = createAsyncThunk(
    'miscInvoiceCreation/submitMiscInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveMiscellaneous(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:  [],
    clients:      [],
    subClients:   [],
    mainDCA:      [],
    subDCA:       [],
    dedCostCenters: [],
    dedDCA:       [],
    dedSubDCA:    [],
    saveResult:   null,
    loading: {
        costCenters: false,
        clients:     false,
        subClients:  false,
        dca:         false,
        subDca:      false,
        dedCC:       false,
        dedDca:      false,
        dedSubDca:   false,
        save:        false,
    },
    errors: {
        costCenters: null,
        clients:     null,
        subClients:  null,
        dca:         null,
        subDca:      null,
        dedCC:       null,
        dedDca:      null,
        dedSubDca:   null,
        save:        null,
    },
};

const miscInvoiceCreationSlice = createSlice({
    name: 'miscInvoiceCreation',
    initialState,
    reducers: {
        clearMiscSubClients: (s) => { s.subClients = []; },
        clearMiscDCA:        (s) => { s.mainDCA = []; s.subDCA = []; },
        clearMiscSubDCA:     (s) => { s.subDCA = []; },
        clearMiscDedCC:      (s) => { s.dedCostCenters = []; s.dedDCA = []; s.dedSubDCA = []; },
        clearMiscDedDCA:     (s) => { s.dedDCA = []; s.dedSubDCA = []; },
        clearMiscDedSubDCA:  (s) => { s.dedSubDCA = []; },
        clearMiscSaveResult: (s) => { s.saveResult = null; s.errors.save = null; },
        resetMiscInvoice:    () => initialState,
    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchMiscCostCenters.pending,   s => { s.loading.costCenters = true;  s.errors.costCenters = null; })
            .addCase(fetchMiscCostCenters.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchMiscCostCenters.rejected,  (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        builder
            .addCase(fetchMiscClients.pending,   s => { s.loading.clients = true;  s.errors.clients = null; })
            .addCase(fetchMiscClients.fulfilled, (s, a) => { s.loading.clients = false; s.clients = a.payload; })
            .addCase(fetchMiscClients.rejected,  (s, a) => { s.loading.clients = false; s.errors.clients = a.payload; });

        builder
            .addCase(fetchMiscSubClients.pending,   s => { s.loading.subClients = true;  s.errors.subClients = null; s.subClients = []; })
            .addCase(fetchMiscSubClients.fulfilled, (s, a) => { s.loading.subClients = false; s.subClients = a.payload; })
            .addCase(fetchMiscSubClients.rejected,  (s, a) => { s.loading.subClients = false; s.errors.subClients = a.payload; });

        builder
            .addCase(fetchMiscDCA.pending,   s => { s.loading.dca = true;  s.errors.dca = null; s.mainDCA = []; s.subDCA = []; })
            .addCase(fetchMiscDCA.fulfilled, (s, a) => { s.loading.dca = false; s.mainDCA = a.payload; })
            .addCase(fetchMiscDCA.rejected,  (s, a) => { s.loading.dca = false; s.errors.dca = a.payload; });

        builder
            .addCase(fetchMiscSubDCA.pending,   s => { s.loading.subDca = true;  s.errors.subDca = null; s.subDCA = []; })
            .addCase(fetchMiscSubDCA.fulfilled, (s, a) => { s.loading.subDca = false; s.subDCA = a.payload; })
            .addCase(fetchMiscSubDCA.rejected,  (s, a) => { s.loading.subDca = false; s.errors.subDca = a.payload; });

        builder
            .addCase(fetchMiscDedCC.pending,   s => { s.loading.dedCC = true;  s.errors.dedCC = null; s.dedCostCenters = []; })
            .addCase(fetchMiscDedCC.fulfilled, (s, a) => { s.loading.dedCC = false; s.dedCostCenters = a.payload; })
            .addCase(fetchMiscDedCC.rejected,  (s, a) => { s.loading.dedCC = false; s.errors.dedCC = a.payload; });

        builder
            .addCase(fetchMiscDedDCA.pending,   s => { s.loading.dedDca = true;  s.errors.dedDca = null; s.dedDCA = []; s.dedSubDCA = []; })
            .addCase(fetchMiscDedDCA.fulfilled, (s, a) => { s.loading.dedDca = false; s.dedDCA = a.payload; })
            .addCase(fetchMiscDedDCA.rejected,  (s, a) => { s.loading.dedDca = false; s.errors.dedDca = a.payload; });

        builder
            .addCase(fetchMiscDedSubDCA.pending,   s => { s.loading.dedSubDca = true;  s.errors.dedSubDca = null; s.dedSubDCA = []; })
            .addCase(fetchMiscDedSubDCA.fulfilled, (s, a) => { s.loading.dedSubDca = false; s.dedSubDCA = a.payload; })
            .addCase(fetchMiscDedSubDCA.rejected,  (s, a) => { s.loading.dedSubDca = false; s.errors.dedSubDca = a.payload; });

        builder
            .addCase(submitMiscInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitMiscInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitMiscInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearMiscSubClients,
    clearMiscDCA,
    clearMiscSubDCA,
    clearMiscDedCC,
    clearMiscDedDCA,
    clearMiscDedSubDCA,
    clearMiscSaveResult,
    resetMiscInvoice,
} = miscInvoiceCreationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectMiscCostCenters   = s => s.miscInvoiceCreation.costCenters;
export const selectMiscClients       = s => s.miscInvoiceCreation.clients;
export const selectMiscSubClients    = s => s.miscInvoiceCreation.subClients;
export const selectMiscMainDCA       = s => s.miscInvoiceCreation.mainDCA;
export const selectMiscSubDCA        = s => s.miscInvoiceCreation.subDCA;
export const selectMiscDedCostCenters = s => s.miscInvoiceCreation.dedCostCenters;
export const selectMiscDedDCA        = s => s.miscInvoiceCreation.dedDCA;
export const selectMiscDedSubDCA     = s => s.miscInvoiceCreation.dedSubDCA;
export const selectMiscSaveResult    = s => s.miscInvoiceCreation.saveResult;

export const selectMiscCCLoading         = s => s.miscInvoiceCreation.loading.costCenters;
export const selectMiscClientsLoading    = s => s.miscInvoiceCreation.loading.clients;
export const selectMiscSubClientsLoading = s => s.miscInvoiceCreation.loading.subClients;
export const selectMiscDCALoading        = s => s.miscInvoiceCreation.loading.dca;
export const selectMiscSubDCALoading     = s => s.miscInvoiceCreation.loading.subDca;
export const selectMiscDedCCLoading      = s => s.miscInvoiceCreation.loading.dedCC;
export const selectMiscDedDCALoading     = s => s.miscInvoiceCreation.loading.dedDca;
export const selectMiscDedSubDCALoading  = s => s.miscInvoiceCreation.loading.dedSubDca;
export const selectMiscSaveLoading       = s => s.miscInvoiceCreation.loading.save;
export const selectMiscSaveError         = s => s.miscInvoiceCreation.errors.save;

export default miscInvoiceCreationSlice.reducer;
