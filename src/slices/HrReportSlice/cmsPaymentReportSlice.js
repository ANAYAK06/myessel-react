import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cmsAPI from '../../api/HRReportAPI/cmsPaymentReportAPI';

// Async Thunks for CMS Payment Report APIs
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

// 2. Fetch CMS Months by Year (UPDATED to accept params object)
export const fetchCMSMonthsByYear = createAsyncThunk(
    'cmspaymentreport/fetchCMSMonthsByYear',
    async (params, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSMonthsByYear(params);
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
            // Return both data and eType to track which type was fetched
            return { data: response, eType: params.eType };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Paid Employees');
        }
    }
);

// 3a. Fetch CMS Paid Employees by Cost Centre (NEW)
export const fetchCMSPaidEmployeebyCC = createAsyncThunk(
    'cmspaymentreport/fetchCMSPaidEmployeebyCC',
    async (params, { rejectWithValue }) => {
        try {
            const response = await cmsAPI.getCMSPaidEmployeebyCC(params);
            // Return both data and eType to track which type was fetched
            return { data: response, eType: params.eType };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Paid Employees by Cost Centre');
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
            // Return both data and eType to track which type was fetched
            return { data: response, eType: params.eType };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CMS Paid Cost Centre Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs - Separated by Employee Type
    cmsYears: [],
    cmsMonths: [],

    // Staff Data
    cmsPaidEmployeesStaff: [],
    cmsPaidEmployeesByCCStaff: [],
    cmsPaidCostCentresStaff: [],

    // Labour Data
    cmsPaidEmployeesLabour: [],
    cmsPaidEmployeesByCCLabour: [],
    cmsPaidCostCentresLabour: [],

    // Common Data (not type-specific)
    cmsPayReportEmployeeData: [],
    empPaySlipData: null,

    // Loading states for each API - Separated by Employee Type
    loading: {
        cmsYears: false,
        cmsMonths: false,

        // Staff Loading States
        cmsPaidEmployeesStaff: false,
        cmsPaidEmployeesByCCStaff: false,
        cmsPaidCostCentresStaff: false,

        // Labour Loading States
        cmsPaidEmployeesLabour: false,
        cmsPaidEmployeesByCCLabour: false,
        cmsPaidCostCentresLabour: false,

        // Common Loading States
        cmsPayReportEmployeeData: false,
        empPaySlipData: false,
    },

    // Error states for each API - Separated by Employee Type
    errors: {
        cmsYears: null,
        cmsMonths: null,

        // Staff Error States
        cmsPaidEmployeesStaff: null,
        cmsPaidEmployeesByCCStaff: null,
        cmsPaidCostCentresStaff: null,

        // Labour Error States
        cmsPaidEmployeesLabour: null,
        cmsPaidEmployeesByCCLabour: null,
        cmsPaidCostCentresLabour: null,

        // Common Error States
        cmsPayReportEmployeeData: null,
        empPaySlipData: null,
    },

    // UI State & Filters
    filters: {
        selectedYear: '',
        selectedMonth: '',
        emprefNo: '',
        ccCode: '',
        lType: 'NA', // Default 'NA' for Staff
        contraCode: 'NA', // Default 'NA' for Staff
        eType: 'Staff', // 'Staff' or 'Labour'
        reportType: 'employee' // UI view type: 'employee', 'costcentre', 'month'
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
            const currentEType = state.filters.eType || 'Staff';
            state.filters = {
                selectedYear: '',
                selectedMonth: '',
                emprefNo: '',
                ccCode: '',
                lType: currentEType === 'Staff' ? 'NA' : '',
                contraCode: currentEType === 'Staff' ? 'NA' : '',
                eType: currentEType,
                reportType: 'employee'
            };
        },

        // Action to set employee type with proper lType and contraCode logic
        setEmployeeType: (state, action) => {
            const eType = action.payload;
            state.filters.eType = eType;

            // When eType is 'Staff', set lType and contraCode to 'NA'
            if (eType === 'Staff') {
                state.filters.lType = 'NA';
                state.filters.contraCode = 'NA';
            } else if (eType === 'Labour') {
                // For Labour, lType and contraCode can be empty or user-selected
                // Reset to empty strings so user can select
                state.filters.lType = '';
                state.filters.contraCode = '';
            }
        },

        // Action to set lType (only for Labour)
        setLType: (state, action) => {
            // Only allow setting lType if eType is Labour
            if (state.filters.eType === 'Labour') {
                state.filters.lType = action.payload;
            }
        },

        // Action to set contraCode (only for Labour)
        setContraCode: (state, action) => {
            // Only allow setting contraCode if eType is Labour
            if (state.filters.eType === 'Labour') {
                state.filters.contraCode = action.payload;
            }
        },

        // Action to set report type (UI view)
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
            state.cmsPaidEmployeesStaff = [];
            state.cmsPaidEmployeesByCCStaff = [];
            state.cmsPaidCostCentresStaff = [];
            state.cmsPaidEmployeesLabour = [];
            state.cmsPaidEmployeesByCCLabour = [];
            state.cmsPaidCostCentresLabour = [];
            state.cmsPayReportEmployeeData = [];
            state.empPaySlipData = null;
        },

        // Action to reset only Staff data
        resetStaffData: (state) => {
            state.cmsPaidEmployeesStaff = [];
            state.cmsPaidEmployeesByCCStaff = [];
            state.cmsPaidCostCentresStaff = [];
        },

        // Action to reset only Labour data
        resetLabourData: (state) => {
            state.cmsPaidEmployeesLabour = [];
            state.cmsPaidEmployeesByCCLabour = [];
            state.cmsPaidCostCentresLabour = [];
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
            state.cmsPaidEmployeesStaff = [];
            state.cmsPaidEmployeesByCCStaff = [];
            state.cmsPaidCostCentresStaff = [];
            state.cmsPaidEmployeesLabour = [];
            state.cmsPaidEmployeesByCCLabour = [];
            state.cmsPaidCostCentresLabour = [];
            state.cmsPayReportEmployeeData = [];
            state.empPaySlipData = null;
        },

        // Action to clear months when year changes
        clearMonthsData: (state) => {
            state.cmsMonths = [];
            state.cmsPaidEmployeesStaff = [];
            state.cmsPaidEmployeesByCCStaff = [];
            state.cmsPaidCostCentresStaff = [];
            state.cmsPaidEmployeesLabour = [];
            state.cmsPaidEmployeesByCCLabour = [];
            state.cmsPaidCostCentresLabour = [];
            state.cmsPayReportEmployeeData = [];
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

                state.cmsYears = action.payload?.Data || action.payload || [];
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
                state.cmsMonths = action.payload?.Data || action.payload || [];
            })

            .addCase(fetchCMSMonthsByYear.rejected, (state, action) => {
                state.loading.cmsMonths = false;
                state.errors.cmsMonths = action.payload;
            })

        // 3. CMS Paid Employees (handles both Staff and Labour)
        builder
            .addCase(fetchCMSPaidEmployee.pending, (state, action) => {
                // Determine which loading state to set based on eType in meta.arg
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesLabour = true;
                    state.errors.cmsPaidEmployeesLabour = null;
                } else {
                    state.loading.cmsPaidEmployeesStaff = true;
                    state.errors.cmsPaidEmployeesStaff = null;
                }
            })
            .addCase(fetchCMSPaidEmployee.fulfilled, (state, action) => {
                const { data, eType } = action.payload;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesLabour = false;
                    state.cmsPaidEmployeesLabour = data;
                } else {
                    state.loading.cmsPaidEmployeesStaff = false;
                    state.cmsPaidEmployeesStaff = data;
                }
            })
            .addCase(fetchCMSPaidEmployee.rejected, (state, action) => {
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesLabour = false;
                    state.errors.cmsPaidEmployeesLabour = action.payload;
                } else {
                    state.loading.cmsPaidEmployeesStaff = false;
                    state.errors.cmsPaidEmployeesStaff = action.payload;
                }
            })

        // 3a. CMS Paid Employees by Cost Centre (handles both Staff and Labour)
        builder
            .addCase(fetchCMSPaidEmployeebyCC.pending, (state, action) => {
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesByCCLabour = true;
                    state.errors.cmsPaidEmployeesByCCLabour = null;
                } else {
                    state.loading.cmsPaidEmployeesByCCStaff = true;
                    state.errors.cmsPaidEmployeesByCCStaff = null;
                }
            })
            .addCase(fetchCMSPaidEmployeebyCC.fulfilled, (state, action) => {
                const { data, eType } = action.payload;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesByCCLabour = false;
                    state.cmsPaidEmployeesByCCLabour = data;
                } else {
                    state.loading.cmsPaidEmployeesByCCStaff = false;
                    state.cmsPaidEmployeesByCCStaff = data;
                }
            })
            .addCase(fetchCMSPaidEmployeebyCC.rejected, (state, action) => {
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidEmployeesByCCLabour = false;
                    state.errors.cmsPaidEmployeesByCCLabour = action.payload;
                } else {
                    state.loading.cmsPaidEmployeesByCCStaff = false;
                    state.errors.cmsPaidEmployeesByCCStaff = action.payload;
                }
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

        // 6. CMS Paid Cost Centre by Month (handles both Staff and Labour)
        builder
            .addCase(fetchCMSPaidCCbyMonth.pending, (state, action) => {
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidCostCentresLabour = true;
                    state.errors.cmsPaidCostCentresLabour = null;
                } else {
                    state.loading.cmsPaidCostCentresStaff = true;
                    state.errors.cmsPaidCostCentresStaff = null;
                }
            })
            .addCase(fetchCMSPaidCCbyMonth.fulfilled, (state, action) => {
                const { data, eType } = action.payload;
                if (eType === 'Labour') {
                    state.loading.cmsPaidCostCentresLabour = false;
                    state.cmsPaidCostCentresLabour = data;
                } else {
                    state.loading.cmsPaidCostCentresStaff = false;
                    state.cmsPaidCostCentresStaff = data;
                }
            })
            .addCase(fetchCMSPaidCCbyMonth.rejected, (state, action) => {
                const eType = action.meta.arg?.eType;
                if (eType === 'Labour') {
                    state.loading.cmsPaidCostCentresLabour = false;
                    state.errors.cmsPaidCostCentresLabour = action.payload;
                } else {
                    state.loading.cmsPaidCostCentresStaff = false;
                    state.errors.cmsPaidCostCentresStaff = action.payload;
                }
            });
    },
});

