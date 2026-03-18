import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as pfesiAPI from '../../api/HRReportAPI/pfandesiReportAPI';

// Async Thunks for PF & ESI Payment Report APIs
// ==============================================

// 1. Fetch PF/ESI Paid Years
export const fetchPFESIPaidYears = createAsyncThunk(
    'pfesireport/fetchPFESIPaidYears',
    async (params, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getPFESIPaidYears(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PF/ESI Paid Years');
        }
    }
);

// 2. Fetch PF/ESI Paid Months by Year
export const fetchPfEsiPaidMonthsByYear = createAsyncThunk(
    'pfesireport/fetchPfEsiPaidMonthsByYear',
    async (params, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getPfEsiPaidMonthsByYear(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PF/ESI Paid Months');
        }
    }
);

// 3. Fetch PF/ESI Paid Cost Centre
export const fetchPFESIPaidCC = createAsyncThunk(
    'pfesireport/fetchPFESIPaidCC',
    async (params, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getPFESIPaidCC(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PF/ESI Paid Cost Centre');
        }
    }
);

// 4. Fetch Paid PF Data (Staff)
export const fetchPaidPFData = createAsyncThunk(
    'pfesireport/fetchPaidPFData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getPaidPFData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Paid PF Data (Staff)');
        }
    }
);

// 5. Fetch Labour Paid PF Data
export const fetchLBPaidPFData = createAsyncThunk(
    'pfesireport/fetchLBPaidPFData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getLBPaidPFData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour Paid PF Data');
        }
    }
);

// 6. Fetch Labour Paid ESI Data
export const fetchLBPaidESIData = createAsyncThunk(
    'pfesireport/fetchLBPaidESIData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getLBPaidESIData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour Paid ESI Data');
        }
    }
);

// 7. Fetch Paid ESI Data (Staff)
export const fetchPaidESIData = createAsyncThunk(
    'pfesireport/fetchPaidESIData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await pfesiAPI.getPaidESIData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Paid ESI Data (Staff)');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    pfesiYears: [],
    pfesiMonths: [],
    pfesiCostCentres: [],
    staffPFData: [],
    staffESIData: [],
    labourPFData: [],
    labourESIData: [],

    // Loading states for each API
    loading: {
        pfesiYears: false,
        pfesiMonths: false,
        pfesiCostCentres: false,
        staffPFData: false,
        staffESIData: false,
        labourPFData: false,
        labourESIData: false,
    },

    // Error states for each API
    errors: {
        pfesiYears: null,
        pfesiMonths: null,
        pfesiCostCentres: null,
        staffPFData: null,
        staffESIData: null,
        labourPFData: null,
        labourESIData: null,
    },

    // UI State & Filters
    filters: {
        selectedYear: '',
        selectedMonth: '',
        selectedCCCode: '', // "0" for "Select All"
        reportType: 'EPF', // EPF or ESIC
        employeeType: 'Staff', // Staff or Labour
        labourType: '', // "Own Labour" or "Contractor"
        contractorCode: 'NA', // Contractor code or "NA"
    },

    // Report Parameters
    reportParams: {
        reportType: 'EPF',
        lType: '',
        contraCode: '',
        eType: '',
    }
};

