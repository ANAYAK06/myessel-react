import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as assetSalesAPI from '../../api/AssetAPI/assetSalesReportAPI';

// Async Thunks for 2 Asset Sales Report APIs
// ===========================================

// 1. Fetch Asset Sale Main Grid
export const fetchAssetSaleMainGrid = createAsyncThunk(
    'assetsalesreport/fetchAssetSaleMainGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await assetSalesAPI.getAssetSaleMainGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Asset Sale Main Grid');
        }
    }
);

// 2. Fetch Asset Sale Inner Details
export const fetchAssetSaleInnerDetails = createAsyncThunk(
    'assetsalesreport/fetchAssetSaleInnerDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await assetSalesAPI.getAssetSaleInnerDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Asset Sale Inner Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    assetSaleMainGrid: [],
    assetSaleInnerDetails: [],

    // Loading states for each API
    loading: {
        assetSaleMainGrid: false,
        assetSaleInnerDetails: false,
    },

    // Error states for each API
    errors: {
        assetSaleMainGrid: null,
        assetSaleInnerDetails: null,
    },

    // UI State / Filters
    filters: {
        Fdate: '',
        TDate: '',
        Reqno: ''
    }
};

// Asset Sales Report Slice
// ========================
const assetSalesReportSlice = createSlice({
    name: 'assetsalesreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                Fdate: '',
                TDate: '',
                Reqno: ''
            };
        },
        
        // Action to reset asset sales data
        resetAssetSalesData: (state) => {
            state.assetSaleMainGrid = [];
            state.assetSaleInnerDetails = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset main grid data
        resetMainGridData: (state) => {
            state.assetSaleMainGrid = [];
        },

        // Action to reset inner details data
        resetInnerDetailsData: (state) => {
            state.assetSaleInnerDetails = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Asset Sale Main Grid
        builder
            .addCase(fetchAssetSaleMainGrid.pending, (state) => {
                state.loading.assetSaleMainGrid = true;
                state.errors.assetSaleMainGrid = null;
            })
            .addCase(fetchAssetSaleMainGrid.fulfilled, (state, action) => {
                state.loading.assetSaleMainGrid = false;
                state.assetSaleMainGrid = action.payload;
            })
            .addCase(fetchAssetSaleMainGrid.rejected, (state, action) => {
                state.loading.assetSaleMainGrid = false;
                state.errors.assetSaleMainGrid = action.payload;
            })

        // 2. Asset Sale Inner Details
        builder
            .addCase(fetchAssetSaleInnerDetails.pending, (state) => {
                state.loading.assetSaleInnerDetails = true;
                state.errors.assetSaleInnerDetails = null;
            })
            .addCase(fetchAssetSaleInnerDetails.fulfilled, (state, action) => {
                state.loading.assetSaleInnerDetails = false;
                state.assetSaleInnerDetails = action.payload;
            })
            .addCase(fetchAssetSaleInnerDetails.rejected, (state, action) => {
                state.loading.assetSaleInnerDetails = false;
                state.errors.assetSaleInnerDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetAssetSalesData, 
    clearError, 
    resetMainGridData,
    resetInnerDetailsData
} = assetSalesReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAssetSaleMainGrid = (state) => state.assetsalesreport.assetSaleMainGrid;
export const selectAssetSaleInnerDetails = (state) => state.assetsalesreport.assetSaleInnerDetails;

// Loading selectors
export const selectLoading = (state) => state.assetsalesreport.loading;
export const selectAssetSaleMainGridLoading = (state) => state.assetsalesreport.loading.assetSaleMainGrid;
export const selectAssetSaleInnerDetailsLoading = (state) => state.assetsalesreport.loading.assetSaleInnerDetails;

// Error selectors
export const selectErrors = (state) => state.assetsalesreport.errors;
export const selectAssetSaleMainGridError = (state) => state.assetsalesreport.errors.assetSaleMainGrid;
export const selectAssetSaleInnerDetailsError = (state) => state.assetsalesreport.errors.assetSaleInnerDetails;

// Filter selectors
export const selectFilters = (state) => state.assetsalesreport.filters;
export const selectSelectedFdate = (state) => state.assetsalesreport.filters.Fdate;
export const selectSelectedTDate = (state) => state.assetsalesreport.filters.TDate;
export const selectSelectedReqno = (state) => state.assetsalesreport.filters.Reqno;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.assetsalesreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.assetsalesreport.errors).some(error => error !== null);

// Export reducer
export default assetSalesReportSlice.reducer;