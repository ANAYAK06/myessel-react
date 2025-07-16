import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dailyIssuedItemsReportAPI from '../../api/Stock/dailIssuedItemsReportAPI';

// Async Thunks for Daily Issued Items Report APIs
// ================================================

// 1. Fetch View Cost Center Codes
export const fetchViewCostCenterCodes = createAsyncThunk(
    'dailyissueditemsreport/fetchViewCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await dailyIssuedItemsReportAPI.getViewCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch View Cost Center Codes');
        }
    }
);

// 2. Fetch Issue Grid Data
export const fetchIssueGridData = createAsyncThunk(
    'dailyissueditemsreport/fetchIssueGridData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await dailyIssuedItemsReportAPI.viewIssueGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Issue Grid Data');
        }
    }
);

// 3. Fetch Issue Items Details
export const fetchIssueItemsDetails = createAsyncThunk(
    'dailyissueditemsreport/fetchIssueItemsDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await dailyIssuedItemsReportAPI.viewIssueItemsDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Issue Items Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    viewCostCenterCodes: [],
    issueGridData: [],
    issueItemsDetails: [],

    // Loading states for each API
    loading: {
        viewCostCenterCodes: false,
        issueGridData: false,
        issueItemsDetails: false,
    },

    // Error states for each API
    errors: {
        viewCostCenterCodes: null,
        issueGridData: null,
        issueItemsDetails: null,
    },

    // UI State / Filters
    filters: {
        // For Cost Center Codes
        UID: '',
        RID: '',
        StoreStatus: 'Active',
        
        // For Issue Grid
        CCode: '',
        Fdate: '',
        TDate: '',
        
        // For Issue Items Details
        Issueno: ''
    }
};

