import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCCClosingTypes,
    getCCClosingCCs,
    getCCStorePendings,
    getDCABudgetReport,
    getCCClosingStatusReport,
    saveCCClosingData,
    getVerifyCCClosingGrid,
    getVerifyCCClosingView,
    approveCCClose,
} from '../../api/AccountsAPI/ccClosingAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCCClosingTypes = createAsyncThunk(
    'ccClosing/fetchCCClosingTypes',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCCClosingTypes();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load closing types');
        }
    }
);

export const fetchCCClosingCCs = createAsyncThunk(
    'ccClosing/fetchCCClosingCCs',
    async ({ closingType, uid, rid }, { rejectWithValue }) => {
        try {
            const res = await getCCClosingCCs({ closingType, uid, rid });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load CC list');
        }
    }
);

export const fetchCCPendingStatus = createAsyncThunk(
    'ccClosing/fetchCCPendingStatus',
    async ({ ccCode, type }, { rejectWithValue }) => {
        try {
            const res = await getCCStorePendings({ ccCode, type });
            return Array.isArray(res.data?.Data) ? res.data.Data : [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to check pending status');
        }
    }
);

export const fetchDCABudgetReport = createAsyncThunk(
    'ccClosing/fetchDCABudgetReport',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getDCABudgetReport(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load DCA budget report');
        }
    }
);

export const fetchCCClosingStatusReport = createAsyncThunk(
    'ccClosing/fetchCCClosingStatusReport',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getCCClosingStatusReport(ccCode);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load CC status report');
        }
    }
);

export const submitCCClosingData = createAsyncThunk(
    'ccClosing/submitCCClosingData',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveCCClosingData(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save CC closing data');
        }
    }
);

export const fetchVerifyCCClosingGrid = createAsyncThunk(
    'ccClosing/fetchVerifyCCClosingGrid',
    async ({ roleId, created, userId }, { rejectWithValue }) => {
        try {
            const res = await getVerifyCCClosingGrid({ roleId, created, userId });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load verification list');
        }
    }
);

export const fetchVerifyCCClosingView = createAsyncThunk(
    'ccClosing/fetchVerifyCCClosingView',
    async ({ tranno, rid, typeid }, { rejectWithValue }) => {
        try {
            const res = await getVerifyCCClosingView({ tranno, rid, typeid });
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load closing detail');
        }
    }
);

