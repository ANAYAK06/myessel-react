import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as viewIndentsReportAPI from '../../api/Stock/indentReportAPI';

// Async Thunks for View Indents Report APIs
// ==========================================

// 1. Fetch Cost Center Codes
export const fetchCostCenterCodes = createAsyncThunk(
    'viewindentsreport/fetchCostCenterCodes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewIndentsReportAPI.getCostCenterCodes(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Center Codes');
        }
    }
);

// 2. Fetch Indent Grid Data
export const fetchIndentGridData = createAsyncThunk(
    'viewindentsreport/fetchIndentGridData',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewIndentsReportAPI.viewIndentGrid(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Indent Grid Data');
        }
    }
);

// 3. Fetch Indent Items Details
export const fetchIndentItemsDetails = createAsyncThunk(
    'viewindentsreport/fetchIndentItemsDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewIndentsReportAPI.viewIndentItemsDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Indent Items Details');
        }
    }
);

// 4. Fetch Indent Items Transfer Details
export const fetchIndentItemsTransferDetails = createAsyncThunk(
    'viewindentsreport/fetchIndentItemsTransferDetails',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewIndentsReportAPI.viewIndentItemsTransferDetails(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Indent Items Transfer Details');
        }
    }
);

// 5. Fetch Indent Remarks
export const fetchIndentRemarks = createAsyncThunk(
    'viewindentsreport/fetchIndentRemarks',
    async (params, { rejectWithValue }) => {
        try {
            const response = await viewIndentsReportAPI.viewIndentRemarks(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Indent Remarks');
        }
    }
);

// 6. Combined Thunk for Indent Details (calls all 3 detail APIs together)
export const fetchIndentCompleteDetails = createAsyncThunk(
    'viewindentsreport/fetchIndentCompleteDetails',
    async (params, { dispatch, rejectWithValue }) => {
        try {
            const { Indno } = params;
            
            if (!Indno) {
                throw new Error('Indno is required for fetching complete details');
            }

            // Call all three APIs in parallel
            const [itemsDetailsResponse, transferDetailsResponse, remarksResponse] = await Promise.allSettled([
                dispatch(fetchIndentItemsDetails({ Indno })).unwrap(),
                dispatch(fetchIndentItemsTransferDetails({ Indno })).unwrap(),
                dispatch(fetchIndentRemarks({ Indno })).unwrap()
            ]);

            // Process results
            const result = {
                Indno,
                itemsDetails: itemsDetailsResponse.status === 'fulfilled' ? itemsDetailsResponse.value : null,
                transferDetails: transferDetailsResponse.status === 'fulfilled' ? transferDetailsResponse.value : null,
                remarks: remarksResponse.status === 'fulfilled' ? remarksResponse.value : null,
                errors: {
                    itemsDetails: itemsDetailsResponse.status === 'rejected' ? itemsDetailsResponse.reason : null,
                    transferDetails: transferDetailsResponse.status === 'rejected' ? transferDetailsResponse.reason : null,
                    remarks: remarksResponse.status === 'rejected' ? remarksResponse.reason : null
                }
            };

            return result;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch complete indent details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    costCenterCodes: [],
    indentGridData: [],
    indentItemsDetails: [],
    indentTransferDetails: [],
    indentRemarks: [],

    // Combined details for modal
    combinedIndentDetails: null,

    // Loading states for each API
    loading: {
        costCenterCodes: false,
        indentGridData: false,
        indentItemsDetails: false,
        indentTransferDetails: false,
        indentRemarks: false,
        combinedDetails: false,
    },

    // Error states for each API
    errors: {
        costCenterCodes: null,
        indentGridData: null,
        indentItemsDetails: null,
        indentTransferDetails: null,
        indentRemarks: null,
        combinedDetails: null,
    },

    // UI State / Filters
    filters: {
        // For Cost Center Codes
        UID: '',
        RID: '',
        
        // For Indent Grid
        CCode: '',
        Fdate: '',
        TDate: '',
        
        // For Details
        Indno: ''
    }
};

// View Indents Report Slice
// ==========================
const viewIndentsReportSlice = createSlice({
    name: 'viewindentsreport',
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
                CCode: '',
                Fdate: '',
                TDate: '',
                Indno: ''
            };
        },
        
        // Action to reset ONLY grid data (preserve dropdowns) - for normal operations
        resetGridData: (state) => {
            state.indentGridData = [];
            state.indentItemsDetails = [];
            state.indentTransferDetails = [];
            state.indentRemarks = [];
            state.combinedIndentDetails = null;
            // ✅ DON'T clear costCenterCodes - preserve dropdowns!
        },

        // Action to reset EVERYTHING including dropdowns - for Reset button only
        resetAllData: (state) => {
            state.costCenterCodes = [];
            state.indentGridData = [];
            state.indentItemsDetails = [];
            state.indentTransferDetails = [];
            state.indentRemarks = [];
            state.combinedIndentDetails = null;
            
            state.filters = {
                UID: '',
                RID: '',
                CCode: '',
                Fdate: '',
                TDate: '',
                Indno: ''
            };
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset cost center codes data
        resetCostCenterCodesData: (state) => {
            state.costCenterCodes = [];
        },

        // Action to reset indent grid data
        resetIndentGridData: (state) => {
            state.indentGridData = [];
        },

        // Action to reset indent items details data
        resetIndentItemsDetailsData: (state) => {
            state.indentItemsDetails = [];
        },

        // Action to reset indent transfer details data
        resetIndentTransferDetailsData: (state) => {
            state.indentTransferDetails = [];
        },

        // Action to reset indent remarks data
        resetIndentRemarksData: (state) => {
            state.indentRemarks = [];
        },

        // Action to reset combined details
        resetCombinedDetails: (state) => {
            state.combinedIndentDetails = null;
        },

        // Action to reset all indent data
        resetAllIndentData: (state) => {
            state.costCenterCodes = [];
            state.indentGridData = [];
            state.indentItemsDetails = [];
            state.indentTransferDetails = [];
            state.indentRemarks = [];
            state.combinedIndentDetails = null;
        },

        // Action to set cost center filter
        setCostCenter: (state, action) => {
            state.filters.CCode = action.payload;
        },

        // Action to clear cost center filter
        clearCostCenter: (state) => {
            state.filters.CCode = '';
        },

        // Action to set date range filters
        setDateRange: (state, action) => {
            const { Fdate, TDate } = action.payload;
            state.filters.Fdate = Fdate || state.filters.Fdate;
            state.filters.TDate = TDate || state.filters.TDate;
        },

        // Action to clear date range filters
        clearDateRange: (state) => {
            state.filters.Fdate = '';
            state.filters.TDate = '';
        },

        // Action to set indent number filter
        setIndno: (state, action) => {
            state.filters.Indno = action.payload;
        },

        // Action to clear indent number filter
        clearIndno: (state) => {
            state.filters.Indno = '';
        },

        // Action to set user credentials
        setUserCredentials: (state, action) => {
            const { UID, RID } = action.payload;
            state.filters.UID = UID || state.filters.UID;
            state.filters.RID = RID || state.filters.RID;
        },

        // Action to clear user credentials
        clearUserCredentials: (state) => {
            state.filters.UID = '';
            state.filters.RID = '';
        }
    },
    extraReducers: (builder) => {
        // 1. Cost Center Codes
        builder
            .addCase(fetchCostCenterCodes.pending, (state) => {
                state.loading.costCenterCodes = true;
                state.errors.costCenterCodes = null;
            })
            .addCase(fetchCostCenterCodes.fulfilled, (state, action) => {
                state.loading.costCenterCodes = false;
                state.costCenterCodes = action.payload;
            })
            .addCase(fetchCostCenterCodes.rejected, (state, action) => {
                state.loading.costCenterCodes = false;
                state.errors.costCenterCodes = action.payload;
            })

        // 2. Indent Grid Data
        builder
            .addCase(fetchIndentGridData.pending, (state) => {
                state.loading.indentGridData = true;
                state.errors.indentGridData = null;
            })
            .addCase(fetchIndentGridData.fulfilled, (state, action) => {
                state.loading.indentGridData = false;
                state.indentGridData = action.payload;
            })
            .addCase(fetchIndentGridData.rejected, (state, action) => {
                state.loading.indentGridData = false;
                state.errors.indentGridData = action.payload;
            })

        // 3. Indent Items Details
        builder
            .addCase(fetchIndentItemsDetails.pending, (state) => {
                state.loading.indentItemsDetails = true;
                state.errors.indentItemsDetails = null;
            })
            .addCase(fetchIndentItemsDetails.fulfilled, (state, action) => {
                state.loading.indentItemsDetails = false;
                state.indentItemsDetails = action.payload;
            })
            .addCase(fetchIndentItemsDetails.rejected, (state, action) => {
                state.loading.indentItemsDetails = false;
                state.errors.indentItemsDetails = action.payload;
            })

        // 4. Indent Items Transfer Details
        builder
            .addCase(fetchIndentItemsTransferDetails.pending, (state) => {
                state.loading.indentTransferDetails = true;
                state.errors.indentTransferDetails = null;
            })
            .addCase(fetchIndentItemsTransferDetails.fulfilled, (state, action) => {
                state.loading.indentTransferDetails = false;
                state.indentTransferDetails = action.payload;
            })
            .addCase(fetchIndentItemsTransferDetails.rejected, (state, action) => {
                state.loading.indentTransferDetails = false;
                state.errors.indentTransferDetails = action.payload;
            })

        // 5. Indent Remarks
        builder
            .addCase(fetchIndentRemarks.pending, (state) => {
                state.loading.indentRemarks = true;
                state.errors.indentRemarks = null;
            })
            .addCase(fetchIndentRemarks.fulfilled, (state, action) => {
                state.loading.indentRemarks = false;
                state.indentRemarks = action.payload;
            })
            .addCase(fetchIndentRemarks.rejected, (state, action) => {
                state.loading.indentRemarks = false;
                state.errors.indentRemarks = action.payload;
            })

        // 6. Combined Indent Details
        builder
            .addCase(fetchIndentCompleteDetails.pending, (state) => {
                state.loading.combinedDetails = true;
                state.errors.combinedDetails = null;
            })
            .addCase(fetchIndentCompleteDetails.fulfilled, (state, action) => {
                state.loading.combinedDetails = false;
                state.combinedIndentDetails = action.payload;
            })
            .addCase(fetchIndentCompleteDetails.rejected, (state, action) => {
                state.loading.combinedDetails = false;
                state.errors.combinedDetails = action.payload;
            });
    },
});

// Export actions
export const { 
    setFilters, 
    clearFilters, 
    resetGridData,                            // ✅ Only resets grid data (preserves dropdowns)
    resetAllData,                             // ✅ Resets everything (for Reset button only)
    clearError, 
    resetCostCenterCodesData,
    resetIndentGridData,
    resetIndentItemsDetailsData,
    resetIndentTransferDetailsData,
    resetIndentRemarksData,
    resetCombinedDetails,
    resetAllIndentData,
    setCostCenter,                            // ✅ Helper for cost center
    clearCostCenter,                          // ✅ Helper for clearing cost center
    setDateRange,                             // ✅ Helper for date range
    clearDateRange,                           // ✅ Helper for clearing date range
    setIndno,                                 // ✅ Helper for indent number
    clearIndno,                               // ✅ Helper for clearing indent number
    setUserCredentials,                       // ✅ Helper for setting user credentials
    clearUserCredentials                      // ✅ Helper for clearing user credentials
} = viewIndentsReportSlice.actions;

// Selectors
// =========

// Data selectors
export const selectCostCenterCodes = (state) => state.viewindentsreport.costCenterCodes;
export const selectIndentGridData = (state) => state.viewindentsreport.indentGridData;
export const selectIndentItemsDetails = (state) => state.viewindentsreport.indentItemsDetails;
export const selectIndentTransferDetails = (state) => state.viewindentsreport.indentTransferDetails;
export const selectIndentRemarks = (state) => state.viewindentsreport.indentRemarks;
export const selectCombinedIndentDetails = (state) => state.viewindentsreport.combinedIndentDetails;

// Loading selectors
export const selectLoading = (state) => state.viewindentsreport.loading;
export const selectCostCenterCodesLoading = (state) => state.viewindentsreport.loading.costCenterCodes;
export const selectIndentGridDataLoading = (state) => state.viewindentsreport.loading.indentGridData;
export const selectIndentItemsDetailsLoading = (state) => state.viewindentsreport.loading.indentItemsDetails;
export const selectIndentTransferDetailsLoading = (state) => state.viewindentsreport.loading.indentTransferDetails;
export const selectIndentRemarksLoading = (state) => state.viewindentsreport.loading.indentRemarks;
export const selectCombinedDetailsLoading = (state) => state.viewindentsreport.loading.combinedDetails;

// Error selectors
export const selectErrors = (state) => state.viewindentsreport.errors;
export const selectCostCenterCodesError = (state) => state.viewindentsreport.errors.costCenterCodes;
export const selectIndentGridDataError = (state) => state.viewindentsreport.errors.indentGridData;
export const selectIndentItemsDetailsError = (state) => state.viewindentsreport.errors.indentItemsDetails;
export const selectIndentTransferDetailsError = (state) => state.viewindentsreport.errors.indentTransferDetails;
export const selectIndentRemarksError = (state) => state.viewindentsreport.errors.indentRemarks;
export const selectCombinedDetailsError = (state) => state.viewindentsreport.errors.combinedDetails;

// Filter selectors
export const selectFilters = (state) => state.viewindentsreport.filters;
export const selectSelectedUID = (state) => state.viewindentsreport.filters.UID;
export const selectSelectedRID = (state) => state.viewindentsreport.filters.RID;
export const selectSelectedCCode = (state) => state.viewindentsreport.filters.CCode;
export const selectSelectedFdate = (state) => state.viewindentsreport.filters.Fdate;
export const selectSelectedTDate = (state) => state.viewindentsreport.filters.TDate;
export const selectSelectedIndno = (state) => state.viewindentsreport.filters.Indno;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.viewindentsreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.viewindentsreport.errors).some(error => error !== null);

