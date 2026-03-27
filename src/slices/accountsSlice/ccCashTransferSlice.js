import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/ccCashTransferAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCCCashTransferList = createAsyncThunk(
    'ccCashTransfer/fetchList',
    async ({ roleId, uid }, { rejectWithValue }) => {
        try { return await api.getCCCashTransferList(roleId, uid); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch list'); }
    }
);

export const fetchCCCashTransferById = createAsyncThunk(
    'ccCashTransfer/fetchById',
    async ({ voucherId, refno }, { rejectWithValue }) => {
        try { return await api.getCCCashTransferById(voucherId, refno); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch detail'); }
    }
);

export const verifyCCCashTransfer = createAsyncThunk(
    'ccCashTransfer/verify',
    async (payload, { rejectWithValue }) => {
        try { return await api.verifyCCCashTransfer(payload); }
        catch (err) { return rejectWithValue(err.message || 'Verification failed'); }
    }
);

export const saveCCCashTransfer = createAsyncThunk(
    'ccCashTransfer/save',
    async (payload, { rejectWithValue }) => {
        try { return await api.saveCCCashTransfer(payload); }
        catch (err) { return rejectWithValue(err.message || 'Save failed'); }
    }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    pendingList:  [],
    detail:       null,
    saveResult:   null,
    saveStatus:   null,   // null | 'pending' | 'success' | 'failed'
    verifyResult: null,
    verifyStatus: null,   // null | 'pending' | 'success' | 'failed'
    loading: {
        list:   false,
        detail: false,
        save:   false,
        verify: false,
    },
    errors: {
        list:   null,
        detail: null,
        save:   null,
        verify: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const ccCashTransferSlice = createSlice({
    name: 'ccCashTransfer',
    initialState,
    reducers: {
        clearDetail:       (s) => { s.detail = null; s.errors.detail = null; },
        clearSaveResult:   (s) => { s.saveResult = null; s.saveStatus = null; s.errors.save = null; },
        clearVerifyResult: (s) => { s.verifyResult = null; s.verifyStatus = null; s.errors.verify = null; },
        resetCCCashTransfer: (s) => { Object.assign(s, initialState); },
    },
    extraReducers: (builder) => {

        // Fetch list
        builder
            .addCase(fetchCCCashTransferList.pending,    (s) => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchCCCashTransferList.fulfilled,  (s, a) => { s.loading.list = false; s.pendingList = a.payload?.Data || []; })
            .addCase(fetchCCCashTransferList.rejected,   (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.pendingList = []; });

        // Fetch detail
        builder
            .addCase(fetchCCCashTransferById.pending,    (s) => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchCCCashTransferById.fulfilled,  (s, a) => {
                s.loading.detail = false;
                const data = a.payload?.Data;
                s.detail = Array.isArray(data) ? data[0] : data || null;
            })
            .addCase(fetchCCCashTransferById.rejected,   (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        // Verify
        builder
            .addCase(verifyCCCashTransfer.pending,    (s) => { s.loading.verify = true; s.errors.verify = null; s.verifyStatus = 'pending'; })
            .addCase(verifyCCCashTransfer.fulfilled,  (s, a) => {
                s.loading.verify = false;
                s.verifyResult   = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const ok  = a.payload?.IsSuccessful === true ||
                            (typeof raw === 'string' && raw.split(/[,$]/)[0].trim().toLowerCase() === 'submitted');
                s.verifyStatus  = ok ? 'success' : 'failed';
                if (!ok) s.errors.verify = (typeof raw === 'string' && raw) || 'Verification failed';
            })
            .addCase(verifyCCCashTransfer.rejected,   (s, a) => { s.loading.verify = false; s.errors.verify = a.payload; s.verifyStatus = 'failed'; });

        // Save
        builder
            .addCase(saveCCCashTransfer.pending,    (s) => { s.loading.save = true; s.errors.save = null; s.saveStatus = 'pending'; })
            .addCase(saveCCCashTransfer.fulfilled,  (s, a) => {
                s.loading.save = false;
                s.saveResult   = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                // SP returns "Successfull" (double-l) on success
                const ok  = a.payload?.IsSuccessful === true ||
                            (typeof raw === 'string' && raw.split(/[,$]/)[0].trim().toLowerCase() === 'successfull');
                s.saveStatus  = ok ? 'success' : 'failed';
                if (!ok) s.errors.save = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(saveCCCashTransfer.rejected,   (s, a) => { s.loading.save = false; s.errors.save = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearDetail,
    clearSaveResult,
    clearVerifyResult,
    resetCCCashTransfer,
} = ccCashTransferSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCCCashTransferList        = (s) => s.ccCashTransfer.pendingList;
export const selectCCCashTransferDetail      = (s) => s.ccCashTransfer.detail;
export const selectCCSaveStatus              = (s) => s.ccCashTransfer.saveStatus;
export const selectCCSaveError               = (s) => s.ccCashTransfer.errors.save;
export const selectCCVerifyStatus            = (s) => s.ccCashTransfer.verifyStatus;
export const selectCCVerifyError             = (s) => s.ccCashTransfer.errors.verify;

export const selectCCListLoading             = (s) => s.ccCashTransfer.loading.list;
export const selectCCDetailLoading           = (s) => s.ccCashTransfer.loading.detail;
export const selectCCSaveLoading             = (s) => s.ccCashTransfer.loading.save;
export const selectCCVerifyLoading           = (s) => s.ccCashTransfer.loading.verify;

export const selectCCListError               = (s) => s.ccCashTransfer.errors.list;
export const selectCCDetailError             = (s) => s.ccCashTransfer.errors.detail;

export default ccCashTransferSlice.reducer;
