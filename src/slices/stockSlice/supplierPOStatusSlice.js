import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierPOStatusAPI from '../../api/Stock/supplierPOStatusAPI';

// Async Thunks for Supplier PO Status APIs
// =========================================

// 1. Fetch View Purchase Status Grid
export const fetchViewPurchaseStatusGrid = createAsyncThunk(
    'supplierpostatus/fetchViewPurchaseStatusGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await supplierPOStatusAPI.getViewPurchaseStatusGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch View Purchase Status Grid');
        }
    }
);

// 2. Fetch Purchase Cost Center Codes
export const fetchPurchaseCostCenterCodes = createAsyncThunk(
    'supplierpostatus/fetchPurchaseCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await supplierPOStatusAPI.getPurchaseCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Purchase Cost Center Codes');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    viewPurchaseStatusGrid: [],
    purchaseCostCenterCodes: [],

    // Loading states for each API
    loading: {
        viewPurchaseStatusGrid: false,
        purchaseCostCenterCodes: false,
    },

    // Error states for each API
    errors: {
        viewPurchaseStatusGrid: null,
        purchaseCostCenterCodes: null,
    },

    // UI State / Filters
    filters: {
        CCode: '',
        Fromdate: '',
        Todate: '',
        UID: '',
        RID: ''
    }
};

// Supplier PO Status Slice
// ========================
const supplierPOStatusSlice = createSlice({
    name: 'supplierpostatus',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                CCode: '',
                Fromdate: '',
                Todate: '',
                UID: '',
                RID: ''
            };
        },
        
        // Action to reset ONLY purchase status data (preserve dropdowns) - for normal operations
        resetPurchaseData: (state) => {
            state.viewPurchaseStatusGrid = [];
            // ✅ DON'T clear purchaseCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.viewPurchaseStatusGrid = [];
            
            state.filters = {
                CCode: '',
                Fromdate: '',
                Todate: '',
                UID: '',
                RID: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset view purchase status grid data
        resetViewPurchaseStatusGridData: (state) => {
            state.viewPurchaseStatusGrid = [];
        },

        // Action to reset purchase cost center codes data
        resetPurchaseCostCenterCodesData: (state) => {
            state.purchaseCostCenterCodes = [];
        },

        // Action to reset all supplier PO status data
        resetAllSupplierPOStatusData: (state) => {
            state.viewPurchaseStatusGrid = [];
            state.purchaseCostCenterCodes = [];
        },

        // Action to set date range filters
        setDateRange: (state, action) => {
            const { fromDate, toDate } = action.payload;
            state.filters.Fromdate = fromDate;
            state.filters.Todate = toDate;
        },

        // Action to clear date range filters
        clearDateRange: (state) => {
            state.filters.Fromdate = '';
            state.filters.Todate = '';
        }
    },
    extraReducers: (builder) => {
        // 1. View Purchase Status Grid
        builder
            .addCase(fetchViewPurchaseStatusGrid.pending, (state) => {
                state.loading.viewPurchaseStatusGrid = true;
                state.errors.viewPurchaseStatusGrid = null;
            })
            .addCase(fetchViewPurchaseStatusGrid.fulfilled, (state, action) => {
                state.loading.viewPurchaseStatusGrid = false;
                state.viewPurchaseStatusGrid = action.payload;
            })
            .addCase(fetchViewPurchaseStatusGrid.rejected, (state, action) => {
                state.loading.viewPurchaseStatusGrid = false;
                state.errors.viewPurchaseStatusGrid = action.payload;
            })

        // 2. Purchase Cost Center Codes
        builder
            .addCase(fetchPurchaseCostCenterCodes.pending, (state) => {
                state.loading.purchaseCostCenterCodes = true;
                state.errors.purchaseCostCenterCodes = null;
            })
            .addCase(fetchPurchaseCostCenterCodes.fulfilled, (state, action) => {
                state.loading.purchaseCostCenterCodes = false;
                state.purchaseCostCenterCodes = action.payload;
            })
            .addCase(fetchPurchaseCostCenterCodes.rejected, (state, action) => {
                state.loading.purchaseCostCenterCodes = false;
                state.errors.purchaseCostCenterCodes = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetPurchaseData,                    // ✅ Only resets purchase data (preserves dropdowns)
    resetAllData,                         // ✅ Resets everything (for Reset button only)
    clearError, 
    resetViewPurchaseStatusGridData,
    resetPurchaseCostCenterCodesData,
    resetAllSupplierPOStatusData,
    setDateRange,                         // ✅ Helper for date range
    clearDateRange                        // ✅ Helper for clearing dates
} = supplierPOStatusSlice.actions;

// Selectors
// =========

// Data selectors
export const selectViewPurchaseStatusGrid = (state) => state.supplierpostatus.viewPurchaseStatusGrid;
export const selectPurchaseCostCenterCodes = (state) => state.supplierpostatus.purchaseCostCenterCodes;

// Loading selectors
export const selectLoading = (state) => state.supplierpostatus.loading;
export const selectViewPurchaseStatusGridLoading = (state) => state.supplierpostatus.loading.viewPurchaseStatusGrid;
export const selectPurchaseCostCenterCodesLoading = (state) => state.supplierpostatus.loading.purchaseCostCenterCodes;

// Error selectors
export const selectErrors = (state) => state.supplierpostatus.errors;
export const selectViewPurchaseStatusGridError = (state) => state.supplierpostatus.errors.viewPurchaseStatusGrid;
export const selectPurchaseCostCenterCodesError = (state) => state.supplierpostatus.errors.purchaseCostCenterCodes;

// Filter selectors
export const selectFilters = (state) => state.supplierpostatus.filters;
export const selectSelectedCCode = (state) => state.supplierpostatus.filters.CCode;
export const selectSelectedFromDate = (state) => state.supplierpostatus.filters.Fromdate;
export const selectSelectedToDate = (state) => state.supplierpostatus.filters.Todate;
export const selectSelectedUID = (state) => state.supplierpostatus.filters.UID;
export const selectSelectedRID = (state) => state.supplierpostatus.filters.RID;

// Date range selector
export const selectDateRange = (state) => ({
    fromDate: state.supplierpostatus.filters.Fromdate,
    toDate: state.supplierpostatus.filters.Todate
});

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.supplierpostatus.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.supplierpostatus.errors).some(error => error !== null);

// Utility selectors
export const selectHasPurchaseData = (state) => {
    return Array.isArray(state.supplierpostatus.viewPurchaseStatusGrid?.Data) && 
           state.supplierpostatus.viewPurchaseStatusGrid.Data.length > 0;
};

export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.supplierpostatus.purchaseCostCenterCodes?.Data) && 
           state.supplierpostatus.purchaseCostCenterCodes.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.supplierpostatus.viewPurchaseStatusGrid.length > 0 || 
           state.supplierpostatus.purchaseCostCenterCodes.length > 0;
};

