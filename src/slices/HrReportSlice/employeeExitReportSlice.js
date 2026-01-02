import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as empExitAPI from '../../api/HRReportAPI/employeeExitReportAPI';

// Async Thunks for Employee Exit Report APIs
// ===========================================

// 1. Fetch Employee Exit Report by Date Range
export const fetchEmpExit = createAsyncThunk(
    'employeeexitreport/fetchEmpExit',
    async (params, { rejectWithValue }) => {
        try {
            const response = await empExitAPI.getEmpExit(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Exit Report');
        }
    }
);

// 2. Fetch Employee Exit Report Details by ID
export const fetchReportEmpExitById = createAsyncThunk(
    'employeeexitreport/fetchReportEmpExitById',
    async (params, { rejectWithValue }) => {
        try {
            const response = await empExitAPI.getReportEmpExitById(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Exit Report Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    empExitList: [],
    empExitDetails: null,

    // Loading states for each API
    loading: {
        empExitList: false,
        empExitDetails: false,
    },

    // Error states for each API
    errors: {
        empExitList: null,
        empExitDetails: null,
    },

    // UI State & Filters
    filters: {
        fromDate: '',
        toDate: '',
        selectedEmpRefNo: '',
        selectedId: '',
        selectedRoleId: ''
    }
};

// Employee Exit Report Slice
// ===========================
const employeeExitReportSlice = createSlice({
    name: 'employeeexitreport',
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
                toDate: '',
                selectedEmpRefNo: '',
                selectedId: '',
                selectedRoleId: ''
            };
        },

        // Action to reset employee exit report data
        resetEmpExitData: (state) => {
            state.empExitList = [];
            state.empExitDetails = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected details
        resetEmpExitDetails: (state) => {
            state.empExitDetails = null;
        },

        // Action to clear list data when filters change
        clearEmpExitListData: (state) => {
            state.empExitList = [];
            state.empExitDetails = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Employee Exit Report List
        builder
            .addCase(fetchEmpExit.pending, (state) => {
                state.loading.empExitList = true;
                state.errors.empExitList = null;
            })
            .addCase(fetchEmpExit.fulfilled, (state, action) => {
                state.loading.empExitList = false;
                state.empExitList = action.payload;
            })
            .addCase(fetchEmpExit.rejected, (state, action) => {
                state.loading.empExitList = false;
                state.errors.empExitList = action.payload;
            })

        // 2. Employee Exit Report Details
        builder
            .addCase(fetchReportEmpExitById.pending, (state) => {
                state.loading.empExitDetails = true;
                state.errors.empExitDetails = null;
            })
            .addCase(fetchReportEmpExitById.fulfilled, (state, action) => {
                state.loading.empExitDetails = false;
                state.empExitDetails = action.payload;
            })
            .addCase(fetchReportEmpExitById.rejected, (state, action) => {
                state.loading.empExitDetails = false;
                state.errors.empExitDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetEmpExitData, 
    clearError, 
    resetEmpExitDetails,
    clearEmpExitListData 
} = employeeExitReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectEmpExitList = (state) => state.employeeexitreport.empExitList;
export const selectEmpExitDetails = (state) => state.employeeexitreport.empExitDetails;

// Loading selectors
export const selectLoading = (state) => state.employeeexitreport.loading;
export const selectEmpExitListLoading = (state) => state.employeeexitreport.loading.empExitList;
export const selectEmpExitDetailsLoading = (state) => state.employeeexitreport.loading.empExitDetails;

// Error selectors
export const selectErrors = (state) => state.employeeexitreport.errors;
export const selectEmpExitListError = (state) => state.employeeexitreport.errors.empExitList;
export const selectEmpExitDetailsError = (state) => state.employeeexitreport.errors.empExitDetails;

// Filter selectors
export const selectFilters = (state) => state.employeeexitreport.filters;
export const selectFromDate = (state) => state.employeeexitreport.filters.fromDate;
export const selectToDate = (state) => state.employeeexitreport.filters.toDate;
export const selectSelectedEmpRefNo = (state) => state.employeeexitreport.filters.selectedEmpRefNo;
export const selectSelectedId = (state) => state.employeeexitreport.filters.selectedId;
export const selectSelectedRoleId = (state) => state.employeeexitreport.filters.selectedRoleId;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.employeeexitreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.employeeexitreport.errors).some(error => error !== null);

// Export reducer
export default employeeExitReportSlice.reducer;