import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lostScrapReportAPI from '../../api/Stock/lostScrapReportAPI';

// Async Thunks for Lost and Scrap Report APIs
// ================================================

// 1. Fetch View Lost & Damaged Cost Center Codes
export const fetchViewldCostCenterCodes = createAsyncThunk(
    'lostscrapreport/fetchViewldCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await lostScrapReportAPI.getViewldCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch View Lost & Damaged Cost Center Codes');
        }
    }
);

// 2. Fetch Lost and Damaged Grid Data
export const fetchLostandDamagedGridData = createAsyncThunk(
    'lostscrapreport/fetchLostandDamagedGridData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await lostScrapReportAPI.viewLostandDamagedGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Lost and Damaged Grid Data');
        }
    }
);

// 3. Fetch Lost and Damaged Items Details
export const fetchLostandDamagedItemsDetails = createAsyncThunk(
    'lostscrapreport/fetchLostandDamagedItemsDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await lostScrapReportAPI.viewLostandDamagedItemsDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Lost and Damaged Items Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    viewldCostCenterCodes: [],
    lostandDamagedGridData: [],
    lostandDamagedItemsDetails: [],

    // Loading states for each API
    loading: {
        viewldCostCenterCodes: false,
        lostandDamagedGridData: false,
        lostandDamagedItemsDetails: false,
    },

    // Error states for each API
    errors: {
        viewldCostCenterCodes: null,
        lostandDamagedGridData: null,
        lostandDamagedItemsDetails: null,
    },

    // UI State / Filters
    filters: {
        // For Cost Center Codes
        UID: '',
        RID: '',
        StoreStatus: 'Active',
        
        // For Lost and Damaged Grid
        CCode: '',
        Fdate: '',
        TDate: '',
        
        // For Lost and Damaged Items Details
        Refno: '',
        CCCode: ''
    }
};

