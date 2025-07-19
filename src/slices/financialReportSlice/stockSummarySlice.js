import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as stockSummaryAPI from '../../api/FinanceReportAPI/stockSummaryAPI';

// Async Thunks for Stock Summary APIs
// ====================================

// 1. Fetch Stock Summary
export const fetchStockSummary = createAsyncThunk(
    'stocksummary/fetchStockSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await stockSummaryAPI.getStockSummary();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Stock Summary');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    stockSummary: [],

    // Loading states for each API
    loading: {
        stockSummary: false,
    },

    // Error states for each API
    errors: {
        stockSummary: null,
    },

    // Last fetch timestamp for cache management
    lastFetched: null
};

// Stock Summary Slice
// ===================
const stockSummarySlice = createSlice({
    name: 'stocksummary',
    initialState,
    reducers: {
        // Action to reset all data
        resetAllData: (state) => {
            state.stockSummary = [];
            state.lastFetched = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset stock summary data
        resetStockSummaryData: (state) => {
            state.stockSummary = [];
            state.lastFetched = null;
        },

        // Action to set last fetched timestamp
        setLastFetched: (state) => {
            state.lastFetched = new Date().toISOString();
        }
    },
    extraReducers: (builder) => {
        // 1. Stock Summary
        builder
            .addCase(fetchStockSummary.pending, (state) => {
                state.loading.stockSummary = true;
                state.errors.stockSummary = null;
            })
            .addCase(fetchStockSummary.fulfilled, (state, action) => {
                state.loading.stockSummary = false;
                state.stockSummary = action.payload;
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchStockSummary.rejected, (state, action) => {
                state.loading.stockSummary = false;
                state.errors.stockSummary = action.payload;
            });
    },
});

// Export actions
export const { 
    resetAllData,
    clearError, 
    resetStockSummaryData,
    setLastFetched
} = stockSummarySlice.actions;

// Selectors
// =========

// Data selectors
export const selectStockSummary = (state) => state.stocksummary.stockSummary;

// Loading selectors
export const selectLoading = (state) => state.stocksummary.loading;
export const selectStockSummaryLoading = (state) => state.stocksummary.loading.stockSummary;

// Error selectors
export const selectErrors = (state) => state.stocksummary.errors;
export const selectStockSummaryError = (state) => state.stocksummary.errors.stockSummary;

// Utility selectors
export const selectLastFetched = (state) => state.stocksummary.lastFetched;
export const selectIsAnyLoading = (state) => Object.values(state.stocksummary.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.stocksummary.errors).some(error => error !== null);

// Data utility selectors
export const selectHasStockSummaryData = (state) => {
    return Array.isArray(state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData) && 
           state.stocksummary.stockSummary.Data.ConsolidateStockSummaryData.length > 0;
};

export const selectHasDetailedData = (state) => {
    return Array.isArray(state.stocksummary.stockSummary?.Data?.ConsStockSummaryDetailedData) && 
           state.stocksummary.stockSummary.Data.ConsStockSummaryDetailedData.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.stocksummary.stockSummary.length > 0;
};

// Stock summary data selectors
export const selectConsolidateStockSummaryData = (state) => {
    return state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData || [];
};

export const selectConsStockSummaryDetailedData = (state) => {
    return state.stocksummary.stockSummary?.Data?.ConsStockSummaryDetailedData || [];
};

export const selectStockSummaryDate = (state) => {
    return state.stocksummary.stockSummary?.Data?.Date || null;
};

export const selectStockSummaryCCCode = (state) => {
    return state.stocksummary.stockSummary?.Data?.CCCode || null;
};

// Stock summary statistics selector based on actual data structure
export const selectStockSummaryStats = (state) => {
    const summaryData = state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData || [];
    
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
        return {
            totalCostCenters: 0,
            totalAssetAmount: 0,
            totalSemiAssetAmount: 0,
            totalSemiConsumableAmount: 0,
            totalBoughtOutAmount: 0,
            grandTotalAmount: 0,
            averageAmountPerCC: 0,
            highestValueCC: null,
            lowestValueCC: null
        };
    }

    // Calculate statistics from consolidate stock summary data
    const totalAssetAmount = summaryData.reduce((sum, item) => sum + (parseFloat(item.AssetAmount || 0)), 0);
    const totalSemiAssetAmount = summaryData.reduce((sum, item) => sum + (parseFloat(item.SemiAssetAmount || 0)), 0);
    const totalSemiConsumableAmount = summaryData.reduce((sum, item) => sum + (parseFloat(item.SemiConsumbleAmount || 0)), 0);
    const totalBoughtOutAmount = summaryData.reduce((sum, item) => sum + (parseFloat(item.BoughtOutAmount || 0)), 0);
    const grandTotalAmount = summaryData.reduce((sum, item) => sum + (parseFloat(item.TotalAmount || 0)), 0);
    
    const averageAmountPerCC = summaryData.length > 0 ? grandTotalAmount / summaryData.length : 0;
    
    // Find highest and lowest value cost centers
    const sortedByTotal = [...summaryData].sort((a, b) => parseFloat(b.TotalAmount || 0) - parseFloat(a.TotalAmount || 0));
    const highestValueCC = sortedByTotal[0] || null;
    const lowestValueCC = sortedByTotal[sortedByTotal.length - 1] || null;

    return {
        totalCostCenters: summaryData.length,
        totalAssetAmount,
        totalSemiAssetAmount,
        totalSemiConsumableAmount,
        totalBoughtOutAmount,
        grandTotalAmount,
        averageAmountPerCC,
        highestValueCC,
        lowestValueCC
    };
};

// Stock category breakdown selector
export const selectStockCategoryBreakdown = (state) => {
    const summaryData = state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData || [];
    
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
        return {
            assetCenters: [],
            semiAssetCenters: [],
            semiConsumableCenters: [],
            boughtOutCenters: [],
            mixedCenters: []
        };
    }

    const categories = {
        assetCenters: [],           // CCs with only Asset amounts
        semiAssetCenters: [],       // CCs with only Semi-Asset amounts
        semiConsumableCenters: [],  // CCs with only Semi-Consumable amounts
        boughtOutCenters: [],       // CCs with only Bought-Out amounts
        mixedCenters: []            // CCs with multiple categories
    };

    summaryData.forEach(item => {
        const hasAsset = parseFloat(item.AssetAmount || 0) > 0;
        const hasSemiAsset = parseFloat(item.SemiAssetAmount || 0) > 0;
        const hasSemiConsumable = parseFloat(item.SemiConsumbleAmount || 0) > 0;
        const hasBoughtOut = parseFloat(item.BoughtOutAmount || 0) > 0;
        
        const categoryCount = [hasAsset, hasSemiAsset, hasSemiConsumable, hasBoughtOut].filter(Boolean).length;
        
        if (categoryCount > 1) {
            categories.mixedCenters.push(item);
        } else if (hasAsset) {
            categories.assetCenters.push(item);
        } else if (hasSemiAsset) {
            categories.semiAssetCenters.push(item);
        } else if (hasSemiConsumable) {
            categories.semiConsumableCenters.push(item);
        } else if (hasBoughtOut) {
            categories.boughtOutCenters.push(item);
        }
    });

    return categories;
};

// Top cost centers by amount selector
export const selectTopCostCentersByAmount = (state, limit = 10) => {
    const summaryData = state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData || [];
    
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
        return [];
    }

    return [...summaryData]
        .sort((a, b) => parseFloat(b.TotalAmount || 0) - parseFloat(a.TotalAmount || 0))
        .slice(0, limit);
};

// Cost centers with zero amounts selector
export const selectCostCentersWithZeroAmounts = (state) => {
    const summaryData = state.stocksummary.stockSummary?.Data?.ConsolidateStockSummaryData || [];
    
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
        return [];
    }

    return summaryData.filter(item => parseFloat(item.TotalAmount || 0) === 0);
};

// Cache validation selector (useful for determining if data is fresh)
export const selectIsDataFresh = (state, maxAgeMinutes = 5) => {
    const lastFetched = state.stocksummary.lastFetched;
    if (!lastFetched) return false;
    
    const lastFetchTime = new Date(lastFetched);
    const now = new Date();
    const diffMinutes = (now - lastFetchTime) / (1000 * 60);
    
    return diffMinutes <= maxAgeMinutes;
};

// Export reducer
export default stockSummarySlice.reducer;