import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/LabourPayrollAPI/labourPayrollAPI';

export const uploadLabourStaging = createAsyncThunk(
    'labourPayroll/uploadStaging',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.uploadStaging(payload);
            return res?.Data || res;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Upload failed';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const fetchStagingPreview = createAsyncThunk(
    'labourPayroll/fetchStagingPreview',
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.getStagingPreview(params);
            return res?.Data || [];
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Failed to load preview';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const generateLabourPayroll = createAsyncThunk(
    'labourPayroll/generate',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.generatePayroll(payload);
            // Budget check failures come back as HTTP 200 with IsSuccessful: false
            // The error message lives on the outer wrapper (res.Message), not res.Data
            if (res?.IsSuccessful === false) {
                return rejectWithValue(res.Message || 'Payroll generation failed');
            }
            return res?.Data || res;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Payroll generation failed';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const fetchPayrollSummary = createAsyncThunk(
    'labourPayroll/fetchSummary',
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.getPayrollSummary(params);
            return res?.Data || null;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Failed to load summary';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const fetchPayrollInbox = createAsyncThunk(
    'labourPayroll/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getPayrollInbox(roleId);
            return res?.Data || [];
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Failed to load payroll inbox';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const fetchPayrollDetailForVerification = createAsyncThunk(
    'labourPayroll/fetchVerifyDetail',
    async (payrollId, { rejectWithValue }) => {
        try {
            const res = await api.getPayrollDetailForVerification(payrollId);
            return res?.Data || null;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Failed to load payroll detail';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

export const submitApproveLabourPayroll = createAsyncThunk(
    'labourPayroll/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.approveLabourPayroll(payload);
            if (res?.IsSuccessful === false) {
                return rejectWithValue(res.Message || 'Approval failed');
            }
            return res?.Data || res;
        } catch (err) {
            const detail = err?.ErrorDetails?.ErrorMessage;
            const msg = err?.Message || err?.message || 'Approval failed';
            return rejectWithValue(detail ? `${msg}: ${detail}` : msg);
        }
    }
);

const labourPayrollSlice = createSlice({
    name: 'labourPayroll',
    initialState: {
        stagingRows:      [],
        stagingLoading:   false,
        stagingError:     null,
        uploadBatchId:    null,

        previewRows:      [],
        previewLoading:   false,
        previewError:     null,

        generateLoading:  false,
        generateResult:   null,
        generateError:    null,

        summary:          null,
        summaryLoading:   false,
        summaryError:     null,

        inbox:            [],
        inboxLoading:     false,
        inboxError:       null,

        verifyDetail:     null,
        verifyDetailLoading: false,
        verifyDetailError:   null,

        approveLoading:   false,
        approveResult:    null,
        approveError:     null,
    },
    reducers: {
        clearPayrollState: () => ({
            stagingRows: [], stagingLoading: false, stagingError: null, uploadBatchId: null,
            previewRows: [], previewLoading: false, previewError: null,
            generateLoading: false, generateResult: null, generateError: null,
            summary: null, summaryLoading: false, summaryError: null,
            inbox: [], inboxLoading: false, inboxError: null,
            verifyDetail: null, verifyDetailLoading: false, verifyDetailError: null,
            approveLoading: false, approveResult: null, approveError: null,
        }),
        clearGenerateResult: (s) => { s.generateResult = null; s.generateError = null; },
        clearApproveResult:  (s) => { s.approveResult = null; s.approveError = null; },
        clearVerifyDetail:   (s) => { s.verifyDetail = null; s.verifyDetailError = null; },
    },
    extraReducers: (b) => {
        b
        .addCase(uploadLabourStaging.pending,   (s) => { s.stagingLoading = true;  s.stagingError = null; })
        .addCase(uploadLabourStaging.fulfilled, (s, a) => {
            s.stagingLoading = false;
            s.uploadBatchId  = a.payload?.UploadBatchId || (typeof a.payload === 'string' ? a.payload : null);
        })
        .addCase(uploadLabourStaging.rejected,  (s, a) => { s.stagingLoading = false; s.stagingError = a.payload; })

        .addCase(fetchStagingPreview.pending,   (s) => { s.previewLoading = true;  s.previewError = null; })
        .addCase(fetchStagingPreview.fulfilled, (s, a) => { s.previewLoading = false; s.previewRows = a.payload; })
        .addCase(fetchStagingPreview.rejected,  (s, a) => { s.previewLoading = false; s.previewError = a.payload; })

        .addCase(generateLabourPayroll.pending,   (s) => { s.generateLoading = true;  s.generateError = null; s.generateResult = null; })
        .addCase(generateLabourPayroll.fulfilled, (s, a) => { s.generateLoading = false; s.generateResult = a.payload; })
        .addCase(generateLabourPayroll.rejected,  (s, a) => { s.generateLoading = false; s.generateError = a.payload; })

        .addCase(fetchPayrollSummary.pending,   (s) => { s.summaryLoading = true;  s.summaryError = null; })
        .addCase(fetchPayrollSummary.fulfilled, (s, a) => { s.summaryLoading = false; s.summary = a.payload; })
        .addCase(fetchPayrollSummary.rejected,  (s, a) => { s.summaryLoading = false; s.summaryError = a.payload; })

        .addCase(fetchPayrollInbox.pending,   (s) => { s.inboxLoading = true;  s.inboxError = null; })
        .addCase(fetchPayrollInbox.fulfilled, (s, a) => { s.inboxLoading = false; s.inbox = a.payload; })
        .addCase(fetchPayrollInbox.rejected,  (s, a) => { s.inboxLoading = false; s.inboxError = a.payload; })

        .addCase(fetchPayrollDetailForVerification.pending,   (s) => { s.verifyDetailLoading = true;  s.verifyDetailError = null; })
        .addCase(fetchPayrollDetailForVerification.fulfilled, (s, a) => { s.verifyDetailLoading = false; s.verifyDetail = a.payload; })
        .addCase(fetchPayrollDetailForVerification.rejected,  (s, a) => { s.verifyDetailLoading = false; s.verifyDetailError = a.payload; })

        .addCase(submitApproveLabourPayroll.pending,   (s) => { s.approveLoading = true;  s.approveError = null; s.approveResult = null; })
        .addCase(submitApproveLabourPayroll.fulfilled, (s, a) => { s.approveLoading = false; s.approveResult = a.payload; })
        .addCase(submitApproveLabourPayroll.rejected,  (s, a) => { s.approveLoading = false; s.approveError = a.payload; });
    },
});

export const { clearPayrollState, clearGenerateResult, clearApproveResult, clearVerifyDetail } = labourPayrollSlice.actions;
export default labourPayrollSlice.reducer;
