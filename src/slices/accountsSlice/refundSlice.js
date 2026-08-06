import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cashVoucherAPI from '../../api/AccountsAPI/cashVoucherAPI';
import * as refundAPI from '../../api/AccountsAPI/refundAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────
// CC/DCA/SubDCA cascades reuse the same endpoints CashVoucherCreation/GeneralPayment use
// (GetACCCCCode / GetCashDCACode / GetCashSDCACode). Refund needs two independent cascades
// (principal + optional interest) running at once, so they're wrapped here instead of
// sharing cashVoucherSlice's single dcaList/sdcaList state.

export const fetchRefundCCList = createAsyncThunk(
    'refund/fetchCCList',
    async ({ uid, rid }, { rejectWithValue }) => {
        try {
            const res = await cashVoucherAPI.getACCCCCode(uid, rid);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch cost centre list');
        }
    }
);

export const fetchRefundDCAList = createAsyncThunk(
    'refund/fetchDCAList',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await cashVoucherAPI.getCashDCACode(ccCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch account head list');
        }
    }
);

export const fetchRefundSDCAList = createAsyncThunk(
    'refund/fetchSDCAList',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await cashVoucherAPI.getCashSDCACode(dcaCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch sub account head list');
        }
    }
);

export const fetchRefundIntDCAList = createAsyncThunk(
    'refund/fetchIntDCAList',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await cashVoucherAPI.getCashDCACode(ccCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch interest account head list');
        }
    }
);

export const fetchRefundIntSDCAList = createAsyncThunk(
    'refund/fetchIntSDCAList',
    async (dcaCode, { rejectWithValue }) => {
        try {
            const res = await cashVoucherAPI.getCashSDCACode(dcaCode);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch interest sub account head list');
        }
    }
);

export const submitRefund = createAsyncThunk(
    'refund/submit',
    async (params, { rejectWithValue }) => {
        try {
            const res = await refundAPI.saveRefund(params);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save refund');
        }
    }
);

export const fetchReturnedRefund = createAsyncThunk(
    'refund/fetchReturned',
    async (bankRefno, { rejectWithValue }) => {
        try {
            const res = await refundAPI.getReturnedRefundById(bankRefno);
            const data = res.data?.Data;
            return Array.isArray(data) ? (data[0] || null) : (data || null);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to fetch returned refund');
        }
    }
);

