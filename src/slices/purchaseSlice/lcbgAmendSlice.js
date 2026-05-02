import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getLCBGCodes,
    getLCBGVendorClient,
    saveLCBGAmendData,
} from '../../api/PurchaseAPI/lcbgAmendAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchLCBGCodes = createAsyncThunk(
    'lcbgAmend/fetchCodes',
    async (params, { rejectWithValue }) => {
        try { return await getLCBGCodes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch LC/BG codes'); }
    }
);

export const fetchLCBGVendorClient = createAsyncThunk(
    'lcbgAmend/fetchVendorClient',
    async (params, { rejectWithValue }) => {
        try { return await getLCBGVendorClient(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor/client details'); }
    }
);

export const submitLCBGAmend = createAsyncThunk(
    'lcbgAmend/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveLCBGAmendData(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save LC/BG amend data'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    codes:          [],
    codesLoading:   false,
    codesError:     null,

    details:        null,   // Data[0] from GetLCBGVendorClient
    detailsLoading: false,
    detailsError:   null,

    saveResult:     null,
    saveStatus:     null,   // null | 'pending' | 'success' | 'failed'
    saveLoading:    false,
    saveError:      null,
};

const lcbgAmendSlice = createSlice({
    name: 'lcbgAmend',
    initialState,
    reducers: {
        clearCodes:      (s) => { s.codes = []; s.codesError = null; },
        clearDetails:    (s) => { s.details = null; s.detailsError = null; },
        clearSaveResult: (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetLCBGAmend:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLCBGCodes.pending,   (s) => { s.codesLoading = true; s.codesError = null; s.codes = []; })
            .addCase(fetchLCBGCodes.fulfilled, (s, a) => { s.codesLoading = false; s.codes = a.payload?.Data || []; })
            .addCase(fetchLCBGCodes.rejected,  (s, a) => { s.codesLoading = false; s.codesError = a.payload; });

        builder
            .addCase(fetchLCBGVendorClient.pending,   (s) => { s.detailsLoading = true; s.detailsError = null; s.details = null; })
            .addCase(fetchLCBGVendorClient.fulfilled, (s, a) => {
                s.detailsLoading = false;
                s.details = a.payload?.Data?.[0] || null;
            })
            .addCase(fetchLCBGVendorClient.rejected,  (s, a) => { s.detailsLoading = false; s.detailsError = a.payload; });

        builder
            .addCase(submitLCBGAmend.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitLCBGAmend.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.split('$')[0].trim() : '';
                s.saveStatus = (msg === 'Submited' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitLCBGAmend.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearCodes, clearDetails, clearSaveResult, resetLCBGAmend,
} = lcbgAmendSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectLCBGCodes          = (s) => s.lcbgAmend.codes;
export const selectLCBGCodesLoading   = (s) => s.lcbgAmend.codesLoading;
export const selectLCBGCodesError     = (s) => s.lcbgAmend.codesError;
export const selectLCBGDetails        = (s) => s.lcbgAmend.details;
export const selectLCBGDetailsLoading = (s) => s.lcbgAmend.detailsLoading;
export const selectLCBGDetailsError   = (s) => s.lcbgAmend.detailsError;
export const selectLCBGAmendSaveStatus  = (s) => s.lcbgAmend.saveStatus;
export const selectLCBGAmendSaveLoading = (s) => s.lcbgAmend.saveLoading;
export const selectLCBGAmendSaveError   = (s) => s.lcbgAmend.saveError;

export default lcbgAmendSlice.reducer;