export const submitApproveCCClose = createAsyncThunk(
    'ccClosing/submitApproveCCClose',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await approveCCClose(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to approve CC closing');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    closingTypes: [],
    ccList: [],
    pendingStatus: null,   // null = not checked yet, [] = no pending, [...] = has pending items
    dcaBudgetReport: [],
    statusReport: null,
    verifyList: [],
    verifyDetail: null,
    saveResult: null,
    approveResult: null,

    loading: {
        closingTypes: false,
        ccList: false,
        pendingStatus: false,
        dcaBudget: false,
        statusReport: false,
        save: false,
        verifyList: false,
        verifyDetail: false,
        approve: false,
    },
    errors: {
        closingTypes: null,
        ccList: null,
        pendingStatus: null,
        dcaBudget: null,
        statusReport: null,
        save: null,
        verifyList: null,
        verifyDetail: null,
        approve: null,
    },
};

const ccClosingSlice = createSlice({
    name: 'ccClosing',
    initialState,
    reducers: {
        clearSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        clearApproveResult: (state) => { state.approveResult = null; state.errors.approve = null; },
        clearPendingStatus: (state) => { state.pendingStatus = null; state.errors.pendingStatus = null; },
        clearStatusReport: (state) => { state.statusReport = null; state.dcaBudgetReport = []; },
        clearVerifyDetail: (state) => { state.verifyDetail = null; state.errors.verifyDetail = null; },
        resetCCClosing: () => initialState,
    },
    extraReducers: (builder) => {
        // Closing types
        builder
            .addCase(fetchCCClosingTypes.pending, s => { s.loading.closingTypes = true; s.errors.closingTypes = null; })
            .addCase(fetchCCClosingTypes.fulfilled, (s, a) => { s.loading.closingTypes = false; s.closingTypes = a.payload; })
            .addCase(fetchCCClosingTypes.rejected, (s, a) => { s.loading.closingTypes = false; s.errors.closingTypes = a.payload; });

        // CC list
        builder
            .addCase(fetchCCClosingCCs.pending, s => { s.loading.ccList = true; s.errors.ccList = null; s.ccList = []; })
            .addCase(fetchCCClosingCCs.fulfilled, (s, a) => { s.loading.ccList = false; s.ccList = a.payload; })
            .addCase(fetchCCClosingCCs.rejected, (s, a) => { s.loading.ccList = false; s.errors.ccList = a.payload; });

        // Pending status
        builder
            .addCase(fetchCCPendingStatus.pending, s => { s.loading.pendingStatus = true; s.errors.pendingStatus = null; s.pendingStatus = null; })
            .addCase(fetchCCPendingStatus.fulfilled, (s, a) => { s.loading.pendingStatus = false; s.pendingStatus = a.payload; })
            .addCase(fetchCCPendingStatus.rejected, (s, a) => { s.loading.pendingStatus = false; s.errors.pendingStatus = a.payload; });

        // DCA budget report
        builder
            .addCase(fetchDCABudgetReport.pending, s => { s.loading.dcaBudget = true; s.errors.dcaBudget = null; })
            .addCase(fetchDCABudgetReport.fulfilled, (s, a) => { s.loading.dcaBudget = false; s.dcaBudgetReport = a.payload; })
            .addCase(fetchDCABudgetReport.rejected, (s, a) => { s.loading.dcaBudget = false; s.errors.dcaBudget = a.payload; });

        // CC status report
        builder
            .addCase(fetchCCClosingStatusReport.pending, s => { s.loading.statusReport = true; s.errors.statusReport = null; })
            .addCase(fetchCCClosingStatusReport.fulfilled, (s, a) => { s.loading.statusReport = false; s.statusReport = a.payload; })
            .addCase(fetchCCClosingStatusReport.rejected, (s, a) => { s.loading.statusReport = false; s.errors.statusReport = a.payload; });

        // Save
        builder
            .addCase(submitCCClosingData.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitCCClosingData.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitCCClosingData.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });

        // Verify list
        builder
            .addCase(fetchVerifyCCClosingGrid.pending, s => { s.loading.verifyList = true; s.errors.verifyList = null; })
            .addCase(fetchVerifyCCClosingGrid.fulfilled, (s, a) => { s.loading.verifyList = false; s.verifyList = a.payload; })
            .addCase(fetchVerifyCCClosingGrid.rejected, (s, a) => { s.loading.verifyList = false; s.errors.verifyList = a.payload; });

        // Verify detail
        builder
            .addCase(fetchVerifyCCClosingView.pending, s => { s.loading.verifyDetail = true; s.errors.verifyDetail = null; s.verifyDetail = null; })
            .addCase(fetchVerifyCCClosingView.fulfilled, (s, a) => { s.loading.verifyDetail = false; s.verifyDetail = a.payload; })
            .addCase(fetchVerifyCCClosingView.rejected, (s, a) => { s.loading.verifyDetail = false; s.errors.verifyDetail = a.payload; });

        // Approve
        builder
            .addCase(submitApproveCCClose.pending, s => { s.loading.approve = true; s.errors.approve = null; s.approveResult = null; })
            .addCase(submitApproveCCClose.fulfilled, (s, a) => { s.loading.approve = false; s.approveResult = a.payload; })
            .addCase(submitApproveCCClose.rejected, (s, a) => { s.loading.approve = false; s.errors.approve = a.payload; });
    },
});

export const {
    clearSaveResult,
    clearApproveResult,
    clearPendingStatus,
    clearStatusReport,
    clearVerifyDetail,
    resetCCClosing,
} = ccClosingSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectClosingTypes     = s => s.ccClosing.closingTypes;
export const selectCCList           = s => s.ccClosing.ccList;
export const selectPendingStatus    = s => s.ccClosing.pendingStatus;
export const selectDCABudgetReport  = s => s.ccClosing.dcaBudgetReport;
export const selectCCStatusReport   = s => s.ccClosing.statusReport;
export const selectVerifyList       = s => s.ccClosing.verifyList;
export const selectVerifyDetail     = s => s.ccClosing.verifyDetail;
export const selectSaveResult       = s => s.ccClosing.saveResult;
export const selectApproveResult    = s => s.ccClosing.approveResult;

export const selectClosingTypesLoading  = s => s.ccClosing.loading.closingTypes;
export const selectCCListLoading        = s => s.ccClosing.loading.ccList;
export const selectPendingStatusLoading = s => s.ccClosing.loading.pendingStatus;
export const selectDCABudgetLoading     = s => s.ccClosing.loading.dcaBudget;
export const selectStatusReportLoading  = s => s.ccClosing.loading.statusReport;
export const selectSaveLoading          = s => s.ccClosing.loading.save;
export const selectVerifyListLoading    = s => s.ccClosing.loading.verifyList;
export const selectVerifyDetailLoading  = s => s.ccClosing.loading.verifyDetail;
export const selectApproveLoading       = s => s.ccClosing.loading.approve;

export const selectSaveError        = s => s.ccClosing.errors.save;
export const selectPendingError     = s => s.ccClosing.errors.pendingStatus;

export default ccClosingSlice.reducer;
