import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as leaveReportAPI from '../../api/HRReportAPI/staffLeaveReportAPI';

// Async Thunks for Leave Report APIs
// ===================================

// 1. Fetch Leave Report Grid by Date Range
export const fetchLeaveReportGrid = createAsyncThunk(
    'leavereport/fetchLeaveReportGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await leaveReportAPI.getLeaveReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Leave Report Grid');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    leaveReportGrid: [],

    // Loading states for each API
    loading: {
        leaveReportGrid: false,
    },

    // Error states for each API
    errors: {
        leaveReportGrid: null,
    },

    // UI State & Filters
    filters: {
        fromDate: '',
        toDate: ''
    }
};

// Leave Report Slice
// ==================
const leaveReportSlice = createSlice({
    name: 'leavereport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                fromDate: '',
                toDate: ''
            };
        },

        // Action to reset leave report data
        resetLeaveReportData: (state) => {
            state.leaveReportGrid = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        }
    },
    extraReducers: (builder) => {
        // 1. Leave Report Grid
        builder
            .addCase(fetchLeaveReportGrid.pending, (state) => {
                state.loading.leaveReportGrid = true;
                state.errors.leaveReportGrid = null;
            })
            .addCase(fetchLeaveReportGrid.fulfilled, (state, action) => {
                state.loading.leaveReportGrid = false;
                state.leaveReportGrid = action.payload;
            })
            .addCase(fetchLeaveReportGrid.rejected, (state, action) => {
                state.loading.leaveReportGrid = false;
                state.errors.leaveReportGrid = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetLeaveReportData, 
    clearError
} = leaveReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectLeaveReportGrid = (state) => state.leavereport.leaveReportGrid;

// Loading selectors
export const selectLoading = (state) => state.leavereport.loading;
export const selectLeaveReportGridLoading = (state) => state.leavereport.loading.leaveReportGrid;

// Error selectors
export const selectErrors = (state) => state.leavereport.errors;
export const selectLeaveReportGridError = (state) => state.leavereport.errors.leaveReportGrid;

// Filter selectors
export const selectFilters = (state) => state.leavereport.filters;
export const selectFromDate = (state) => state.leavereport.filters.fromDate;
export const selectToDate = (state) => state.leavereport.filters.toDate;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.leavereport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.leavereport.errors).some(error => error !== null);

// Export reducer
export default leaveReportSlice.reducer;