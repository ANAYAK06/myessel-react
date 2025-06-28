import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as viewCurrentStockAPI from '../../api/Stock/currentStockAPI';

// Async Thunks for View Current Stock APIs
// ========================================

// 1. Fetch View Stock Grid
export const fetchViewStockGrid = createAsyncThunk(
    'viewcurrentstock/fetchViewStockGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewCurrentStockAPI.getViewStockGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch View Stock Grid');
        }
    }
);

// 2. Fetch View Stock Grid New
export const fetchViewStockGridNew = createAsyncThunk(
    'viewcurrentstock/fetchViewStockGridNew',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewCurrentStockAPI.getViewStockGridNew(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch View Stock Grid New');
        }
    }
);

// 3. Fetch Item Categories
export const fetchItemCategories = createAsyncThunk(
    'viewcurrentstock/fetchItemCategories',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewCurrentStockAPI.getItemCategories(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Item Categories');
        }
    }
);

// 4. Fetch Stock Cost Center Codes
export const fetchStockCostCenterCodes = createAsyncThunk(
    'viewcurrentstock/fetchStockCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewCurrentStockAPI.getStockCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Cost Center Codes');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    viewStockGrid: [],
    viewStockGridNew: [],
    itemCategories: [],
    stockCostCenterCodes: [],

    // Loading states for each API
    loading: {
        viewStockGrid: false,
        viewStockGridNew: false,
        itemCategories: false,
        stockCostCenterCodes: false,
    },

    // Error states for each API
    errors: {
        viewStockGrid: null,
        viewStockGridNew: null,
        itemCategories: null,
        stockCostCenterCodes: null,
    },

    // UI State / Filters
    filters: {
        CCode: '',
        Cattype: '',
        UID: '',
        RID: ''
    }
};

