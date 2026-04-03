import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/bankTransferAPI';

// ── Thunk ─────────────────────────────────────────────────────────────────────

export const submitBankTransfer = createAsyncThunk(
    'bankTransfer/submit',
    async (payload, { rejectWithValue }) => {
        try { return await api.saveBankTransfer(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save bank transfer'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    saveResult:   null,
    saveStatus:   null, // null | 'pending' | 'success' | 'failed'
    loading:      false,
    error:        null,
};

const bankTransferSlice = createSlice({
    name: 'bankTransfer',
    initialState,
    reducers: {
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.error      = null;
        },
        resetBankTransfer: (state) => { Object.assign(state, initialState); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitBankTransfer.pending, (s) => {
                s.loading = true; s.error = null; s.saveStatus = 'pending';
            })
            .addCase(submitBankTransfer.fulfilled, (s, a) => {
                s.loading    = false;
                s.saveResult = a.payload;
                const raw    = a.payload?.Data || a.payload || '';
                const ok     = a.payload?.IsSuccessful === true ||
                               (typeof raw === 'string' && raw.toLowerCase().includes('successfull'));
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.error = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitBankTransfer.rejected, (s, a) => {
                s.loading = false; s.error = a.payload; s.saveStatus = 'failed';
            });
    },
});

export const { clearSaveResult, resetBankTransfer } = bankTransferSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectBtSaveResult = (s) => s.bankTransfer.saveResult;
export const selectBtSaveStatus = (s) => s.bankTransfer.saveStatus;
export const selectBtLoading    = (s) => s.bankTransfer.loading;
export const selectBtError      = (s) => s.bankTransfer.error;

export default bankTransferSlice.reducer;
