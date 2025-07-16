import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as stockTransferReportAPI from '../../api/Stock/stockTransferReportAPI';

// Async Thunks for Stock Transfer Report APIs
// ============================================

// 1. Fetch Transfer Cost Center Codes
export const fetchTransferCostCenterCodes = createAsyncThunk(
    'stocktransferreport/fetchTransferCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockTransferReportAPI.getTransferCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Transfer Cost Center Codes');
        }
    }
);

// 2. Fetch Transfer Grid Data
export const fetchTransferGridData = createAsyncThunk(
    'stocktransferreport/fetchTransferGridData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockTransferReportAPI.viewTransferGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Transfer Grid Data');
        }
    }
);

// 3. Fetch Transfer Items Details
export const fetchTransferItemsDetails = createAsyncThunk(
    'stocktransferreport/fetchTransferItemsDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockTransferReportAPI.viewTransferItemsDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Transfer Items Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    transferCostCenterCodes: [],
    transferGridData: [],
    transferItemsDetails: [],

    // Loading states for each API
    loading: {
        transferCostCenterCodes: false,
        transferGridData: false,
        transferItemsDetails: false,
    },

    // Error states for each API
    errors: {
        transferCostCenterCodes: null,
        transferGridData: null,
        transferItemsDetails: null,
    },

    // UI State / Filters
    filters: {
        // For Cost Center Codes
        UID: '',
        RID: '',
        StoreStatus: '',
        
        // For Transfer Grid
        CCode: '',
        Fdate: '',
        TDate: '',
        
        // For Items Details
        Refno: ''
    }
};

// Stock Transfer Report Slice
// ============================
const stockTransferReportSlice = createSlice({
    name: 'stocktransferreport',
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
                StoreStatus: '',
                CCode: '',
                Fdate: '',
                TDate: '',
                Refno: ''
            };
        },
        
        // Action to reset ONLY grid data (preserve dropdowns) - for normal operations
        resetGridData: (state) => {
            state.transferGridData = [];
            state.transferItemsDetails = [];
            // ✅ DON'T clear transferCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.transferCostCenterCodes = [];
            state.transferGridData = [];
            state.transferItemsDetails = [];
            
            state.filters = {
                UID: '',
                RID: '',
                StoreStatus: '',
                CCode: '',
                Fdate: '',
                TDate: '',
                Refno: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset transfer cost center codes data
        resetTransferCostCenterCodesData: (state) => {
            state.transferCostCenterCodes = [];
        },

        // Action to reset transfer grid data
        resetTransferGridData: (state) => {
            state.transferGridData = [];
        },

        // Action to reset transfer items details data
        resetTransferItemsDetailsData: (state) => {
            state.transferItemsDetails = [];
        },

        // Action to reset all stock transfer data
        resetAllStockTransferData: (state) => {
            state.transferCostCenterCodes = [];
            state.transferGridData = [];
            state.transferItemsDetails = [];
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

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UID, RID, StoreStatus } = action.payload;
            state.filters.UID = UID || state.filters.UID;
            state.filters.RID = RID || state.filters.RID;
            state.filters.StoreStatus = StoreStatus || state.filters.StoreStatus;
        },

        // Action to set store status filter
        setStoreStatus: (state, action) => {
            state.filters.StoreStatus = action.payload;
        },

        // Action to clear store status filter
        clearStoreStatus: (state) => {
            state.filters.StoreStatus = '';
        }
    },
    extraReducers: (builder) => {
        // 1. Transfer Cost Center Codes
        builder
            .addCase(fetchTransferCostCenterCodes.pending, (state) => {
                state.loading.transferCostCenterCodes = true;
                state.errors.transferCostCenterCodes = null;
            })
            .addCase(fetchTransferCostCenterCodes.fulfilled, (state, action) => {
                state.loading.transferCostCenterCodes = false;
                state.transferCostCenterCodes = action.payload;
            })
            .addCase(fetchTransferCostCenterCodes.rejected, (state, action) => {
                state.loading.transferCostCenterCodes = false;
                state.errors.transferCostCenterCodes = action.payload;
            })

        // 2. Transfer Grid Data
        builder
            .addCase(fetchTransferGridData.pending, (state) => {
                state.loading.transferGridData = true;
                state.errors.transferGridData = null;
            })
            .addCase(fetchTransferGridData.fulfilled, (state, action) => {
                state.loading.transferGridData = false;
                state.transferGridData = action.payload;
            })
            .addCase(fetchTransferGridData.rejected, (state, action) => {
                state.loading.transferGridData = false;
                state.errors.transferGridData = action.payload;
            })

        // 3. Transfer Items Details
        builder
            .addCase(fetchTransferItemsDetails.pending, (state) => {
                state.loading.transferItemsDetails = true;
                state.errors.transferItemsDetails = null;
            })
            .addCase(fetchTransferItemsDetails.fulfilled, (state, action) => {
                state.loading.transferItemsDetails = false;
                state.transferItemsDetails = action.payload;
            })
            .addCase(fetchTransferItemsDetails.rejected, (state, action) => {
                state.loading.transferItemsDetails = false;
                state.errors.transferItemsDetails = action.payload;
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
    resetTransferCostCenterCodesData,
    resetTransferGridData,
    resetTransferItemsDetailsData,
    resetAllStockTransferData,
    setCostCenter,                            // ✅ Helper for cost center
    clearCostCenter,                          // ✅ Helper for clearing cost center
    setDateRange,                             // ✅ Helper for date range
    clearDateRange,                           // ✅ Helper for clearing date range
    setRefno,                                 // ✅ Helper for reference number
    clearRefno,                               // ✅ Helper for clearing reference number
    setUserCredentials,                       // ✅ Helper for setting user credentials
    setStoreStatus,                           // ✅ Helper for store status
    clearStoreStatus                          // ✅ Helper for clearing store status
} = stockTransferReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectTransferCostCenterCodes = (state) => state.stocktransferreport.transferCostCenterCodes;
export const selectTransferGridData = (state) => state.stocktransferreport.transferGridData;
export const selectTransferItemsDetails = (state) => state.stocktransferreport.transferItemsDetails;

// Loading selectors
export const selectLoading = (state) => state.stocktransferreport.loading;
export const selectTransferCostCenterCodesLoading = (state) => state.stocktransferreport.loading.transferCostCenterCodes;
export const selectTransferGridDataLoading = (state) => state.stocktransferreport.loading.transferGridData;
export const selectTransferItemsDetailsLoading = (state) => state.stocktransferreport.loading.transferItemsDetails;

// Error selectors
export const selectErrors = (state) => state.stocktransferreport.errors;
export const selectTransferCostCenterCodesError = (state) => state.stocktransferreport.errors.transferCostCenterCodes;
export const selectTransferGridDataError = (state) => state.stocktransferreport.errors.transferGridData;
export const selectTransferItemsDetailsError = (state) => state.stocktransferreport.errors.transferItemsDetails;

// Filter selectors
export const selectFilters = (state) => state.stocktransferreport.filters;
export const selectSelectedUID = (state) => state.stocktransferreport.filters.UID;
export const selectSelectedRID = (state) => state.stocktransferreport.filters.RID;
export const selectSelectedStoreStatus = (state) => state.stocktransferreport.filters.StoreStatus;
export const selectSelectedCCode = (state) => state.stocktransferreport.filters.CCode;
export const selectSelectedFdate = (state) => state.stocktransferreport.filters.Fdate;
export const selectSelectedTDate = (state) => state.stocktransferreport.filters.TDate;
export const selectSelectedRefno = (state) => state.stocktransferreport.filters.Refno;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.stocktransferreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.stocktransferreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.stocktransferreport.transferCostCenterCodes?.Data) && 
           state.stocktransferreport.transferCostCenterCodes.Data.length > 0;
};

