import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getGeneralCCTypes,
    getGeneralCCSubTypes,
    getGeneralCostCenters,
    searchPANAutocomplete,
    saveNewPAN,
    getGeneralDCA,
    getGeneralSubDCA,
    getGeneralDedCostCenters,
    insertGeneralInvoice,
} from '../../api/AccountsAPI/generalInvoiceCreationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchGenCCTypes = createAsyncThunk(
    'genInvoiceCreation/fetchGenCCTypes',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getGeneralCCTypes();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenCCSubTypes = createAsyncThunk(
    'genInvoiceCreation/fetchGenCCSubTypes',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getGeneralCCSubTypes();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenCostCenters = createAsyncThunk(
    'genInvoiceCreation/fetchGenCostCenters',
    async ({ ccType, subType }, { rejectWithValue }) => {
        try {
            const res = await getGeneralCostCenters({ ccType, subType });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchPANSuggestions = createAsyncThunk(
    'genInvoiceCreation/fetchPANSuggestions',
    async ({ pfx, typ }, { rejectWithValue }) => {
        try {
            const res = await searchPANAutocomplete({ pfx, typ });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitNewPAN = createAsyncThunk(
    'genInvoiceCreation/submitNewPAN',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveNewPAN(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenDCA = createAsyncThunk(
    'genInvoiceCreation/fetchGenDCA',
    async ({ ccCode, finalDate }, { rejectWithValue }) => {
        try {
            const res = await getGeneralDCA({ ccCode, finalDate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenSubDCA = createAsyncThunk(
    'genInvoiceCreation/fetchGenSubDCA',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await getGeneralSubDCA(dcaCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenDedCostCenters = createAsyncThunk(
    'genInvoiceCreation/fetchGenDedCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getGeneralDedCostCenters();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenDedDCA = createAsyncThunk(
    'genInvoiceCreation/fetchGenDedDCA',
    async ({ ccCode, finalDate }, { rejectWithValue }) => {
        try {
            const res = await getGeneralDCA({ ccCode, finalDate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGenDedSubDCA = createAsyncThunk(
    'genInvoiceCreation/fetchGenDedSubDCA',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await getGeneralSubDCA(dcaCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitGenInvoice = createAsyncThunk(
    'genInvoiceCreation/submitGenInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await insertGeneralInvoice(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    ccTypes:        [],
    ccSubTypes:     [],
    costCenters:    [],
    panSuggestions: [],
    mainDCA:        [],
    subDCA:         [],
    dedCostCenters: [],
    dedDCA:         [],
    dedSubDCA:      [],
    saveResult:     null,
    newPANResult:   null,
    loading: {
        ccTypes:     false,
        ccSubTypes:  false,
        costCenters: false,
        pan:         false,
        dca:         false,
        subDca:      false,
        dedCC:       false,
        dedDca:      false,
        dedSubDca:   false,
        save:        false,
        newPan:      false,
    },
    errors: {
        costCenters: null,
        pan:         null,
        dca:         null,
        subDca:      null,
        dedCC:       null,
        dedDca:      null,
        dedSubDca:   null,
        save:        null,
        newPan:      null,
    },
};

const genInvoiceCreationSlice = createSlice({
    name: 'genInvoiceCreation',
    initialState,
    reducers: {
        clearGenSaveResult:      (s) => { s.saveResult = null; s.errors.save = null; },
        clearGenPANSuggestions:  (s) => { s.panSuggestions = []; },
        clearGenNewPANResult:    (s) => { s.newPANResult = null; },
        clearGenCostCenters:     (s) => { s.costCenters = []; },
        clearGenDCA:             (s) => { s.mainDCA = []; s.subDCA = []; },
        clearGenSubDCA:          (s) => { s.subDCA = []; },
        clearGenDedDCA:          (s) => { s.dedDCA = []; s.dedSubDCA = []; },
        clearGenDedSubDCA:       (s) => { s.dedSubDCA = []; },
        resetGenInvoice:         () => initialState,
    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchGenCCTypes.pending,   s => { s.loading.ccTypes = true; })
            .addCase(fetchGenCCTypes.fulfilled, (s, a) => { s.loading.ccTypes = false; s.ccTypes = a.payload; })
            .addCase(fetchGenCCTypes.rejected,  s => { s.loading.ccTypes = false; });

        builder
            .addCase(fetchGenCCSubTypes.pending,   s => { s.loading.ccSubTypes = true; })
            .addCase(fetchGenCCSubTypes.fulfilled, (s, a) => { s.loading.ccSubTypes = false; s.ccSubTypes = a.payload; })
            .addCase(fetchGenCCSubTypes.rejected,  s => { s.loading.ccSubTypes = false; });

        builder
            .addCase(fetchGenCostCenters.pending,   s => { s.loading.costCenters = true;  s.errors.costCenters = null; s.costCenters = []; })
            .addCase(fetchGenCostCenters.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchGenCostCenters.rejected,  (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        builder
            .addCase(fetchPANSuggestions.pending,   s => { s.loading.pan = true;  s.errors.pan = null; s.panSuggestions = []; })
            .addCase(fetchPANSuggestions.fulfilled, (s, a) => { s.loading.pan = false; s.panSuggestions = a.payload; })
            .addCase(fetchPANSuggestions.rejected,  (s, a) => { s.loading.pan = false; s.errors.pan = a.payload; });

        builder
            .addCase(submitNewPAN.pending,   s => { s.loading.newPan = true;  s.errors.newPan = null; s.newPANResult = null; })
            .addCase(submitNewPAN.fulfilled, (s, a) => { s.loading.newPan = false; s.newPANResult = a.payload; })
            .addCase(submitNewPAN.rejected,  (s, a) => { s.loading.newPan = false; s.errors.newPan = a.payload; });

        builder
            .addCase(fetchGenDCA.pending,   s => { s.loading.dca = true;  s.errors.dca = null; s.mainDCA = []; s.subDCA = []; })
            .addCase(fetchGenDCA.fulfilled, (s, a) => { s.loading.dca = false; s.mainDCA = a.payload; })
            .addCase(fetchGenDCA.rejected,  (s, a) => { s.loading.dca = false; s.errors.dca = a.payload; });

        builder
            .addCase(fetchGenSubDCA.pending,   s => { s.loading.subDca = true;  s.errors.subDca = null; s.subDCA = []; })
            .addCase(fetchGenSubDCA.fulfilled, (s, a) => { s.loading.subDca = false; s.subDCA = a.payload; })
            .addCase(fetchGenSubDCA.rejected,  (s, a) => { s.loading.subDca = false; s.errors.subDca = a.payload; });

        builder
            .addCase(fetchGenDedCostCenters.pending,   s => { s.loading.dedCC = true;  s.errors.dedCC = null; s.dedCostCenters = []; })
            .addCase(fetchGenDedCostCenters.fulfilled, (s, a) => { s.loading.dedCC = false; s.dedCostCenters = a.payload; })
            .addCase(fetchGenDedCostCenters.rejected,  (s, a) => { s.loading.dedCC = false; s.errors.dedCC = a.payload; });

        builder
            .addCase(fetchGenDedDCA.pending,   s => { s.loading.dedDca = true;  s.errors.dedDca = null; s.dedDCA = []; s.dedSubDCA = []; })
            .addCase(fetchGenDedDCA.fulfilled, (s, a) => { s.loading.dedDca = false; s.dedDCA = a.payload; })
            .addCase(fetchGenDedDCA.rejected,  (s, a) => { s.loading.dedDca = false; s.errors.dedDca = a.payload; });

        builder
            .addCase(fetchGenDedSubDCA.pending,   s => { s.loading.dedSubDca = true;  s.errors.dedSubDca = null; s.dedSubDCA = []; })
            .addCase(fetchGenDedSubDCA.fulfilled, (s, a) => { s.loading.dedSubDca = false; s.dedSubDCA = a.payload; })
            .addCase(fetchGenDedSubDCA.rejected,  (s, a) => { s.loading.dedSubDca = false; s.errors.dedSubDca = a.payload; });

        builder
            .addCase(submitGenInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitGenInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitGenInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearGenSaveResult,
    clearGenPANSuggestions,
    clearGenNewPANResult,
    clearGenCostCenters,
    clearGenDCA,
    clearGenSubDCA,
    clearGenDedDCA,
    clearGenDedSubDCA,
    resetGenInvoice,
} = genInvoiceCreationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectGenCCTypes        = s => s.genInvoiceCreation.ccTypes;
export const selectGenCCSubTypes     = s => s.genInvoiceCreation.ccSubTypes;
export const selectGenCostCenters    = s => s.genInvoiceCreation.costCenters;
export const selectGenPANSuggestions = s => s.genInvoiceCreation.panSuggestions;
export const selectGenMainDCA        = s => s.genInvoiceCreation.mainDCA;
export const selectGenSubDCA         = s => s.genInvoiceCreation.subDCA;
export const selectGenDedCostCenters = s => s.genInvoiceCreation.dedCostCenters;
export const selectGenDedDCA         = s => s.genInvoiceCreation.dedDCA;
export const selectGenDedSubDCA      = s => s.genInvoiceCreation.dedSubDCA;
export const selectGenSaveResult     = s => s.genInvoiceCreation.saveResult;
export const selectGenNewPANResult   = s => s.genInvoiceCreation.newPANResult;

export const selectGenCCTypesLoading     = s => s.genInvoiceCreation.loading.ccTypes;
export const selectGenCCSubTypesLoading  = s => s.genInvoiceCreation.loading.ccSubTypes;
export const selectGenCCLoading          = s => s.genInvoiceCreation.loading.costCenters;
export const selectGenPANLoading         = s => s.genInvoiceCreation.loading.pan;
export const selectGenDCALoading         = s => s.genInvoiceCreation.loading.dca;
export const selectGenSubDCALoading      = s => s.genInvoiceCreation.loading.subDca;
export const selectGenDedCCLoading       = s => s.genInvoiceCreation.loading.dedCC;
export const selectGenDedDCALoading      = s => s.genInvoiceCreation.loading.dedDca;
export const selectGenDedSubDCALoading   = s => s.genInvoiceCreation.loading.dedSubDca;
export const selectGenSaveLoading        = s => s.genInvoiceCreation.loading.save;
export const selectGenNewPANLoading      = s => s.genInvoiceCreation.loading.newPan;
export const selectGenSaveError          = s => s.genInvoiceCreation.errors.save;
export const selectGenNewPANError        = s => s.genInvoiceCreation.errors.newPan;

export default genInvoiceCreationSlice.reducer;
