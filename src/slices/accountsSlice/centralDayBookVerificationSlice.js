import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCentralDayBookList,
    getCentralDayBookVerificationById,
    verifyCentralDayBook,
} from '../../api/AccountsAPI/centralDayBookAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCentralDayBookList = createAsyncThunk(
    'centralDayBookVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getCentralDayBookList(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCentralDayBookDetail = createAsyncThunk(
    'centralDayBookVerification/fetchDetail',
    async (rowid, { rejectWithValue }) => {
        try {
            const res = await getCentralDayBookVerificationById(rowid);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveCentralDayBook = createAsyncThunk(
    'centralDayBookVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await verifyCentralDayBook(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    list:           [],
    detail:         null,
    approvalResult: null,
    loading: {
        list:    false,
        detail:  false,
        approve: false,
    },
    errors: {
        list:    null,
        detail:  null,
        approve: null,
    },
};

const centralDayBookVerificationSlice = createSlice({
    name: 'centralDayBookVerification',
    initialState,
    reducers: {
        clearCentralDayBookDetail:        (s) => { s.detail = null; },
        clearCentralDayBookApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        resetCentralDayBookVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCentralDayBookList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchCentralDayBookList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchCentralDayBookList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchCentralDayBookDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchCentralDayBookDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchCentralDayBookDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveCentralDayBook.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveCentralDayBook.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveCentralDayBook.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });
    },
});

export const {
    clearCentralDayBookDetail,
    clearCentralDayBookApproveResult,
    resetCentralDayBookVerification,
} = centralDayBookVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCentralDayBookList           = s => s.centralDayBookVerification.list;
export const selectCentralDayBookDetailData     = s => s.centralDayBookVerification.detail;
export const selectCentralDayBookApprovalResult = s => s.centralDayBookVerification.approvalResult;

export const selectCentralDayBookListLoading    = s => s.centralDayBookVerification.loading.list;
export const selectCentralDayBookDetailLoading  = s => s.centralDayBookVerification.loading.detail;
export const selectCentralDayBookApproveLoading = s => s.centralDayBookVerification.loading.approve;

export const selectCentralDayBookListError = s => s.centralDayBookVerification.errors.list;

export default centralDayBookVerificationSlice.reducer;
