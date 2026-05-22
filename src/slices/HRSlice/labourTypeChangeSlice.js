import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/labourTypeChangeAPI';
import { getActiveLBContractors } from '../../api/HRAPI/labourBankChangeAPI';
import { getLaboursForReport } from '../../api/HRReportAPI/labourReportAPI';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchLabourTypeList = createAsyncThunk(
    'labourTypeChange/fetchLabourList',
    async (labourType, { rejectWithValue }) => {
        try {
            const res = await getLaboursForReport(labourType);
            return Array.isArray(res?.Data) ? res.Data : Array.isArray(res) ? res : [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch labours');
        }
    }
);

export const fetchLTCContractors = createAsyncThunk(
    'labourTypeChange/fetchContractors',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getActiveLBContractors();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch contractors');
        }
    }
);

export const fetchLTCMinDate = createAsyncThunk(
    'labourTypeChange/fetchMinDate',
    async (labourId, { rejectWithValue }) => {
        try {
            const res = await api.getLabourTypeChangeMinDate(labourId);
            return res?.Data || res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch min date');
        }
    }
);

export const submitLabourTypeChangeRequest = createAsyncThunk(
    'labourTypeChange/submitRequest',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.requestLabourTypeChange(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit request');
        }
    }
);

export const fetchLTCInbox = createAsyncThunk(
    'labourTypeChange/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getLabourTypeChangeInbox(roleId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inbox');
        }
    }
);

export const fetchLTCById = createAsyncThunk(
    'labourTypeChange/fetchById',
    async (requestId, { rejectWithValue }) => {
        try {
            const res = await api.getLabourTypeChangeById(requestId);
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch request detail');
        }
    }
);

export const verifyLTCRequest = createAsyncThunk(
    'labourTypeChange/verify',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.verifyLabourTypeChange(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to process verification');
        }
    }
);

export const fetchLTCWorkHistory = createAsyncThunk(
    'labourTypeChange/fetchWorkHistory',
    async (labourId, { rejectWithValue }) => {
        try {
            const res = await api.getLabourWorkHistory(labourId);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch work history');
        }
    }
);

