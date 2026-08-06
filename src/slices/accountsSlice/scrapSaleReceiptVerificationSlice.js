import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getVerifyReceiptAgainstScrapSaleGrid,
    getVerifyReceiptAgainstScrapeSaleView,
    approveReceiptAgainstScrapSale,
} from '../../api/AccountsAPI/scrapSaleReceiptVerificationAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchSSRVList = createAsyncThunk(
    'scrapSaleReceiptVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getVerifyReceiptAgainstScrapSaleGrid(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchSSRVDetail = createAsyncThunk(
    'scrapSaleReceiptVerification/fetchDetail',
    async (refno, { rejectWithValue }) => {
        try {
            const res = await getVerifyReceiptAgainstScrapeSaleView(refno);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveSSRV = createAsyncThunk(
    'scrapSaleReceiptVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveReceiptAgainstScrapSale(payload);
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

const scrapSaleReceiptVerificationSlice = createSlice({
    name: 'scrapSaleReceiptVerification',
    initialState,
    reducers: {
        clearSSRVDetail:        (s) => { s.detail = null; },
        clearSSRVApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        resetSSRVVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSSRVList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchSSRVList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchSSRVList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchSSRVDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchSSRVDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchSSRVDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveSSRV.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveSSRV.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveSSRV.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });
    },
});

export const {
    clearSSRVDetail,
    clearSSRVApproveResult,
    resetSSRVVerification,
} = scrapSaleReceiptVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectSSRVList           = s => s.scrapSaleReceiptVerification.list;
export const selectSSRVDetail         = s => s.scrapSaleReceiptVerification.detail;
export const selectSSRVApprovalResult = s => s.scrapSaleReceiptVerification.approvalResult;

export const selectSSRVListLoading    = s => s.scrapSaleReceiptVerification.loading.list;
export const selectSSRVDetailLoading  = s => s.scrapSaleReceiptVerification.loading.detail;
export const selectSSRVApproveLoading = s => s.scrapSaleReceiptVerification.loading.approve;

export const selectSSRVListError = s => s.scrapSaleReceiptVerification.errors.list;

export default scrapSaleReceiptVerificationSlice.reducer;