// Export actions
export const {
    setFilters,
    clearFilters,
    setEmployeeType,
    setLType,
    setContraCode,
    setReportType,
    setPaySlipParams,
    clearPaySlipParams,
    resetCMSPaymentData,
    resetStaffData,
    resetLabourData,
    clearError,
    resetSelectedData,
    clearMonthsData
} = cmsPaymentReportSlice.actions;

// Selectors
// =========

// Data selectors - Common
export const selectCMSYears = (state) => state.cmspaymentreport.cmsYears;
export const selectCMSMonths = (state) => state.cmspaymentreport.cmsMonths;
export const selectCMSPayReportEmployeeData = (state) => state.cmspaymentreport.cmsPayReportEmployeeData;
export const selectEmpPaySlipData = (state) => state.cmspaymentreport.empPaySlipData;

// Data selectors - Staff
export const selectCMSPaidEmployeesStaff = (state) => state.cmspaymentreport.cmsPaidEmployeesStaff;
export const selectCMSPaidEmployeesByCCStaff = (state) => state.cmspaymentreport.cmsPaidEmployeesByCCStaff;
export const selectCMSPaidCostCentresStaff = (state) => state.cmspaymentreport.cmsPaidCostCentresStaff;

// Data selectors - Labour
export const selectCMSPaidEmployeesLabour = (state) => state.cmspaymentreport.cmsPaidEmployeesLabour;
export const selectCMSPaidEmployeesByCCLabour = (state) => state.cmspaymentreport.cmsPaidEmployeesByCCLabour;
export const selectCMSPaidCostCentresLabour = (state) => state.cmspaymentreport.cmsPaidCostCentresLabour;

