import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRReportAPI/ltaReportAPI';

export const fetchLTAReport = createAsyncThunk(
    'ltaReport/fetchReport',
    async (_, { rejectWithValue }) => {
        try {
            return await api.getLTAReport();
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch LTA report');
        }
    }
);

export const fetchLTADetail = createAsyncThunk(
    'ltaReport/fetchDetail',
    async (transNo, { rejectWithValue }) => {
        try {
            return await api.getLTADetailByTransNo(transNo);
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch LTA detail');
        }
    }
);

const ltaReportSlice = createSlice({
    name: 'ltaReport',
    initialState: {
        records: [],
        detail: null,
        loading: false,
        detailLoading: false,
        error: null,
        detailError: null,
    },
    reducers: {
        clearDetail: (state) => {
            state.detail = null;
            state.detailError = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLTAReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLTAReport.fulfilled, (state, action) => {
                state.loading = false;
                state.records = action.payload?.Data || [];
            })
            .addCase(fetchLTAReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.records = [];
            })
            .addCase(fetchLTADetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchLTADetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detail = action.payload?.Data || null;
            })
            .addCase(fetchLTADetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
                state.detail = null;
            });
    },
});

export const { clearDetail, clearError } = ltaReportSlice.actions;

export const selectLTARecords = (state) => state.ltaReport.records;
export const selectLTADetail = (state) => state.ltaReport.detail;
export const selectLTALoading = (state) => state.ltaReport.loading;
export const selectLTADetailLoading = (state) => state.ltaReport.detailLoading;
export const selectLTAError = (state) => state.ltaReport.error;

export default ltaReportSlice.reducer;