// Utility selectors
export const selectHasCostCenterCodesData = (state) => {
    return Array.isArray(state.viewindentsreport.costCenterCodes?.Data) && 
           state.viewindentsreport.costCenterCodes.Data.length > 0;
};

export const selectHasIndentGridData = (state) => {
    return Array.isArray(state.viewindentsreport.indentGridData?.Data) && 
           state.viewindentsreport.indentGridData.Data.length > 0;
};

export const selectHasIndentItemsDetailsData = (state) => {
    return Array.isArray(state.viewindentsreport.indentItemsDetails?.Data) && 
           state.viewindentsreport.indentItemsDetails.Data.length > 0;
};

export const selectHasIndentTransferDetailsData = (state) => {
    return Array.isArray(state.viewindentsreport.indentTransferDetails?.Data) && 
           state.viewindentsreport.indentTransferDetails.Data.length > 0;
};

export const selectHasIndentRemarksData = (state) => {
    return Array.isArray(state.viewindentsreport.indentRemarks?.Data) && 
           state.viewindentsreport.indentRemarks.Data.length > 0;
};

export const selectHasAnyData = (state) => {
    return state.viewindentsreport.costCenterCodes.length > 0 || 
           state.viewindentsreport.indentGridData.length > 0 || 
           state.viewindentsreport.indentItemsDetails.length > 0 ||
           state.viewindentsreport.indentTransferDetails.length > 0 ||
           state.viewindentsreport.indentRemarks.length > 0;
};