// Dynamic selectors based on current eType filter
export const selectCurrentCMSPaidEmployees = (state) => {
    return state.cmspaymentreport.filters.eType === 'Labour'
        ? state.cmspaymentreport.cmsPaidEmployeesLabour
        : state.cmspaymentreport.cmsPaidEmployeesStaff;
};

export const selectCurrentCMSPaidEmployeesByCC = (state) => {
    return state.cmspaymentreport.filters.eType === 'Labour'
        ? state.cmspaymentreport.cmsPaidEmployeesByCCLabour
        : state.cmspaymentreport.cmsPaidEmployeesByCCStaff;
};

export const selectCurrentCMSPaidCostCentres = (state) => {
    return state.cmspaymentreport.filters.eType === 'Labour'
        ? state.cmspaymentreport.cmsPaidCostCentresLabour
        : state.cmspaymentreport.cmsPaidCostCentresStaff;
};

// Loading selectors - Common
export const selectLoading = (state) => state.cmspaymentreport.loading;
export const selectCMSYearsLoading = (state) => state.cmspaymentreport.loading.cmsYears;
export const selectCMSMonthsLoading = (state) => state.cmspaymentreport.loading.cmsMonths;
export const selectCMSPayReportEmployeeDataLoading = (state) => state.cmspaymentreport.loading.cmsPayReportEmployeeData;
export const selectEmpPaySlipDataLoading = (state) => state.cmspaymentreport.loading.empPaySlipData;

