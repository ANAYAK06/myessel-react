import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllUnsecuredLoans,
    checkAccessForLoan,
    saveNewUnsLoan,
    saveUnsLoanTopUp,
    saveUnsLoanRepay,
    updateUnsLoanInterest,
} from '../../api/AccountsAPI/unsecuredLoanAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchAllUnsecuredLoans = createAsyncThunk(
    'unsecuredLoan/fetchAll',
    async (params, { rejectWithValue }) => {
        try { return await getAllUnsecuredLoans(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch loans'); }
    }
);

export const fetchLoanAccess = createAsyncThunk(
    'unsecuredLoan/fetchAccess',
    async (params, { rejectWithValue }) => {
        try { return await checkAccessForLoan(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to check access'); }
    }
);

export const submitNewUnsLoan = createAsyncThunk(
    'unsecuredLoan/submitNew',
    async (payload, { rejectWithValue }) => {
        try { return await saveNewUnsLoan(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save new loan'); }
    }
);

export const submitUnsLoanTopUp = createAsyncThunk(
    'unsecuredLoan/submitTopUp',
    async (payload, { rejectWithValue }) => {
        try { return await saveUnsLoanTopUp(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save topup'); }
    }
);

export const submitUnsLoanRepay = createAsyncThunk(
    'unsecuredLoan/submitRepay',
    async (payload, { rejectWithValue }) => {
        try { return await saveUnsLoanRepay(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save repayment'); }
    }
);

export const submitUpdateInterest = createAsyncThunk(
    'unsecuredLoan/updateInterest',
    async (payload, { rejectWithValue }) => {
        try { return await updateUnsLoanInterest(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to update interest rate'); }
    }
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const isSaved = (payload) => {
    const raw = payload?.Data || payload || '';
    const msg = typeof raw === 'string' ? raw.split('$')[0].trim() : '';
    return msg === 'Submited' || payload?.IsSuccessful === true;
};

const extractMsg = (payload) => {
    const raw = payload?.Data || payload || '';
    return typeof raw === 'string' ? raw : '';
};

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    loans:         [],
    loansLoading:  false,
    loansError:    null,

    access:        null,   // { NewLoanAccess, TopupAccess, RepayAccess, ViewAccess, EditInteresAccess }
    accessLoading: false,

    saveStatus:    null,   // null | 'success' | 'failed'
    saveLoading:   false,
    saveError:     null,

    interestSaveStatus:  null,
    interestSaveLoading: false,
    interestSaveError:   null,
};

const unsecuredLoanSlice = createSlice({
    name: 'unsecuredLoan',
    initialState,
    reducers: {
        clearSaveResult:         (s) => { s.saveStatus = null; s.saveError = null; },
        clearInterestSaveResult: (s) => { s.interestSaveStatus = null; s.interestSaveError = null; },
        resetUnsecuredLoan:      () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch loans
        builder
            .addCase(fetchAllUnsecuredLoans.pending,   (s) => { s.loansLoading = true; s.loansError = null; })
            .addCase(fetchAllUnsecuredLoans.fulfilled, (s, a) => { s.loansLoading = false; s.loans = a.payload?.Data || []; })
            .addCase(fetchAllUnsecuredLoans.rejected,  (s, a) => { s.loansLoading = false; s.loansError = a.payload; });

        // Fetch access
        builder
            .addCase(fetchLoanAccess.pending,   (s) => { s.accessLoading = true; })
            .addCase(fetchLoanAccess.fulfilled, (s, a) => { s.accessLoading = false; s.access = a.payload?.Data || null; })
            .addCase(fetchLoanAccess.rejected,  (s) => { s.accessLoading = false; });

        // Submit (New / TopUp / Repay share same save state)
        const saveThunks = [submitNewUnsLoan, submitUnsLoanTopUp, submitUnsLoanRepay];
        saveThunks.forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = null; })
                .addCase(thunk.fulfilled, (s, a) => {
                    s.saveLoading = false;
                    s.saveStatus  = isSaved(a.payload) ? 'success' : 'failed';
                    if (s.saveStatus === 'failed') s.saveError = extractMsg(a.payload) || 'Save failed';
                })
                .addCase(thunk.rejected,  (s, a) => { s.saveLoading = false; s.saveStatus = 'failed'; s.saveError = a.payload; });
        });

        // Update interest
        builder
            .addCase(submitUpdateInterest.pending,   (s) => { s.interestSaveLoading = true; s.interestSaveError = null; s.interestSaveStatus = null; })
            .addCase(submitUpdateInterest.fulfilled, (s, a) => {
                s.interestSaveLoading = false;
                s.interestSaveStatus  = isSaved(a.payload) ? 'success' : 'failed';
                if (s.interestSaveStatus === 'failed') s.interestSaveError = extractMsg(a.payload) || 'Update failed';
            })
            .addCase(submitUpdateInterest.rejected,  (s, a) => { s.interestSaveLoading = false; s.interestSaveStatus = 'failed'; s.interestSaveError = a.payload; });
    },
});

export const {
    clearSaveResult, clearInterestSaveResult, resetUnsecuredLoan,
} = unsecuredLoanSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectUnsLoans              = (s) => s.unsecuredLoan.loans;
export const selectUnsLoansLoading       = (s) => s.unsecuredLoan.loansLoading;
export const selectUnsLoansError         = (s) => s.unsecuredLoan.loansError;
export const selectLoanAccess            = (s) => s.unsecuredLoan.access;
export const selectLoanAccessLoading     = (s) => s.unsecuredLoan.accessLoading;
export const selectUnsSaveStatus         = (s) => s.unsecuredLoan.saveStatus;
export const selectUnsSaveLoading        = (s) => s.unsecuredLoan.saveLoading;
export const selectUnsSaveError          = (s) => s.unsecuredLoan.saveError;
export const selectInterestSaveStatus    = (s) => s.unsecuredLoan.interestSaveStatus;
export const selectInterestSaveLoading   = (s) => s.unsecuredLoan.interestSaveLoading;
export const selectInterestSaveError     = (s) => s.unsecuredLoan.interestSaveError;

export default unsecuredLoanSlice.reducer;
