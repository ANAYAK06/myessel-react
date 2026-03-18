import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ctcAPI from '../../api/HRReportAPI/staffCTCReportAPI';

// Async Thunks for Staff CTC Report APIs
// ========================================

// 1. Fetch CTC Employee Cost Centers
export const fetchCTCEmpCostCenter = createAsyncThunk(
    'staffctcreport/fetchCTCEmpCostCenter',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ctcAPI.getCTCEmpCostCenter();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CTC Employee Cost Centers');
        }
    }
);

// 2. Fetch Employee CTC by Cost Center
export const fetchEmployeeCTCbyCC = createAsyncThunk(
    'staffctcreport/fetchEmployeeCTCbyCC',
    async (ccCode, { rejectWithValue }) => {
        try {
            const response = await ctcAPI.getEmployeeCTCbyCC(ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee CTC by Cost Center');
        }
    }
);

// 3. Fetch Employee CTC by Employee
export const fetchEmployeeCTCbyEmp = createAsyncThunk(
    'staffctcreport/fetchEmployeeCTCbyEmp',
    async (emprefNo, { rejectWithValue }) => {
        try {
            const response = await ctcAPI.getEmployeeCTCbyEmp(emprefNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee CTC by Employee');
        }
    }
);

// 4. Fetch Employee CTC for Report
export const fetchEmpCTCforReport = createAsyncThunk(
    'staffctcreport/fetchEmpCTCforReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await ctcAPI.getEmpCTCforReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee CTC for Report');
        }
    }
);

