import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLaboursForReport } from '../../api/HRReportAPI/labourReportAPI';

export const fetchLabourReport = createAsyncThunk(
    'labourreport/fetchLabourReport',
    async (labourType, { rejectWithValue }) => {
        try {
            return await getLaboursForReport(labourType);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labour report');
        }
    }
);

const initialState = {
    labourList: [],
    loading: false,
    error: null,
    labourType: 'Own Labour',
};

const labourReportSlice = createSlice({
    name: 'labourreport',
    initialState,
    reducers: {
        setLabourType: (state, action) => {
            state.labourType = action.payload;
        },
        resetLabourReport: (state) => {
            state.labourList = [];
            state.error = null;
        },
        clearLabourError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLabourReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLabourReport.fulfilled, (state, action) => {
                state.loading = false;
                state.labourList = action.payload;
            })
            .addCase(fetchLabourReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setLabourType, resetLabourReport, clearLabourError } = labourReportSlice.actions;

export const selectLabourList = (state) => state.labourreport.labourList;
export const selectLabourLoading = (state) => state.labourreport.loading;
export const selectLabourError = (state) => state.labourreport.error;
export const selectLabourType = (state) => state.labourreport.labourType;

export default labourReportSlice.reducer;
