import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as stockPurchaseAPI from '../../api/GstAPI/gstReportAPI';

// Async Thunks for GST Report APIs
// ================================

// 1. Fetch GST Purchase Consolidate Tax Numbers
export const fetchGstPurchaseConsolidateTaxNos = createAsyncThunk(
    'gstreport/fetchGstPurchaseConsolidateTaxNos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await stockPurchaseAPI.getStockPurchaseConsolidateTaxNos();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch GST Purchase Consolidate Tax Numbers');
        }
    }
);

// 2. Fetch GST Purchase Consolidate Report Grid
export const fetchGstPurchaseConsolidateReportGrid = createAsyncThunk(
    'gstreport/fetchGstPurchaseConsolidateReportGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockPurchaseAPI.getStockPurchaseConsolidateReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch GST Purchase Consolidate Report Grid');
        }
    }
);

// 3. Fetch GST Purchase Report Grid
export const fetchGstPurchaseReportGrid = createAsyncThunk(
    'gstreport/fetchGstPurchaseReportGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await stockPurchaseAPI.getStockPurchaseReportGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch GST Purchase Report Grid');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    gstPurchaseConsolidateTaxNos: [],
    gstPurchaseConsolidateReportGrid: [],
    gstPurchaseReportGrid: [],

    // Loading states for each API
    loading: {
        gstPurchaseConsolidateTaxNos: false,
        gstPurchaseConsolidateReportGrid: false,
        gstPurchaseReportGrid: false,
    },

    // Error states for each API
    errors: {
        gstPurchaseConsolidateTaxNos: null,
        gstPurchaseConsolidateReportGrid: null,
        gstPurchaseReportGrid: null,
    },

    // UI State / Filters
    filters: {
        taxno: '',
        fromDate: '',
        toDate: ''
    }
};

