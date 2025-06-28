import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as scrapWalletReportAPI from '../../api/Stock/scrapWalletReportAPI';

// Async Thunks for Scrap Wallet Report APIs
// ==========================================

// 1. Fetch Scrap Wallet Balance Items Report Data
export const fetchScrapWalletBalanceItemsReportData = createAsyncThunk(
    'scrapwalletreport/fetchScrapWalletBalanceItemsReportData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await scrapWalletReportAPI.getScrapWalletBalanceItemsReportData(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Scrap Wallet Balance Items Report Data');
        }
    }
);

// 2. Fetch SWR Cost Center Codes
export const fetchSWRCostCenterCodes = createAsyncThunk(
    'scrapwalletreport/fetchSWRCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await scrapWalletReportAPI.getSWRCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SWR Cost Center Codes');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    scrapWalletBalanceItemsReportData: [],
    swrCostCenterCodes: [],

    // Loading states for each API
    loading: {
        scrapWalletBalanceItemsReportData: false,
        swrCostCenterCodes: false,
    },

    // Error states for each API
    errors: {
        scrapWalletBalanceItemsReportData: null,
        swrCostCenterCodes: null,
    },

    // UI State / Filters
    filters: {
        CCCode: '',
        UID: '',
        Roleid: '',
        RID: ''
    }
};

// Scrap Wallet Report Slice
// ==========================
const scrapWalletReportSlice = createSlice({
    name: 'scrapwalletreport',
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
                UID: '',
                Roleid: '',
                RID: ''
            };
        },
        
        // Action to reset ONLY report data (preserve dropdowns) - for normal operations
        resetReportData: (state) => {
            state.scrapWalletBalanceItemsReportData = [];
            // ✅ DON'T clear swrCostCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.scrapWalletBalanceItemsReportData = [];
            
            state.filters = {
                CCCode: '',
                UID: '',
                Roleid: '',
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

        // Action to reset scrap wallet balance items report data
        resetScrapWalletBalanceItemsReportData: (state) => {
            state.scrapWalletBalanceItemsReportData = [];
        },

        // Action to reset SWR cost center codes data
        resetSWRCostCenterCodesData: (state) => {
            state.swrCostCenterCodes = [];
        },

        // Action to reset all scrap wallet report data
        resetAllScrapWalletReportData: (state) => {
            state.scrapWalletBalanceItemsReportData = [];
            state.swrCostCenterCodes = [];
        },

        // Action to set cost center filter
        setCostCenter: (state, action) => {
            state.filters.CCCode = action.payload;
        },

        // Action to clear cost center filter
        clearCostCenter: (state) => {
            state.filters.CCCode = '';
        },

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UID, Roleid, RID } = action.payload;
            state.filters.UID = UID || state.filters.UID;
            state.filters.Roleid = Roleid || state.filters.Roleid;
            state.filters.RID = RID || state.filters.RID;
        }
    },
    extraReducers: (builder) => {
        // 1. Scrap Wallet Balance Items Report Data
        builder
            .addCase(fetchScrapWalletBalanceItemsReportData.pending, (state) => {
                state.loading.scrapWalletBalanceItemsReportData = true;
                state.errors.scrapWalletBalanceItemsReportData = null;
            })
            .addCase(fetchScrapWalletBalanceItemsReportData.fulfilled, (state, action) => {
                state.loading.scrapWalletBalanceItemsReportData = false;
                state.scrapWalletBalanceItemsReportData = action.payload;
            })
            .addCase(fetchScrapWalletBalanceItemsReportData.rejected, (state, action) => {
                state.loading.scrapWalletBalanceItemsReportData = false;
                state.errors.scrapWalletBalanceItemsReportData = action.payload;
            })

        // 2. SWR Cost Center Codes
        builder
            .addCase(fetchSWRCostCenterCodes.pending, (state) => {
                state.loading.swrCostCenterCodes = true;
                state.errors.swrCostCenterCodes = null;
            })
            .addCase(fetchSWRCostCenterCodes.fulfilled, (state, action) => {
                state.loading.swrCostCenterCodes = false;
                state.swrCostCenterCodes = action.payload;
            })
            .addCase(fetchSWRCostCenterCodes.rejected, (state, action) => {
                state.loading.swrCostCenterCodes = false;
                state.errors.swrCostCenterCodes = action.payload;
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
    resetScrapWalletBalanceItemsReportData,
    resetSWRCostCenterCodesData,
    resetAllScrapWalletReportData,
    setCostCenter,                             // ✅ Helper for cost center
    clearCostCenter,                           // ✅ Helper for clearing cost center
    setUserCredentials                         // ✅ Helper for setting user credentials
} = scrapWalletReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectScrapWalletBalanceItemsReportData = (state) => state.scrapwalletreport.scrapWalletBalanceItemsReportData;
export const selectSWRCostCenterCodes = (state) => state.scrapwalletreport.swrCostCenterCodes;

// Loading selectors
export const selectLoading = (state) => state.scrapwalletreport.loading;
export const selectScrapWalletBalanceItemsReportDataLoading = (state) => state.scrapwalletreport.loading.scrapWalletBalanceItemsReportData;
export const selectSWRCostCenterCodesLoading = (state) => state.scrapwalletreport.loading.swrCostCenterCodes;

// Error selectors
export const selectErrors = (state) => state.scrapwalletreport.errors;
export const selectScrapWalletBalanceItemsReportDataError = (state) => state.scrapwalletreport.errors.scrapWalletBalanceItemsReportData;
export const selectSWRCostCenterCodesError = (state) => state.scrapwalletreport.errors.swrCostCenterCodes;

// Filter selectors
export const selectFilters = (state) => state.scrapwalletreport.filters;
export const selectSelectedCCCode = (state) => state.scrapwalletreport.filters.CCCode;
export const selectSelectedUID = (state) => state.scrapwalletreport.filters.UID;
export const selectSelectedRoleid = (state) => state.scrapwalletreport.filters.Roleid;
export const selectSelectedRID = (state) => state.scrapwalletreport.filters.RID;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.scrapwalletreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.scrapwalletreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasReportData = (state) => {
    return Array.isArray(state.scrapwalletreport.scrapWalletBalanceItemsReportData?.Data) && 
           state.scrapwalletreport.scrapWalletBalanceItemsReportData.Data.length > 0;
};

export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.scrapwalletreport.swrCostCenterCodes?.Data) && 
           state.scrapwalletreport.swrCostCenterCodes.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.scrapwalletreport.scrapWalletBalanceItemsReportData.length > 0 || 
           state.scrapwalletreport.swrCostCenterCodes.length > 0;
};

