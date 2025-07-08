import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sppoReportsAPI from '../../api/SpPOAPI/spPoReportAPI';

// Async Thunks for SPPO Reports APIs
// ==================================

// 1. Fetch Cost Centers for SPPO Close by Vendor
export const fetchCCForSPPOCloseByVendor = createAsyncThunk(
    'spporeport/fetchCCForSPPOCloseByVendor',
    async (params, { rejectWithValue }) => {
        try {
            const response = await sppoReportsAPI.getCCForSPPOCloseByVendor(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Centers for SPPO Close');
        }
    }
);

// 2. Fetch DCA for PO Report
export const fetchDCAForPOReport = createAsyncThunk(
    'spporeport/fetchDCAForPOReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await sppoReportsAPI.getDCAForPOReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA for PO Report');
        }
    }
);

// 3. Fetch Vendors for SPPO Report - ENHANCED: Better parameter handling
export const fetchVendorsForSPPOReport = createAsyncThunk(
    'spporeport/fetchVendorsForSPPOReport',
    async (params, { rejectWithValue }) => {
        try {
            // Ensure we're using the correct parameter names for API
            const apiParams = {
                CCCode: params.CCCode,
                DCA: params.DCA || params.DCACode // API expects DCA, not DCACode
            };
            console.log('🎯 SPPO Vendor API Params:', apiParams);

            const response = await sppoReportsAPI.getVendorsForSPPOReport(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Vendors for SPPO Report');
        }
    }
);

// 4. Fetch SPPO Report Data - ENHANCED: Handle Select All, optional month, and Status
export const fetchSPPOReportData = createAsyncThunk(
    'spporeport/fetchSPPOReportData',
    async (params, { rejectWithValue }) => {
        try {
            // Handle optional month and Select All vendor
            const apiParams = {
                CCCode: params.CCCode,
                DCACode: params.DCACode,
                VendorCode: params.VendorCode, // Can be 'Select All'
                month: params.month || '', // Optional
                year: params.year, // Financial year format (e.g., 2025-26)
                Status: params.Status // Running or Closed
            };
            console.log('📊 SPPO Report API Params:', apiParams);

            const response = await sppoReportsAPI.getSPPOReportData(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SPPO Report Data');
        }
    }
);

// 5. Fetch SPPO for Print
export const fetchSPPOForPrint = createAsyncThunk(
    'spporeport/fetchSPPOForPrint',
    async (params, { rejectWithValue }) => {
        try {
            const response = await sppoReportsAPI.getSPPOForPrint(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SPPO for Print');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    sppoCostCenters: [],
    sppoDCACodes: [],
    sppoVendors: [],
    sppoReportData: [],
    sppoPrintData: [],

    // Loading states for each API
    loading: {
        sppoCostCenters: false,
        sppoDCACodes: false,
        sppoVendors: false,
        sppoReportData: false,
        sppoPrintData: false,
    },

    // Error states for each API
    errors: {
        sppoCostCenters: null,
        sppoDCACodes: null,
        sppoVendors: null,
        sppoReportData: null,
        sppoPrintData: null,
    },

    // UI State / Filters - ENHANCED: Clear separation of DCA vs DCACode
    filters: {
        Userid: '',
        Roleid: '',
        CCStatusval: '',
        CCCode: '',
        DCA: '', // Used for vendor fetching
        DCACode: '', // Used for report generation (same value as DCA)
        VendorCode: '',
        month: '', // Optional
        year: '', // Financial year format: 2025-26
        Status: '', // Running or Closed
        SPPONO: ''
    }
};

// SPPO Report Slice
// =================
const sppoReportSlice = createSlice({
    name: 'spporeport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                Userid: '',
                Roleid: '',
                CCStatusval: '',
                CCCode: '',
                DCA: '',
                DCACode: '',
                VendorCode: '',
                month: '',
                year: '',
                Status: '',
                SPPONO: ''
            };
        },

        // Action to reset ONLY report data (preserve dropdowns)
        resetReportData: (state) => {
            state.sppoReportData = [];
            state.sppoPrintData = [];
        },

        // Action to reset EVERYTHING including dropdowns
        resetAllData: (state) => {
            state.sppoCostCenters = [];
            state.sppoDCACodes = [];
            state.sppoVendors = [];
            state.sppoReportData = [];
            state.sppoPrintData = [];

            state.filters = {
                Userid: '',
                Roleid: '',
                CCStatusval: '',
                CCCode: '',
                DCA: '',
                DCACode: '',
                VendorCode: '',
                month: '',
                year: '',
                Status: '',
                SPPONO: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset dropdown data when cost center changes
        resetDependentDropdowns: (state) => {
            state.sppoDCACodes = [];
            state.sppoVendors = [];
            state.filters.DCA = '';
            state.filters.DCACode = '';
            state.filters.VendorCode = '';
        },

        // Action to reset vendor dropdown when DCA changes
        resetVendorDropdown: (state) => {
            state.sppoVendors = [];
            state.filters.VendorCode = '';
        },

        // ENHANCED: Action to set DCA with proper handling
        setDCACode: (state, action) => {
            const { dcaValue } = action.payload;
            state.filters = {
                ...state.filters, // Preserve all existing values including CCStatusval, CCCode
                DCA: dcaValue,
                DCACode: dcaValue,
                VendorCode: '' // Reset only vendor when DCA changes
            };
            // Reset vendor dropdown data
            state.sppoVendors = [];
        },

        // Action to set financial year filter with validation
        setFinancialYear: (state, action) => {
            const { year } = action.payload;
            // Validate financial year format (YYYY-YY or empty)
            if (year === '' || /^\d{4}-\d{2}$/.test(year)) {
                state.filters.year = year;
            }
        },

        // Action to clear financial year filter
        clearFinancialYear: (state) => {
            state.filters.year = '';
        },

        // ENHANCED: Action to set month (optional)
        setMonth: (state, action) => {
            const { month } = action.payload;
            state.filters.month = month || ''; // Can be empty
        },

        // Action to clear month filter
        clearMonth: (state) => {
            state.filters.month = '';
        },

        // Action to set SPPONO for print
        setSPPONO: (state, action) => {
            const { sppono } = action.payload;
            state.filters.SPPONO = sppono || '';
        },

        // Action to clear SPPONO
        clearSPPONO: (state) => {
            state.filters.SPPONO = '';
        },

        // Action to set CC Status value
        setCCStatusval: (state, action) => {
            const { ccStatusval } = action.payload;
            state.filters.CCStatusval = ccStatusval || '';
        },

        // Action to set User ID
        setUserid: (state, action) => {
            const { userid } = action.payload;
            state.filters.Userid = userid || '';
        },

        // Action to set Role ID
        setRoleid: (state, action) => {
            const { roleid } = action.payload;
            state.filters.Roleid = roleid || '';
        },

        // Action to set Status (Running or Closed)
        setStatus: (state, action) => {
            const { status } = action.payload;
            // Validate Status value
            if (status === 'Running' || status === 'Closed' || status === '') {
                state.filters.Status = status;
            }
        },

        // Action to clear Status
        clearStatus: (state) => {
            state.filters.Status = '';
        }
    },
    extraReducers: (builder) => {
        // 1. Cost Centers for SPPO Close by Vendor
        builder
            .addCase(fetchCCForSPPOCloseByVendor.pending, (state) => {
                state.loading.sppoCostCenters = true;
                state.errors.sppoCostCenters = null;
            })
            .addCase(fetchCCForSPPOCloseByVendor.fulfilled, (state, action) => {
                state.loading.sppoCostCenters = false;
                state.sppoCostCenters = action.payload;
            })
            .addCase(fetchCCForSPPOCloseByVendor.rejected, (state, action) => {
                state.loading.sppoCostCenters = false;
                state.errors.sppoCostCenters = action.payload;
            })

        // 2. DCA for PO Report
        builder
            .addCase(fetchDCAForPOReport.pending, (state) => {
                state.loading.sppoDCACodes = true;
                state.errors.sppoDCACodes = null;
            })
            .addCase(fetchDCAForPOReport.fulfilled, (state, action) => {
                state.loading.sppoDCACodes = false;
                state.sppoDCACodes = action.payload;
            })
            .addCase(fetchDCAForPOReport.rejected, (state, action) => {
                state.loading.sppoDCACodes = false;
                state.errors.sppoDCACodes = action.payload;
            })

        // 3. Vendors for SPPO Report
        builder
            .addCase(fetchVendorsForSPPOReport.pending, (state) => {
                state.loading.sppoVendors = true;
                state.errors.sppoVendors = null;
            })
            .addCase(fetchVendorsForSPPOReport.fulfilled, (state, action) => {
                state.loading.sppoVendors = false;
                state.sppoVendors = action.payload;
            })
            .addCase(fetchVendorsForSPPOReport.rejected, (state, action) => {
                state.loading.sppoVendors = false;
                state.errors.sppoVendors = action.payload;
            })

        // 4. SPPO Report Data
        builder
            .addCase(fetchSPPOReportData.pending, (state) => {
                state.loading.sppoReportData = true;
                state.errors.sppoReportData = null;
            })
            .addCase(fetchSPPOReportData.fulfilled, (state, action) => {
                state.loading.sppoReportData = false;
                state.sppoReportData = action.payload;
            })
            .addCase(fetchSPPOReportData.rejected, (state, action) => {
                state.loading.sppoReportData = false;
                state.errors.sppoReportData = action.payload;
            })

        // 5. SPPO Print Data
        builder
            .addCase(fetchSPPOForPrint.pending, (state) => {
                state.loading.sppoPrintData = true;
                state.errors.sppoPrintData = null;
            })
            .addCase(fetchSPPOForPrint.fulfilled, (state, action) => {
                state.loading.sppoPrintData = false;
                state.sppoPrintData = action.payload;
            })
            .addCase(fetchSPPOForPrint.rejected, (state, action) => {
                state.loading.sppoPrintData = false;
                state.errors.sppoPrintData = action.payload;
            });
    },
});

// Export actions
export const {
    setFilters,
    clearFilters,
    resetReportData,
    resetAllData,
    clearError,
    resetDependentDropdowns,
    resetVendorDropdown,
    setDCACode,
    setFinancialYear,
    clearFinancialYear,
    setMonth,
    clearMonth,
    setSPPONO,
    clearSPPONO,
    setCCStatusval,
    setUserid,
    setRoleid,
    setStatus,
    clearStatus
} = sppoReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectSPPOCostCenters = (state) => state.spporeport.sppoCostCenters;
export const selectSPPODCACodes = (state) => state.spporeport.sppoDCACodes;
export const selectSPPOVendors = (state) => state.spporeport.sppoVendors;
export const selectSPPOReportData = (state) => state.spporeport.sppoReportData;
export const selectSPPOPrintData = (state) => state.spporeport.sppoPrintData;

// Loading selectors
export const selectLoading = (state) => state.spporeport.loading;
export const selectSPPOCostCentersLoading = (state) => state.spporeport.loading.sppoCostCenters;
export const selectSPPODCACodesLoading = (state) => state.spporeport.loading.sppoDCACodes;
export const selectSPPOVendorsLoading = (state) => state.spporeport.loading.sppoVendors;
export const selectSPPOReportDataLoading = (state) => state.spporeport.loading.sppoReportData;
export const selectSPPOPrintDataLoading = (state) => state.spporeport.loading.sppoPrintData;

// Error selectors
export const selectErrors = (state) => state.spporeport.errors;
export const selectSPPOCostCentersError = (state) => state.spporeport.errors.sppoCostCenters;
export const selectSPPODCACodesError = (state) => state.spporeport.errors.sppoDCACodes;
export const selectSPPOVendorsError = (state) => state.spporeport.errors.sppoVendors;
export const selectSPPOReportDataError = (state) => state.spporeport.errors.sppoReportData;
export const selectSPPOPrintDataError = (state) => state.spporeport.errors.sppoPrintData;

// Filter selectors
export const selectFilters = (state) => state.spporeport.filters;
export const selectSelectedUserid = (state) => state.spporeport.filters.Userid;
export const selectSelectedRoleid = (state) => state.spporeport.filters.Roleid;
export const selectSelectedCCStatusval = (state) => state.spporeport.filters.CCStatusval;
export const selectSelectedCCCode = (state) => state.spporeport.filters.CCCode;
export const selectSelectedDCA = (state) => state.spporeport.filters.DCA;
export const selectSelectedDCACode = (state) => state.spporeport.filters.DCACode;
export const selectSelectedVendorCode = (state) => state.spporeport.filters.VendorCode;
export const selectSelectedMonth = (state) => state.spporeport.filters.month;
export const selectSelectedYear = (state) => state.spporeport.filters.year;
export const selectSelectedStatus = (state) => state.spporeport.filters.Status;
export const selectSelectedSPPONO = (state) => state.spporeport.filters.SPPONO;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.spporeport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.spporeport.errors).some(error => error !== null);

// ENHANCED: Validation selectors
export const selectCanFetchCostCenters = (state) => {
    const { Userid, Roleid } = state.spporeport.filters;
    return !!(Userid && Roleid);
};

export const selectCanFetchDCACodes = (state) => {
    const { CCCode } = state.spporeport.filters;
    return !!CCCode;
};

export const selectCanFetchVendors = (state) => {
    const { CCCode, DCA } = state.spporeport.filters;
    return !!(CCCode && DCA);
};

export const selectCanGenerateReport = (state) => {
    const { CCCode, DCACode, VendorCode, year, Status } = state.spporeport.filters;
    // Month is optional, so not required for validation
    return !!(CCCode && DCACode && VendorCode && year && Status);
};

export const selectCanFetchPrintData = (state) => {
    const { SPPONO } = state.spporeport.filters;
    return !!SPPONO;
};

// Utility selectors
export const selectHasCostCentersData = (state) => {
    return Array.isArray(state.spporeport.sppoCostCenters?.Data) &&
        state.spporeport.sppoCostCenters.Data.length > 0;
};

export const selectHasDCACodesData = (state) => {
    return Array.isArray(state.spporeport.sppoDCACodes?.Data) &&
        state.spporeport.sppoDCACodes.Data.length > 0;
};

export const selectHasVendorsData = (state) => {
    return Array.isArray(state.spporeport.sppoVendors?.Data) &&
        state.spporeport.sppoVendors.Data.length > 0;
};

export const selectHasReportData = (state) => {
    return Array.isArray(state.spporeport.sppoReportData?.Data) &&
        state.spporeport.sppoReportData.Data.length > 0;
};

export const selectHasPrintData = (state) => {
    return Array.isArray(state.spporeport.sppoPrintData?.Data) &&
        state.spporeport.sppoPrintData.Data.length > 0;
};

// Report summary selector (handles Select All vendors)
export const selectSPPOReportSummary = (state) => {
    const reportData = state.spporeport.sppoReportData?.Data || [];

    if (!Array.isArray(reportData) || reportData.length === 0) {
        return {
            totalSPPOs: 0,
            totalAmount: 0,
            uniqueVendors: 0,
            totalBalance: 0
        };
    }

    const summary = reportData.reduce((acc, sppo) => {
        const totalValue = parseFloat(sppo.TotalValue || sppo.TotalAmount || sppo.Amount || 0);
        const balance = parseFloat(sppo.Balance || 0);
        const vendor = sppo.VendorCode || sppo.VendorName || '';

        acc.totalSPPOs += 1;
        acc.totalAmount += totalValue;
        acc.totalBalance += balance;
        if (vendor) acc.vendors.add(vendor);

        return acc;
    }, {
        totalSPPOs: 0,
        totalAmount: 0,
        totalBalance: 0,
        vendors: new Set()
    });

    return {
        totalSPPOs: summary.totalSPPOs,
        totalAmount: summary.totalAmount,
        uniqueVendors: summary.vendors.size,
        totalBalance: summary.totalBalance
    };
};

// Financial year validation selector
export const selectIsValidFinancialYear = (state) => {
    const { year } = state.spporeport.filters;
    return year === '' || /^\d{4}-\d{2}$/.test(year);
};

// Complete filter status selector
export const selectFilterStatus = (state) => {
    const filters = state.spporeport.filters;
    return {
        hasUserCredentials: !!(filters.Userid && filters.Roleid),
        hasCostCenter: !!filters.CCCode,
        hasDCA: !!filters.DCA,
        hasVendor: !!filters.VendorCode,
        hasYear: !!filters.year,
        hasMonth: !!filters.month,
        hasStatus: !!filters.Status,
        hasSPPONO: !!filters.SPPONO,
        isReadyForReport: !!(filters.CCCode && filters.DCACode && filters.VendorCode && filters.year && filters.Status)
    };
};

// Export reducer
export default sppoReportSlice.reducer;