// PF & ESI Report Slice
// =====================
const pfesiReportSlice = createSlice({
    name: 'pfesireport',
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
                selectedCCCode: '',
                reportType: 'EPF',
                employeeType: 'Staff',
                labourType: '',
                contractorCode: 'NA',
            };
        },

        // Action to set report type (EPF or ESIC)
        setReportType: (state, action) => {
            state.filters.reportType = action.payload;
        },

        // Action to set employee type (Staff or Labour)
        setEmployeeType: (state, action) => {
            state.filters.employeeType = action.payload;
        },

        // Action to set labour type
        setLabourType: (state, action) => {
            state.filters.labourType = action.payload;
        },

        // Action to set contractor code
        setContractorCode: (state, action) => {
            state.filters.contractorCode = action.payload;
        },

        // Action to set report parameters
        setReportParams: (state, action) => {
            state.reportParams = { ...state.reportParams, ...action.payload };
        },

        // Action to clear report parameters
        clearReportParams: (state) => {
            state.reportParams = {
                reportType: 'EPF',
                lType: '',
                contraCode: '',
                eType: '',
            };
        },

        // Action to reset PF/ESI report data
        resetPFESIReportData: (state) => {
            state.pfesiCostCentres = [];
            state.staffPFData = [];
            state.staffESIData = [];
            state.labourPFData = [];
            state.labourESIData = [];
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
            state.pfesiCostCentres = [];
            state.staffPFData = [];
            state.staffESIData = [];
            state.labourPFData = [];
            state.labourESIData = [];
        },

        // Action to clear months when year changes
        clearMonthsData: (state) => {
            state.pfesiMonths = [];
            state.pfesiCostCentres = [];
            state.staffPFData = [];
            state.staffESIData = [];
            state.labourPFData = [];
            state.labourESIData = [];
        },

        // Action to clear cost centres when month changes
        clearCostCentreData: (state) => {
            state.pfesiCostCentres = [];
            state.staffPFData = [];
            state.staffESIData = [];
            state.labourPFData = [];
            state.labourESIData = [];
        }
    },
   extraReducers: (builder) => {
    // 1. PF/ESI Paid Years
    builder
        .addCase(fetchPFESIPaidYears.pending, (state) => {
            state.loading.pfesiYears = true;
            state.errors.pfesiYears = null;
        })
        .addCase(fetchPFESIPaidYears.fulfilled, (state, action) => {
            state.loading.pfesiYears = false;
            // Extract Data array from response
            state.pfesiYears = action.payload?.Data || action.payload || [];
            console.log('✅ Years extracted and stored:', state.pfesiYears); // DEBUG
        })
        .addCase(fetchPFESIPaidYears.rejected, (state, action) => {
            state.loading.pfesiYears = false;
            state.errors.pfesiYears = action.payload;
        })

    // 2. PF/ESI Paid Months by Year
    builder
        .addCase(fetchPfEsiPaidMonthsByYear.pending, (state) => {
            state.loading.pfesiMonths = true;
            state.errors.pfesiMonths = null;
        })
        .addCase(fetchPfEsiPaidMonthsByYear.fulfilled, (state, action) => {
            state.loading.pfesiMonths = false;
            // Extract Data array from response
            state.pfesiMonths = action.payload?.Data || action.payload || [];
            console.log('✅ Months extracted and stored:', state.pfesiMonths); // DEBUG
        })
        .addCase(fetchPfEsiPaidMonthsByYear.rejected, (state, action) => {
            state.loading.pfesiMonths = false;
            state.errors.pfesiMonths = action.payload;
        })

    // 3. PF/ESI Paid Cost Centre
    builder
        .addCase(fetchPFESIPaidCC.pending, (state) => {
            state.loading.pfesiCostCentres = true;
            state.errors.pfesiCostCentres = null;
        })
        .addCase(fetchPFESIPaidCC.fulfilled, (state, action) => {
            state.loading.pfesiCostCentres = false;
            // Extract Data array from response
            state.pfesiCostCentres = action.payload?.Data || action.payload || [];
            console.log('✅ Cost Centres extracted and stored:', state.pfesiCostCentres); // DEBUG
        })
        .addCase(fetchPFESIPaidCC.rejected, (state, action) => {
            state.loading.pfesiCostCentres = false;
            state.errors.pfesiCostCentres = action.payload;
        })

    // 4. Paid PF Data (Staff)
    builder
        .addCase(fetchPaidPFData.pending, (state) => {
            state.loading.staffPFData = true;
            state.errors.staffPFData = null;
        })
        .addCase(fetchPaidPFData.fulfilled, (state, action) => {
            state.loading.staffPFData = false;
            // Store the entire response object as it contains Data with nested structure
            state.staffPFData = action.payload || {};
            console.log('✅ Staff PF Data stored:', state.staffPFData); // DEBUG
        })
        .addCase(fetchPaidPFData.rejected, (state, action) => {
            state.loading.staffPFData = false;
            state.errors.staffPFData = action.payload;
        })

    // 5. Labour Paid PF Data
    builder
        .addCase(fetchLBPaidPFData.pending, (state) => {
            state.loading.labourPFData = true;
            state.errors.labourPFData = null;
        })
        .addCase(fetchLBPaidPFData.fulfilled, (state, action) => {
            state.loading.labourPFData = false;
            // Store the entire response object
            state.labourPFData = action.payload || {};
            console.log('✅ Labour PF Data stored:', state.labourPFData); // DEBUG
        })
        .addCase(fetchLBPaidPFData.rejected, (state, action) => {
            state.loading.labourPFData = false;
            state.errors.labourPFData = action.payload;
        })

    // 6. Labour Paid ESI Data
    builder
        .addCase(fetchLBPaidESIData.pending, (state) => {
            state.loading.labourESIData = true;
            state.errors.labourESIData = null;
        })
        .addCase(fetchLBPaidESIData.fulfilled, (state, action) => {
            state.loading.labourESIData = false;
            // Store the entire response object
            state.labourESIData = action.payload || {};
            console.log('✅ Labour ESI Data stored:', state.labourESIData); // DEBUG
        })
        .addCase(fetchLBPaidESIData.rejected, (state, action) => {
            state.loading.labourESIData = false;
            state.errors.labourESIData = action.payload;
        })

    // 7. Paid ESI Data (Staff)
    builder
        .addCase(fetchPaidESIData.pending, (state) => {
            state.loading.staffESIData = true;
            state.errors.staffESIData = null;
        })
        .addCase(fetchPaidESIData.fulfilled, (state, action) => {
            state.loading.staffESIData = false;
            // Store the entire response object
            state.staffESIData = action.payload || {};
            console.log('✅ Staff ESI Data stored:', state.staffESIData); // DEBUG
        })
        .addCase(fetchPaidESIData.rejected, (state, action) => {
            state.loading.staffESIData = false;
            state.errors.staffESIData = action.payload;
        });
},
});

