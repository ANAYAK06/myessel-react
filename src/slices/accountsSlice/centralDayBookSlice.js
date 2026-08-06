import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as centralDayBookAPI from '../../api/AccountsAPI/centralDayBookAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCCCashBalance = createAsyncThunk(
    'centralDayBook/fetchCCCashBalance',
    async ({ roleId, uid }, { rejectWithValue }) => {
        try {
            const res = await centralDayBookAPI.getCCCashBalance(roleId, uid);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to fetch cost centre balances');
        }
    }
);

export const fetchCashAmounts = createAsyncThunk(
    'centralDayBook/fetchCashAmounts',
    async (_, { rejectWithValue }) => {
        try {
            const res = await centralDayBookAPI.getCashAmounts();
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to fetch balance summary');
        }
    }
);

export const submitCentralDayBook = createAsyncThunk(
    'centralDayBook/submit',
    async (params, { rejectWithValue }) => {
        try {
            const res = await centralDayBookAPI.saveCentralDayBook(params);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save central day book entry');
        }
    }
);

export const fetchReturnedCentralDayBook = createAsyncThunk(
    'centralDayBook/fetchReturned',
    async (rowid, { rejectWithValue }) => {
        try {
            const res = await centralDayBookAPI.getReturnedCentralDayBookById(rowid);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to fetch returned entry');
        }
    }
);

export const resubmitCentralDayBook = createAsyncThunk(
    'centralDayBook/resubmit',
    async (params, { rejectWithValue }) => {
        try {
            const res = await centralDayBookAPI.updateCentralDayBook(params);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to resubmit central day book entry');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    ccBalanceList: [],
    cashAmounts:   null,
    returnedCDB:   null,
    saveResult:    null,
    saveStatus:    null,   // null | 'pending' | 'success' | 'failed'

    loading: {
        ccBalanceList: false,
        cashAmounts:   false,
        returnedCDB:   false,
        save:          false,
    },
    errors: {
        ccBalanceList: null,
        cashAmounts:   null,
        returnedCDB:   null,
        save:          null,
    },
};

const centralDayBookSlice = createSlice({
    name: 'centralDayBook',
    initialState,
    reducers: {
        clearCentralDayBookSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },
        clearReturnedCentralDayBook: (state) => {
            state.returnedCDB = null;
            state.errors.returnedCDB = null;
        },
        resetCentralDayBook: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCCCashBalance.pending,   (s) => { s.loading.ccBalanceList = true;  s.errors.ccBalanceList = null; })
            .addCase(fetchCCCashBalance.fulfilled, (s, a) => { s.loading.ccBalanceList = false; s.ccBalanceList = a.payload; })
            .addCase(fetchCCCashBalance.rejected,  (s, a) => { s.loading.ccBalanceList = false; s.errors.ccBalanceList = a.payload; s.ccBalanceList = []; });

        builder
            .addCase(fetchCashAmounts.pending,   (s) => { s.loading.cashAmounts = true;  s.errors.cashAmounts = null; })
            .addCase(fetchCashAmounts.fulfilled, (s, a) => { s.loading.cashAmounts = false; s.cashAmounts = a.payload; })
            .addCase(fetchCashAmounts.rejected,  (s, a) => { s.loading.cashAmounts = false; s.errors.cashAmounts = a.payload; s.cashAmounts = null; });

        builder
            .addCase(fetchReturnedCentralDayBook.pending,   (s) => { s.loading.returnedCDB = true;  s.errors.returnedCDB = null; s.returnedCDB = null; })
            .addCase(fetchReturnedCentralDayBook.fulfilled, (s, a) => { s.loading.returnedCDB = false; s.returnedCDB = a.payload; })
            .addCase(fetchReturnedCentralDayBook.rejected,  (s, a) => { s.loading.returnedCDB = false; s.errors.returnedCDB = a.payload; });

        const handleSavePending   = (s) => { s.loading.save = true;  s.errors.save = null; s.saveStatus = 'pending'; };
        const handleSaveFulfilled = (s, a) => {
            s.loading.save = false;
            s.saveResult = a.payload;
            const msg = typeof a.payload === 'string' ? a.payload : (a.payload?.Message || '');
            const ok = msg === 'Successfull' || msg.toLowerCase().includes('success');
            s.saveStatus = ok ? 'success' : 'failed';
            if (!ok) s.errors.save = msg || 'Save failed';
        };
        const handleSaveRejected = (s, a) => { s.loading.save = false; s.errors.save = a.payload; s.saveStatus = 'failed'; };

        builder
            .addCase(submitCentralDayBook.pending,   handleSavePending)
            .addCase(submitCentralDayBook.fulfilled, handleSaveFulfilled)
            .addCase(submitCentralDayBook.rejected,  handleSaveRejected);

        builder
            .addCase(resubmitCentralDayBook.pending,   handleSavePending)
            .addCase(resubmitCentralDayBook.fulfilled, handleSaveFulfilled)
            .addCase(resubmitCentralDayBook.rejected,  handleSaveRejected);
    },
});

export const {
    clearCentralDayBookSaveResult,
    clearReturnedCentralDayBook,
    resetCentralDayBook,
} = centralDayBookSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCCBalanceList = (s) => s.centralDayBook.ccBalanceList;
export const selectCashAmounts   = (s) => s.centralDayBook.cashAmounts;

export const selectCCBalanceListLoading = (s) => s.centralDayBook.loading.ccBalanceList;
export const selectCashAmountsLoading   = (s) => s.centralDayBook.loading.cashAmounts;

export const selectReturnedCentralDayBook        = (s) => s.centralDayBook.returnedCDB;
export const selectReturnedCentralDayBookLoading = (s) => s.centralDayBook.loading.returnedCDB;

export const selectCentralDayBookSaveResult  = (s) => s.centralDayBook.saveResult;
export const selectCentralDayBookSaveStatus  = (s) => s.centralDayBook.saveStatus;
export const selectCentralDayBookSaveLoading = (s) => s.centralDayBook.loading.save;
export const selectCentralDayBookSaveError   = (s) => s.centralDayBook.errors.save;

export default centralDayBookSlice.reducer;
