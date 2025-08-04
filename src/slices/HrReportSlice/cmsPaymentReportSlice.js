import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cmsAPI from '../../api/HRReportAPI/cmsPaymentReportAPI';

// Async Thunks for 6 CMS Payment Report APIs
// ==========================================

// 1. Fetch CMS Years
export const fetchCMSYears = createAsyncThunk(
    'cmspaymentreport/fetchCMSYears',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSYears();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Years');
        }
    }
);

// 2. Fetch CMS Months by Year
export const fetchCMSMonthsByYear = createAsyncThunk(
    'cmspaymentreport/fetchCMSMonthsByYear',
    async (year, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSMonthsByYear(year);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Months');
        }
    }
);

// 3. Fetch CMS Paid Employees
export const fetchCMSPaidEmployee = createAsyncThunk(
    'cmspaymentreport/fetchCMSPaidEmployee',
    async (params, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSPaidEmployee(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Paid Employees');
        }
    }
);

// 4. Fetch CMS Pay Report Employee Data
export const fetchCMSPayReportEmployeeData = createAsyncThunk(
    'cmspaymentreport/fetchCMSPayReportEmployeeData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSPayReportEmployeeData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Pay Report Employee Data');
        }
    }
);

// 5. Fetch Employee Pay Slip Data
export const fetchEmpPaySlipData = createAsyncThunk(
    'cmspaymentreport/fetchEmpPaySlipData',
    async (paySlipData, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getEmpPaySlipData(paySlipData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Pay Slip Data');
        }
    }
);

