import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as stockReconciliationAPI from '../../api/Stock/stockReconciliationAPI';

// Async Thunks for Stock Reconciliation APIs
// ===========================================

// 1. Fetch Stock Reconciliation Data
export const fetchStockReconciliationData = createAsyncThunk(
    'stockreconciliation/fetchStockReconciliationData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockReconciliationAPI.getStockReconciliationData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Reconciliation Data');
        }
    }
);

// 2. Fetch Stock Rec Cost Center Codes
export const fetchStockRecCostCenterCodes = createAsyncThunk(
    'stockreconciliation/fetchStockRecCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockReconciliationAPI.getStockRecCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Rec Cost Center Codes');
        }
    }
);

// 3. Fetch Stock Reconciliation Summary Data
export const fetchStockReconciliationSummaryData = createAsyncThunk(
    'stockreconciliation/fetchStockReconciliationSummaryData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockReconciliationAPI.getStockReconciliationSummaryData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Reconciliation Summary Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    stockReconciliationData: [],
    stockRecCostCenterCodes: [],
    stockReconciliationSummaryData: [],

    // Loading states for each API
    loading: {
        stockReconciliationData: false,
        stockRecCostCenterCodes: false,
        stockReconciliationSummaryData: false,
    },

    // Error states for each API
    errors: {
        stockReconciliationData: null,
        stockRecCostCenterCodes: null,
        stockReconciliationSummaryData: null,
    },

    // UI State / Filters
    filters: {
        CCCode: '',
        Type: '',
        UID: '',
        RID: '',
        StoreStatus: '',
        For: '',
        ItemCode: ''
    }
};