// Export actions
export const {
    setFilters,
    clearFilters,
    setReportType,
    setEmployeeType,
    setLabourType,
    setContractorCode,
    setReportParams,
    clearReportParams,
    resetPFESIReportData,
    clearError,
    resetSelectedData,
    clearMonthsData,
    clearCostCentreData
} = pfesiReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectPFESIYears = (state) => state.pfesireport.pfesiYears;
export const selectPFESIMonths = (state) => state.pfesireport.pfesiMonths;
export const selectPFESICostCentres = (state) => state.pfesireport.pfesiCostCentres;
export const selectStaffPFData = (state) => state.pfesireport.staffPFData;
export const selectStaffESIData = (state) => state.pfesireport.staffESIData;
export const selectLabourPFData = (state) => state.pfesireport.labourPFData;
export const selectLabourESIData = (state) => state.pfesireport.labourESIData;

// Loading selectors
export const selectLoading = (state) => state.pfesireport.loading;
export const selectPFESIYearsLoading = (state) => state.pfesireport.loading.pfesiYears;
export const selectPFESIMonthsLoading = (state) => state.pfesireport.loading.pfesiMonths;
export const selectPFESICostCentresLoading = (state) => state.pfesireport.loading.pfesiCostCentres;
export const selectStaffPFDataLoading = (state) => state.pfesireport.loading.staffPFData;
export const selectStaffESIDataLoading = (state) => state.pfesireport.loading.staffESIData;
export const selectLabourPFDataLoading = (state) => state.pfesireport.loading.labourPFData;
export const selectLabourESIDataLoading = (state) => state.pfesireport.loading.labourESIData;

// Error selectors
export const selectErrors = (state) => state.pfesireport.errors;
export const selectPFESIYearsError = (state) => state.pfesireport.errors.pfesiYears;
export const selectPFESIMonthsError = (state) => state.pfesireport.errors.pfesiMonths;
export const selectPFESICostCentresError = (state) => state.pfesireport.errors.pfesiCostCentres;
export const selectStaffPFDataError = (state) => state.pfesireport.errors.staffPFData;
export const selectStaffESIDataError = (state) => state.pfesireport.errors.staffESIData;
export const selectLabourPFDataError = (state) => state.pfesireport.errors.labourPFData;
export const selectLabourESIDataError = (state) => state.pfesireport.errors.labourESIData;

// Filter selectors
export const selectFilters = (state) => state.pfesireport.filters;
export const selectSelectedYear = (state) => state.pfesireport.filters.selectedYear;
export const selectSelectedMonth = (state) => state.pfesireport.filters.selectedMonth;
export const selectSelectedCCCode = (state) => state.pfesireport.filters.selectedCCCode;
export const selectReportType = (state) => state.pfesireport.filters.reportType;
export const selectEmployeeType = (state) => state.pfesireport.filters.employeeType;
export const selectLabourType = (state) => state.pfesireport.filters.labourType;
export const selectContractorCode = (state) => state.pfesireport.filters.contractorCode;

// Report Parameters selectors
export const selectReportParams = (state) => state.pfesireport.reportParams;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.pfesireport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.pfesireport.errors).some(error => error !== null);

// Report-specific selectors
export const selectIsEPFReport = (state) => state.pfesireport.filters.reportType === 'EPF';
export const selectIsESICReport = (state) => state.pfesireport.filters.reportType === 'ESIC';
export const selectIsStaffEmployee = (state) => state.pfesireport.filters.employeeType === 'Staff';
export const selectIsLabourEmployee = (state) => state.pfesireport.filters.employeeType === 'Labour';
export const selectIsOwnLabour = (state) => state.pfesireport.filters.labourType === 'Own Labour';
export const selectIsContractor = (state) => state.pfesireport.filters.labourType === 'Contractor';

// Combined data selector based on report type and employee type
export const selectCurrentReportData = (state) => {
    const { reportType, employeeType } = state.pfesireport.filters;
    
    if (employeeType === 'Staff') {
        return reportType === 'EPF' ? state.pfesireport.staffPFData : state.pfesireport.staffESIData;
    } else {
        return reportType === 'EPF' ? state.pfesireport.labourPFData : state.pfesireport.labourESIData;
    }
};

// Current loading state selector
export const selectCurrentReportLoading = (state) => {
    const { reportType, employeeType } = state.pfesireport.filters;

    if (employeeType === 'Staff') {
        return reportType === 'EPF' ? state.pfesireport.loading.staffPFData : state.pfesireport.loading.staffESIData;
    } else {
        return reportType === 'EPF' ? state.pfesireport.loading.labourPFData : state.pfesireport.loading.labourESIData;
    }
};

// Current error state selector
export const selectCurrentReportError = (state) => {
    const { reportType, employeeType } = state.pfesireport.filters;

    if (employeeType === 'Staff') {
        return reportType === 'EPF' ? state.pfesireport.errors.staffPFData : state.pfesireport.errors.staffESIData;
    } else {
        return reportType === 'EPF' ? state.pfesireport.errors.labourPFData : state.pfesireport.errors.labourESIData;
    }
};

// Export reducer
export default pfesiReportSlice.reducer;