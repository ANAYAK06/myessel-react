import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as trackingAPI from '../../api/dashboardAPI/trackingAPI';

export const fetchTrackingValues = createAsyncThunk(
    'pendingTracking/fetchTrackingValues',
    async (roleId, { rejectWithValue }) => {
        try {
            return await trackingAPI.getTrackingValues(roleId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed');
        }
    }
);

export const fetchTrackingNos = createAsyncThunk(
    'pendingTracking/fetchTrackingNos',
    async (params, { rejectWithValue }) => {
        try {
            return await trackingAPI.getTrackingNos(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed');
        }
    }
);

export const fetchTrackingData = createAsyncThunk(
    'pendingTracking/fetchTrackingData',
    async (params, { rejectWithValue }) => {
        try {
            return await trackingAPI.getTrackingData(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed');
        }
    }
);

const pendingTrackingSlice = createSlice({
    name: 'pendingTracking',
    initialState: {
        trackingValues: [],
        trackingNos: [],
        trackingData: [],
        selectedMoid: null,
        selectedRoleId: null,
        selectedRoleName: null,
        loading: { values: false, nos: false, data: false },
        errors: { values: null, nos: null, data: null },
    },
    reducers: {
        // Step 1: user picks a transaction type — clear everything below
        setSelectedMoid: (state, action) => {
            state.selectedMoid = action.payload;
            state.trackingNos = [];
            state.trackingData = [];
            state.selectedRoleId = null;
            state.selectedRoleName = null;
            state.errors.nos = null;
            state.errors.data = null;
        },
        // Step 2: user picks a role in the approval chain — clear table only
        setSelectedRole: (state, action) => {
            state.selectedRoleId = action.payload.roleId;
            state.selectedRoleName = action.payload.roleName;
            state.trackingData = [];
            state.errors.data = null;
        },
        clearTrackingDetail: (state) => {
            state.trackingNos = [];
            state.trackingData = [];
            state.selectedMoid = null;
            state.selectedRoleId = null;
            state.selectedRoleName = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTrackingValues.pending, (state) => {
                state.loading.values = true;
                state.errors.values = null;
            })
            .addCase(fetchTrackingValues.fulfilled, (state, action) => {
                state.loading.values = false;
                state.trackingValues = action.payload?.Data || [];
            })
            .addCase(fetchTrackingValues.rejected, (state, action) => {
                state.loading.values = false;
                state.errors.values = action.payload;
                state.trackingValues = [];
            });

        builder
            .addCase(fetchTrackingNos.pending, (state) => {
                state.loading.nos = true;
                state.errors.nos = null;
            })
            .addCase(fetchTrackingNos.fulfilled, (state, action) => {
                state.loading.nos = false;
                state.trackingNos = action.payload?.Data || [];
            })
            .addCase(fetchTrackingNos.rejected, (state, action) => {
                state.loading.nos = false;
                state.errors.nos = action.payload;
                state.trackingNos = [];
            });

        builder
            .addCase(fetchTrackingData.pending, (state) => {
                state.loading.data = true;
                state.errors.data = null;
            })
            .addCase(fetchTrackingData.fulfilled, (state, action) => {
                state.loading.data = false;
                state.trackingData = action.payload?.Data || [];
            })
            .addCase(fetchTrackingData.rejected, (state, action) => {
                state.loading.data = false;
                state.errors.data = action.payload;
                state.trackingData = [];
            });
    },
});

export const { setSelectedMoid, setSelectedRole, clearTrackingDetail } = pendingTrackingSlice.actions;

export const selectTrackingValues        = (state) => state.pendingTracking.trackingValues;
export const selectTrackingNos           = (state) => state.pendingTracking.trackingNos;
export const selectTrackingData          = (state) => state.pendingTracking.trackingData;
export const selectSelectedMoid          = (state) => state.pendingTracking.selectedMoid;
export const selectSelectedRoleId        = (state) => state.pendingTracking.selectedRoleId;
export const selectSelectedRoleName      = (state) => state.pendingTracking.selectedRoleName;
export const selectTrackingValuesLoading = (state) => state.pendingTracking.loading.values;
export const selectTrackingNosLoading    = (state) => state.pendingTracking.loading.nos;
export const selectTrackingDataLoading   = (state) => state.pendingTracking.loading.data;

export default pendingTrackingSlice.reducer;