// Daily Issued Items Report Slice
// ================================
const dailyIssuedItemsReportSlice = createSlice({
    name: 'dailyissueditemsreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                UID: '',
                RID: '',
                StoreStatus: 'Active',
                CCode: '',
                Fdate: '',
                TDate: '',
                Issueno: ''
            };
        },
        
        // Action to reset ONLY grid data (preserve dropdowns) - for normal operations
        resetGridData: (state) => {
            state.issueGridData = [];
            state.issueItemsDetails = [];
            // ✅ DON'T clear viewCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.viewCostCenterCodes = [];
            state.issueGridData = [];
            state.issueItemsDetails = [];
            
            state.filters = {
                UID: '',
                RID: '',
                StoreStatus: 'Active',
                CCode: '',
                Fdate: '',
                TDate: '',
                Issueno: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset view cost center codes data
        resetViewCostCenterCodesData: (state) => {
            state.viewCostCenterCodes = [];
        },

        // Action to reset issue grid data
        resetIssueGridData: (state) => {
            state.issueGridData = [];
        },

        // Action to reset issue items details data
        resetIssueItemsDetailsData: (state) => {
            state.issueItemsDetails = [];
        },

        // Action to reset all issue data
        resetAllIssueData: (state) => {
            state.viewCostCenterCodes = [];
            state.issueGridData = [];
            state.issueItemsDetails = [];
        },

        // Action to set cost center filter
        setCostCenter: (state, action) => {
            state.filters.CCode = action.payload;
        },

        // Action to clear cost center filter
        clearCostCenter: (state) => {
            state.filters.CCode = '';
        },

        // Action to set date range filters
        setDateRange: (state, action) => {
            const { Fdate, TDate } = action.payload;
            state.filters.Fdate = Fdate || state.filters.Fdate;
            state.filters.TDate = TDate || state.filters.TDate;
        },

        // Action to clear date range filters
        clearDateRange: (state) => {
            state.filters.Fdate = '';
            state.filters.TDate = '';
        },

        // Action to set issue number filter
        setIssueno: (state, action) => {
            state.filters.Issueno = action.payload;
        },

        // Action to clear issue number filter
        clearIssueno: (state) => {
            state.filters.Issueno = '';
        },

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UID, RID, StoreStatus } = action.payload;
            state.filters.UID = UID || state.filters.UID;
            state.filters.RID = RID || state.filters.RID;
            state.filters.StoreStatus = StoreStatus || state.filters.StoreStatus;
        },

        // Action to clear user credentials
        clearUserCredentials: (state) => {
            state.filters.UID = '';
            state.filters.RID = '';
            state.filters.StoreStatus = 'Active';
        },

        // Action to set store status filter
        setStoreStatus: (state, action) => {
            state.filters.StoreStatus = action.payload;
        },

        // Action to clear store status filter
        clearStoreStatus: (state) => {
            state.filters.StoreStatus = 'Active';
        }
    },
    extraReducers: (builder) => {
        // 1. View Cost Center Codes
        builder
            .addCase(fetchViewCostCenterCodes.pending, (state) => {
                state.loading.viewCostCenterCodes = true;
                state.errors.viewCostCenterCodes = null;
            })
            .addCase(fetchViewCostCenterCodes.fulfilled, (state, action) => {
                state.loading.viewCostCenterCodes = false;
                state.viewCostCenterCodes = action.payload;
            })
            .addCase(fetchViewCostCenterCodes.rejected, (state, action) => {
                state.loading.viewCostCenterCodes = false;
                state.errors.viewCostCenterCodes = action.payload;
            })

        // 2. Issue Grid Data
        builder
            .addCase(fetchIssueGridData.pending, (state) => {
                state.loading.issueGridData = true;
                state.errors.issueGridData = null;
            })
            .addCase(fetchIssueGridData.fulfilled, (state, action) => {
                state.loading.issueGridData = false;
                state.issueGridData = action.payload;
            })
            .addCase(fetchIssueGridData.rejected, (state, action) => {
                state.loading.issueGridData = false;
                state.errors.issueGridData = action.payload;
            })

        // 3. Issue Items Details
        builder
            .addCase(fetchIssueItemsDetails.pending, (state) => {
                state.loading.issueItemsDetails = true;
                state.errors.issueItemsDetails = null;
            })
            .addCase(fetchIssueItemsDetails.fulfilled, (state, action) => {
                state.loading.issueItemsDetails = false;
                state.issueItemsDetails = action.payload;
            })
            .addCase(fetchIssueItemsDetails.rejected, (state, action) => {
                state.loading.issueItemsDetails = false;
                state.errors.issueItemsDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetGridData,                            // ✅ Only resets grid data (preserves dropdowns)
    resetAllData,                             // ✅ Resets everything (for Reset button only)
    clearError, 
    resetViewCostCenterCodesData,
    resetIssueGridData,
    resetIssueItemsDetailsData,
    resetAllIssueData,
    setCostCenter,                            // ✅ Helper for cost center
    clearCostCenter,                          // ✅ Helper for clearing cost center
    setDateRange,                             // ✅ Helper for date range
    clearDateRange,                           // ✅ Helper for clearing date range
    setIssueno,                               // ✅ Helper for issue number
    clearIssueno,                             // ✅ Helper for clearing issue number
    setUserCredentials,                       // ✅ Helper for setting user credentials
    clearUserCredentials,                     // ✅ Helper for clearing user credentials
    setStoreStatus,                           // ✅ Helper for store status
    clearStoreStatus                          // ✅ Helper for clearing store status
} = dailyIssuedItemsReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectViewCostCenterCodes = (state) => state.dailyissueditemsreport.viewCostCenterCodes;
export const selectIssueGridData = (state) => state.dailyissueditemsreport.issueGridData;
export const selectIssueItemsDetails = (state) => state.dailyissueditemsreport.issueItemsDetails;

// Loading selectors
export const selectLoading = (state) => state.dailyissueditemsreport.loading;
export const selectViewCostCenterCodesLoading = (state) => state.dailyissueditemsreport.loading.viewCostCenterCodes;
export const selectIssueGridDataLoading = (state) => state.dailyissueditemsreport.loading.issueGridData;
export const selectIssueItemsDetailsLoading = (state) => state.dailyissueditemsreport.loading.issueItemsDetails;

// Error selectors
export const selectErrors = (state) => state.dailyissueditemsreport.errors;
export const selectViewCostCenterCodesError = (state) => state.dailyissueditemsreport.errors.viewCostCenterCodes;
export const selectIssueGridDataError = (state) => state.dailyissueditemsreport.errors.issueGridData;
export const selectIssueItemsDetailsError = (state) => state.dailyissueditemsreport.errors.issueItemsDetails;

// Filter selectors
export const selectFilters = (state) => state.dailyissueditemsreport.filters;
export const selectSelectedUID = (state) => state.dailyissueditemsreport.filters.UID;
export const selectSelectedRID = (state) => state.dailyissueditemsreport.filters.RID;
export const selectSelectedStoreStatus = (state) => state.dailyissueditemsreport.filters.StoreStatus;
export const selectSelectedCCode = (state) => state.dailyissueditemsreport.filters.CCode;
export const selectSelectedFdate = (state) => state.dailyissueditemsreport.filters.Fdate;
export const selectSelectedTDate = (state) => state.dailyissueditemsreport.filters.TDate;
export const selectSelectedIssueno = (state) => state.dailyissueditemsreport.filters.Issueno;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.dailyissueditemsreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.dailyissueditemsreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasViewCostCenterCodesData = (state) => {
    return Array.isArray(state.dailyissueditemsreport.viewCostCenterCodes?.Data) && 
           state.dailyissueditemsreport.viewCostCenterCodes.Data.length > 0;
};

export const selectHasIssueGridData = (state) => {
    return Array.isArray(state.dailyissueditemsreport.issueGridData?.Data) && 
           state.dailyissueditemsreport.issueGridData.Data.length > 0;
};

export const selectHasIssueItemsDetailsData = (state) => {
    return Array.isArray(state.dailyissueditemsreport.issueItemsDetails?.Data) && 
           state.dailyissueditemsreport.issueItemsDetails.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.dailyissueditemsreport.viewCostCenterCodes.length > 0 || 
           state.dailyissueditemsreport.issueGridData.length > 0 || 
           state.dailyissueditemsreport.issueItemsDetails.length > 0;
};

// Issue summary selector based on grid data structure
export const selectIssueSummary = (state) => {
    const gridData = state.dailyissueditemsreport.issueGridData?.Data || [];
    
    if (!Array.isArray(gridData) || gridData.length === 0) {
        return {
            totalIssues: 0,
            totalAmount: 0,
            totalQuantity: 0,
            uniqueCostCenters: 0,
            averageAmount: 0
        };
    }

    // Calculate statistics from issue data
    const totalAmount = gridData.reduce((sum, issue) => sum + (parseFloat(issue.Amount || issue.Value || issue.TotalAmount) || 0), 0);
    const totalQuantity = gridData.reduce((sum, issue) => sum + (parseFloat(issue.Quantity || issue.IssuedQty || issue.Qty) || 0), 0);
    const uniqueCostCenters = new Set(gridData.map(issue => issue.CostCenter || issue.CCCode || issue.Costcenter).filter(cc => cc)).size;
    const averageAmount = gridData.length > 0 ? totalAmount / gridData.length : 0;

    return {
        totalIssues: gridData.length,
        totalAmount,
        totalQuantity,
        uniqueCostCenters,
        averageAmount
    };
};

// Filter validation selectors
export const selectViewCostCenterCodesFiltersValid = (state) => {
    const { UID, RID } = state.dailyissueditemsreport.filters;
    return !!(UID && RID); // UID and RID are required for cost center codes
};

export const selectIssueGridFiltersValid = (state) => {
    const { CCode } = state.dailyissueditemsreport.filters;
    return !!CCode; // CCode is required for issue grid (dates are optional)
};

export const selectIssueItemsDetailsFiltersValid = (state) => {
    const { Issueno } = state.dailyissueditemsreport.filters;
    return !!Issueno; // Issueno is required for issue items details
};

// Date range selector
export const selectDateRange = (state) => ({
    Fdate: state.dailyissueditemsreport.filters.Fdate,
    TDate: state.dailyissueditemsreport.filters.TDate
});

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.dailyissueditemsreport.filters.UID,
    RID: state.dailyissueditemsreport.filters.RID,
    StoreStatus: state.dailyissueditemsreport.filters.StoreStatus
});

// Cost center and date range combined selector
export const selectIssueGridParams = (state) => ({
    CCode: state.dailyissueditemsreport.filters.CCode,
    Fdate: state.dailyissueditemsreport.filters.Fdate,
    TDate: state.dailyissueditemsreport.filters.TDate
});

// Issue items details params selector
export const selectIssueItemsDetailsParams = (state) => ({
    Issueno: state.dailyissueditemsreport.filters.Issueno
});

// View cost center codes params selector
export const selectViewCostCenterCodesParams = (state) => ({
    UID: state.dailyissueditemsreport.filters.UID,
    RID: state.dailyissueditemsreport.filters.RID,
    StoreStatus: state.dailyissueditemsreport.filters.StoreStatus
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.dailyissueditemsreport.filters;

// Export reducer
export default dailyIssuedItemsReportSlice.reducer;