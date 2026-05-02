import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllLoans, getLoanDetails, saveTermLoanPayment } from '../../api/AccountsAPI/termLoanPaymentAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchAllLoans = createAsyncThunk(
    'termLoanPayment/fetchAllLoans',
    async (_, { rejectWithValue }) => {
        try { return await getAllLoans(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch loans'); }
    }
);

export const fetchLoanDetails = createAsyncThunk(
    'termLoanPayment/fetchLoanDetails',
    async (loanNo, { rejectWithValue }) => {
        try { return await getLoanDetails(loanNo); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch loan details'); }
    }
);

export const submitTermLoanPayment = createAsyncThunk(
    'termLoanPayment/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveTermLoanPayment(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save payment'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    loans:         [],
    loansLoading:  false,
    loansError:    null,

    loanDetails:        null,   // Data[0] from GetAgencycode
    loanDetailsLoading: false,
    loanDetailsError:   null,

    saveStatus:  null,   // null | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const termLoanPaymentSlice = createSlice({
    name: 'termLoanPayment',
    initialState,
    reducers: {
        clearLoanDetails:       (s) => { s.loanDetails = null; s.loanDetailsError = null; },
        clearSaveResult:        (s) => { s.saveStatus = null; s.saveError = null; },
        resetTermLoanPayment:   () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllLoans.pending,   (s) => { s.loansLoading = true; s.loansError = null; })
            .addCase(fetchAllLoans.fulfilled, (s, a) => { s.loansLoading = false; s.loans = a.payload?.Data || []; })
            .addCase(fetchAllLoans.rejected,  (s, a) => { s.loansLoading = false; s.loansError = a.payload; });

        builder
            .addCase(fetchLoanDetails.pending,   (s) => { s.loanDetailsLoading = true; s.loanDetailsError = null; s.loanDetails = null; })
            .addCase(fetchLoanDetails.fulfilled, (s, a) => {
                s.loanDetailsLoading = false;
                s.loanDetails = a.payload?.Data?.[0] || null;
            })
            .addCase(fetchLoanDetails.rejected,  (s, a) => { s.loanDetailsLoading = false; s.loanDetailsError = a.payload; });

        builder
            .addCase(submitTermLoanPayment.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = null; })
            .addCase(submitTermLoanPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.trim() : '';
                s.saveStatus = (msg === 'Successfull' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = msg || 'Save failed';
            })
            .addCase(submitTermLoanPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const { clearLoanDetails, clearSaveResult, resetTermLoanPayment } = termLoanPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectLoans              = (s) => s.termLoanPayment.loans;
export const selectLoansLoading       = (s) => s.termLoanPayment.loansLoading;
export const selectLoanDetails        = (s) => s.termLoanPayment.loanDetails;
export const selectLoanDetailsLoading = (s) => s.termLoanPayment.loanDetailsLoading;
export const selectLoanDetailsError   = (s) => s.termLoanPayment.loanDetailsError;
export const selectTLPSaveStatus      = (s) => s.termLoanPayment.saveStatus;
export const selectTLPSaveLoading     = (s) => s.termLoanPayment.saveLoading;
export const selectTLPSaveError       = (s) => s.termLoanPayment.saveError;

export default termLoanPaymentSlice.reducer;
