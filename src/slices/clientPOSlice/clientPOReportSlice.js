import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as clientPOAPI from '../../api/ClientPOAPI/clientPOReportAPI';

// Async Thunks for 3 Client PO Report APIs
// ==========================================

// 1. Fetch Client PO for Report
export const fetchClientPOForReport = createAsyncThunk(
    'clientporeport/fetchClientPOForReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getClientPOForReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Client PO for Report');
        }
    }
);

// 2. Fetch Client PO by Cost Center
export const fetchClientPObyCC = createAsyncThunk(
    'clientporeport/fetchClientPObyCC',
    async (CCCode, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getClientPObyCC(CCCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Client PO by Cost Center');
        }
    }
);

// 3. Fetch All Cost Centers Client
export const fetchAllCostCentersClient = createAsyncThunk(
    'clientporeport/fetchAllCostCentersClient',
    async (_, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getAllCostCentersClient();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch All Cost Centers Client');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    clientPOForReport: [],
    clientPObyCC: [],
    allCostCentersClient: [],

    // Loading states for each API
    loading: {
        clientPOForReport: false,
        clientPObyCC: false,
        allCostCentersClient: false,
    },

    // Error states for each API
    errors: {
        clientPOForReport: null,
        clientPObyCC: null,
        allCostCentersClient: null,
    },

    // UI State
    filters: {
        CCCode: '',
        PONO: ''
    },

    // Selected states
    selectedCostCenter: null,
    selectedPO: null
};

// Client PO Report Slice
// ======================
const clientPOReportSlice = createSlice({
    name: 'clientporeport',
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
                PONO: ''
            };
        },
        
        // Action to reset client PO data
        resetClientPOData: (state) => {
            state.clientPOForReport = [];
            state.clientPObyCC = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to set selected cost center
        setSelectedCostCenter: (state, action) => {
            state.selectedCostCenter = action.payload;
        },

        // Action to set selected PO
        setSelectedPO: (state, action) => {
            state.selectedPO = action.payload;
        },

        // Action to reset selected data
        resetSelectedData: (state) => {
            state.selectedCostCenter = null;
            state.selectedPO = null;
            state.clientPOForReport = [];
            state.clientPObyCC = [];
        },

        // Action to clear all data
        clearAllData: (state) => {
            state.clientPOForReport = [];
            state.clientPObyCC = [];
            state.allCostCentersClient = [];
            state.selectedCostCenter = null;
            state.selectedPO = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Client PO for Report
        builder
            .addCase(fetchClientPOForReport.pending, (state) => {
                state.loading.clientPOForReport = true;
                state.errors.clientPOForReport = null;
            })
            .addCase(fetchClientPOForReport.fulfilled, (state, action) => {
                state.loading.clientPOForReport = false;
                state.clientPOForReport = action.payload;
            })
            .addCase(fetchClientPOForReport.rejected, (state, action) => {
                state.loading.clientPOForReport = false;
                state.errors.clientPOForReport = action.payload;
            })

        // 2. Client PO by Cost Center
        builder
            .addCase(fetchClientPObyCC.pending, (state) => {
                state.loading.clientPObyCC = true;
                state.errors.clientPObyCC = null;
            })
            .addCase(fetchClientPObyCC.fulfilled, (state, action) => {
                state.loading.clientPObyCC = false;
                state.clientPObyCC = action.payload;
            })
            .addCase(fetchClientPObyCC.rejected, (state, action) => {
                state.loading.clientPObyCC = false;
                state.errors.clientPObyCC = action.payload;
            })

        // 3. All Cost Centers Client
        builder
            .addCase(fetchAllCostCentersClient.pending, (state) => {
                state.loading.allCostCentersClient = true;
                state.errors.allCostCentersClient = null;
            })
            .addCase(fetchAllCostCentersClient.fulfilled, (state, action) => {
                state.loading.allCostCentersClient = false;
                state.allCostCentersClient = action.payload;
            })
            .addCase(fetchAllCostCentersClient.rejected, (state, action) => {
                state.loading.allCostCentersClient = false;
                state.errors.allCostCentersClient = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetClientPOData, 
    clearError, 
    setSelectedCostCenter,
    setSelectedPO,
    resetSelectedData,
    clearAllData
} = clientPOReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectClientPOForReport = (state) => state.clientporeport.clientPOForReport;
export const selectClientPObyCC = (state) => state.clientporeport.clientPObyCC;
export const selectAllCostCentersClient = (state) => state.clientporeport.allCostCentersClient;

// Loading selectors
export const selectLoading = (state) => state.clientporeport.loading;
export const selectClientPOForReportLoading = (state) => state.clientporeport.loading.clientPOForReport;
export const selectClientPObyCCLoading = (state) => state.clientporeport.loading.clientPObyCC;
export const selectAllCostCentersClientLoading = (state) => state.clientporeport.loading.allCostCentersClient;

// Error selectors
export const selectErrors = (state) => state.clientporeport.errors;
export const selectClientPOForReportError = (state) => state.clientporeport.errors.clientPOForReport;
export const selectClientPObyCCError = (state) => state.clientporeport.errors.clientPObyCC;
export const selectAllCostCentersClientError = (state) => state.clientporeport.errors.allCostCentersClient;

// Filter selectors
export const selectFilters = (state) => state.clientporeport.filters;
export const selectSelectedCCCode = (state) => state.clientporeport.filters.CCCode;
export const selectSelectedPONO = (state) => state.clientporeport.filters.PONO;

// Selected data selectors
export const selectSelectedCostCenter = (state) => state.clientporeport.selectedCostCenter;
export const selectSelectedPO = (state) => state.clientporeport.selectedPO;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.clientporeport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.clientporeport.errors).some(error => error !== null);

// Utility selectors
export const selectHasData = (state) => {
    return state.clientporeport.clientPOForReport.length > 0 || 
           state.clientporeport.clientPObyCC.length > 0 || 
           state.clientporeport.allCostCentersClient.length > 0;
};

export const selectFilteredPOData = (state) => {
    const { CCCode, PONO } = state.clientporeport.filters;
    let filteredData = state.clientporeport.clientPOForReport;
    
    if (CCCode) {
        filteredData = filteredData.filter(item => 
            item.CCCode && item.CCCode.toLowerCase().includes(CCCode.toLowerCase())
        );
    }
    
    if (PONO) {
        filteredData = filteredData.filter(item => 
            item.PONO && item.PONO.toLowerCase().includes(PONO.toLowerCase())
        );
    }
    
    return filteredData;
};


export default clientPOReportSlice.reducer;