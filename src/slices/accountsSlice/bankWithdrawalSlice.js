import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/bankWithdrawalAPI';

// ── Thunk ─────────────────────────────────────────────────────────────────────

export const submitBankWithdrawal = createAsyncThunk(
    'bankWithdrawal/submit',
    async (payload, { rejectWithValue }) => {
        try { return await api.saveBankWithdrawal(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save withdrawal'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    saveResult:   null,
    saveStatus:   null, // null | 'pending' | 'success' | 'failed'
    loading:      false,
    error:        null,
};

const bankWithdrawalSlice = createSlice({
    name: 'bankWithdrawal',
    initialState,
    reducers: {
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.error      = null;
        },
        resetBankWithdrawal: (state) => { Object.assign(state, initialState); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitBankWithdrawal.pending, (s) => {
                s.loading = true; s.error = null; s.saveStatus = 'pending';
            })
            .addCase(submitBankWithdrawal.fulfilled, (s, a) => {
                s.loading    = false;
                s.saveResult = a.payload;
                const raw    = a.payload?.Data || a.payload || '';
                const ok     = a.payload?.IsSuccessful === true ||
                               (typeof raw === 'string' && raw.toLowerCase().includes('successfull'));
                s.saveStatus = ok ? 'success' : 'failed';
                if (!ok) s.error = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitBankWithdrawal.rejected, (s, a) => {
                s.loading = false; s.error = a.payload; s.saveStatus = 'failed';
            });
    },
});

export const { clearSaveResult, resetBankWithdrawal } = bankWithdrawalSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectBwSaveResult = (s) => s.bankWithdrawal.saveResult;
export const selectBwSaveStatus = (s) => s.bankWithdrawal.saveStatus;
export const selectBwLoading    = (s) => s.bankWithdrawal.loading;
export const selectBwError      = (s) => s.bankWithdrawal.error;

export default bankWithdrawalSlice.reducer;
