import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lcbgAPI from '../../api/LCandBGAPI/lcBgAPI';

// Async Thunks for LCBG APIs
// ===========================

// 1. Fetch LCBG Codes
export const fetchLCBGCodes = createAsyncThunk(
    'lcbg/fetchLCBGCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await lcbgAPI.getLCBGCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch LCBG Codes');
        }
    }
);

// 2. Fetch LCBG Status Report Main Grid
export const fetchLCBGStatusReportMainGrid = createAsyncThunk(
    'lcbg/fetchLCBGStatusReportMainGrid',
    async (params, { rejectWithValue }) => {
        try {
            const response = await lcbgAPI.getLCBGStatusReportMainGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch LCBG Status Report Main Grid');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    lcbgCodes: [],
    lcbgStatusReportMainGrid: [],

    // Loading states for each API
    loading: {
        lcbgCodes: false,
        lcbgStatusReportMainGrid: false,
    },

    // Error states for each API
    errors: {
        lcbgCodes: null,
        lcbgStatusReportMainGrid: null,
    },

    // UI State / Filters
    filters: {
        // For LCBG Codes
        LCBGType: '',
        LCBGStatus: 'Active',
        
        // For Status Report Main Grid
        StartYear: '',
        EndYear: '',
        FYYear: ''
    }
};

// LCBG Slice
// ==========
const lcbgSlice = createSlice({
    name: 'lcbg',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                LCBGType: '',
                LCBGStatus: 'Active',
                StartYear: '',
                EndYear: '',
                FYYear: ''
            };
        },
        
        // Action to reset all data
        resetAllData: (state) => {
            state.lcbgCodes = [];
            state.lcbgStatusReportMainGrid = [];
            
            state.filters = {
                LCBGType: '',
                LCBGStatus: 'Active',
                StartYear: '',
                EndYear: '',
                FYYear: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset LCBG codes data
        resetLCBGCodesData: (state) => {
            state.lcbgCodes = [];
        },

        // Action to reset LCBG status report main grid data
        resetLCBGStatusReportMainGridData: (state) => {
            state.lcbgStatusReportMainGrid = [];
        },

        // Action to set LCBG type filter
        setLCBGType: (state, action) => {
            state.filters.LCBGType = action.payload;
        },

        // Action to clear LCBG type filter
        clearLCBGType: (state) => {
            state.filters.LCBGType = '';
        },

        // Action to set LCBG status filter
        setLCBGStatus: (state, action) => {
            state.filters.LCBGStatus = action.payload;
        },

        // Action to clear LCBG status filter
        clearLCBGStatus: (state) => {
            state.filters.LCBGStatus = 'Active';
        },

        // Action to set start year filter
        setStartYear: (state, action) => {
            state.filters.StartYear = action.payload;
        },

        // Action to clear start year filter
        clearStartYear: (state) => {
            state.filters.StartYear = '';
        },

        // Action to set end year filter
        setEndYear: (state, action) => {
            state.filters.EndYear = action.payload;
        },

        // Action to clear end year filter
        clearEndYear: (state) => {
            state.filters.EndYear = '';
        },

        // Action to set FY year filter
        setFYYear: (state, action) => {
            state.filters.FYYear = action.payload;
        },

        // Action to clear FY year filter
        clearFYYear: (state) => {
            state.filters.FYYear = '';
        }
    },
    extraReducers: (builder) => {
        // 1. LCBG Codes
        builder
            .addCase(fetchLCBGCodes.pending, (state) => {
                state.loading.lcbgCodes = true;
                state.errors.lcbgCodes = null;
            })
            .addCase(fetchLCBGCodes.fulfilled, (state, action) => {
                state.loading.lcbgCodes = false;
                state.lcbgCodes = action.payload;
            })
            .addCase(fetchLCBGCodes.rejected, (state, action) => {
                state.loading.lcbgCodes = false;
                state.errors.lcbgCodes = action.payload;
            })

        // 2. LCBG Status Report Main Grid
        builder
            .addCase(fetchLCBGStatusReportMainGrid.pending, (state) => {
                state.loading.lcbgStatusReportMainGrid = true;
                state.errors.lcbgStatusReportMainGrid = null;
            })
            .addCase(fetchLCBGStatusReportMainGrid.fulfilled, (state, action) => {
                state.loading.lcbgStatusReportMainGrid = false;
                state.lcbgStatusReportMainGrid = action.payload;
            })
            .addCase(fetchLCBGStatusReportMainGrid.rejected, (state, action) => {
                state.loading.lcbgStatusReportMainGrid = false;
                state.errors.lcbgStatusReportMainGrid = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetAllData,
    clearError, 
    resetLCBGCodesData,
    resetLCBGStatusReportMainGridData,
    setLCBGType,                              // ✅ Helper for LCBG type
    clearLCBGType,                            // ✅ Helper for clearing LCBG type
    setLCBGStatus,                            // ✅ Helper for LCBG status
    clearLCBGStatus,                          // ✅ Helper for clearing LCBG status
    setStartYear,                             // ✅ Helper for start year
    clearStartYear,                           // ✅ Helper for clearing start year
    setEndYear,                               // ✅ Helper for end year
    clearEndYear,                             // ✅ Helper for clearing end year
    setFYYear,                                // ✅ Helper for FY year
    clearFYYear                               // ✅ Helper for clearing FY year
} = lcbgSlice.actions;

// Selectors
// =========

// Data selectors
export const selectLCBGCodes = (state) => state.lcbg.lcbgCodes;
export const selectLCBGStatusReportMainGrid = (state) => state.lcbg.lcbgStatusReportMainGrid;

// Loading selectors
export const selectLoading = (state) => state.lcbg.loading;
export const selectLCBGCodesLoading = (state) => state.lcbg.loading.lcbgCodes;
export const selectLCBGStatusReportMainGridLoading = (state) => state.lcbg.loading.lcbgStatusReportMainGrid;

// Error selectors
export const selectErrors = (state) => state.lcbg.errors;
export const selectLCBGCodesError = (state) => state.lcbg.errors.lcbgCodes;
export const selectLCBGStatusReportMainGridError = (state) => state.lcbg.errors.lcbgStatusReportMainGrid;

// Filter selectors
export const selectFilters = (state) => state.lcbg.filters;
export const selectSelectedLCBGType = (state) => state.lcbg.filters.LCBGType;
export const selectSelectedLCBGStatus = (state) => state.lcbg.filters.LCBGStatus;
export const selectSelectedStartYear = (state) => state.lcbg.filters.StartYear;
export const selectSelectedEndYear = (state) => state.lcbg.filters.EndYear;
export const selectSelectedFYYear = (state) => state.lcbg.filters.FYYear;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.lcbg.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.lcbg.errors).some(error => error !== null);

// Utility selectors
export const selectHasLCBGCodesData = (state) => {
    return Array.isArray(state.lcbg.lcbgCodes?.Data) && 
           state.lcbg.lcbgCodes.Data.length > 0;
};

export const selectHasLCBGStatusReportMainGridData = (state) => {
    return Array.isArray(state.lcbg.lcbgStatusReportMainGrid?.Data) && 
           state.lcbg.lcbgStatusReportMainGrid.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.lcbg.lcbgCodes.length > 0 || 
           state.lcbg.lcbgStatusReportMainGrid.length > 0;
};

// LCBG summary selector based on codes data structure
export const selectLCBGSummary = (state) => {
    const codesData = state.lcbg.lcbgCodes?.Data || [];
    
    if (!Array.isArray(codesData) || codesData.length === 0) {
        return {
            totalCodes: 0,
            activeCount: 0,
            inactiveCount: 0,
            lcCount: 0,
            bgCount: 0
        };
    }

    // Calculate statistics from LCBG codes data
    const activeCount = codesData.filter(item => item.Status === 'Active' || item.LCBGStatus === 'Active').length;
    const inactiveCount = codesData.length - activeCount;
    const lcCount = codesData.filter(item => item.Type === 'LC' || item.LCBGType === 'LC').length;
    const bgCount = codesData.filter(item => item.Type === 'BG' || item.LCBGType === 'BG').length;

    return {
        totalCodes: codesData.length,
        activeCount,
        inactiveCount,
        lcCount,
        bgCount
    };
};

// Status Report summary selector
export const selectLCBGStatusReportSummary = (state) => {
    const reportData = state.lcbg.lcbgStatusReportMainGrid?.Data || [];
    
    if (!Array.isArray(reportData) || reportData.length === 0) {
        return {
            totalRecords: 0,
            totalAmount: 0,
            activeRecords: 0,
            expiredRecords: 0,
            pendingRecords: 0
        };
    }

    // Calculate statistics from report data
    const totalAmount = reportData.reduce((sum, item) => sum + (parseFloat(item.Amount || item.Value || 0)), 0);
    const activeRecords = reportData.filter(item => item.Status === 'Active').length;
    const expiredRecords = reportData.filter(item => item.Status === 'Expired').length;
    const pendingRecords = reportData.filter(item => item.Status === 'Pending').length;

    return {
        totalRecords: reportData.length,
        totalAmount,
        activeRecords,
        expiredRecords,
        pendingRecords
    };
};

// Filter validation selectors
export const selectLCBGCodesFiltersValid = (state) => {
    const { LCBGType, LCBGStatus } = state.lcbg.filters;
    return !!(LCBGType && LCBGStatus); // Both LCBGType and LCBGStatus are required
};

export const selectLCBGStatusReportMainGridFiltersValid = (state) => {
    const { StartYear, EndYear, FYYear, LCBGStatus } = state.lcbg.filters;
    return !!(StartYear && EndYear && FYYear && LCBGStatus); // All four parameters are required
};

// LCBG codes params selector
export const selectLCBGCodesParams = (state) => ({
    LCBGType: state.lcbg.filters.LCBGType,
    LCBGStatus: state.lcbg.filters.LCBGStatus
});

// LCBG status report main grid params selector
export const selectLCBGStatusReportMainGridParams = (state) => ({
    StartYear: state.lcbg.filters.StartYear,
    EndYear: state.lcbg.filters.EndYear,
    FYYear: state.lcbg.filters.FYYear,
    LCBGStatus: state.lcbg.filters.LCBGStatus
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.lcbg.filters;

// Export reducer
export default lcbgSlice.reducer;