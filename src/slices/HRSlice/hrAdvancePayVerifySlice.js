import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/hrAdvancePayVerifyAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchHRAdvancePayInbox = createAsyncThunk(
    'hrAdvancePay/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getHRAdvancePayForVerify(roleId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inbox');
        }
    }
);

export const fetchHRAdvancePayDetail = createAsyncThunk(
    'hrAdvancePay/fetchDetail',
    async ({ transNo, empRefNo }, { rejectWithValue }) => {
        try {
            const res = await api.getHRAdvancePayData({ transNo, empRefNo });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch advance details');
        }
    }
);

export const approveHRAdvancePay = createAsyncThunk(
    'hrAdvancePay/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.approveHRAdvancePayment(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to process approval');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    inbox:         [],
    detail:        null,
    approveResult: null,
    loading: {
        inbox:   false,
        detail:  false,
        approve: false,
    },
    errors: {
        inbox:   null,
        detail:  null,
        approve: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const hrAdvancePayVerifySlice = createSlice({
    name: 'hrAdvancePay',
    initialState,
    reducers: {
        clearDetail:        (s) => { s.detail = null; s.errors.detail = null; },
        clearApproveResult: (s) => { s.approveResult = null; s.errors.approve = null; },
        resetAll:           () => initialState,
    },
    extraReducers: (builder) => {
        const pend = (key) => (s) => { s.loading[key] = true;  s.errors[key] = null; };
        const fail = (key) => (s, a) => { s.loading[key] = false; s.errors[key] = a.payload; };

        // inbox
        builder
            .addCase(fetchHRAdvancePayInbox.pending,   pend('inbox'))
            .addCase(fetchHRAdvancePayInbox.fulfilled,  (s, a) => { s.loading.inbox = false; s.inbox = a.payload; })
            .addCase(fetchHRAdvancePayInbox.rejected,   (s, a) => { s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = []; });

        // detail
        builder
            .addCase(fetchHRAdvancePayDetail.pending,   (s) => { s.loading.detail = true; s.errors.detail = null; s.detail = null; })
            .addCase(fetchHRAdvancePayDetail.fulfilled,  (s, a) => { s.loading.detail = false; s.detail = a.payload; })
            .addCase(fetchHRAdvancePayDetail.rejected,   fail('detail'));

        // approve
        builder
            .addCase(approveHRAdvancePay.pending,   pend('approve'))
            .addCase(approveHRAdvancePay.fulfilled,  (s, a) => { s.loading.approve = false; s.approveResult = a.payload; })
            .addCase(approveHRAdvancePay.rejected,   fail('approve'));
    },
});

export const { clearDetail, clearApproveResult, resetAll } = hrAdvancePayVerifySlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectHRAdvancePayInbox   = (s) => Array.isArray(s.hrAdvancePay.inbox) ? s.hrAdvancePay.inbox : [];
export const selectHRAdvancePayDetail  = (s) => s.hrAdvancePay.detail;
export const selectHRAdvancePayLoading = (s) => s.hrAdvancePay.loading;
export const selectHRAdvancePayErrors  = (s) => s.hrAdvancePay.errors;

export default hrAdvancePayVerifySlice.reducer;
