import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as itemCodeAPI from '../../api/Stock/ItemCodeReprotAPI';

// Async Thunks for 3 Item Code Report APIs
// =========================================

// 1. Fetch Item Category Details All
export const fetchItemCategoryDetailsAll = createAsyncThunk(
    'itemcodereport/fetchItemCategoryDetailsAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getItemCategoryDetailsAll();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Item Category Details');
        }
    }
);

// 2. Fetch Major Group Code
export const fetchMajorGroupCode = createAsyncThunk(
    'itemcodereport/fetchMajorGroupCode',
    async (params, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.getMajorGroupCode(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Major Group Code');
        }
    }
);

// 3. Fetch Item Codes Grid Detail
export const fetchItemCodesGridDetail = createAsyncThunk(
    'itemcodereport/fetchItemCodesGridDetail',
    async (params, { rejectWithValue }) => {
        try {
            const response = await itemCodeAPI.viewItemCodesGridDetail(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Item Codes Grid Detail');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    itemCategoryDetails: [],
    majorGroupCode: [],
    itemCodesGridDetail: [],

    // Loading states for each API
    loading: {
        itemCategoryDetails: false,
        majorGroupCode: false,
        itemCodesGridDetail: false,
    },

    // Error states for each API
    errors: {
        itemCategoryDetails: null,
        majorGroupCode: null,
        itemCodesGridDetail: null,
    },

    // UI State
    filters: {
        itemCategoryCode: '',
        majorGroupCode: '',
        val: '',
        txt: ''
    }
};

// Item Code Report Slice
// ======================
const itemCodeReportSlice = createSlice({
    name: 'itemcodereport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                itemCategoryCode: '',
                majorGroupCode: '',
                val: '',
                txt: ''
            };
        },
        
        // Action to reset item codes data
        resetItemCodesData: (state) => {
            state.itemCodesGridDetail = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset selected category data
        resetSelectedCategoryData: (state) => {
            state.itemCodesGridDetail = [];
            state.majorGroupCode = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Item Category Details All
        builder
            .addCase(fetchItemCategoryDetailsAll.pending, (state) => {
                state.loading.itemCategoryDetails = true;
                state.errors.itemCategoryDetails = null;
            })
            .addCase(fetchItemCategoryDetailsAll.fulfilled, (state, action) => {
                state.loading.itemCategoryDetails = false;
                state.itemCategoryDetails = action.payload;
            })
            .addCase(fetchItemCategoryDetailsAll.rejected, (state, action) => {
                state.loading.itemCategoryDetails = false;
                state.errors.itemCategoryDetails = action.payload;
            })

        // 2. Major Group Code
        builder
            .addCase(fetchMajorGroupCode.pending, (state) => {
                state.loading.majorGroupCode = true;
                state.errors.majorGroupCode = null;
            })
            .addCase(fetchMajorGroupCode.fulfilled, (state, action) => {
                state.loading.majorGroupCode = false;
                state.majorGroupCode = action.payload;
            })
            .addCase(fetchMajorGroupCode.rejected, (state, action) => {
                state.loading.majorGroupCode = false;
                state.errors.majorGroupCode = action.payload;
            })

        // 3. Item Codes Grid Detail
        builder
            .addCase(fetchItemCodesGridDetail.pending, (state) => {
                state.loading.itemCodesGridDetail = true;
                state.errors.itemCodesGridDetail = null;
            })
            .addCase(fetchItemCodesGridDetail.fulfilled, (state, action) => {
                state.loading.itemCodesGridDetail = false;
                state.itemCodesGridDetail = action.payload;
            })
            .addCase(fetchItemCodesGridDetail.rejected, (state, action) => {
                state.loading.itemCodesGridDetail = false;
                state.errors.itemCodesGridDetail = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetItemCodesData, 
    clearError, 
    resetSelectedCategoryData 
} = itemCodeReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectItemCategoryDetails = (state) => state.itemcodereport.itemCategoryDetails;
export const selectMajorGroupCode = (state) => state.itemcodereport.majorGroupCode;
export const selectItemCodesGridDetail = (state) => state.itemcodereport.itemCodesGridDetail;

// Loading selectors
export const selectLoading = (state) => state.itemcodereport.loading;
export const selectItemCategoryDetailsLoading = (state) => state.itemcodereport.loading.itemCategoryDetails;
export const selectMajorGroupCodeLoading = (state) => state.itemcodereport.loading.majorGroupCode;
export const selectItemCodesGridDetailLoading = (state) => state.itemcodereport.loading.itemCodesGridDetail;

// Error selectors
export const selectErrors = (state) => state.itemcodereport.errors;
export const selectItemCategoryDetailsError = (state) => state.itemcodereport.errors.itemCategoryDetails;
export const selectMajorGroupCodeError = (state) => state.itemcodereport.errors.majorGroupCode;
export const selectItemCodesGridDetailError = (state) => state.itemcodereport.errors.itemCodesGridDetail;

// Filter selectors
export const selectFilters = (state) => state.itemcodereport.filters;
export const selectSelectedItemCategory = (state) => state.itemcodereport.filters.itemCategoryCode;
export const selectSelectedMajorGroup = (state) => state.itemcodereport.filters.majorGroupCode;
export const selectSelectedVal = (state) => state.itemcodereport.filters.val;
export const selectSelectedTxt = (state) => state.itemcodereport.filters.txt;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.itemcodereport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.itemcodereport.errors).some(error => error !== null);

// Export reducer
export default itemCodeReportSlice.reducer;