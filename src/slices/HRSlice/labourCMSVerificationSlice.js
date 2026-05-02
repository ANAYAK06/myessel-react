import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/labourCMSPaymentAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchLabourCMSInbox = createAsyncThunk(
    'labourCMSVerification/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getInbox(roleId);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch Labour CMS inbox');
        }
    }
);

export const fetchLabourCMSDetail = createAsyncThunk(
    'labourCMSVerification/fetchDetail',
    async (cmsTransactionNo, { rejectWithValue }) => {
        try {
            const res = await api.getDetail(cmsTransactionNo);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch Labour CMS detail');
        }
    }
);

export const approveLabourCMSPayment = createAsyncThunk(
    'labourCMSVerification/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.approveLabourCMS(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to approve Labour CMS payment');
        }
    }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    inbox: [],
    detail: null,
    workerGrid: [],
    approvalResult: null,

    loading: {
        inbox: false,
        detail: false,
        approve: false,
    },
    errors: {
        inbox: null,
        detail: null,
        approve: null,
    },

    selectedTransactionNo: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const labourCMSVerificationSlice = createSlice({
    name: 'labourCMSVerification',
    initialState,
    reducers: {
        setSelectedTransactionNo: (state, action) => {
            state.selectedTransactionNo = action.payload;
        },
        resetDetail: (state) => {
            state.detail = null;
            state.workerGrid = [];
            state.approvalResult = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },
        resetVerificationData: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLabourCMSInbox.pending, (state) => {
                state.loading.inbox = true;
                state.errors.inbox = null;
            })
            .addCase(fetchLabourCMSInbox.fulfilled, (state, action) => {
                state.loading.inbox = false;
                state.inbox = action.payload?.Data || [];
            })
            .addCase(fetchLabourCMSInbox.rejected, (state, action) => {
                state.loading.inbox = false;
                state.errors.inbox = action.payload;
                state.inbox = [];
            })

            .addCase(fetchLabourCMSDetail.pending, (state) => {
                state.loading.detail = true;
                state.errors.detail = null;
            })
            .addCase(fetchLabourCMSDetail.fulfilled, (state, action) => {
                state.loading.detail = false;
                const rawData = action.payload?.Data;
                state.detail = rawData?.Header || null;
                state.workerGrid = rawData?.Details || [];
            })
            .addCase(fetchLabourCMSDetail.rejected, (state, action) => {
                state.loading.detail = false;
                state.errors.detail = action.payload;
                state.detail = null;
                state.workerGrid = [];
            })

            .addCase(approveLabourCMSPayment.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
            })
            .addCase(approveLabourCMSPayment.fulfilled, (state, action) => {
                state.loading.approve = false;
                state.approvalResult = action.payload;
            })
            .addCase(approveLabourCMSPayment.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve = action.payload;
            });
    },
});

export const {
    setSelectedTransactionNo,
    resetDetail,
    clearApprovalResult,
    resetVerificationData,
} = labourCMSVerificationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectInbox = (state) => {
    const inbox = state.labourCMSVerification.inbox;
    return Array.isArray(inbox) ? inbox : [];
};
export const selectDetail = (state) => state.labourCMSVerification.detail;
export const selectWorkerGrid = (state) => {
    const wg = state.labourCMSVerification.workerGrid;
    return Array.isArray(wg) ? wg : [];
};
export const selectApprovalResult = (state) => state.labourCMSVerification.approvalResult;

export const selectInboxLoading = (state) => state.labourCMSVerification.loading.inbox;
export const selectDetailLoading = (state) => state.labourCMSVerification.loading.detail;
export const selectApproveLoading = (state) => state.labourCMSVerification.loading.approve;

export const selectInboxError = (state) => state.labourCMSVerification.errors.inbox;
export const selectDetailError = (state) => state.labourCMSVerification.errors.detail;

export const selectSelectedTransactionNo = (state) => state.labourCMSVerification.selectedTransactionNo;

export default labourCMSVerificationSlice.reducer;
