import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rejectionAlertAPI from '../../api/RejectionAlertAPI/rejectionAlertAPI';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchRejectionAlertCount = createAsyncThunk(
    'rejectionAlerts/fetchCount',
    async (userId, { rejectWithValue }) => {
        try {
            return await rejectionAlertAPI.getRejectionAlertCount(userId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rejection alert count');
        }
    }
);

export const fetchRejectionAlerts = createAsyncThunk(
    'rejectionAlerts/fetchAlerts',
    async (userId, { rejectWithValue }) => {
        try {
            return await rejectionAlertAPI.getRejectionAlerts(userId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch rejection alerts');
        }
    }
);

export const updateAlertStatus = createAsyncThunk(
    'rejectionAlerts/updateStatus',
    async (payload, { rejectWithValue }) => {
        // payload: { RejectionAlertId, UserId, Status }
        try {
            await rejectionAlertAPI.updateRejectionAlertStatus(payload);
            return payload;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update rejection alert status');
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const rejectionAlertSlice = createSlice({
    name: 'rejectionAlerts',
    initialState: {
        alerts: [],
        count: 0,
        loadingCount: false,
        loadingAlerts: false,
        error: null,
    },
    reducers: {
        // Optimistic local updates so the UI responds instantly
        markAlertRead: (state, action) => {
            const id = action.payload;
            const alert = state.alerts.find(a => a.RejectionAlertId === id);
            if (alert && !alert.IsRead) {
                alert.IsRead = true;
                state.count = Math.max(0, state.count - 1);
            }
        },
        dismissAlert: (state, action) => {
            const id = action.payload;
            const index = state.alerts.findIndex(a => a.RejectionAlertId === id);
            if (index !== -1) {
                const wasUnread = !state.alerts[index].IsRead;
                state.alerts.splice(index, 1);
                if (wasUnread) {
                    state.count = Math.max(0, state.count - 1);
                }
            }
        },
    },
    extraReducers: (builder) => {
        // Count
        builder
            .addCase(fetchRejectionAlertCount.pending, (state) => {
                state.loadingCount = true;
            })
            .addCase(fetchRejectionAlertCount.fulfilled, (state, action) => {
                state.loadingCount = false;
                // API may return a plain number or { count: N } or { Count: N }
                const raw = action.payload;
                if (typeof raw === 'number') {
                    state.count = raw;
                } else if (raw && typeof raw === 'object') {
                    state.count = raw.count ?? raw.Count ?? raw.AlertCount ?? 0;
                }
            })
            .addCase(fetchRejectionAlertCount.rejected, (state, action) => {
                state.loadingCount = false;
                state.error = action.payload;
            });

        // Alerts list
        builder
            .addCase(fetchRejectionAlerts.pending, (state) => {
                state.loadingAlerts = true;
            })
            .addCase(fetchRejectionAlerts.fulfilled, (state, action) => {
                state.loadingAlerts = false;
                const raw = action.payload;
                state.alerts = Array.isArray(raw) ? raw : (raw?.data ?? raw?.Data ?? []);
            })
            .addCase(fetchRejectionAlerts.rejected, (state, action) => {
                state.loadingAlerts = false;
                state.error = action.payload;
            });

        // Update status — optimistic already done via reducers above;
        // on rejection we could roll back, but keep it simple for now
        builder
            .addCase(updateAlertStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { markAlertRead, dismissAlert } = rejectionAlertSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectRejectionAlerts = (state) => state.rejectionAlerts.alerts;
export const selectRejectionAlertCount = (state) => state.rejectionAlerts.count;
export const selectRejectionAlertsLoading = (state) => state.rejectionAlerts.loadingAlerts;
export const selectRejectionCountLoading = (state) => state.rejectionAlerts.loadingCount;

export default rejectionAlertSlice.reducer;