// GST Report Slice
// ================
const gstReportSlice = createSlice({
    name: 'gstreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                taxno: '',
                fromDate: '',
                toDate: ''
            };
        },
        
        // Action to reset ONLY report grids (preserve tax numbers dropdown) - for normal operations
        resetReportData: (state) => {
            state.gstPurchaseConsolidateReportGrid = [];
            state.gstPurchaseReportGrid = [];
            // ✅ DON'T clear gstPurchaseConsolidateTaxNos - preserve dropdown!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.gstPurchaseConsolidateTaxNos = [];
            state.gstPurchaseConsolidateReportGrid = [];
            state.gstPurchaseReportGrid = [];
            state.filters = {
                taxno: '',
                fromDate: '',
                toDate: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset GST purchase consolidate tax numbers data
        resetGstPurchaseConsolidateTaxNosData: (state) => {
            state.gstPurchaseConsolidateTaxNos = [];
        },

        // Action to reset GST purchase consolidate report grid data
        resetGstPurchaseConsolidateReportGridData: (state) => {
            state.gstPurchaseConsolidateReportGrid = [];
        },

        // Action to reset GST purchase report grid data
        resetGstPurchaseReportGridData: (state) => {
            state.gstPurchaseReportGrid = [];
        },

        // Action to reset all GST report data
        resetAllGstReportData: (state) => {
            state.gstPurchaseConsolidateTaxNos = [];
            state.gstPurchaseConsolidateReportGrid = [];
            state.gstPurchaseReportGrid = [];
        }
    },
    extraReducers: (builder) => {
        // 1. GST Purchase Consolidate Tax Numbers
        builder
            .addCase(fetchGstPurchaseConsolidateTaxNos.pending, (state) => {
                state.loading.gstPurchaseConsolidateTaxNos = true;
                state.errors.gstPurchaseConsolidateTaxNos = null;
            })
            .addCase(fetchGstPurchaseConsolidateTaxNos.fulfilled, (state, action) => {
                state.loading.gstPurchaseConsolidateTaxNos = false;
                state.gstPurchaseConsolidateTaxNos = action.payload;
            })
            .addCase(fetchGstPurchaseConsolidateTaxNos.rejected, (state, action) => {
                state.loading.gstPurchaseConsolidateTaxNos = false;
                state.errors.gstPurchaseConsolidateTaxNos = action.payload;
            })

        // 2. GST Purchase Consolidate Report Grid
        builder
            .addCase(fetchGstPurchaseConsolidateReportGrid.pending, (state) => {
                state.loading.gstPurchaseConsolidateReportGrid = true;
                state.errors.gstPurchaseConsolidateReportGrid = null;
            })
            .addCase(fetchGstPurchaseConsolidateReportGrid.fulfilled, (state, action) => {
                state.loading.gstPurchaseConsolidateReportGrid = false;
                state.gstPurchaseConsolidateReportGrid = action.payload;
            })
            .addCase(fetchGstPurchaseConsolidateReportGrid.rejected, (state, action) => {
                state.loading.gstPurchaseConsolidateReportGrid = false;
                state.errors.gstPurchaseConsolidateReportGrid = action.payload;
            })

        // 3. GST Purchase Report Grid
        builder
            .addCase(fetchGstPurchaseReportGrid.pending, (state) => {
                state.loading.gstPurchaseReportGrid = true;
                state.errors.gstPurchaseReportGrid = null;
            })
            .addCase(fetchGstPurchaseReportGrid.fulfilled, (state, action) => {
                state.loading.gstPurchaseReportGrid = false;
                state.gstPurchaseReportGrid = action.payload;
            })
            .addCase(fetchGstPurchaseReportGrid.rejected, (state, action) => {
                state.loading.gstPurchaseReportGrid = false;
                state.errors.gstPurchaseReportGrid = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetReportData,                                    // ✅ Only resets report grids (preserves dropdowns)
    resetAllData,                                       // ✅ Resets everything (for Reset button only)
    clearError, 
    resetGstPurchaseConsolidateTaxNosData,
    resetGstPurchaseConsolidateReportGridData,
    resetGstPurchaseReportGridData,
    resetAllGstReportData
} = gstReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectGstPurchaseConsolidateTaxNos = (state) => state.gstreport.gstPurchaseConsolidateTaxNos;
export const selectGstPurchaseConsolidateReportGrid = (state) => state.gstreport.gstPurchaseConsolidateReportGrid;
export const selectGstPurchaseReportGrid = (state) => state.gstreport.gstPurchaseReportGrid;

// Loading selectors
export const selectLoading = (state) => state.gstreport.loading;
export const selectGstPurchaseConsolidateTaxNosLoading = (state) => state.gstreport.loading.gstPurchaseConsolidateTaxNos;
export const selectGstPurchaseConsolidateReportGridLoading = (state) => state.gstreport.loading.gstPurchaseConsolidateReportGrid;
export const selectGstPurchaseReportGridLoading = (state) => state.gstreport.loading.gstPurchaseReportGrid;

// Error selectors
export const selectErrors = (state) => state.gstreport.errors;
export const selectGstPurchaseConsolidateTaxNosError = (state) => state.gstreport.errors.gstPurchaseConsolidateTaxNos;
export const selectGstPurchaseConsolidateReportGridError = (state) => state.gstreport.errors.gstPurchaseConsolidateReportGrid;
export const selectGstPurchaseReportGridError = (state) => state.gstreport.errors.gstPurchaseReportGrid;

// Filter selectors
export const selectFilters = (state) => state.gstreport.filters;
export const selectSelectedTaxno = (state) => state.gstreport.filters.taxno;
export const selectSelectedFromDate = (state) => state.gstreport.filters.fromDate;
export const selectSelectedToDate = (state) => state.gstreport.filters.toDate;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.gstreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.gstreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasReportData = (state) => {
    return state.gstreport.gstPurchaseConsolidateReportGrid.length > 0 || state.gstreport.gstPurchaseReportGrid.length > 0;
};

export const selectHasTaxNosData = (state) => {
    return Array.isArray(state.gstreport.gstPurchaseConsolidateTaxNos?.Data) && state.gstreport.gstPurchaseConsolidateTaxNos.Data.length > 0;
};

export const selectHasConsolidateReportData = (state) => {
    return Array.isArray(state.gstreport.gstPurchaseConsolidateReportGrid?.Data) && state.gstreport.gstPurchaseConsolidateReportGrid.Data.length > 0;
};

export const selectHasGstPurchaseReportData = (state) => {
    return Array.isArray(state.gstreport.gstPurchaseReportGrid?.Data) && state.gstreport.gstPurchaseReportGrid.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.gstreport.gstPurchaseConsolidateTaxNos.length > 0 || 
           state.gstreport.gstPurchaseConsolidateReportGrid.length > 0 ||
           state.gstreport.gstPurchaseReportGrid.length > 0;
};

// Date range validation selector
export const selectIsDateRangeValid = (state) => {
    const { fromDate, toDate } = state.gstreport.filters;
    if (!fromDate || !toDate) return false;
    return new Date(fromDate) <= new Date(toDate);
};

// Export reducer
export default gstReportSlice.reducer;