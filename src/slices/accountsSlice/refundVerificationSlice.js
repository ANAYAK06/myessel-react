import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getRefundVerificationList,
    getRefundVerificationById,
    verifyRefund,
} from '../../api/AccountsAPI/refundAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchRefundList = createAsyncThunk(
    'refundVerification/fetchList',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await getRefundVerificationList(roleId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchRefundDetail = createAsyncThunk(
    'refundVerification/fetchDetail',
    async (tranno, { rejectWithValue }) => {
        try {
            const res = await getRefundVerificationById(tranno);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const approveRefund = createAsyncThunk(
    'refundVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await verifyRefund(payload);
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

const refundVerificationSlice = createSlice({
    name: 'refundVerification',
    initialState,
    reducers: {
        clearRefundDetail:        (s) => { s.detail = null; },
        clearRefundApproveResult: (s) => { s.approvalResult = null; s.errors.approve = null; },
        resetRefundVerification:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRefundList.pending,   s => { s.loading.list = true;  s.errors.list = null; })
            .addCase(fetchRefundList.fulfilled, (s, a) => { s.loading.list = false; s.list = a.payload; })
            .addCase(fetchRefundList.rejected,  (s, a) => { s.loading.list = false; s.errors.list = a.payload; s.list = []; });

        builder
            .addCase(fetchRefundDetail.pending,   s => { s.loading.detail = true;  s.errors.detail = null; s.detail = null; })
            .addCase(fetchRefundDetail.fulfilled, (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchRefundDetail.rejected,  (s, a) => { s.loading.detail = false; s.errors.detail = a.payload; });

        builder
            .addCase(approveRefund.pending,   s => { s.loading.approve = true;  s.errors.approve = null; })
            .addCase(approveRefund.fulfilled, (s, a) => { s.loading.approve = false; s.approvalResult = a.payload; })
            .addCase(approveRefund.rejected,  (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });
    },
});

export const {
    clearRefundDetail,
    clearRefundApproveResult,
    resetRefundVerification,
} = refundVerificationSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectRefundList           = s => s.refundVerification.list;
export const selectRefundDetailData     = s => s.refundVerification.detail;
export const selectRefundApprovalResult = s => s.refundVerification.approvalResult;

export const selectRefundListLoading    = s => s.refundVerification.loading.list;
export const selectRefundDetailLoading  = s => s.refundVerification.loading.detail;
export const selectRefundApproveLoading = s => s.refundVerification.loading.approve;

export const selectRefundListError = s => s.refundVerification.errors.list;

export default refundVerificationSlice.reducer;
