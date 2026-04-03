import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getLCVendorCodes, getPOForLCVendor, getLCBGFDs, saveLCBGData,
    getBGClientCodes, getSubClientsForBGClient, getClientPOsForBGClient,
} from '../../api/LCandBGAPI/lcBgAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

// LC — vendors
export const fetchLCVendorCodes = createAsyncThunk(
    'lcbgCreation/fetchVendors',
    async (params, { rejectWithValue }) => {
        try { return await getLCVendorCodes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendors'); }
    }
);

// LC — POs for a vendor
export const fetchPOForVendor = createAsyncThunk(
    'lcbgCreation/fetchPOs',
    async (params, { rejectWithValue }) => {
        try { return await getPOForLCVendor(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch PO numbers'); }
    }
);

// BG — clients
export const fetchBGClientCodes = createAsyncThunk(
    'lcbgCreation/fetchBGClients',
    async (params, { rejectWithValue }) => {
        try { return await getBGClientCodes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch BG clients'); }
    }
);

// BG — sub-clients for a client
export const fetchSubClientsForBGClient = createAsyncThunk(
    'lcbgCreation/fetchSubClients',
    async (params, { rejectWithValue }) => {
        try { return await getSubClientsForBGClient(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch sub-clients'); }
    }
);

// BG — POs for client + sub-client
export const fetchClientPOsForBG = createAsyncThunk(
    'lcbgCreation/fetchClientPOs',
    async (params, { rejectWithValue }) => {
        try { return await getClientPOsForBGClient(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch client PO numbers'); }
    }
);

// FD numbers
export const fetchLCBGFDNumbers = createAsyncThunk(
    'lcbgCreation/fetchFDs',
    async (_, { rejectWithValue }) => {
        try { return await getLCBGFDs(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch FD numbers'); }
    }
);

// Submit
export const submitLCBGData = createAsyncThunk(
    'lcbgCreation/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveLCBGData(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save LC/BG data'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    // LC
    vendors:           [],
    vendorsLoading:    false,
    vendorsError:      null,
    poList:            [],      // LC POs (Vendorpos / VendorpoName)
    poLoading:         false,
    poError:           null,

    // BG
    bgClients:         [],
    bgClientsLoading:  false,
    bgClientsError:    null,
    subClients:        [],
    subClientsLoading: false,
    subClientsError:   null,
    bgPoList:          [],      // BG POs (Clientpos / ClientpoName)
    bgPoLoading:       false,
    bgPoError:         null,

    // FD
    fdList:         [],
    fdLoading:      false,
    fdError:        null,

    // Save
    saveResult:     null,
    saveStatus:     null,   // null | 'pending' | 'success' | 'failed'
    saveLoading:    false,
    saveError:      null,
};

const lcbgCreationSlice = createSlice({
    name: 'lcbgCreation',
    initialState,
    reducers: {
        clearPOList:       (s) => { s.poList = []; s.poError = null; },
        clearSubClients:   (s) => { s.subClients = []; s.subClientsError = null; },
        clearBGPoList:     (s) => { s.bgPoList = []; s.bgPoError = null; },
        clearSaveResult:   (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetLCBGCreation: () => initialState,
    },
    extraReducers: (builder) => {
        // LC vendors
        builder
            .addCase(fetchLCVendorCodes.pending,   (s) => { s.vendorsLoading = true;  s.vendorsError = null; })
            .addCase(fetchLCVendorCodes.fulfilled, (s, a) => { s.vendorsLoading = false; s.vendors = a.payload?.Data || []; })
            .addCase(fetchLCVendorCodes.rejected,  (s, a) => { s.vendorsLoading = false; s.vendorsError = a.payload; });

        // LC POs
        builder
            .addCase(fetchPOForVendor.pending,   (s) => { s.poLoading = true;  s.poError = null; s.poList = []; })
            .addCase(fetchPOForVendor.fulfilled, (s, a) => { s.poLoading = false; s.poList = a.payload?.Data || []; })
            .addCase(fetchPOForVendor.rejected,  (s, a) => { s.poLoading = false; s.poError = a.payload; });

        // BG clients
        builder
            .addCase(fetchBGClientCodes.pending,   (s) => { s.bgClientsLoading = true;  s.bgClientsError = null; })
            .addCase(fetchBGClientCodes.fulfilled, (s, a) => { s.bgClientsLoading = false; s.bgClients = a.payload?.Data || []; })
            .addCase(fetchBGClientCodes.rejected,  (s, a) => { s.bgClientsLoading = false; s.bgClientsError = a.payload; });

        // BG sub-clients
        builder
            .addCase(fetchSubClientsForBGClient.pending,   (s) => { s.subClientsLoading = true;  s.subClientsError = null; s.subClients = []; })
            .addCase(fetchSubClientsForBGClient.fulfilled, (s, a) => { s.subClientsLoading = false; s.subClients = a.payload?.Data || []; })
            .addCase(fetchSubClientsForBGClient.rejected,  (s, a) => { s.subClientsLoading = false; s.subClientsError = a.payload; });

        // BG POs
        builder
            .addCase(fetchClientPOsForBG.pending,   (s) => { s.bgPoLoading = true;  s.bgPoError = null; s.bgPoList = []; })
            .addCase(fetchClientPOsForBG.fulfilled, (s, a) => { s.bgPoLoading = false; s.bgPoList = a.payload?.Data || []; })
            .addCase(fetchClientPOsForBG.rejected,  (s, a) => { s.bgPoLoading = false; s.bgPoError = a.payload; });

        // FD
        builder
            .addCase(fetchLCBGFDNumbers.pending,   (s) => { s.fdLoading = true;  s.fdError = null; })
            .addCase(fetchLCBGFDNumbers.fulfilled, (s, a) => { s.fdLoading = false; s.fdList = a.payload?.Data || []; })
            .addCase(fetchLCBGFDNumbers.rejected,  (s, a) => { s.fdLoading = false; s.fdError = a.payload; });

        // Save
        builder
            .addCase(submitLCBGData.pending,   (s) => { s.saveLoading = true;  s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitLCBGData.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const ok  = (typeof raw === 'string' && raw.toLowerCase().includes('submit')) ||
                            a.payload?.IsSuccessful === true;
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.saveError = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitLCBGData.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const { clearPOList, clearSubClients, clearBGPoList, clearSaveResult, resetLCBGCreation } = lcbgCreationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectLCVendors           = (s) => s.lcbgCreation.vendors;
export const selectLCVendorsLoading    = (s) => s.lcbgCreation.vendorsLoading;
export const selectPOList              = (s) => s.lcbgCreation.poList;
export const selectPOLoading           = (s) => s.lcbgCreation.poLoading;
export const selectBGClients           = (s) => s.lcbgCreation.bgClients;
export const selectBGClientsLoading    = (s) => s.lcbgCreation.bgClientsLoading;
export const selectSubClients          = (s) => s.lcbgCreation.subClients;
export const selectSubClientsLoading   = (s) => s.lcbgCreation.subClientsLoading;
export const selectBGPoList            = (s) => s.lcbgCreation.bgPoList;
export const selectBGPoLoading         = (s) => s.lcbgCreation.bgPoLoading;
export const selectFDList              = (s) => s.lcbgCreation.fdList;
export const selectFDLoading           = (s) => s.lcbgCreation.fdLoading;
export const selectLCBGSaveStatus      = (s) => s.lcbgCreation.saveStatus;
export const selectLCBGSaveLoading     = (s) => s.lcbgCreation.saveLoading;
export const selectLCBGSaveError       = (s) => s.lcbgCreation.saveError;

export default lcbgCreationSlice.reducer;