export const resubmitRefund = createAsyncThunk(
    'refund/resubmit',
    async (params, { rejectWithValue }) => {
        try {
            const res = await refundAPI.updateRefund(params);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to resubmit refund');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    ccList:      [],
    dcaList:     [],
    sdcaList:    [],
    intDcaList:  [],
    intSdcaList: [],

    returnedRefund: null,
    saveResult:     null,
    saveStatus:     null,   // null | 'pending' | 'success' | 'failed'

    loading: {
        ccList:      false,
        dcaList:     false,
        sdcaList:    false,
        intDcaList:  false,
        intSdcaList: false,
        returnedRefund: false,
        save:        false,
    },
    errors: {
        ccList:      null,
        dcaList:     null,
        sdcaList:    null,
        intDcaList:  null,
        intSdcaList: null,
        returnedRefund: null,
        save:        null,
    },
};

const refundSlice = createSlice({
    name: 'refund',
    initialState,
    reducers: {
        clearRefundDCAAndBelow: (state) => {
            state.dcaList  = [];
            state.sdcaList = [];
        },
        clearRefundSDCAList: (state) => {
            state.sdcaList = [];
        },
        clearRefundIntDCAAndBelow: (state) => {
            state.intDcaList  = [];
            state.intSdcaList = [];
        },
        clearRefundIntSDCAList: (state) => {
            state.intSdcaList = [];
        },
        clearRefundSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },
        clearReturnedRefund: (state) => {
            state.returnedRefund = null;
            state.errors.returnedRefund = null;
        },
        resetRefund: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRefundCCList.pending,   (s) => { s.loading.ccList = true;  s.errors.ccList = null; })
            .addCase(fetchRefundCCList.fulfilled, (s, a) => { s.loading.ccList = false; s.ccList = a.payload; })
            .addCase(fetchRefundCCList.rejected,  (s, a) => { s.loading.ccList = false; s.errors.ccList = a.payload; s.ccList = []; });

        builder
            .addCase(fetchRefundDCAList.pending,   (s) => { s.loading.dcaList = true;  s.errors.dcaList = null; s.dcaList = []; s.sdcaList = []; })
            .addCase(fetchRefundDCAList.fulfilled, (s, a) => { s.loading.dcaList = false; s.dcaList = a.payload; })
            .addCase(fetchRefundDCAList.rejected,  (s, a) => { s.loading.dcaList = false; s.errors.dcaList = a.payload; s.dcaList = []; });

        builder
            .addCase(fetchRefundSDCAList.pending,   (s) => { s.loading.sdcaList = true;  s.errors.sdcaList = null; s.sdcaList = []; })
            .addCase(fetchRefundSDCAList.fulfilled, (s, a) => { s.loading.sdcaList = false; s.sdcaList = a.payload; })
            .addCase(fetchRefundSDCAList.rejected,  (s, a) => { s.loading.sdcaList = false; s.errors.sdcaList = a.payload; s.sdcaList = []; });

        builder
            .addCase(fetchRefundIntDCAList.pending,   (s) => { s.loading.intDcaList = true;  s.errors.intDcaList = null; s.intDcaList = []; s.intSdcaList = []; })
            .addCase(fetchRefundIntDCAList.fulfilled, (s, a) => { s.loading.intDcaList = false; s.intDcaList = a.payload; })
            .addCase(fetchRefundIntDCAList.rejected,  (s, a) => { s.loading.intDcaList = false; s.errors.intDcaList = a.payload; s.intDcaList = []; });

        builder
            .addCase(fetchRefundIntSDCAList.pending,   (s) => { s.loading.intSdcaList = true;  s.errors.intSdcaList = null; s.intSdcaList = []; })
            .addCase(fetchRefundIntSDCAList.fulfilled, (s, a) => { s.loading.intSdcaList = false; s.intSdcaList = a.payload; })
            .addCase(fetchRefundIntSDCAList.rejected,  (s, a) => { s.loading.intSdcaList = false; s.errors.intSdcaList = a.payload; s.intSdcaList = []; });

        builder
            .addCase(fetchReturnedRefund.pending,   (s) => { s.loading.returnedRefund = true;  s.errors.returnedRefund = null; s.returnedRefund = null; })
            .addCase(fetchReturnedRefund.fulfilled, (s, a) => { s.loading.returnedRefund = false; s.returnedRefund = a.payload; })
            .addCase(fetchReturnedRefund.rejected,  (s, a) => { s.loading.returnedRefund = false; s.errors.returnedRefund = a.payload; });

        const handleSavePending  = (s) => { s.loading.save = true;  s.errors.save = null; s.saveStatus = 'pending'; };
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
            .addCase(submitRefund.pending,   handleSavePending)
            .addCase(submitRefund.fulfilled, handleSaveFulfilled)
            .addCase(submitRefund.rejected,  handleSaveRejected);

        builder
            .addCase(resubmitRefund.pending,   handleSavePending)
            .addCase(resubmitRefund.fulfilled, handleSaveFulfilled)
            .addCase(resubmitRefund.rejected,  handleSaveRejected);
    },
});

export const {
    clearRefundDCAAndBelow,
    clearRefundSDCAList,
    clearRefundIntDCAAndBelow,
    clearRefundIntSDCAList,
    clearRefundSaveResult,
    clearReturnedRefund,
    resetRefund,
} = refundSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectRefundCCList      = (s) => s.refund.ccList;
export const selectRefundDCAList     = (s) => s.refund.dcaList;
export const selectRefundSDCAList    = (s) => s.refund.sdcaList;
export const selectRefundIntDCAList  = (s) => s.refund.intDcaList;
export const selectRefundIntSDCAList = (s) => s.refund.intSdcaList;

export const selectRefundCCLoading      = (s) => s.refund.loading.ccList;
export const selectRefundDCALoading     = (s) => s.refund.loading.dcaList;
export const selectRefundSDCALoading    = (s) => s.refund.loading.sdcaList;
export const selectRefundIntDCALoading  = (s) => s.refund.loading.intDcaList;
export const selectRefundIntSDCALoading = (s) => s.refund.loading.intSdcaList;

export const selectReturnedRefund        = (s) => s.refund.returnedRefund;
export const selectReturnedRefundLoading = (s) => s.refund.loading.returnedRefund;

export const selectRefundSaveResult  = (s) => s.refund.saveResult;
export const selectRefundSaveStatus  = (s) => s.refund.saveStatus;
export const selectRefundSaveLoading = (s) => s.refund.loading.save;
export const selectRefundSaveError   = (s) => s.refund.errors.save;

export default refundSlice.reducer;
