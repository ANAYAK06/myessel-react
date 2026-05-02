import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllAgencyCodes, saveTLDetails } from '../../api/AccountsAPI/termLoanCreationAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchAgencyCodes = createAsyncThunk(
    'termLoanCreation/fetchAgencyCodes',
    async (_, { rejectWithValue }) => {
        try { return await getAllAgencyCodes(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch agency codes'); }
    }
);

export const submitTermLoan = createAsyncThunk(
    'termLoanCreation/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveTLDetails(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save term loan'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    agencies:        [],
    agenciesLoading: false,
    agenciesError:   null,

    saveStatus:  null,   // null | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const termLoanCreationSlice = createSlice({
    name: 'termLoanCreation',
    initialState,
    reducers: {
        clearSaveResult:        (s) => { s.saveStatus = null; s.saveError = null; },
        resetTermLoanCreation:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAgencyCodes.pending,   (s) => { s.agenciesLoading = true; s.agenciesError = null; })
            .addCase(fetchAgencyCodes.fulfilled, (s, a) => { s.agenciesLoading = false; s.agencies = a.payload?.Data || []; })
            .addCase(fetchAgencyCodes.rejected,  (s, a) => { s.agenciesLoading = false; s.agenciesError = a.payload; });

        builder
            .addCase(submitTermLoan.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = null; })
            .addCase(submitTermLoan.fulfilled, (s, a) => {
                s.saveLoading = false;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.trim() : '';
                // SP returns "Successfull" (double-l)
                s.saveStatus = (msg === 'Successfull' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = msg || 'Save failed';
            })
            .addCase(submitTermLoan.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const { clearSaveResult, resetTermLoanCreation } = termLoanCreationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectAgencies        = (s) => s.termLoanCreation.agencies;
export const selectAgenciesLoading = (s) => s.termLoanCreation.agenciesLoading;
export const selectTLSaveStatus    = (s) => s.termLoanCreation.saveStatus;
export const selectTLSaveLoading   = (s) => s.termLoanCreation.saveLoading;
export const selectTLSaveError     = (s) => s.termLoanCreation.saveError;

export default termLoanCreationSlice.reducer;
