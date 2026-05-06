import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bulkWorkerAPI from '../../api/HRAPI/bulkWorkerRegistrationAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

export const fetchVerifyBulkWorkerList = createAsyncThunk(
    'bulkWorkerVerify/fetchVerifyBulkWorkerList',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Bulk Worker List:', roleId);
            const response = await bulkWorkerAPI.getVerifyBulkWorker(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verification list');
        }
    }
);

export const fetchBulkWorkerDataById = createAsyncThunk(
    'bulkWorkerVerify/fetchBulkWorkerDataById',
    async ({ transRefno, id }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Bulk Worker Data - TransRefno:', transRefno, 'Id:', id);
            const response = await bulkWorkerAPI.getBulkWorkerDataById({ transRefno, id });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch batch detail');
        }
    }
);

export const approveBulkWorkerRegistration = createAsyncThunk(
    'bulkWorkerVerify/approveBulkWorkerRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving/Returning Bulk Worker Registration');
            const response = await bulkWorkerAPI.approveBulkWorker(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Approval failed');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    verificationList: [],
    selectedBatch: null,
    batchDetail: null,
    approveResult: null,
    loading: {
        list: false,
        detail: false,
        approve: false,
    },
    errors: {
        list: null,
        detail: null,
        approve: null,
    },
};

// ==============================================
// SLICE
// ==============================================
const bulkWorkerVerificationSlice = createSlice({
    name: 'bulkWorkerVerify',
    initialState,
    reducers: {
        setSelectedBatch: (state, action) => {
            state.selectedBatch = action.payload;
            state.batchDetail = null;
            state.approveResult = null;
        },
        clearApproveResult: (state) => {
            state.approveResult = null;
            state.errors.approve = null;
        },
        resetAll: (state) => {
            state.verificationList = [];
            state.selectedBatch = null;
            state.batchDetail = null;
            state.approveResult = null;
            state.loading = { list: false, detail: false, approve: false };
            state.errors = { list: null, detail: null, approve: null };
        },
    },
    extraReducers: (builder) => {
        // Fetch list
        builder
            .addCase(fetchVerifyBulkWorkerList.pending, (state) => {
                state.loading.list = true;
                state.errors.list = null;
            })
            .addCase(fetchVerifyBulkWorkerList.fulfilled, (state, action) => {
                state.loading.list = false;
                state.verificationList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifyBulkWorkerList.rejected, (state, action) => {
                state.loading.list = false;
                state.errors.list = action.payload;
                state.verificationList = [];
            });

        // Fetch batch detail
        builder
            .addCase(fetchBulkWorkerDataById.pending, (state) => {
                state.loading.detail = true;
                state.errors.detail = null;
                state.batchDetail = null;
            })
            .addCase(fetchBulkWorkerDataById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.batchDetail = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchBulkWorkerDataById.rejected, (state, action) => {
                state.loading.detail = false;
                state.errors.detail = action.payload;
                state.batchDetail = null;
            });

        // Approve
        builder
            .addCase(approveBulkWorkerRegistration.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
            })
            .addCase(approveBulkWorkerRegistration.fulfilled, (state, action) => {
                state.loading.approve = false;
                state.approveResult = action.payload;
            })
            .addCase(approveBulkWorkerRegistration.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve = action.payload;
            });
    },
});

export const { setSelectedBatch, clearApproveResult, resetAll } = bulkWorkerVerificationSlice.actions;

// ==============================================
// SELECTORS
// ==============================================
export const selectVerificationList = (state) => state.bulkWorkerVerify.verificationList;
export const selectVerificationListArray = (state) => {
    const list = state.bulkWorkerVerify.verificationList;
    return Array.isArray(list) ? list : [];
};
export const selectSelectedBatch = (state) => state.bulkWorkerVerify.selectedBatch;
export const selectBatchDetail = (state) => state.bulkWorkerVerify.batchDetail;
export const selectBatchDetailArray = (state) => {
    const detail = state.bulkWorkerVerify.batchDetail;
    return Array.isArray(detail) ? detail : [];
};
export const selectApproveResult = (state) => state.bulkWorkerVerify.approveResult;
export const selectListLoading = (state) => state.bulkWorkerVerify.loading.list;
export const selectDetailLoading = (state) => state.bulkWorkerVerify.loading.detail;
export const selectApproveLoading = (state) => state.bulkWorkerVerify.loading.approve;
export const selectListError = (state) => state.bulkWorkerVerify.errors.list;
export const selectDetailError = (state) => state.bulkWorkerVerify.errors.detail;
export const selectApproveError = (state) => state.bulkWorkerVerify.errors.approve;

export default bulkWorkerVerificationSlice.reducer;