// Loading selectors - Staff
export const selectCMSPaidEmployeesStaffLoading = (state) => state.cmspaymentreport.loading.cmsPaidEmployeesStaff;
export const selectCMSPaidEmployeesByCCStaffLoading = (state) => state.cmspaymentreport.loading.cmsPaidEmployeesByCCStaff;
export const selectCMSPaidCostCentresStaffLoading = (state) => state.cmspaymentreport.loading.cmsPaidCostCentresStaff;

// Loading selectors - Labour
export const selectCMSPaidEmployeesLabourLoading = (state) => state.cmspaymentreport.loading.cmsPaidEmployeesLabour;
export const selectCMSPaidEmployeesByCCLabourLoading = (state) => state.cmspaymentreport.loading.cmsPaidEmployeesByCCLabour;
export const selectCMSPaidCostCentresLabourLoading = (state) => state.cmspaymentreport.loading.cmsPaidCostCentresLabour;

// Dynamic loading selector based on current eType
export const selectCurrentLoading = (state) => {
    const eType = state.cmspaymentreport.filters.eType;
    if (eType === 'Labour') {
        return state.cmspaymentreport.loading.cmsPaidEmployeesLabour ||
            state.cmspaymentreport.loading.cmsPaidEmployeesByCCLabour ||
            state.cmspaymentreport.loading.cmsPaidCostCentresLabour;
    } else {
        return state.cmspaymentreport.loading.cmsPaidEmployeesStaff ||
            state.cmspaymentreport.loading.cmsPaidEmployeesByCCStaff ||
            state.cmspaymentreport.loading.cmsPaidCostCentresStaff;
    }
};

// Error selectors - Common
export const selectErrors = (state) => state.cmspaymentreport.errors;
export const selectCMSYearsError = (state) => state.cmspaymentreport.errors.cmsYears;
export const selectCMSMonthsError = (state) => state.cmspaymentreport.errors.cmsMonths;
export const selectCMSPayReportEmployeeDataError = (state) => state.cmspaymentreport.errors.cmsPayReportEmployeeData;
export const selectEmpPaySlipDataError = (state) => state.cmspaymentreport.errors.empPaySlipData;

// Error selectors - Staff
export const selectCMSPaidEmployeesStaffError = (state) => state.cmspaymentreport.errors.cmsPaidEmployeesStaff;
export const selectCMSPaidEmployeesByCCStaffError = (state) => state.cmspaymentreport.errors.cmsPaidEmployeesByCCStaff;
export const selectCMSPaidCostCentresStaffError = (state) => state.cmspaymentreport.errors.cmsPaidCostCentresStaff;

// Error selectors - Labour
export const selectCMSPaidEmployeesLabourError = (state) => state.cmspaymentreport.errors.cmsPaidEmployeesLabour;
export const selectCMSPaidEmployeesByCCLabourError = (state) => state.cmspaymentreport.errors.cmsPaidEmployeesByCCLabour;
export const selectCMSPaidCostCentresLabourError = (state) => state.cmspaymentreport.errors.cmsPaidCostCentresLabour;

// Dynamic error selector based on current eType
export const selectCurrentError = (state) => {
    const eType = state.cmspaymentreport.filters.eType;
    if (eType === 'Labour') {
        return state.cmspaymentreport.errors.cmsPaidEmployeesLabour ||
            state.cmspaymentreport.errors.cmsPaidEmployeesByCCLabour ||
            state.cmspaymentreport.errors.cmsPaidCostCentresLabour;
    } else {
        return state.cmspaymentreport.errors.cmsPaidEmployeesStaff ||
            state.cmspaymentreport.errors.cmsPaidEmployeesByCCStaff ||
            state.cmspaymentreport.errors.cmsPaidCostCentresStaff;
    }
};

// Filter selectors
export const selectFilters = (state) => state.cmspaymentreport.filters;
export const selectSelectedYear = (state) => state.cmspaymentreport.filters.selectedYear;
export const selectSelectedMonth = (state) => state.cmspaymentreport.filters.selectedMonth;
export const selectEmprefNo = (state) => state.cmspaymentreport.filters.emprefNo;
export const selectCCCode = (state) => state.cmspaymentreport.filters.ccCode;
export const selectLType = (state) => state.cmspaymentreport.filters.lType;
export const selectContraCode = (state) => state.cmspaymentreport.filters.contraCode;
export const selectEType = (state) => state.cmspaymentreport.filters.eType;
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

// Employee type selectors
export const selectIsStaffType = (state) => state.cmspaymentreport.filters.eType === 'Staff';
export const selectIsLabourType = (state) => state.cmspaymentreport.filters.eType === 'Labour';

// Export reducer
export default cmsPaymentReportSlice.reducer;