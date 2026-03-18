import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffReportAPI from '../../api/HRReportAPI/StaffReportAPI';

// Async Thunks for Staff Report APIs
// ===================================

// 1. Fetch All Staff by Role ID
export const fetchAllStaff = createAsyncThunk(
    'staffreport/fetchAllStaff',
    async (params, { rejectWithValue }) => {
        try {
            const response = await staffReportAPI.getAllStaff(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Staff List');
        }
    }
);

// 2. Fetch Staff Details by Reference Number
export const fetchStaffDetailsByRefNo = createAsyncThunk(
    'staffreport/fetchStaffDetailsByRefNo',
    async (params, { rejectWithValue }) => {
        try {
            const response = await staffReportAPI.getStaffDetailsByRefNo(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Staff Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    staffList: [],
    staffDetails: null,

    // Loading states for each API
    loading: {
        staffList: false,
        staffDetails: false,
    },

    // Error states for each API
    errors: {
        staffList: null,
        staffDetails: null,
    },

    // UI State & Filters
    filters: {
        roleId: '',
        selectedEmpRefNo: '',
    }
};

// Staff Report Slice
// ==================
const staffReportSlice = createSlice({
    name: 'staffreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                roleId: '',
                selectedEmpRefNo: '',
            };
        },

        // Action to reset staff report data
        resetStaffData: (state) => {
            state.staffList = [];
            state.staffDetails = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected details
        resetStaffDetails: (state) => {
            state.staffDetails = null;
        },

        // Action to clear list data when filters change
        clearStaffListData: (state) => {
            state.staffList = [];
            state.staffDetails = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Staff List
        builder
            .addCase(fetchAllStaff.pending, (state) => {
                state.loading.staffList = true;
                state.errors.staffList = null;
            })
            .addCase(fetchAllStaff.fulfilled, (state, action) => {
                state.loading.staffList = false;
                state.staffList = action.payload;
            })
            .addCase(fetchAllStaff.rejected, (state, action) => {
                state.loading.staffList = false;
                state.errors.staffList = action.payload;
            })

        // 2. Staff Details
        builder
            .addCase(fetchStaffDetailsByRefNo.pending, (state) => {
                state.loading.staffDetails = true;
                state.errors.staffDetails = null;
            })
            .addCase(fetchStaffDetailsByRefNo.fulfilled, (state, action) => {
                state.loading.staffDetails = false;
                state.staffDetails = action.payload;
            })
            .addCase(fetchStaffDetailsByRefNo.rejected, (state, action) => {
                state.loading.staffDetails = false;
                state.errors.staffDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetStaffData, 
    clearError, 
    resetStaffDetails,
    clearStaffListData 
} = staffReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectStaffList = (state) => state.staffreport.staffList;
export const selectStaffDetails = (state) => state.staffreport.staffDetails;

// Loading selectors
export const selectLoading = (state) => state.staffreport.loading;
export const selectStaffListLoading = (state) => state.staffreport.loading.staffList;
export const selectStaffDetailsLoading = (state) => state.staffreport.loading.staffDetails;

// Error selectors
export const selectErrors = (state) => state.staffreport.errors;
export const selectStaffListError = (state) => state.staffreport.errors.staffList;
export const selectStaffDetailsError = (state) => state.staffreport.errors.staffDetails;

// Filter selectors
export const selectFilters = (state) => state.staffreport.filters;
export const selectRoleId = (state) => state.staffreport.filters.roleId;
export const selectSelectedEmpRefNo = (state) => state.staffreport.filters.selectedEmpRefNo;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffreport.errors).some(error => error !== null);

// Export reducer
export default staffReportSlice.reducer;