// Indent summary selector based on main grid data structure
export const selectIndentSummary = (state) => {
    const gridData = state.viewindentsreport.indentGridData?.Data || [];
    
    if (!Array.isArray(gridData) || gridData.length === 0) {
        return {
            totalIndents: 0,
            totalAmount: 0,
            uniqueCostCenters: 0,
            averageAmount: 0
        };
    }

    const totalAmount = gridData.reduce((sum, indent) => sum + (parseFloat(indent.Amount) || 0), 0);
    const uniqueCostCenters = new Set(gridData.map(indent => indent.Costcenter).filter(cc => cc)).size;
    const averageAmount = gridData.length > 0 ? totalAmount / gridData.length : 0;

    return {
        totalIndents: gridData.length,
        totalAmount,
        uniqueCostCenters,
        averageAmount
    };
};

// Processed remarks selector (extracts only remarks text)
export const selectProcessedRemarks = (state) => {
    const remarks = state.viewindentsreport.indentRemarks?.Data || [];
    
    if (!Array.isArray(remarks) || remarks.length === 0) {
        return [];
    }

    return remarks
        .map(item => item.Remarks)
        .filter(remark => remark && remark.trim() !== '')
        .map((remark, index) => ({
            id: index + 1,
            text: remark.trim()
        }));
};

