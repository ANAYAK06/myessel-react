import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as assetAPI from '../../api/AssetAPI/assetDepreciationReportAPI';

// Async Thunks for 2 Asset Depreciation Report APIs
// =================================================

// 1. Fetch All Asset Depreciation Cost Centers
export const fetchAllAssetDepCostCenters = createAsyncThunk(
    'assetdepreciationreport/fetchAllAssetDepCostCenters',
    async (params, { rejectWithValue }) => {
        try {
            const response = await assetAPI.getAllAssetDepCostCenters(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch All Asset Depreciation Cost Centers');
        }
    }
);

// 2. Fetch Assets Depreciation Report
export const fetchAssetsDepreciation = createAsyncThunk(
    'assetdepreciationreport/fetchAssetsDepreciation',
    async (params, { rejectWithValue }) => {
        try {
            const response = await assetAPI.getAssetsDepreciation(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Assets Depreciation Report');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    allAssetDepCostCenters: [],
    assetsDepreciation: [],

    // Loading states for each API
    loading: {
        allAssetDepCostCenters: false,
        assetsDepreciation: false,
    },

    // Error states for each API
    errors: {
        allAssetDepCostCenters: null,
        assetsDepreciation: null,
    },

    // UI State / Filters
    filters: {
        UID: '',
        RID: '',
        StoreStatus: '',
        CCCode: '',
        Fyear: ''
    }
};

// Asset Depreciation Report Slice
// ===============================
const assetDepreciationReportSlice = createSlice({
    name: 'assetdepreciationreport',
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
                CCCode: '',
                Fyear: ''
            };
        },
        
        // Action to reset asset depreciation data
        resetAssetDepreciationData: (state) => {
            state.allAssetDepCostCenters = [];
            state.assetsDepreciation = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset cost centers data
        resetCostCentersData: (state) => {
            state.allAssetDepCostCenters = [];
        },

        // Action to reset depreciation report data
        resetDepreciationReportData: (state) => {
            state.assetsDepreciation = [];
        }
    },
    extraReducers: (builder) => {
        // 1. All Asset Depreciation Cost Centers
        builder
            .addCase(fetchAllAssetDepCostCenters.pending, (state) => {
                state.loading.allAssetDepCostCenters = true;
                state.errors.allAssetDepCostCenters = null;
            })
            .addCase(fetchAllAssetDepCostCenters.fulfilled, (state, action) => {
                state.loading.allAssetDepCostCenters = false;
                state.allAssetDepCostCenters = action.payload;
            })
            .addCase(fetchAllAssetDepCostCenters.rejected, (state, action) => {
                state.loading.allAssetDepCostCenters = false;
                state.errors.allAssetDepCostCenters = action.payload;
            })

        // 2. Assets Depreciation Report
        builder
            .addCase(fetchAssetsDepreciation.pending, (state) => {
                state.loading.assetsDepreciation = true;
                state.errors.assetsDepreciation = null;
            })
            .addCase(fetchAssetsDepreciation.fulfilled, (state, action) => {
                state.loading.assetsDepreciation = false;
                state.assetsDepreciation = action.payload;
            })
            .addCase(fetchAssetsDepreciation.rejected, (state, action) => {
                state.loading.assetsDepreciation = false;
                state.errors.assetsDepreciation = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetAssetDepreciationData, 
    clearError, 
    resetCostCentersData,
    resetDepreciationReportData
} = assetDepreciationReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectAllAssetDepCostCenters = (state) => state.assetdepreciationreport.allAssetDepCostCenters;
export const selectAssetsDepreciation = (state) => state.assetdepreciationreport.assetsDepreciation;

// Loading selectors
export const selectLoading = (state) => state.assetdepreciationreport.loading;
export const selectAllAssetDepCostCentersLoading = (state) => state.assetdepreciationreport.loading.allAssetDepCostCenters;
export const selectAssetsDepreciationLoading = (state) => state.assetdepreciationreport.loading.assetsDepreciation;

// Error selectors
export const selectErrors = (state) => state.assetdepreciationreport.errors;
export const selectAllAssetDepCostCentersError = (state) => state.assetdepreciationreport.errors.allAssetDepCostCenters;
export const selectAssetsDepreciationError = (state) => state.assetdepreciationreport.errors.assetsDepreciation;

// Filter selectors
export const selectFilters = (state) => state.assetdepreciationreport.filters;
export const selectSelectedUID = (state) => state.assetdepreciationreport.filters.UID;
export const selectSelectedRID = (state) => state.assetdepreciationreport.filters.RID;
export const selectSelectedStoreStatus = (state) => state.assetdepreciationreport.filters.StoreStatus;
export const selectSelectedCCCode = (state) => state.assetdepreciationreport.filters.CCCode;
export const selectSelectedFyear = (state) => state.assetdepreciationreport.filters.Fyear;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.assetdepreciationreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.assetdepreciationreport.errors).some(error => error !== null);

// Export reducer
export default assetDepreciationReportSlice.reducer;