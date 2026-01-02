import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as attendanceAPI from '../../api/HRReportAPI/staffAttendanceReportAPI';

// Async Thunks for Staff Attendance Report APIs
// ==============================================

// 1. Fetch Attendance Cost Centres by Month
export const fetchAttendanceCCByMonth = createAsyncThunk(
    'staffattendancereport/fetchAttendanceCCByMonth',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getAttendanceCCByMonth(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Attendance Cost Centres');
        }
    }
);

// 2. Fetch Attendance Data
export const fetchAttendanceData = createAsyncThunk(
    'staffattendancereport/fetchAttendanceData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getAttendanceData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Attendance Data');
        }
    }
);

// 3. Fetch Employees for Attendance Report
export const fetchEmployeesForAttendanceReport = createAsyncThunk(
    'staffattendancereport/fetchEmployeesForAttendanceReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getEmployeesForAttendanceReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employees for Attendance Report');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    attendanceCostCentres: [],
    attendanceData: [],
    attendanceEmployees: [],

    // Loading states for each API
    loading: {
        attendanceCostCentres: false,
        attendanceData: false,
        attendanceEmployees: false,
    },

    // Error states for each API
    errors: {
        attendanceCostCentres: null,
        attendanceData: null,
        attendanceEmployees: null,
    },

    // UI State & Filters
    filters: {
        selectedMonth: '',
        selectedYear: '',
        typeValue: '',
        reportType: 'costcentre', // costcentre, employee
        prefix: '',
        prefixType: ''
    }
};

// Staff Attendance Report Slice
// ==============================
const staffAttendanceReportSlice = createSlice({
    name: 'staffattendancereport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                selectedMonth: '',
                selectedYear: '',
                typeValue: '',
                reportType: 'costcentre',
                prefix: '',
                prefixType: ''
            };
        },

        // Action to set report type
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },

        // Action to reset attendance report data
        resetAttendanceData: (state) => {
            state.attendanceCostCentres = [];
            state.attendanceData = [];
            state.attendanceEmployees = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected data
        resetSelectedData: (state) => {
            state.attendanceData = [];
            state.attendanceEmployees = [];
        },

        // Action to clear cost centres when filters change
        clearCostCentresData: (state) => {
            state.attendanceCostCentres = [];
            state.attendanceData = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Attendance Cost Centres by Month
        builder
            .addCase(fetchAttendanceCCByMonth.pending, (state) => {
                state.loading.attendanceCostCentres = true;
                state.errors.attendanceCostCentres = null;
            })
            .addCase(fetchAttendanceCCByMonth.fulfilled, (state, action) => {
                state.loading.attendanceCostCentres = false;
                state.attendanceCostCentres = action.payload;
            })
            .addCase(fetchAttendanceCCByMonth.rejected, (state, action) => {
                state.loading.attendanceCostCentres = false;
                state.errors.attendanceCostCentres = action.payload;
            })

        // 2. Attendance Data
        builder
            .addCase(fetchAttendanceData.pending, (state) => {
                state.loading.attendanceData = true;
                state.errors.attendanceData = null;
            })
            .addCase(fetchAttendanceData.fulfilled, (state, action) => {
                state.loading.attendanceData = false;
                state.attendanceData = action.payload;
            })
            .addCase(fetchAttendanceData.rejected, (state, action) => {
                state.loading.attendanceData = false;
                state.errors.attendanceData = action.payload;
            })

        // 3. Employees for Attendance Report
        builder
            .addCase(fetchEmployeesForAttendanceReport.pending, (state) => {
                state.loading.attendanceEmployees = true;
                state.errors.attendanceEmployees = null;
            })
            .addCase(fetchEmployeesForAttendanceReport.fulfilled, (state, action) => {
                state.loading.attendanceEmployees = false;
                state.attendanceEmployees = action.payload;
            })
            .addCase(fetchEmployeesForAttendanceReport.rejected, (state, action) => {
                state.loading.attendanceEmployees = false;
                state.errors.attendanceEmployees = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    setReportType,
    resetAttendanceData, 
    clearError, 
    resetSelectedData,
    clearCostCentresData 
} = staffAttendanceReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAttendanceCostCentres = (state) => state.staffattendancereport.attendanceCostCentres;
export const selectAttendanceData = (state) => state.staffattendancereport.attendanceData;
export const selectAttendanceEmployees = (state) => state.staffattendancereport.attendanceEmployees;

// Loading selectors
export const selectLoading = (state) => state.staffattendancereport.loading;
export const selectAttendanceCostCentresLoading = (state) => state.staffattendancereport.loading.attendanceCostCentres;
export const selectAttendanceDataLoading = (state) => state.staffattendancereport.loading.attendanceData;
export const selectAttendanceEmployeesLoading = (state) => state.staffattendancereport.loading.attendanceEmployees;

// Error selectors
export const selectErrors = (state) => state.staffattendancereport.errors;
export const selectAttendanceCostCentresError = (state) => state.staffattendancereport.errors.attendanceCostCentres;
export const selectAttendanceDataError = (state) => state.staffattendancereport.errors.attendanceData;
export const selectAttendanceEmployeesError = (state) => state.staffattendancereport.errors.attendanceEmployees;

// Filter selectors
export const selectFilters = (state) => state.staffattendancereport.filters;
export const selectSelectedMonth = (state) => state.staffattendancereport.filters.selectedMonth;
export const selectSelectedYear = (state) => state.staffattendancereport.filters.selectedYear;
export const selectTypeValue = (state) => state.staffattendancereport.filters.typeValue;
export const selectReportType = (state) => state.staffattendancereport.filters.reportType;
export const selectPrefix = (state) => state.staffattendancereport.filters.prefix;
export const selectPrefixType = (state) => state.staffattendancereport.filters.prefixType;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffattendancereport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffattendancereport.errors).some(error => error !== null);

// Report-specific selectors
export const selectIsCostCentreReportType = (state) => state.staffattendancereport.filters.reportType === 'costcentre';
export const selectIsEmployeeReportType = (state) => state.staffattendancereport.filters.reportType === 'employee';

// Export reducer
export default staffAttendanceReportSlice.reducer;