// Processed transfer details selector (extracts only required fields)
export const selectProcessedTransferDetails = (state) => {
    const transferDetails = state.viewindentsreport.indentTransferDetails?.Data || [];
    
    if (!Array.isArray(transferDetails) || transferDetails.length === 0) {
        return [];
    }

    return transferDetails
        .filter(item => item.ItemCode) // Only items with ItemCode
        .map((item, index) => ({
            id: index + 1,
            itemCode: item.ItemCode,
            transferredQty: item.TransferredQty || 0,
            fromCC: item.FromCC,
            refno: item.Refno,
            itemStatus: item.ItemStatus
        }));
};

// Filter validation selectors
export const selectCostCenterFiltersValid = (state) => {
    const { UID, RID } = state.viewindentsreport.filters;
    return !!(UID && RID); // UID and RID are required for cost center codes
};

export const selectIndentGridFiltersValid = (state) => {
    const { CCode, Fdate, TDate } = state.viewindentsreport.filters;
    return !!(CCode && Fdate && TDate); // All are required for indent grid
};

export const selectIndentDetailsFiltersValid = (state) => {
    const { Indno } = state.viewindentsreport.filters;
    return !!Indno; // Indno is required for details
};

// Date range selector
export const selectDateRange = (state) => ({
    Fdate: state.viewindentsreport.filters.Fdate,
    TDate: state.viewindentsreport.filters.TDate
});

// User credentials selector
export const selectUserCredentials = (state) => ({
    UID: state.viewindentsreport.filters.UID,
    RID: state.viewindentsreport.filters.RID
});

// Cost center and date range combined selector
export const selectIndentGridParams = (state) => ({
    CCode: state.viewindentsreport.filters.CCode,
    Fdate: state.viewindentsreport.filters.Fdate,
    TDate: state.viewindentsreport.filters.TDate
});

// Indent details params selector
export const selectIndentDetailsParams = (state) => ({
    Indno: state.viewindentsreport.filters.Indno
});

// All filters selector for easy form binding
export const selectAllFilters = (state) => state.viewindentsreport.filters;

// Export reducer
export default viewIndentsReportSlice.reducer;