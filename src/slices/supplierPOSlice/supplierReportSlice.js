import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierReportsAPI from '../../api/SupplierPOAPI/supplierPOReportAPI';

// Async Thunks for Supplier Reports APIs
// ======================================

// 1. Fetch Supplier Cost Centers
export const fetchSupplierCC = createAsyncThunk(
    'supplierreport/fetchSupplierCC',
    async (params, { rejectWithValue }) => {
        try {
            const response = await supplierReportsAPI.getSupplierCC(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier Cost Centers');
        }
    }
);

// 2. Fetch Supplier DCA Codes
export const fetchSupplierDCA = createAsyncThunk(
    'supplierreport/fetchSupplierDCA',
    async (params, { rejectWithValue }) => {
        try {
            const response = await supplierReportsAPI.getSupplierDCA(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier DCA Codes');
        }
    }
);

// 3. Fetch Supplier Vendors - FIXED: Better parameter handling
export const fetchSupplierVendor = createAsyncThunk(
    'supplierreport/fetchSupplierVendor',
    async (params, { rejectWithValue }) => {
        try {
            // Ensure we're using the correct parameter name for API
            const apiParams = {
                CCCode: params.CCCode,
                DCA: params.DCA || params.DCACode // API expects DCA, not DCACode
            };
            console.log('🎯 Vendor API Params:', apiParams);

            const response = await supplierReportsAPI.getSupplierVendor(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier Vendors');
        }
    }
);

// 4. Fetch Supplier PO Report - ENHANCED: Handle Select All and optional month
export const fetchSupplierPOForReport = createAsyncThunk(
    'supplierreport/fetchSupplierPOForReport',
    async (params, { rejectWithValue }) => {
        try {
            // Handle optional month and Select All vendor
            const apiParams = {
                CCCode: params.CCCode,
                DCACode: params.DCACode,
                VendorCode: params.VendorCode, // Can be 'Select All'
                month: params.month || '', // Optional
                year: params.year // Can be 'Any Year'
            };
            console.log('📊 Report API Params:', apiParams);

            const response = await supplierReportsAPI.getSupplierPOForReport(apiParams);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier PO Report');
        }
    }
);

// 5. Fetch Supplier PO by PO Number
export const fetchSupplierPObyPO = createAsyncThunk(
    'supplierreport/fetchSupplierPObyPO',
    async (params, { rejectWithValue }) => {
        try {
            const response = await supplierReportsAPI.getSupplierPObyPO(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier PO by PO Number');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    supplierCostCenters: [],
    supplierDCACodes: [],
    supplierVendors: [],
    supplierPOReport: [],
    supplierPODetails: [],

    // Loading states for each API
    loading: {
        supplierCostCenters: false,
        supplierDCACodes: false,
        supplierVendors: false,
        supplierPOReport: false,
        supplierPODetails: false,
    },

    // Error states for each API
    errors: {
        supplierCostCenters: null,
        supplierDCACodes: null,
        supplierVendors: null,
        supplierPOReport: null,
        supplierPODetails: null,
    },

    // UI State / Filters - FIXED: Clear separation of DCA vs DCACode
    filters: {
        Roleid: '',
        userid: '',
        StoreStatus: '',
        CCCode: '',
        DCA: '', // Used for vendor fetching
        DCACode: '', // Used for report generation (same value as DCA)
        VendorCode: '',
        month: '', // Optional
        year: '', // Can be 'Any Year' or format: 2025-26
        PONo: ''
    }
};

// Supplier Report Slice
// =====================
const supplierReportSlice = createSlice({
    name: 'supplierreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                Roleid: '',
                userid: '',
                StoreStatus: '',
                CCCode: '',
                DCA: '',
                DCACode: '',
                VendorCode: '',
                month: '',
                year: '',
                PONo: ''
            };
        },

        // Action to reset ONLY report data (preserve dropdowns)
        resetReportData: (state) => {
            state.supplierPOReport = [];
            state.supplierPODetails = [];
        },

        // Action to reset EVERYTHING including dropdowns
        resetAllData: (state) => {
            state.supplierCostCenters = [];
            state.supplierDCACodes = [];
            state.supplierVendors = [];
            state.supplierPOReport = [];
            state.supplierPODetails = [];

            state.filters = {
                Roleid: '',
                userid: '',
                StoreStatus: '',
                CCCode: '',
                DCA: '',
                DCACode: '',
                VendorCode: '',
                month: '',
                year: '',
                PONo: ''
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
            state.supplierDCACodes = [];
            state.supplierVendors = [];
            state.filters.DCA = '';
            state.filters.DCACode = '';
            state.filters.VendorCode = '';
        },

        // Action to reset vendor dropdown when DCA changes
        resetVendorDropdown: (state) => {
            state.supplierVendors = [];
            state.filters.VendorCode = '';
        },

        // ENHANCED: Action to set DCA with proper handling
        setDCACode: (state, action) => {
            const { dcaValue } = action.payload;
            state.filters = {
                ...state.filters, // Preserve all existing values including StoreStatus, CCCode
                DCA: dcaValue,
                DCACode: dcaValue,
                VendorCode: '' // Reset only vendor when DCA changes
            };
            // Reset vendor dropdown data
            state.supplierVendors = [];
        },

        // Action to set year filter with validation
        setFinancialYear: (state, action) => {
            const { year } = action.payload;
            // Validate financial year format (YYYY-YY, 'Any Year', or empty)
            if (year === 'Any Year' || year === '' || /^\d{4}-\d{2}$/.test(year)) {
                state.filters.year = year;
            }
        },

        // Action to clear year filter
        clearFinancialYear: (state) => {
            state.filters.year = '';
        },

        // ENHANCED: Action to set DCA with proper handling
        setDCACode: (state, action) => {
            const { dcaValue } = action.payload;
            // Set both DCA and DCACode to the same value for consistency
            state.filters.DCA = dcaValue;
            state.filters.DCACode = dcaValue;
            // Reset vendor when DCA changes
            state.supplierVendors = [];
            state.filters.VendorCode = '';
        },

        // ENHANCED: Action to set month (optional)
        setMonth: (state, action) => {
            const { month } = action.payload;
            state.filters.month = month || ''; // Can be empty
        },

        // ENHANCED: Action to set month (optional)
        setMonth: (state, action) => {
            const { month } = action.payload;
            state.filters.month = month || ''; // Can be empty
        }
    },
    extraReducers: (builder) => {
        // 1. Supplier Cost Centers
        builder
            .addCase(fetchSupplierCC.pending, (state) => {
                state.loading.supplierCostCenters = true;
                state.errors.supplierCostCenters = null;
            })
            .addCase(fetchSupplierCC.fulfilled, (state, action) => {
                state.loading.supplierCostCenters = false;
                state.supplierCostCenters = action.payload;
            })
            .addCase(fetchSupplierCC.rejected, (state, action) => {
                state.loading.supplierCostCenters = false;
                state.errors.supplierCostCenters = action.payload;
            })

        // 2. Supplier DCA Codes
        builder
            .addCase(fetchSupplierDCA.pending, (state) => {
                state.loading.supplierDCACodes = true;
                state.errors.supplierDCACodes = null;
            })
            .addCase(fetchSupplierDCA.fulfilled, (state, action) => {
                state.loading.supplierDCACodes = false;
                state.supplierDCACodes = action.payload;
            })
            .addCase(fetchSupplierDCA.rejected, (state, action) => {
                state.loading.supplierDCACodes = false;
                state.errors.supplierDCACodes = action.payload;
            })

        // 3. Supplier Vendors
        builder
            .addCase(fetchSupplierVendor.pending, (state) => {
                state.loading.supplierVendors = true;
                state.errors.supplierVendors = null;
            })
            .addCase(fetchSupplierVendor.fulfilled, (state, action) => {
                state.loading.supplierVendors = false;
                state.supplierVendors = action.payload;
            })
            .addCase(fetchSupplierVendor.rejected, (state, action) => {
                state.loading.supplierVendors = false;
                state.errors.supplierVendors = action.payload;
            })

        // 4. Supplier PO Report
        builder
            .addCase(fetchSupplierPOForReport.pending, (state) => {
                state.loading.supplierPOReport = true;
                state.errors.supplierPOReport = null;
            })
            .addCase(fetchSupplierPOForReport.fulfilled, (state, action) => {
                state.loading.supplierPOReport = false;
                state.supplierPOReport = action.payload;
            })
            .addCase(fetchSupplierPOForReport.rejected, (state, action) => {
                state.loading.supplierPOReport = false;
                state.errors.supplierPOReport = action.payload;
            })

        // 5. Supplier PO Details
        builder
            .addCase(fetchSupplierPObyPO.pending, (state) => {
                state.loading.supplierPODetails = true;
                state.errors.supplierPODetails = null;
            })
            .addCase(fetchSupplierPObyPO.fulfilled, (state, action) => {
                state.loading.supplierPODetails = false;
                state.supplierPODetails = action.payload;
            })
            .addCase(fetchSupplierPObyPO.rejected, (state, action) => {
                state.loading.supplierPODetails = false;
                state.errors.supplierPODetails = action.payload;
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
    setDCACode, // NEW: Proper DCA handling
    setFinancialYear,
    clearFinancialYear,
    setMonth // NEW: Month handling
} = supplierReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectSupplierCostCenters = (state) => state.supplierreport.supplierCostCenters;
export const selectSupplierDCACodes = (state) => state.supplierreport.supplierDCACodes;
export const selectSupplierVendors = (state) => state.supplierreport.supplierVendors;
export const selectSupplierPOReport = (state) => state.supplierreport.supplierPOReport;
export const selectSupplierPODetails = (state) => state.supplierreport.supplierPODetails;

// Loading selectors
export const selectLoading = (state) => state.supplierreport.loading;
export const selectSupplierCostCentersLoading = (state) => state.supplierreport.loading.supplierCostCenters;
export const selectSupplierDCACodesLoading = (state) => state.supplierreport.loading.supplierDCACodes;
export const selectSupplierVendorsLoading = (state) => state.supplierreport.loading.supplierVendors;
export const selectSupplierPOReportLoading = (state) => state.supplierreport.loading.supplierPOReport;
export const selectSupplierPODetailsLoading = (state) => state.supplierreport.loading.supplierPODetails;

// Error selectors
export const selectErrors = (state) => state.supplierreport.errors;
export const selectSupplierCostCentersError = (state) => state.supplierreport.errors.supplierCostCenters;
export const selectSupplierDCACodesError = (state) => state.supplierreport.errors.supplierDCACodes;
export const selectSupplierVendorsError = (state) => state.supplierreport.errors.supplierVendors;
export const selectSupplierPOReportError = (state) => state.supplierreport.errors.supplierPOReport;
export const selectSupplierPODetailsError = (state) => state.supplierreport.errors.supplierPODetails;

// Filter selectors
export const selectFilters = (state) => state.supplierreport.filters;
export const selectSelectedRoleid = (state) => state.supplierreport.filters.Roleid;
export const selectSelectedUserid = (state) => state.supplierreport.filters.userid;
export const selectSelectedStoreStatus = (state) => state.supplierreport.filters.StoreStatus;
export const selectSelectedCCCode = (state) => state.supplierreport.filters.CCCode;
export const selectSelectedDCA = (state) => state.supplierreport.filters.DCA;
export const selectSelectedDCACode = (state) => state.supplierreport.filters.DCACode;
export const selectSelectedVendorCode = (state) => state.supplierreport.filters.VendorCode;
export const selectSelectedMonth = (state) => state.supplierreport.filters.month;
export const selectSelectedYear = (state) => state.supplierreport.filters.year;
export const selectSelectedPONo = (state) => state.supplierreport.filters.PONo;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.supplierreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.supplierreport.errors).some(error => error !== null);

// ENHANCED: Validation selectors
export const selectCanFetchCostCenters = (state) => {
    const { Roleid, userid, StoreStatus } = state.supplierreport.filters;
    return !!(Roleid && userid && StoreStatus);
};

export const selectCanFetchDCACodes = (state) => {
    const { CCCode } = state.supplierreport.filters;
    return !!CCCode;
};

export const selectCanFetchVendors = (state) => {
    const { CCCode, DCA } = state.supplierreport.filters;
    return !!(CCCode && DCA);
};

export const selectCanGenerateReport = (state) => {
    const { CCCode, DCACode, VendorCode, year } = state.supplierreport.filters;
    // Month is optional, so not required for validation
    return !!(CCCode && DCACode && VendorCode && year);
};

export const selectCanFetchPODetails = (state) => {
    const { PONo } = state.supplierreport.filters;
    return !!PONo;
};

// Utility selectors
export const selectHasCostCentersData = (state) => {
    return Array.isArray(state.supplierreport.supplierCostCenters?.Data) &&
        state.supplierreport.supplierCostCenters.Data.length > 0;
};

export const selectHasDCACodesData = (state) => {
    return Array.isArray(state.supplierreport.supplierDCACodes?.Data) &&
        state.supplierreport.supplierDCACodes.Data.length > 0;
};

export const selectHasVendorsData = (state) => {
    return Array.isArray(state.supplierreport.supplierVendors?.Data) &&
        state.supplierreport.supplierVendors.Data.length > 0;
};

export const selectHasReportData = (state) => {
    return Array.isArray(state.supplierreport.supplierPOReport?.Data) &&
        state.supplierreport.supplierPOReport.Data.length > 0;
};

export const selectHasPODetailsData = (state) => {
    return Array.isArray(state.supplierreport.supplierPODetails?.Data) &&
        state.supplierreport.supplierPODetails.Data.length > 0;
};

// Report summary selector (handles Select All vendors)
export const selectReportSummary = (state) => {
    const reportData = state.supplierreport.supplierPOReport?.Data || [];

    if (!Array.isArray(reportData) || reportData.length === 0) {
        return {
            totalPOs: 0,
            totalAmount: 0,
            uniqueVendors: 0,
            avgOrderValue: 0
        };
    }

    const summary = reportData.reduce((acc, po) => {
        const amount = parseFloat(po.Amount || po.TotalAmount || po.POAmount || po.NewpricePOTotal || 0);
        const vendor = po.VendorCode || po.VendorName || '';

        acc.totalPOs += 1;
        acc.totalAmount += amount;
        if (vendor) acc.vendors.add(vendor);

        return acc;
    }, {
        totalPOs: 0,
        totalAmount: 0,
        vendors: new Set()
    });

    return {
        totalPOs: summary.totalPOs,
        totalAmount: summary.totalAmount,
        uniqueVendors: summary.vendors.size,
        avgOrderValue: summary.totalPOs > 0 ? summary.totalAmount / summary.totalPOs : 0
    };
};

// Export reducer
export default supplierReportSlice.reducer;