// Purchase status summary selector
export const selectPurchaseSummary = (state) => {
    const purchaseData = state.supplierpostatus.viewPurchaseStatusGrid?.Data || [];
    
    if (!Array.isArray(purchaseData) || purchaseData.length === 0) {
        return {
            totalOrders: 0,
            totalAmount: 0,
            pendingOrders: 0,
            completedOrders: 0
        };
    }

    return purchaseData.reduce((summary, order) => {
        const amount = parseFloat(order.Amount || order.TotalAmount || order.POAmount || 0);
        const status = (order.Status || order.POStatus || '').toLowerCase();
        
        summary.totalOrders += 1;
        summary.totalAmount += amount;
        
        if (status.includes('pending') || status.includes('open')) {
            summary.pendingOrders += 1;
        } else if (status.includes('completed') || status.includes('closed')) {
            summary.completedOrders += 1;
        }
        
        return summary;
    }, {
        totalOrders: 0,
        totalAmount: 0,
        pendingOrders: 0,
        completedOrders: 0
    });
};

// Filter validation selector
export const selectFiltersValid = (state) => {
    const { CCode, Fromdate, Todate, UID, RID } = state.supplierpostatus.filters;
    return !!(UID && RID); // UID and RID are required
};

// Export reducer
export default supplierPOStatusSlice.reducer;