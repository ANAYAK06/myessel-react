import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dividendAPI from '../../api/CapitalAPI/dividendDeclarationApis';

// Async Thunks for Dividend Declaration APIs
// ===========================================

// 1. Insert Dividend Declaration
export const insertDividendDeclaration = createAsyncThunk(
    'dividendDeclaration/insertDividendDeclaration',
    async (declarationData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Inserting Dividend Declaration with data:', declarationData);
            const response = await dividendAPI.insertDividendDeclaration(declarationData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to insert Dividend Declaration');
        }
    }
);

// 2. Approve/Verify/Reject Dividend Declaration
export const approveDividendDeclaration = createAsyncThunk(
    'dividendDeclaration/approveDividendDeclaration',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Processing Dividend Declaration approval with data:', approvalData);
            const response = await dividendAPI.approveDividendDeclaration(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Dividend Declaration approval');
        }
    }
);

// 3. Fetch Verify Dividend Declaration Inbox by Role ID
export const fetchVerifyDividendDeclaration = createAsyncThunk(
    'dividendDeclaration/fetchVerifyDividendDeclaration',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Dividend Declaration Inbox for RoleID:', roleId);
            const response = await dividendAPI.getVerifyDividendDeclaration({ roleId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Declaration Verification Inbox');
        }
    }
);

// 4. Fetch Dividend Declaration Details by Reference Number
export const fetchDividendDeclarationByRefno = createAsyncThunk(
    'dividendDeclaration/fetchDividendDeclarationByRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Dividend Declaration Details for RefNo:', transactionRefno);
            const response = await dividendAPI.getDividendDeclarationByRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Declaration Details');
        }
    }
);