export const fetchMyLTCRequests = createAsyncThunk(
    'labourTypeChange/fetchMyRequests',
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.getLabourTypeChangeRequests(params);
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch requests');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    labourList:    [],
    contractors:   [],
    minDate:       null,
    submitResult:  null,

    inbox:         [],
    requestDetail: null,
    workHistory:   [],
    verifyResult:  null,
    myRequests:    [],

    loading: {
        labourList:  false,
        contractors: false,
        minDate:     false,
        submit:      false,
        inbox:       false,
        detail:      false,
        workHistory: false,
        verify:      false,
        myRequests:  false,
    },
    errors: {
        labourList:  null,
        contractors: null,
        minDate:     null,
        submit:      null,
        inbox:       null,
        detail:      null,
        workHistory: null,
        verify:      null,
        myRequests:  null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const labourTypeChangeSlice = createSlice({
    name: 'labourTypeChange',
    initialState,
    reducers: {
        clearMinDate:      (s) => { s.minDate = null; s.errors.minDate = null; },
        clearSubmitResult: (s) => { s.submitResult = null; s.errors.submit = null; },
        clearVerifyResult: (s) => { s.verifyResult = null; s.errors.verify = null; },
        clearRequestDetail:(s) => { s.requestDetail = null; s.workHistory = []; },
        clearWorkHistory:  (s) => { s.workHistory = []; },
        resetAll:          () => initialState,
    },
    extraReducers: (builder) => {
        const pend = (key) => (s) => { s.loading[key] = true;  s.errors[key] = null; };
        const fail = (key) => (s, a) => { s.loading[key] = false; s.errors[key] = a.payload; };

        // labourList
        builder
            .addCase(fetchLabourTypeList.pending,   pend('labourList'))
            .addCase(fetchLabourTypeList.fulfilled,  (s, a) => { s.loading.labourList = false; s.labourList = a.payload; })
            .addCase(fetchLabourTypeList.rejected,   fail('labourList'));

        // contractors
        builder
            .addCase(fetchLTCContractors.pending,   pend('contractors'))
            .addCase(fetchLTCContractors.fulfilled,  (s, a) => { s.loading.contractors = false; s.contractors = a.payload; })
            .addCase(fetchLTCContractors.rejected,   fail('contractors'));

        // minDate
        builder
            .addCase(fetchLTCMinDate.pending,   pend('minDate'))
            .addCase(fetchLTCMinDate.fulfilled,  (s, a) => { s.loading.minDate = false; s.minDate = a.payload; })
            .addCase(fetchLTCMinDate.rejected,   fail('minDate'));

        // submit
        builder
            .addCase(submitLabourTypeChangeRequest.pending,   pend('submit'))
            .addCase(submitLabourTypeChangeRequest.fulfilled,  (s, a) => { s.loading.submit = false; s.submitResult = a.payload; })
            .addCase(submitLabourTypeChangeRequest.rejected,   fail('submit'));

        // inbox
        builder
            .addCase(fetchLTCInbox.pending,   pend('inbox'))
            .addCase(fetchLTCInbox.fulfilled,  (s, a) => { s.loading.inbox = false; s.inbox = a.payload; })
            .addCase(fetchLTCInbox.rejected,   (s, a) => { s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = []; });

        // detail
        builder
            .addCase(fetchLTCById.pending,   (s) => { s.loading.detail = true; s.errors.detail = null; s.requestDetail = null; })
            .addCase(fetchLTCById.fulfilled,  (s, a) => { s.loading.detail = false; s.requestDetail = a.payload; })
            .addCase(fetchLTCById.rejected,   fail('detail'));

        // verify
        builder
            .addCase(verifyLTCRequest.pending,   pend('verify'))
            .addCase(verifyLTCRequest.fulfilled,  (s, a) => { s.loading.verify = false; s.verifyResult = a.payload; })
            .addCase(verifyLTCRequest.rejected,   fail('verify'));

        // workHistory
        builder
            .addCase(fetchLTCWorkHistory.pending,   (s) => { s.loading.workHistory = true; s.errors.workHistory = null; s.workHistory = []; })
            .addCase(fetchLTCWorkHistory.fulfilled,  (s, a) => { s.loading.workHistory = false; s.workHistory = a.payload; })
            .addCase(fetchLTCWorkHistory.rejected,   fail('workHistory'));

        // myRequests
        builder
            .addCase(fetchMyLTCRequests.pending,   pend('myRequests'))
            .addCase(fetchMyLTCRequests.fulfilled,  (s, a) => { s.loading.myRequests = false; s.myRequests = a.payload; })
            .addCase(fetchMyLTCRequests.rejected,   fail('myRequests'));
    },
});

export const {
    clearMinDate, clearSubmitResult, clearVerifyResult,
    clearRequestDetail, clearWorkHistory, resetAll,
} = labourTypeChangeSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectLTCLabourList    = (s) => s.labourTypeChange.labourList;
export const selectLTCContractors   = (s) => s.labourTypeChange.contractors;
export const selectLTCMinDate       = (s) => s.labourTypeChange.minDate;
export const selectLTCSubmitResult  = (s) => s.labourTypeChange.submitResult;
export const selectLTCInbox         = (s) => Array.isArray(s.labourTypeChange.inbox) ? s.labourTypeChange.inbox : [];
export const selectLTCRequestDetail = (s) => s.labourTypeChange.requestDetail;
export const selectLTCWorkHistory   = (s) => s.labourTypeChange.workHistory;
export const selectLTCVerifyResult  = (s) => s.labourTypeChange.verifyResult;
export const selectLTCMyRequests    = (s) => s.labourTypeChange.myRequests;
export const selectLTCLoading       = (s) => s.labourTypeChange.loading;
export const selectLTCErrors        = (s) => s.labourTypeChange.errors;

export default labourTypeChangeSlice.reducer;