// Scrap wallet summary selector
export const selectScrapWalletSummary = (state) => {
    const reportData = state.scrapwalletreport.scrapWalletBalanceItemsReportData?.Data || [];
    
    if (!Array.isArray(reportData) || reportData.length === 0) {
        return {
            totalItems: 0,
            totalQuantity: 0,
            totalValue: 0,
            totalWeight: 0
        };
    }

    return reportData.reduce((summary, item) => {
        const quantity = parseFloat(item.Quantity || item.Qty || item.BalanceQty || 0);
        const value = parseFloat(item.Value || item.Amount || item.TotalValue || 0);
        const weight = parseFloat(item.Weight || item.TotalWeight || 0);
        
        summary.totalItems += 1;
        summary.totalQuantity += quantity;
        summary.totalValue += value;
        summary.totalWeight += weight;
        
        return summary;
    }, {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalWeight: 0
    });
};

// Filter validation selector
export const selectFiltersValid = (state) => {
    const { UID, Roleid, RID } = state.scrapwalletreport.filters;
    return !!(UID && Roleid && RID); // UID, Roleid, and RID are required
};

// Cost center validation selector
export const selectCostCenterSelected = (state) => {
    return !!state.scrapwalletreport.filters.CCCode;
};

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.scrapwalletreport.filters.UID,
    Roleid: state.scrapwalletreport.filters.Roleid,
    RID: state.scrapwalletreport.filters.RID
});

// Export reducer
export default scrapWalletReportSlice.reducer;