// Stock Reconciliation Slice
// ===========================
const stockReconciliationSlice = createSlice({
    name: 'stockreconciliation',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                CCCode: '',
                Type: '',
                UID: '',
                RID: '',
                StoreStatus: '',
                For: '',
                ItemCode: ''
            };
        },
        
        // Action to reset ONLY report data (preserve dropdowns) - for normal operations
        resetReportData: (state) => {
            state.stockReconciliationData = [];
            state.stockReconciliationSummaryData = [];
            // ✅ DON'T clear stockRecCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.stockReconciliationData = [];
            state.stockReconciliationSummaryData = [];
            
            state.filters = {
                CCCode: '',
                Type: '',
                UID: '',
                RID: '',
                StoreStatus: '',
                For: '',
                ItemCode: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset stock reconciliation data
        resetStockReconciliationData: (state) => {
            state.stockReconciliationData = [];
        },

        // Action to reset stock rec cost center codes data
        resetStockRecCostCenterCodesData: (state) => {
            state.stockRecCostCenterCodes = [];
        },

        // Action to reset stock reconciliation summary data
        resetStockReconciliationSummaryData: (state) => {
            state.stockReconciliationSummaryData = [];
        },

        // Action to reset all stock reconciliation data
        resetAllStockReconciliationData: (state) => {
            state.stockReconciliationData = [];
            state.stockRecCostCenterCodes = [];
            state.stockReconciliationSummaryData = [];
        },

        // Action to set cost center filter
        setCostCenter: (state, action) => {
            state.filters.CCCode = action.payload;
        },

        // Action to clear cost center filter
        clearCostCenter: (state) => {
            state.filters.CCCode = '';
        },

        // Action to set type filter
        setType: (state, action) => {
            state.filters.Type = action.payload;
        },

        // Action to clear type filter
        clearType: (state) => {
            state.filters.Type = '';
        },

        // Action to set for filter
        setFor: (state, action) => {
            state.filters.For = action.payload;
        },

        // Action to clear for filter
        clearFor: (state) => {
            state.filters.For = '';
        },

        // Action to set item code filter
        setItemCode: (state, action) => {
            state.filters.ItemCode = action.payload;
        },

        // Action to clear item code filter
        clearItemCode: (state) => {
            state.filters.ItemCode = '';
        },

        // Action to set store status filter
        setStoreStatus: (state, action) => {
            state.filters.StoreStatus = action.payload;
        },

        // Action to clear store status filter
        clearStoreStatus: (state) => {
            state.filters.StoreStatus = '';
        },

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UID, RID } = action.payload;
            state.filters.UID = UID || state.filters.UID;
            state.filters.RID = RID || state.filters.RID;
        }
    },
    extraReducers: (builder) => {
        // 1. Stock Reconciliation Data
        builder
            .addCase(fetchStockReconciliationData.pending, (state) => {
                state.loading.stockReconciliationData = true;
                state.errors.stockReconciliationData = null;
            })
            .addCase(fetchStockReconciliationData.fulfilled, (state, action) => {
                state.loading.stockReconciliationData = false;
                state.stockReconciliationData = action.payload;
            })
            .addCase(fetchStockReconciliationData.rejected, (state, action) => {
                state.loading.stockReconciliationData = false;
                state.errors.stockReconciliationData = action.payload;
            })

        // 2. Stock Rec Cost Center Codes
        builder
            .addCase(fetchStockRecCostCenterCodes.pending, (state) => {
                state.loading.stockRecCostCenterCodes = true;
                state.errors.stockRecCostCenterCodes = null;
            })
            .addCase(fetchStockRecCostCenterCodes.fulfilled, (state, action) => {
                state.loading.stockRecCostCenterCodes = false;
                state.stockRecCostCenterCodes = action.payload;
            })
            .addCase(fetchStockRecCostCenterCodes.rejected, (state, action) => {
                state.loading.stockRecCostCenterCodes = false;
                state.errors.stockRecCostCenterCodes = action.payload;
            })

        // 3. Stock Reconciliation Summary Data
        builder
            .addCase(fetchStockReconciliationSummaryData.pending, (state) => {
                state.loading.stockReconciliationSummaryData = true;
                state.errors.stockReconciliationSummaryData = null;
            })
            .addCase(fetchStockReconciliationSummaryData.fulfilled, (state, action) => {
                state.loading.stockReconciliationSummaryData = false;
                state.stockReconciliationSummaryData = action.payload;
            })
            .addCase(fetchStockReconciliationSummaryData.rejected, (state, action) => {
                state.loading.stockReconciliationSummaryData = false;
                state.errors.stockReconciliationSummaryData = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetReportData,                           // ✅ Only resets report data (preserves dropdowns)
    resetAllData,                              // ✅ Resets everything (for Reset button only)
    clearError, 
    resetStockReconciliationData,
    resetStockRecCostCenterCodesData,
    resetStockReconciliationSummaryData,
    resetAllStockReconciliationData,
    setCostCenter,                             // ✅ Helper for cost center
    clearCostCenter,                           // ✅ Helper for clearing cost center
    setType,                                   // ✅ Helper for type
    clearType,                                 // ✅ Helper for clearing type
    setFor,                                    // ✅ Helper for for filter
    clearFor,                                  // ✅ Helper for clearing for filter
    setItemCode,                               // ✅ Helper for item code
    clearItemCode,                             // ✅ Helper for clearing item code
    setStoreStatus,                            // ✅ Helper for store status
    clearStoreStatus,                          // ✅ Helper for clearing store status
    setUserCredentials                         // ✅ Helper for setting user credentials
} = stockReconciliationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectStockReconciliationData = (state) => state.stockreconciliation.stockReconciliationData;
export const selectStockRecCostCenterCodes = (state) => state.stockreconciliation.stockRecCostCenterCodes;
export const selectStockReconciliationSummaryData = (state) => state.stockreconciliation.stockReconciliationSummaryData;

// Loading selectors
export const selectLoading = (state) => state.stockreconciliation.loading;
export const selectStockReconciliationDataLoading = (state) => state.stockreconciliation.loading.stockReconciliationData;
export const selectStockRecCostCenterCodesLoading = (state) => state.stockreconciliation.loading.stockRecCostCenterCodes;
export const selectStockReconciliationSummaryDataLoading = (state) => state.stockreconciliation.loading.stockReconciliationSummaryData;

// Error selectors
export const selectErrors = (state) => state.stockreconciliation.errors;
export const selectStockReconciliationDataError = (state) => state.stockreconciliation.errors.stockReconciliationData;
export const selectStockRecCostCenterCodesError = (state) => state.stockreconciliation.errors.stockRecCostCenterCodes;
export const selectStockReconciliationSummaryDataError = (state) => state.stockreconciliation.errors.stockReconciliationSummaryData;

// Filter selectors
export const selectFilters = (state) => state.stockreconciliation.filters;
export const selectSelectedCCCode = (state) => state.stockreconciliation.filters.CCCode;
export const selectSelectedType = (state) => state.stockreconciliation.filters.Type;
export const selectSelectedUID = (state) => state.stockreconciliation.filters.UID;
export const selectSelectedRID = (state) => state.stockreconciliation.filters.RID;
export const selectSelectedStoreStatus = (state) => state.stockreconciliation.filters.StoreStatus;
export const selectSelectedFor = (state) => state.stockreconciliation.filters.For;
export const selectSelectedItemCode = (state) => state.stockreconciliation.filters.ItemCode;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.stockreconciliation.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.stockreconciliation.errors).some(error => error !== null);

// Utility selectors
export const selectHasReconciliationData = (state) => {
    return Array.isArray(state.stockreconciliation.stockReconciliationData?.Data) && 
           state.stockreconciliation.stockReconciliationData.Data.length > 0;
};

export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.stockreconciliation.stockRecCostCenterCodes?.Data) && 
           state.stockreconciliation.stockRecCostCenterCodes.Data.length > 0;
};

