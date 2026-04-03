import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/AccountsAPI/ccSepPaymentAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const checkSEPBudget = createAsyncThunk(
    'ccSepPayment/checkBudget',
    async (params, { rejectWithValue }) => {
        try { return await api.checkBudgetForCCSEPPayment(params); }
        catch (err) { return rejectWithValue(err.message || 'Budget check failed'); }
    }
);

export const submitCCSEPPayment = createAsyncThunk(
    'ccSepPayment/submit',
    async (payload, { rejectWithValue }) => {
        try { return await api.saveCCSEPPayment(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save SEP payment'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    budgetResult:  null,    // { isOk: bool, message: string }
    budgetLoading: false,
    budgetError:   null,
    saveResult:    null,
    saveStatus:    null,    // null | 'pending' | 'success' | 'failed'
    saveLoading:   false,
    saveError:     null,
};

const ccSepPaymentSlice = createSlice({
    name: 'ccSepPayment',
    initialState,
    reducers: {
        clearBudgetResult: (s) => { s.budgetResult = null; s.budgetError = null; },
        clearSaveResult:   (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetCCSepPayment: () => initialState,
    },
    extraReducers: (builder) => {
        // Budget check
        builder
            .addCase(checkSEPBudget.pending,   (s) => { s.budgetLoading = true;  s.budgetError = null; s.budgetResult = null; })
            .addCase(checkSEPBudget.fulfilled, (s, a) => {
                s.budgetLoading = false;
                const data    = a.payload?.Data || '';
                const isOk    = data === 'Exist';
                s.budgetResult = { isOk, message: data };
            })
            .addCase(checkSEPBudget.rejected,  (s, a) => { s.budgetLoading = false; s.budgetError = a.payload; });

        // Submit
        builder
            .addCase(submitCCSEPPayment.pending,   (s) => { s.saveLoading = true;  s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitCCSEPPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw     = a.payload?.Data || a.payload || '';
                const ok      = (typeof raw === 'string' && raw.split('$')[0].trim() === 'Submited') ||
                                a.payload?.IsSuccessful === true;
                s.saveStatus  = ok ? 'success' : 'failed';
                if (!ok) s.saveError = (typeof raw === 'string' && raw) || 'Save failed';
            })
            .addCase(submitCCSEPPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const { clearBudgetResult, clearSaveResult, resetCCSepPayment } = ccSepPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectSEPBudgetResult  = (s) => s.ccSepPayment.budgetResult;
export const selectSEPBudgetLoading = (s) => s.ccSepPayment.budgetLoading;
export const selectSEPBudgetError   = (s) => s.ccSepPayment.budgetError;
export const selectSEPSaveStatus    = (s) => s.ccSepPayment.saveStatus;
export const selectSEPSaveLoading   = (s) => s.ccSepPayment.saveLoading;
export const selectSEPSaveError     = (s) => s.ccSepPayment.saveError;

export default ccSepPaymentSlice.reducer;