// 6. Fetch CMS Paid Cost Centre by Month
export const fetchCMSPaidCCbyMonth = createAsyncThunk(
    'cmspaymentreport/fetchCMSPaidCCbyMonth',
    async (params, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSPaidCCbyMonth(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Paid Cost Centre Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    cmsYears: [],
    cmsMonths: [],
    cmsPaidEmployees: [],
    cmsPayReportEmployeeData: [],
    empPaySlipData: null,
    cmsPaidCostCentres: [],

    // Loading states for each API
    loading: {
        cmsYears: false,
        cmsMonths: false,
        cmsPaidEmployees: false,
        cmsPayReportEmployeeData: false,
        empPaySlipData: false,
        cmsPaidCostCentres: false,
    },

    // Error states for each API
    errors: {
        cmsYears: null,
        cmsMonths: null,
        cmsPaidEmployees: null,
        cmsPayReportEmployeeData: null,
        empPaySlipData: null,
        cmsPaidCostCentres: null,
    },

    // UI State & Filters
    filters: {
        selectedYear: '',
        selectedMonth: '',
        emprefNo: '',
        ccCode: '',
        reportType: 'employee' // employee, costcentre, month
    },

    // Pay Slip Parameters
    paySlipParams: {
        ccCode: '',
        categoryId: 0,
        consolidateTransNo: '',
        employeeName: '',
        payRollDate: '',
        transactionRefno: ''
    }
};

// CMS Payment Report Slice
// ========================
const cmsPaymentReportSlice = createSlice({
    name: 'cmspaymentreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                selectedYear: '',
                selectedMonth: '',
                emprefNo: '',
                ccCode: '',
                reportType: 'employee'
            };
        },

        // Action to set report type
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },

        // Action to set pay slip parameters
        setPaySlipParams: (state, action) => {
            state.paySlipParams = { ...state.paySlipParams, ...action.payload };
        },

        // Action to clear pay slip parameters
        clearPaySlipParams: (state) => {
            state.paySlipParams = {
                ccCode: '',
                categoryId: 0,
                consolidateTransNo: '',
                employeeName: '',
                payRollDate: '',
                transactionRefno: ''
            };
        },
        
        // Action to reset CMS payment report data
        resetCMSPaymentData: (state) => {
            state.cmsPaidEmployees = [];
            state.cmsPayReportEmployeeData = [];
            state.empPaySlipData = null;
            state.cmsPaidCostCentres = [];
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
            state.cmsPaidEmployees = [];
            state.cmsPayReportEmployeeData = [];
            state.empPaySlipData = null;
            state.cmsPaidCostCentres = [];
        },

        // Action to clear months when year changes
        clearMonthsData: (state) => {
            state.cmsMonths = [];
            state.cmsPaidEmployees = [];
            state.cmsPayReportEmployeeData = [];
            state.cmsPaidCostCentres = [];
        }
    },
    extraReducers: (builder) => {
        // 1. CMS Years
        builder
            .addCase(fetchCMSYears.pending, (state) => {
                state.loading.cmsYears = true;
                state.errors.cmsYears = null;
            })
            .addCase(fetchCMSYears.fulfilled, (state, action) => {
                state.loading.cmsYears = false;
                state.cmsYears = action.payload;
            })
            .addCase(fetchCMSYears.rejected, (state, action) => {
                state.loading.cmsYears = false;
                state.errors.cmsYears = action.payload;
            })

        // 2. CMS Months by Year
        builder
            .addCase(fetchCMSMonthsByYear.pending, (state) => {
                state.loading.cmsMonths = true;
                state.errors.cmsMonths = null;
            })
            .addCase(fetchCMSMonthsByYear.fulfilled, (state, action) => {
                state.loading.cmsMonths = false;
                state.cmsMonths = action.payload;
            })
            .addCase(fetchCMSMonthsByYear.rejected, (state, action) => {
                state.loading.cmsMonths = false;
                state.errors.cmsMonths = action.payload;
            })

        // 3. CMS Paid Employees
        builder
            .addCase(fetchCMSPaidEmployee.pending, (state) => {
                state.loading.cmsPaidEmployees = true;
                state.errors.cmsPaidEmployees = null;
            })
            .addCase(fetchCMSPaidEmployee.fulfilled, (state, action) => {
                state.loading.cmsPaidEmployees = false;
                state.cmsPaidEmployees = action.payload;
            })
            .addCase(fetchCMSPaidEmployee.rejected, (state, action) => {
                state.loading.cmsPaidEmployees = false;
                state.errors.cmsPaidEmployees = action.payload;
            })

        // 4. CMS Pay Report Employee Data
        builder
            .addCase(fetchCMSPayReportEmployeeData.pending, (state) => {
                state.loading.cmsPayReportEmployeeData = true;
                state.errors.cmsPayReportEmployeeData = null;
            })
            .addCase(fetchCMSPayReportEmployeeData.fulfilled, (state, action) => {
                state.loading.cmsPayReportEmployeeData = false;
                state.cmsPayReportEmployeeData = action.payload;
            })
            .addCase(fetchCMSPayReportEmployeeData.rejected, (state, action) => {
                state.loading.cmsPayReportEmployeeData = false;
                state.errors.cmsPayReportEmployeeData = action.payload;
            })

        // 5. Employee Pay Slip Data
        builder
            .addCase(fetchEmpPaySlipData.pending, (state) => {
                state.loading.empPaySlipData = true;
                state.errors.empPaySlipData = null;
            })
            .addCase(fetchEmpPaySlipData.fulfilled, (state, action) => {
                state.loading.empPaySlipData = false;
                state.empPaySlipData = action.payload;
            })
            .addCase(fetchEmpPaySlipData.rejected, (state, action) => {
                state.loading.empPaySlipData = false;
                state.errors.empPaySlipData = action.payload;
            })

        // 6. CMS Paid Cost Centre by Month
        builder
            .addCase(fetchCMSPaidCCbyMonth.pending, (state) => {
                state.loading.cmsPaidCostCentres = true;
                state.errors.cmsPaidCostCentres = null;
            })
            .addCase(fetchCMSPaidCCbyMonth.fulfilled, (state, action) => {
                state.loading.cmsPaidCostCentres = false;
                state.cmsPaidCostCentres = action.payload;
            })
            .addCase(fetchCMSPaidCCbyMonth.rejected, (state, action) => {
                state.loading.cmsPaidCostCentres = false;
                state.errors.cmsPaidCostCentres = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    setReportType,
    setPaySlipParams,
    clearPaySlipParams,
    resetCMSPaymentData, 
    clearError, 
    resetSelectedData,
    clearMonthsData 
} = cmsPaymentReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectCMSYears = (state) => state.cmspaymentreport.cmsYears;
export const selectCMSMonths = (state) => state.cmspaymentreport.cmsMonths;
export const selectCMSPaidEmployees = (state) => state.cmspaymentreport.cmsPaidEmployees;
export const selectCMSPayReportEmployeeData = (state) => state.cmspaymentreport.cmsPayReportEmployeeData;
export const selectEmpPaySlipData = (state) => state.cmspaymentreport.empPaySlipData;
export const selectCMSPaidCostCentres = (state) => state.cmspaymentreport.cmsPaidCostCentres;

// Loading selectors
export const selectLoading = (state) => state.cmspaymentreport.loading;
export const selectCMSYearsLoading = (state) => state.cmspaymentreport.loading.cmsYears;
export const selectCMSMonthsLoading = (state) => state.cmspaymentreport.loading.cmsMonths;
export const selectCMSPaidEmployeesLoading = (state) => state.cmspaymentreport.loading.cmsPaidEmployees;
export const selectCMSPayReportEmployeeDataLoading = (state) => state.cmspaymentreport.loading.cmsPayReportEmployeeData;
export const selectEmpPaySlipDataLoading = (state) => state.cmspaymentreport.loading.empPaySlipData;
export const selectCMSPaidCostCentresLoading = (state) => state.cmspaymentreport.loading.cmsPaidCostCentres;

// Error selectors
export const selectErrors = (state) => state.cmspaymentreport.errors;
export const selectCMSYearsError = (state) => state.cmspaymentreport.errors.cmsYears;
export const selectCMSMonthsError = (state) => state.cmspaymentreport.errors.cmsMonths;
export const selectCMSPaidEmployeesError = (state) => state.cmspaymentreport.errors.cmsPaidEmployees;
export const selectCMSPayReportEmployeeDataError = (state) => state.cmspaymentreport.errors.cmsPayReportEmployeeData;
export const selectEmpPaySlipDataError = (state) => state.cmspaymentreport.errors.empPaySlipData;
export const selectCMSPaidCostCentresError = (state) => state.cmspaymentreport.errors.cmsPaidCostCentres;

// Filter selectors
export const selectFilters = (state) => state.cmspaymentreport.filters;
export const selectSelectedYear = (state) => state.cmspaymentreport.filters.selectedYear;
export const selectSelectedMonth = (state) => state.cmspaymentreport.filters.selectedMonth;
export const selectEmprefNo = (state) => state.cmspaymentreport.filters.emprefNo;
export const selectCCCode = (state) => state.cmspaymentreport.filters.ccCode;
export const selectReportType = (state) => state.cmspaymentreport.filters.reportType;

// Pay Slip Parameters selectors
export const selectPaySlipParams = (state) => state.cmspaymentreport.paySlipParams;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.cmspaymentreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.cmspaymentreport.errors).some(error => error !== null);

// Report-specific selectors
export const selectIsEmployeeReportType = (state) => state.cmspaymentreport.filters.reportType === 'employee';
export const selectIsCostCentreReportType = (state) => state.cmspaymentreport.filters.reportType === 'costcentre';
export const selectIsMonthReportType = (state) => state.cmspaymentreport.filters.reportType === 'month';

// Export reducer
export default cmsPaymentReportSlice.reducer;