// View Current Stock Slice
// ========================
const viewCurrentStockSlice = createSlice({
    name: 'viewcurrentstock',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
             
                Cattype: '',
                UID: '',
                RID: ''
            };
        },
        
        // Action to reset ONLY stock grids (preserve dropdowns) - for normal operations
        resetStockData: (state) => {
            state.viewStockGrid = [];
            state.viewStockGridNew = [];
            // ✅ DON'T clear stockCostCenterCodes or itemCategories - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.viewStockGrid = [];
            state.viewStockGridNew = [];
            state.stockCostCenterCodes = [];
            state.itemCategories = [];
            state.filters = {
                CCode: '',
                Cattype: '',
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

        // Action to reset view stock grid data
        resetViewStockGridData: (state) => {
            state.viewStockGrid = [];
        },

        // Action to reset view stock grid new data
        resetViewStockGridNewData: (state) => {
            state.viewStockGridNew = [];
        },

        // Action to reset item categories data
        resetItemCategoriesData: (state) => {
            state.itemCategories = [];
        },

        // Action to reset stock cost center codes data
        resetStockCostCenterCodesData: (state) => {
            state.stockCostCenterCodes = [];
        },

        // Action to reset all view current stock data
        resetAllViewCurrentStockData: (state) => {
            state.viewStockGrid = [];
            state.viewStockGridNew = [];
            state.itemCategories = [];
            state.stockCostCenterCodes = [];
        }
    },
    extraReducers: (builder) => {
        // 1. View Stock Grid
        builder
            .addCase(fetchViewStockGrid.pending, (state) => {
                state.loading.viewStockGrid = true;
                state.errors.viewStockGrid = null;
            })
            .addCase(fetchViewStockGrid.fulfilled, (state, action) => {
                state.loading.viewStockGrid = false;
                state.viewStockGrid = action.payload;
            })
            .addCase(fetchViewStockGrid.rejected, (state, action) => {
                state.loading.viewStockGrid = false;
                state.errors.viewStockGrid = action.payload;
            })

        // 2. View Stock Grid New
        builder
            .addCase(fetchViewStockGridNew.pending, (state) => {
                state.loading.viewStockGridNew = true;
                state.errors.viewStockGridNew = null;
            })
            .addCase(fetchViewStockGridNew.fulfilled, (state, action) => {
                state.loading.viewStockGridNew = false;
                state.viewStockGridNew = action.payload;
            })
            .addCase(fetchViewStockGridNew.rejected, (state, action) => {
                state.loading.viewStockGridNew = false;
                state.errors.viewStockGridNew = action.payload;
            })

        // 3. Item Categories
        builder
            .addCase(fetchItemCategories.pending, (state) => {
                state.loading.itemCategories = true;
                state.errors.itemCategories = null;
            })
            .addCase(fetchItemCategories.fulfilled, (state, action) => {
                state.loading.itemCategories = false;
                state.itemCategories = action.payload;
            })
            .addCase(fetchItemCategories.rejected, (state, action) => {
                state.loading.itemCategories = false;
                state.errors.itemCategories = action.payload;
            })

        // 4. Stock Cost Center Codes
        builder
            .addCase(fetchStockCostCenterCodes.pending, (state) => {
                state.loading.stockCostCenterCodes = true;
                state.errors.stockCostCenterCodes = null;
            })
            .addCase(fetchStockCostCenterCodes.fulfilled, (state, action) => {
                state.loading.stockCostCenterCodes = false;
                state.stockCostCenterCodes = action.payload;
            })
            .addCase(fetchStockCostCenterCodes.rejected, (state, action) => {
                state.loading.stockCostCenterCodes = false;
                state.errors.stockCostCenterCodes = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetStockData,           // ✅ Only resets stock grids (preserves dropdowns)
    resetAllData,             // ✅ Resets everything (for Reset button only)
    clearError, 
    resetViewStockGridData,
    resetViewStockGridNewData,
    resetItemCategoriesData,
    resetStockCostCenterCodesData,
    resetAllViewCurrentStockData
} = viewCurrentStockSlice.actions;

// Selectors
// =========

// Data selectors
export const selectViewStockGrid = (state) => state.viewcurrentstock.viewStockGrid;
export const selectViewStockGridNew = (state) => state.viewcurrentstock.viewStockGridNew;
export const selectItemCategories = (state) => state.viewcurrentstock.itemCategories;
export const selectStockCostCenterCodes = (state) => state.viewcurrentstock.stockCostCenterCodes;

// Loading selectors
export const selectLoading = (state) => state.viewcurrentstock.loading;
export const selectViewStockGridLoading = (state) => state.viewcurrentstock.loading.viewStockGrid;
export const selectViewStockGridNewLoading = (state) => state.viewcurrentstock.loading.viewStockGridNew;
export const selectItemCategoriesLoading = (state) => state.viewcurrentstock.loading.itemCategories;
export const selectStockCostCenterCodesLoading = (state) => state.viewcurrentstock.loading.stockCostCenterCodes;

// Error selectors
export const selectErrors = (state) => state.viewcurrentstock.errors;
export const selectViewStockGridError = (state) => state.viewcurrentstock.errors.viewStockGrid;
export const selectViewStockGridNewError = (state) => state.viewcurrentstock.errors.viewStockGridNew;
export const selectItemCategoriesError = (state) => state.viewcurrentstock.errors.itemCategories;
export const selectStockCostCenterCodesError = (state) => state.viewcurrentstock.errors.stockCostCenterCodes;

// Filter selectors
export const selectFilters = (state) => state.viewcurrentstock.filters;
export const selectSelectedCCode = (state) => state.viewcurrentstock.filters.CCode;
export const selectSelectedCattype = (state) => state.viewcurrentstock.filters.Cattype;
export const selectSelectedUID = (state) => state.viewcurrentstock.filters.UID;
export const selectSelectedRID = (state) => state.viewcurrentstock.filters.RID;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.viewcurrentstock.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.viewcurrentstock.errors).some(error => error !== null);

// Utility selectors
export const selectHasStockData = (state) => {
    return state.viewcurrentstock.viewStockGrid.length > 0 || state.viewcurrentstock.viewStockGridNew.length > 0;
};

export const selectHasCategoriesData = (state) => {
    return Array.isArray(state.viewcurrentstock.itemCategories?.Data) && state.viewcurrentstock.itemCategories.Data.length > 0;
};

export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.viewcurrentstock.stockCostCenterCodes?.Data) && state.viewcurrentstock.stockCostCenterCodes.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.viewcurrentstock.viewStockGrid.length > 0 || 
           state.viewcurrentstock.viewStockGridNew.length > 0 ||
           state.viewcurrentstock.itemCategories.length > 0 ||
           state.viewcurrentstock.stockCostCenterCodes.length > 0;
};

// Export reducer
export default viewCurrentStockSlice.reducer;