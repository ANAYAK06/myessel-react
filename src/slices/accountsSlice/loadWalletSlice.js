import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllWallets,
    getToLoadWallets,
    saveLoadWallet,
    getVerificationLoadWallet,
    getVerificationLoadWalletByNo,
    approveLoadWallet,
} from '../../api/AccountsAPI/loadWalletAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAllWallets = createAsyncThunk(
    'loadWallet/fetchAllWallets',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllWallets();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to fetch wallets');
        }
    }
);

export const fetchToLoadWallets = createAsyncThunk(
    'loadWallet/fetchToLoadWallets',
    async (FromWalletId, { rejectWithValue }) => {
        try {
            const res = await getToLoadWallets(FromWalletId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to fetch destination wallets');
        }
    }
);

export const submitLoadWallet = createAsyncThunk(
    'loadWallet/submit',
    async (payload, { rejectWithValue }) => {
        try {
            return await saveLoadWallet(payload);
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to save load wallet');
        }
    }
);

export const fetchVerifyLoadWalletGrid = createAsyncThunk(
    'loadWallet/fetchVerifyGrid',
    async (Roleid, { rejectWithValue }) => {
        try {
            const res = await getVerificationLoadWallet(Roleid);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to fetch verification list');
        }
    }
);

export const fetchVerifyLoadWalletDetail = createAsyncThunk(
    'loadWallet/fetchVerifyDetail',
    async ({ Refno, TransferType }, { rejectWithValue }) => {
        try {
            const res = await getVerificationLoadWalletByNo({ Refno, TransferType });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to fetch wallet detail');
        }
    }
);

export const submitApproveLoadWallet = createAsyncThunk(
    'loadWallet/approve',
    async (payload, { rejectWithValue }) => {
        try {
            return await approveLoadWallet(payload);
        } catch (err) {
            return rejectWithValue(err?.Message || err.message || 'Failed to approve load wallet');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    // Creation
    wallets:         [],
    walletsLoading:  false,
    toWallets:       [],
    toWalletsLoading: false,
    saveStatus:      null,   // null | 'pending' | 'success' | 'failed'
    saveLoading:     false,
    saveError:       null,

    // Verification
    verifyGrid:         [],
    verifyGridLoading:  false,
    verifyGridError:    null,
    verifyDetail:       null,
    verifyDetailLoading: false,
    approveStatus:      null,  // null | 'pending' | 'success' | 'failed'
    approveLoading:     false,
    approveError:       null,
};

const loadWalletSlice = createSlice({
    name: 'loadWallet',
    initialState,
    reducers: {
        clearSaveResult: (s) => {
            s.saveResult  = null;
            s.saveStatus  = null;
            s.saveError   = null;
        },
        clearVerifyDetail: (s) => {
            s.verifyDetail = null;
        },
        clearApproveResult: (s) => {
            s.approveStatus = null;
            s.approveError  = null;
        },
        resetLoadWallet: (s) => { Object.assign(s, initialState); },
    },
    extraReducers: (builder) => {
        // fetchAllWallets
        builder
            .addCase(fetchAllWallets.pending,    (s) => { s.walletsLoading = true; })
            .addCase(fetchAllWallets.fulfilled,  (s, a) => { s.walletsLoading = false; s.wallets = a.payload; })
            .addCase(fetchAllWallets.rejected,   (s) => { s.walletsLoading = false; });

        // fetchToLoadWallets
        builder
            .addCase(fetchToLoadWallets.pending,    (s) => { s.toWalletsLoading = true; s.toWallets = []; })
            .addCase(fetchToLoadWallets.fulfilled,  (s, a) => { s.toWalletsLoading = false; s.toWallets = a.payload; })
            .addCase(fetchToLoadWallets.rejected,   (s) => { s.toWalletsLoading = false; s.toWallets = []; });

        // submitLoadWallet
        builder
            .addCase(submitLoadWallet.pending,    (s) => { s.saveLoading = true; s.saveStatus = 'pending'; s.saveError = null; })
            .addCase(submitLoadWallet.fulfilled,  (s, a) => {
                s.saveLoading = false;
                const raw = a.payload?.Data || a.payload || '';
                const ok  = a.payload?.IsSuccessful === true ||
                            (typeof raw === 'string' && raw.toLowerCase().includes('submited'));
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.saveError = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitLoadWallet.rejected,   (s, a) => { s.saveLoading = false; s.saveStatus = 'failed'; s.saveError = a.payload; });

        // fetchVerifyLoadWalletGrid
        builder
            .addCase(fetchVerifyLoadWalletGrid.pending,    (s) => { s.verifyGridLoading = true; s.verifyGridError = null; })
            .addCase(fetchVerifyLoadWalletGrid.fulfilled,  (s, a) => { s.verifyGridLoading = false; s.verifyGrid = a.payload; })
            .addCase(fetchVerifyLoadWalletGrid.rejected,   (s, a) => { s.verifyGridLoading = false; s.verifyGridError = a.payload; });

        // fetchVerifyLoadWalletDetail
        builder
            .addCase(fetchVerifyLoadWalletDetail.pending,    (s) => { s.verifyDetailLoading = true; s.verifyDetail = null; })
            .addCase(fetchVerifyLoadWalletDetail.fulfilled,  (s, a) => { s.verifyDetailLoading = false; s.verifyDetail = a.payload; })
            .addCase(fetchVerifyLoadWalletDetail.rejected,   (s) => { s.verifyDetailLoading = false; });

        // submitApproveLoadWallet
        builder
            .addCase(submitApproveLoadWallet.pending,    (s) => { s.approveLoading = true; s.approveStatus = 'pending'; s.approveError = null; })
            .addCase(submitApproveLoadWallet.fulfilled,  (s, a) => {
                s.approveLoading = false;
                const raw = a.payload?.Data || a.payload || '';
                const ok  = a.payload?.IsSuccessful === true ||
                            (typeof raw === 'string' && raw.toLowerCase().includes('submited'));
                s.approveStatus = ok ? 'success' : 'failed';
                if (!ok) s.approveError = (typeof raw === 'string' && raw) || 'Approval failed';
            })
            .addCase(submitApproveLoadWallet.rejected,   (s, a) => { s.approveLoading = false; s.approveStatus = 'failed'; s.approveError = a.payload; });
    },
});

export const { clearSaveResult, clearVerifyDetail, clearApproveResult, resetLoadWallet } = loadWalletSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectWallets            = (s) => s.loadWallet.wallets;
export const selectWalletsLoading     = (s) => s.loadWallet.walletsLoading;
export const selectToWallets          = (s) => s.loadWallet.toWallets;
export const selectToWalletsLoading   = (s) => s.loadWallet.toWalletsLoading;
export const selectLwSaveStatus       = (s) => s.loadWallet.saveStatus;
export const selectLwSaveLoading      = (s) => s.loadWallet.saveLoading;
export const selectLwSaveError        = (s) => s.loadWallet.saveError;
export const selectVerifyGrid         = (s) => s.loadWallet.verifyGrid;
export const selectVerifyGridLoading  = (s) => s.loadWallet.verifyGridLoading;
export const selectVerifyGridError    = (s) => s.loadWallet.verifyGridError;
export const selectVerifyDetail       = (s) => s.loadWallet.verifyDetail;
export const selectVerifyDetailLoading = (s) => s.loadWallet.verifyDetailLoading;
export const selectApproveStatus      = (s) => s.loadWallet.approveStatus;
export const selectApproveLoading     = (s) => s.loadWallet.approveLoading;
export const selectApproveError       = (s) => s.loadWallet.approveError;

export default loadWalletSlice.reducer;