// Lost and Scrap Report Slice
// ============================
const lostScrapReportSlice = createSlice({
    name: 'lostscrapreport',
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
                Refno: '',
                CCCode: ''
            };
        },
        
        // Action to reset ONLY grid data (preserve dropdowns) - for normal operations
        resetGridData: (state) => {
            state.lostandDamagedGridData = [];
            state.lostandDamagedItemsDetails = [];
            // ✅ DON'T clear viewldCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.viewldCostCenterCodes = [];
            state.lostandDamagedGridData = [];
            state.lostandDamagedItemsDetails = [];
            
            state.filters = {
                UID: '',
                RID: '',
                StoreStatus: 'Active',
                CCode: '',
                Fdate: '',
                TDate: '',
                Refno: '',
                CCCode: ''
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
        resetViewldCostCenterCodesData: (state) => {
            state.viewldCostCenterCodes = [];
        },

        // Action to reset lost and damaged grid data
        resetLostandDamagedGridData: (state) => {
            state.lostandDamagedGridData = [];
        },

        // Action to reset lost and damaged items details data
        resetLostandDamagedItemsDetailsData: (state) => {
            state.lostandDamagedItemsDetails = [];
        },

        // Action to reset all lost and damaged data
        resetAllLostandDamagedData: (state) => {
            state.viewldCostCenterCodes = [];
            state.lostandDamagedGridData = [];
            state.lostandDamagedItemsDetails = [];
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

        // Action to set reference number filter
        setRefno: (state, action) => {
            state.filters.Refno = action.payload;
        },

        // Action to clear reference number filter
        clearRefno: (state) => {
            state.filters.Refno = '';
        },

        // Action to set cost center code filter (for details)
        setCCCode: (state, action) => {
            state.filters.CCCode = action.payload;
        },

        // Action to clear cost center code filter
        clearCCCode: (state) => {
            state.filters.CCCode = '';
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
        // 1. View Lost & Damaged Cost Center Codes
        builder
            .addCase(fetchViewldCostCenterCodes.pending, (state) => {
                state.loading.viewldCostCenterCodes = true;
                state.errors.viewldCostCenterCodes = null;
            })
            .addCase(fetchViewldCostCenterCodes.fulfilled, (state, action) => {
                state.loading.viewldCostCenterCodes = false;
                state.viewldCostCenterCodes = action.payload;
            })
            .addCase(fetchViewldCostCenterCodes.rejected, (state, action) => {
                state.loading.viewldCostCenterCodes = false;
                state.errors.viewldCostCenterCodes = action.payload;
            })

        // 2. Lost and Damaged Grid Data
        builder
            .addCase(fetchLostandDamagedGridData.pending, (state) => {
                state.loading.lostandDamagedGridData = true;
                state.errors.lostandDamagedGridData = null;
            })
            .addCase(fetchLostandDamagedGridData.fulfilled, (state, action) => {
                state.loading.lostandDamagedGridData = false;
                state.lostandDamagedGridData = action.payload;
            })
            .addCase(fetchLostandDamagedGridData.rejected, (state, action) => {
                state.loading.lostandDamagedGridData = false;
                state.errors.lostandDamagedGridData = action.payload;
            })

        // 3. Lost and Damaged Items Details
        builder
            .addCase(fetchLostandDamagedItemsDetails.pending, (state) => {
                state.loading.lostandDamagedItemsDetails = true;
                state.errors.lostandDamagedItemsDetails = null;
            })
            .addCase(fetchLostandDamagedItemsDetails.fulfilled, (state, action) => {
                state.loading.lostandDamagedItemsDetails = false;
                state.lostandDamagedItemsDetails = action.payload;
            })
            .addCase(fetchLostandDamagedItemsDetails.rejected, (state, action) => {
                state.loading.lostandDamagedItemsDetails = false;
                state.errors.lostandDamagedItemsDetails = action.payload;
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
    resetViewldCostCenterCodesData,
    resetLostandDamagedGridData,
    resetLostandDamagedItemsDetailsData,
    resetAllLostandDamagedData,
    setCostCenter,                            // ✅ Helper for cost center
    clearCostCenter,                          // ✅ Helper for clearing cost center
    setDateRange,                             // ✅ Helper for date range
    clearDateRange,                           // ✅ Helper for clearing date range
    setRefno,                                 // ✅ Helper for reference number
    clearRefno,                               // ✅ Helper for clearing reference number
    setCCCode,                                // ✅ Helper for cost center code
    clearCCCode,                              // ✅ Helper for clearing cost center code
    setUserCredentials,                       // ✅ Helper for setting user credentials
    clearUserCredentials,                     // ✅ Helper for clearing user credentials
    setStoreStatus,                           // ✅ Helper for store status
    clearStoreStatus                          // ✅ Helper for clearing store status
} = lostScrapReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectViewldCostCenterCodes = (state) => state.lostscrapreport.viewldCostCenterCodes;
export const selectLostandDamagedGridData = (state) => state.lostscrapreport.lostandDamagedGridData;
export const selectLostandDamagedItemsDetails = (state) => state.lostscrapreport.lostandDamagedItemsDetails;

// Loading selectors
export const selectLoading = (state) => state.lostscrapreport.loading;
export const selectViewldCostCenterCodesLoading = (state) => state.lostscrapreport.loading.viewldCostCenterCodes;
export const selectLostandDamagedGridDataLoading = (state) => state.lostscrapreport.loading.lostandDamagedGridData;
export const selectLostandDamagedItemsDetailsLoading = (state) => state.lostscrapreport.loading.lostandDamagedItemsDetails;

// Error selectors
export const selectErrors = (state) => state.lostscrapreport.errors;
export const selectViewldCostCenterCodesError = (state) => state.lostscrapreport.errors.viewldCostCenterCodes;
export const selectLostandDamagedGridDataError = (state) => state.lostscrapreport.errors.lostandDamagedGridData;
export const selectLostandDamagedItemsDetailsError = (state) => state.lostscrapreport.errors.lostandDamagedItemsDetails;

// Filter selectors
export const selectFilters = (state) => state.lostscrapreport.filters;
export const selectSelectedUID = (state) => state.lostscrapreport.filters.UID;
export const selectSelectedRID = (state) => state.lostscrapreport.filters.RID;
export const selectSelectedStoreStatus = (state) => state.lostscrapreport.filters.StoreStatus;
export const selectSelectedCCode = (state) => state.lostscrapreport.filters.CCode;
export const selectSelectedFdate = (state) => state.lostscrapreport.filters.Fdate;
export const selectSelectedTDate = (state) => state.lostscrapreport.filters.TDate;
export const selectSelectedRefno = (state) => state.lostscrapreport.filters.Refno;
export const selectSelectedCCCode = (state) => state.lostscrapreport.filters.CCCode;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.lostscrapreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.lostscrapreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasViewldCostCenterCodesData = (state) => {
    return Array.isArray(state.lostscrapreport.viewldCostCenterCodes?.Data) && 
           state.lostscrapreport.viewldCostCenterCodes.Data.length > 0;
};

export const selectHasLostandDamagedGridData = (state) => {
    return Array.isArray(state.lostscrapreport.lostandDamagedGridData?.Data) && 
           state.lostscrapreport.lostandDamagedGridData.Data.length > 0;
};

export const selectHasLostandDamagedItemsDetailsData = (state) => {
    return Array.isArray(state.lostscrapreport.lostandDamagedItemsDetails?.Data) && 
           state.lostscrapreport.lostandDamagedItemsDetails.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.lostscrapreport.viewldCostCenterCodes.length > 0 || 
           state.lostscrapreport.lostandDamagedGridData.length > 0 || 
           state.lostscrapreport.lostandDamagedItemsDetails.length > 0;
};

// Lost and damaged summary selector based on grid data structure
export const selectLostandDamagedSummary = (state) => {
    const gridData = state.lostscrapreport.lostandDamagedGridData?.Data || [];
    
    if (!Array.isArray(gridData) || gridData.length === 0) {
        return {
            totalRecords: 0,
            totalAmount: 0,
            totalQuantity: 0,
            uniqueCostCenters: 0,
            averageAmount: 0
        };
    }

    // Calculate statistics from lost and damaged data
    const totalAmount = gridData.reduce((sum, item) => sum + (parseFloat(item.Amount || item.Value || item.TotalAmount) || 0), 0);
    const totalQuantity = gridData.reduce((sum, item) => sum + (parseFloat(item.Quantity || item.LostQty || item.Qty) || 0), 0);
    const uniqueCostCenters = new Set(gridData.map(item => item.CostCenter || item.CCCode || item.Costcenter).filter(cc => cc)).size;
    const averageAmount = gridData.length > 0 ? totalAmount / gridData.length : 0;

    return {
        totalRecords: gridData.length,
        totalAmount,
        totalQuantity,
        uniqueCostCenters,
        averageAmount
    };
};

// Filter validation selectors
export const selectViewldCostCenterCodesFiltersValid = (state) => {
    const { UID, RID } = state.lostscrapreport.filters;
    return !!(UID && RID); // UID and RID are required for cost center codes
};

export const selectLostandDamagedGridFiltersValid = (state) => {
    const { CCode } = state.lostscrapreport.filters;
    return !!CCode; // CCode is required for lost and damaged grid (dates are optional)
};

export const selectLostandDamagedItemsDetailsFiltersValid = (state) => {
    const { Refno, CCCode } = state.lostscrapreport.filters;
    return !!(Refno && CCCode); // Both Refno and CCCode are required for lost and damaged items details
};

// Date range selector
export const selectDateRange = (state) => ({
    Fdate: state.lostscrapreport.filters.Fdate,
    TDate: state.lostscrapreport.filters.TDate
});

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.lostscrapreport.filters.UID,
    RID: state.lostscrapreport.filters.RID,
    StoreStatus: state.lostscrapreport.filters.StoreStatus
});

// Cost center and date range combined selector
export const selectLostandDamagedGridParams = (state) => ({
    CCode: state.lostscrapreport.filters.CCode,
    Fdate: state.lostscrapreport.filters.Fdate,
    TDate: state.lostscrapreport.filters.TDate
});

// Lost and damaged items details params selector
export const selectLostandDamagedItemsDetailsParams = (state) => ({
    Refno: state.lostscrapreport.filters.Refno,
    CCCode: state.lostscrapreport.filters.CCCode
});

// View cost center codes params selector
export const selectViewldCostCenterCodesParams = (state) => ({
    UID: state.lostscrapreport.filters.UID,
    RID: state.lostscrapreport.filters.RID,
    StoreStatus: state.lostscrapreport.filters.StoreStatus
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.lostscrapreport.filters;

// Export reducer
export default lostScrapReportSlice.reducer;