export const selectHasSummaryData = (state) => {
    return Array.isArray(state.stockreconciliation.stockReconciliationSummaryData?.Data) && 
           state.stockreconciliation.stockReconciliationSummaryData.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.stockreconciliation.stockReconciliationData.length > 0 || 
           state.stockreconciliation.stockRecCostCenterCodes.length > 0 ||
           state.stockreconciliation.stockReconciliationSummaryData.length > 0;
};

// Stock reconciliation summary selector
export const selectStockReconciliationSummary = (state) => {
    const reconciliationData = state.stockreconciliation.stockReconciliationData?.Data || [];
    
    if (!Array.isArray(reconciliationData) || reconciliationData.length === 0) {
        return {
            totalItems: 0,
            totalSystemStock: 0,
            totalPhysicalStock: 0,
            totalVariance: 0,
            totalValue: 0
        };
    }

    return reconciliationData.reduce((summary, item) => {
        const systemStock = parseFloat(item.SystemStock || item.BookStock || item.ExpectedQty || 0);
        const physicalStock = parseFloat(item.PhysicalStock || item.ActualStock || item.PhysicalQty || 0);
        const variance = parseFloat(item.Variance || item.Difference || (physicalStock - systemStock) || 0);
        const value = parseFloat(item.Value || item.Amount || item.TotalValue || 0);
        
        summary.totalItems += 1;
        summary.totalSystemStock += systemStock;
        summary.totalPhysicalStock += physicalStock;
        summary.totalVariance += variance;
        summary.totalValue += value;
        
        return summary;
    }, {
        totalItems: 0,
        totalSystemStock: 0,
        totalPhysicalStock: 0,
        totalVariance: 0,
        totalValue: 0
    });
};

// Filter validation selectors
export const selectBasicFiltersValid = (state) => {
    const { CCCode, Type } = state.stockreconciliation.filters;
    return !!(CCCode && Type); // CCCode and Type are required for basic reconciliation
};

export const selectCostCenterFiltersValid = (state) => {
    const { UID, RID, StoreStatus } = state.stockreconciliation.filters;
    return !!(UID && RID && (StoreStatus !== undefined && StoreStatus !== null && StoreStatus !== '')); // UID, RID, and StoreStatus are required
};

export const selectSummaryFiltersValid = (state) => {
    const { CCCode, Type, For } = state.stockreconciliation.filters;
    return !!(CCCode && Type && For); // CCCode, Type, and For are required for summary
};

// Cost center validation selector
export const selectCostCenterSelected = (state) => {
    return !!state.stockreconciliation.filters.CCCode;
};

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.stockreconciliation.filters.UID,
    RID: state.stockreconciliation.filters.RID
});

// Export reducer
export default stockReconciliationSlice.reducer;