// 5. Fetch Dividend Declaration List with Filters
export const fetchDividendDeclarationList = createAsyncThunk(
    'dividendDeclaration/fetchDividendDeclarationList',
    async (filters = {}, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Dividend Declaration List with filters:', filters);
            const response = await dividendAPI.getDividendDeclarationList(filters);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Declaration List');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyDividendDeclarationInbox: [],
    dividendDeclarationDetails: null,
    dividendDeclarationList: [],
    insertResult: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        insertDividendDeclaration: false,
        approveDividendDeclaration: false,
        verifyDividendDeclaration: false,
        dividendDeclarationDetails: false,
        dividendDeclarationList: false,
    },

    // Error states for each API
    errors: {
        insertDividendDeclaration: null,
        approveDividendDeclaration: null,
        verifyDividendDeclaration: null,
        dividendDeclarationDetails: null,
        dividendDeclarationList: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
    currentFilters: {},
};

// Dividend Declaration Slice
// ===========================
const dividendDeclarationSlice = createSlice({
    name: 'dividendDeclaration',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected transaction reference number
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },

        // Action to set current filters
        setCurrentFilters: (state, action) => {
            state.currentFilters = action.payload;
        },
        
        // Action to reset dividend declaration details
        resetDividendDeclarationDetails: (state) => {
            state.dividendDeclarationDetails = null;
            state.approvalResult = null;
        },

        // Action to clear insert result
        clearInsertResult: (state) => {
            state.insertResult = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all dividend declaration data
        resetDividendDeclarationData: (state) => {
            state.verifyDividendDeclarationInbox = [];
            state.dividendDeclarationDetails = null;
            state.dividendDeclarationList = [];
            state.insertResult = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus = null;
            state.currentFilters = {};
        },
    },
    extraReducers: (builder) => {
        // 1. Insert Dividend Declaration - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(insertDividendDeclaration.pending, (state) => {
                state.loading.insertDividendDeclaration = true;
                state.errors.insertDividendDeclaration = null;
            })
            .addCase(insertDividendDeclaration.fulfilled, (state, action) => {
                state.loading.insertDividendDeclaration = false;
                // 🔧 FIXED: Extract Data from API response
                // API returns: { Data: "...", IsSuccessful: true, ResponseCode: 200 }
                state.insertResult = action.payload?.Data || action.payload;
            })
            .addCase(insertDividendDeclaration.rejected, (state, action) => {
                state.loading.insertDividendDeclaration = false;
                state.errors.insertDividendDeclaration = action.payload;
                state.insertResult = null;
            })

        // 2. Approve Dividend Declaration - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(approveDividendDeclaration.pending, (state) => {
                state.loading.approveDividendDeclaration = true;
                state.errors.approveDividendDeclaration = null;
            })
            .addCase(approveDividendDeclaration.fulfilled, (state, action) => {
                state.loading.approveDividendDeclaration = false;
                // 🔧 FIXED: Extract Data from API response
                state.approvalResult = action.payload?.Data || action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveDividendDeclaration.rejected, (state, action) => {
                state.loading.approveDividendDeclaration = false;
                state.errors.approveDividendDeclaration = action.payload;
            })

        // 3. Verify Dividend Declaration Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyDividendDeclaration.pending, (state) => {
                state.loading.verifyDividendDeclaration = true;
                state.errors.verifyDividendDeclaration = null;
            })
            .addCase(fetchVerifyDividendDeclaration.fulfilled, (state, action) => {
                state.loading.verifyDividendDeclaration = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.verifyDividendDeclarationInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyDividendDeclaration.rejected, (state, action) => {
                state.loading.verifyDividendDeclaration = false;
                state.errors.verifyDividendDeclaration = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyDividendDeclarationInbox = [];
            })

        // 4. Dividend Declaration Details by RefNo - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchDividendDeclarationByRefno.pending, (state) => {
                state.loading.dividendDeclarationDetails = true;
                state.errors.dividendDeclarationDetails = null;
            })
            .addCase(fetchDividendDeclarationByRefno.fulfilled, (state, action) => {
                state.loading.dividendDeclarationDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: true, ResponseCode: 200 }
                state.dividendDeclarationDetails = action.payload?.Data || null;
            })
            .addCase(fetchDividendDeclarationByRefno.rejected, (state, action) => {
                state.loading.dividendDeclarationDetails = false;
                state.errors.dividendDeclarationDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.dividendDeclarationDetails = null;
            })

        // 5. Dividend Declaration List - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchDividendDeclarationList.pending, (state) => {
                state.loading.dividendDeclarationList = true;
                state.errors.dividendDeclarationList = null;
            })
            .addCase(fetchDividendDeclarationList.fulfilled, (state, action) => {
                state.loading.dividendDeclarationList = false;
                // 🔧 FIXED: Extract Data array from API response
                state.dividendDeclarationList = action.payload?.Data || [];
            })
            .addCase(fetchDividendDeclarationList.rejected, (state, action) => {
                state.loading.dividendDeclarationList = false;
                state.errors.dividendDeclarationList = action.payload;
                // 🔧 FIXED: Reset to empty array on error
                state.dividendDeclarationList = [];
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    setCurrentFilters,
    resetDividendDeclarationDetails,
    clearInsertResult,
    clearApprovalResult,
    clearError,
    resetDividendDeclarationData,
} = dividendDeclarationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyDividendDeclarationInbox = (state) => 
    state.dividendDeclaration.verifyDividendDeclarationInbox;
export const selectDividendDeclarationDetails = (state) => 
    state.dividendDeclaration.dividendDeclarationDetails;
export const selectDividendDeclarationList = (state) => 
    state.dividendDeclaration.dividendDeclarationList;
export const selectInsertResult = (state) => 
    state.dividendDeclaration.insertResult;
export const selectApprovalResult = (state) => 
    state.dividendDeclaration.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyDividendDeclarationInboxArray = (state) => {
    const inbox = state.dividendDeclaration.verifyDividendDeclarationInbox;
    return Array.isArray(inbox) ? inbox : [];
};

export const selectDividendDeclarationListArray = (state) => {
    const list = state.dividendDeclaration.dividendDeclarationList;
    return Array.isArray(list) ? list : [];
};

// Loading selectors
export const selectLoading = (state) => state.dividendDeclaration.loading;
export const selectInsertDividendDeclarationLoading = (state) => 
    state.dividendDeclaration.loading.insertDividendDeclaration;
export const selectApproveDividendDeclarationLoading = (state) => 
    state.dividendDeclaration.loading.approveDividendDeclaration;
export const selectVerifyDividendDeclarationLoading = (state) => 
    state.dividendDeclaration.loading.verifyDividendDeclaration;
export const selectDividendDeclarationDetailsLoading = (state) => 
    state.dividendDeclaration.loading.dividendDeclarationDetails;
export const selectDividendDeclarationListLoading = (state) => 
    state.dividendDeclaration.loading.dividendDeclarationList;

// Error selectors
export const selectErrors = (state) => state.dividendDeclaration.errors;
export const selectInsertDividendDeclarationError = (state) => 
    state.dividendDeclaration.errors.insertDividendDeclaration;
export const selectApproveDividendDeclarationError = (state) => 
    state.dividendDeclaration.errors.approveDividendDeclaration;
export const selectVerifyDividendDeclarationError = (state) => 
    state.dividendDeclaration.errors.verifyDividendDeclaration;
export const selectDividendDeclarationDetailsError = (state) => 
    state.dividendDeclaration.errors.dividendDeclarationDetails;
export const selectDividendDeclarationListError = (state) => 
    state.dividendDeclaration.errors.dividendDeclarationList;

// UI State selectors
export const selectSelectedRoleId = (state) => 
    state.dividendDeclaration.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => 
    state.dividendDeclaration.selectedTransactionRefno;
export const selectApprovalStatus = (state) => 
    state.dividendDeclaration.approvalStatus;
export const selectCurrentFilters = (state) => 
    state.dividendDeclaration.currentFilters;

// Combined selectors
export const selectIsAnyLoading = (state) => 
    Object.values(state.dividendDeclaration.loading).some(loading => loading);
export const selectHasAnyError = (state) => 
    Object.values(state.dividendDeclaration.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectDividendDeclarationSummary = (state) => {
    const inboxArray = Array.isArray(state.dividendDeclaration.verifyDividendDeclarationInbox) 
        ? state.dividendDeclaration.verifyDividendDeclarationInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedDeclaration: state.dividendDeclaration.dividendDeclarationDetails,
        approvalStatus: state.dividendDeclaration.approvalStatus,
        isProcessing: state.dividendDeclaration.loading.approveDividendDeclaration,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.dividendDeclaration.loading.verifyDividendDeclaration
    };
};

// Dividend Declaration Details specific selector
export const selectDividendDeclarationDetailsSummary = (state) => {
    return {
        details: state.dividendDeclaration.dividendDeclarationDetails,
        isLoading: state.dividendDeclaration.loading.dividendDeclarationDetails,
        error: state.dividendDeclaration.errors.dividendDeclarationDetails,
        hasDetails: state.dividendDeclaration.dividendDeclarationDetails !== null,
        isEmpty: state.dividendDeclaration.dividendDeclarationDetails === null 
            && !state.dividendDeclaration.loading.dividendDeclarationDetails
    };
};

// Dividend Declaration List specific selector
export const selectDividendDeclarationListSummary = (state) => {
    const listArray = Array.isArray(state.dividendDeclaration.dividendDeclarationList) 
        ? state.dividendDeclaration.dividendDeclarationList 
        : [];
    
    return {
        list: listArray,
        totalCount: listArray.length,
        isLoading: state.dividendDeclaration.loading.dividendDeclarationList,
        error: state.dividendDeclaration.errors.dividendDeclarationList,
        hasData: listArray.length > 0,
        isEmpty: listArray.length === 0 && !state.dividendDeclaration.loading.dividendDeclarationList,
        filters: state.dividendDeclaration.currentFilters
    };
};

// Insert operation status selector
export const selectInsertOperationStatus = (state) => {
    return {
        result: state.dividendDeclaration.insertResult,
        isLoading: state.dividendDeclaration.loading.insertDividendDeclaration,
        error: state.dividendDeclaration.errors.insertDividendDeclaration,
        isSuccess: state.dividendDeclaration.insertResult !== null,
        isFailed: state.dividendDeclaration.errors.insertDividendDeclaration !== null
    };
};

// Approval operation status selector
export const selectApprovalOperationStatus = (state) => {
    return {
        result: state.dividendDeclaration.approvalResult,
        isLoading: state.dividendDeclaration.loading.approveDividendDeclaration,
        error: state.dividendDeclaration.errors.approveDividendDeclaration,
        isSuccess: state.dividendDeclaration.approvalResult !== null,
        isFailed: state.dividendDeclaration.errors.approveDividendDeclaration !== null,
        status: state.dividendDeclaration.approvalStatus
    };
};

// Export reducer
export default dividendDeclarationSlice.reducer;