export const selectHasTransferGridData = (state) => {
    return Array.isArray(state.stocktransferreport.transferGridData?.Data) && 
           state.stocktransferreport.transferGridData.Data.length > 0;
};

export const selectHasTransferItemsDetailsData = (state) => {
    return Array.isArray(state.stocktransferreport.transferItemsDetails?.Data) && 
           state.stocktransferreport.transferItemsDetails.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.stocktransferreport.transferCostCenterCodes.length > 0 || 
           state.stocktransferreport.transferGridData.length > 0 || 
           state.stocktransferreport.transferItemsDetails.length > 0;
};

// Transfer summary selector
export const selectTransferSummary = (state) => {
    const gridData = state.stocktransferreport.transferGridData?.Data || [];
    
    if (!Array.isArray(gridData) || gridData.length === 0) {
        return {
            totalTransfers: 0,
            totalQuantity: 0,
            totalValue: 0,
            totalItems: 0
        };
    }

    return gridData.reduce((summary, transfer) => {
        const quantity = parseFloat(transfer.Quantity || transfer.Qty || transfer.TotalQty || 0);
        const value = parseFloat(transfer.Value || transfer.Amount || transfer.TotalValue || 0);
        const items = parseFloat(transfer.Items || transfer.ItemCount || 1);
        
        summary.totalTransfers += 1;
        summary.totalQuantity += quantity;
        summary.totalValue += value;
        summary.totalItems += items;
        
        return summary;
    }, {
        totalTransfers: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalItems: 0
    });
};

// Filter validation selectors
export const selectCostCenterFiltersValid = (state) => {
    const { UID, RID } = state.stocktransferreport.filters;
    return !!(UID && RID); // UID and RID are required for cost center codes
};

export const selectTransferGridFiltersValid = (state) => {
    const { CCode, Fdate, TDate } = state.stocktransferreport.filters;
    return !!(CCode && Fdate && TDate); // All are required for transfer grid
};

export const selectTransferItemsFiltersValid = (state) => {
    const { Refno } = state.stocktransferreport.filters;
    return !!Refno; // Refno is required for transfer items details
};

// Date range selector
export const selectDateRange = (state) => ({
    Fdate: state.stocktransferreport.filters.Fdate,
    TDate: state.stocktransferreport.filters.TDate
});

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.stocktransferreport.filters.UID,
    RID: state.stocktransferreport.filters.RID,
    StoreStatus: state.stocktransferreport.filters.StoreStatus
});

// Cost center and date range combined selector
export const selectTransferGridParams = (state) => ({
    CCode: state.stocktransferreport.filters.CCode,
    Fdate: state.stocktransferreport.filters.Fdate,
    TDate: state.stocktransferreport.filters.TDate
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.stocktransferreport.filters;

// Export reducer
export default stockTransferReportSlice.reducer;