// 5. Fetch Auto Complete CTC Employee
export const fetchAutoCompleteCTCEmp = createAsyncThunk(
    'staffctcreport/fetchAutoCompleteCTCEmp',
    async (prefix, { rejectWithValue }) => {
        try {
            const response = await ctcAPI.getAutoCompleteCTCEmp(prefix);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Auto Complete CTC Employee');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    ctcCostCenters: [],
    employeeCTCbyCC: [],
    employeeCTCbyEmp: [],
    empCTCReport: null,
    autoCompleteEmployees: [],

    // Loading states for each API
    loading: {
        ctcCostCenters: false,
        employeeCTCbyCC: false,
        employeeCTCbyEmp: false,
        empCTCReport: false,
        autoCompleteEmployees: false,
    },

    // Error states for each API
    errors: {
        ctcCostCenters: null,
        employeeCTCbyCC: null,
        employeeCTCbyEmp: null,
        empCTCReport: null,
        autoCompleteEmployees: null,
    },

    // UI State & Filters
    filters: {
        selectedCostCenter: '',
        selectedEmployee: '',
        emprefNo: '',
        revisionNo: '',
        searchPrefix: '',
        reportType: 'employee' // employee, costcenter
    }
};

// Staff CTC Report Slice
// ======================
const staffCTCReportSlice = createSlice({
    name: 'staffctcreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                selectedCostCenter: '',
                selectedEmployee: '',
                emprefNo: '',
                revisionNo: '',
                searchPrefix: '',
                reportType: 'employee'
            };
        },

        // Action to set report type
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },

        // Action to set selected cost center
        setSelectedCostCenter: (state, action) => {
            state.filters.selectedCostCenter = action.payload;
        },

        // Action to set selected employee
        setSelectedEmployee: (state, action) => {
            state.filters.selectedEmployee = action.payload;
        },

        // Action to set search prefix
        setSearchPrefix: (state, action) => {
            state.filters.searchPrefix = action.payload;
        },
        
        // Action to reset CTC report data
        resetCTCReportData: (state) => {
            state.employeeCTCbyCC = [];
            state.employeeCTCbyEmp = [];
            state.empCTCReport = null;
            state.autoCompleteEmployees = [];
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
            state.employeeCTCbyCC = [];
            state.employeeCTCbyEmp = [];
            state.empCTCReport = null;
        },

        // Action to clear auto complete data
        clearAutoCompleteData: (state) => {
            state.autoCompleteEmployees = [];
        }
    },
    extraReducers: (builder) => {
        // 1. CTC Employee Cost Centers
        builder
            .addCase(fetchCTCEmpCostCenter.pending, (state) => {
                state.loading.ctcCostCenters = true;
                state.errors.ctcCostCenters = null;
            })
            .addCase(fetchCTCEmpCostCenter.fulfilled, (state, action) => {
                state.loading.ctcCostCenters = false;
                state.ctcCostCenters = action.payload;
            })
            .addCase(fetchCTCEmpCostCenter.rejected, (state, action) => {
                state.loading.ctcCostCenters = false;
                state.errors.ctcCostCenters = action.payload;
            })

        // 2. Employee CTC by Cost Center
        builder
            .addCase(fetchEmployeeCTCbyCC.pending, (state) => {
                state.loading.employeeCTCbyCC = true;
                state.errors.employeeCTCbyCC = null;
            })
            .addCase(fetchEmployeeCTCbyCC.fulfilled, (state, action) => {
                state.loading.employeeCTCbyCC = false;
                state.employeeCTCbyCC = action.payload;
            })
            .addCase(fetchEmployeeCTCbyCC.rejected, (state, action) => {
                state.loading.employeeCTCbyCC = false;
                state.errors.employeeCTCbyCC = action.payload;
            })

        // 3. Employee CTC by Employee
        builder
            .addCase(fetchEmployeeCTCbyEmp.pending, (state) => {
                state.loading.employeeCTCbyEmp = true;
                state.errors.employeeCTCbyEmp = null;
            })
            .addCase(fetchEmployeeCTCbyEmp.fulfilled, (state, action) => {
                state.loading.employeeCTCbyEmp = false;
                state.employeeCTCbyEmp = action.payload;
            })
            .addCase(fetchEmployeeCTCbyEmp.rejected, (state, action) => {
                state.loading.employeeCTCbyEmp = false;
                state.errors.employeeCTCbyEmp = action.payload;
            })

        // 4. Employee CTC for Report
        builder
            .addCase(fetchEmpCTCforReport.pending, (state) => {
                state.loading.empCTCReport = true;
                state.errors.empCTCReport = null;
            })
            .addCase(fetchEmpCTCforReport.fulfilled, (state, action) => {
                state.loading.empCTCReport = false;
                state.empCTCReport = action.payload;
            })
            .addCase(fetchEmpCTCforReport.rejected, (state, action) => {
                state.loading.empCTCReport = false;
                state.errors.empCTCReport = action.payload;
            })

        // 5. Auto Complete CTC Employee
        builder
            .addCase(fetchAutoCompleteCTCEmp.pending, (state) => {
                state.loading.autoCompleteEmployees = true;
                state.errors.autoCompleteEmployees = null;
            })
            .addCase(fetchAutoCompleteCTCEmp.fulfilled, (state, action) => {
                state.loading.autoCompleteEmployees = false;
                state.autoCompleteEmployees = action.payload;
            })
            .addCase(fetchAutoCompleteCTCEmp.rejected, (state, action) => {
                state.loading.autoCompleteEmployees = false;
                state.errors.autoCompleteEmployees = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    setReportType,
    setSelectedCostCenter,
    setSelectedEmployee,
    setSearchPrefix,
    resetCTCReportData, 
    clearError, 
    resetSelectedData,
    clearAutoCompleteData 
} = staffCTCReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectCTCCostCenters = (state) => state.staffctcreport.ctcCostCenters;
export const selectEmployeeCTCbyCC = (state) => state.staffctcreport.employeeCTCbyCC;
export const selectEmployeeCTCbyEmp = (state) => state.staffctcreport.employeeCTCbyEmp;
export const selectEmpCTCReport = (state) => state.staffctcreport.empCTCReport;
export const selectAutoCompleteEmployees = (state) => state.staffctcreport.autoCompleteEmployees;

// Loading selectors
export const selectLoading = (state) => state.staffctcreport.loading;
export const selectCTCCostCentersLoading = (state) => state.staffctcreport.loading.ctcCostCenters;
export const selectEmployeeCTCbyCCLoading = (state) => state.staffctcreport.loading.employeeCTCbyCC;
export const selectEmployeeCTCbyEmpLoading = (state) => state.staffctcreport.loading.employeeCTCbyEmp;
export const selectEmpCTCReportLoading = (state) => state.staffctcreport.loading.empCTCReport;
export const selectAutoCompleteEmployeesLoading = (state) => state.staffctcreport.loading.autoCompleteEmployees;

// Error selectors
export const selectErrors = (state) => state.staffctcreport.errors;
export const selectCTCCostCentersError = (state) => state.staffctcreport.errors.ctcCostCenters;
export const selectEmployeeCTCbyCCError = (state) => state.staffctcreport.errors.employeeCTCbyCC;
export const selectEmployeeCTCbyEmpError = (state) => state.staffctcreport.errors.employeeCTCbyEmp;
export const selectEmpCTCReportError = (state) => state.staffctcreport.errors.empCTCReport;
export const selectAutoCompleteEmployeesError = (state) => state.staffctcreport.errors.autoCompleteEmployees;

// Filter selectors
export const selectFilters = (state) => state.staffctcreport.filters;
export const selectSelectedCostCenter = (state) => state.staffctcreport.filters.selectedCostCenter;
export const selectSelectedEmployee = (state) => state.staffctcreport.filters.selectedEmployee;
export const selectEmprefNo = (state) => state.staffctcreport.filters.emprefNo;
export const selectRevisionNo = (state) => state.staffctcreport.filters.revisionNo;
export const selectSearchPrefix = (state) => state.staffctcreport.filters.searchPrefix;
export const selectReportType = (state) => state.staffctcreport.filters.reportType;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffctcreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffctcreport.errors).some(error => error !== null);

// Report-specific selectors
export const selectIsEmployeeReportType = (state) => state.staffctcreport.filters.reportType === 'employee';
export const selectIsCostCenterReportType = (state) => state.staffctcreport.filters.reportType === 'costcenter';

// Export reducer
export default staffCTCReportSlice.reducer;