import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as statusAPI from '../../api/commonAPI/getStatusAPI';

// Generic Async Thunks
// ====================

// 1. Fetch Status List (remains the same)
export const fetchStatusList = createAsyncThunk(
    'approval/fetchStatusList',
    async (params, { rejectWithValue }) => {
        try {
            const response = await statusAPI.getStatusList(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Status List');
        }
    }
);

// 2. Execute Approval Action (Generic)
export const executeApprovalAction = createAsyncThunk(
    'approval/executeApprovalAction',
    async ({ approvalData, approvalFunction }, { rejectWithValue }) => {
        try {
            // Execute the specific approval function passed in
            const response = await approvalFunction(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to execute approval action');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    statusList: [],
    
    // Current request parameters for caching
    currentParams: {
        MOID: '',
        ROID: '',
        ChkAmt: 0
    },

    // Loading states
    loading: {
        statusList: false,
        approvalAction: false, // Generic approval action loading
    },

    // Error states
    errors: {
        statusList: null,
        approvalAction: null, // Generic approval action error
    },

    // Approval result
    approvalResult: null,

    // Return button visibility control
    showReturnButton: 'No', // 'Yes' or 'No'

    // Button disable state after click
    buttonsDisabled: false,

    // Current approval context (staff, leave, po, etc.)
    approvalContext: null,

    // Cache for different MOID/ROID combinations
    cache: {}
};

// Helper function to get appropriate styling for different action types
const getActionButtonClass = (actionType) => {
    const type = actionType.toLowerCase();
    
    const styleMap = {
        'approve': 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        'verify': 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
        'return': 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
        'reject': 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
    };
    
    return styleMap[type] || 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800';
};

// Generic Approval Slice
// ======================
const approvalSlice = createSlice({
    name: 'approval',
    initialState,
    reducers: {
        // Action to set current request parameters
        setCurrentParams: (state, action) => {
            state.currentParams = { ...state.currentParams, ...action.payload };
        },
        
        // Action to set approval context (staff, leave, po, etc.)
        setApprovalContext: (state, action) => {
            state.approvalContext = action.payload;
        },
        
        // Action to clear current data
        clearStatusList: (state) => {
            state.statusList = [];
        },
        
        // Action to control return button visibility
        setShowReturnButton: (state, action) => {
            state.showReturnButton = action.payload; // 'Yes' or 'No'
        },

        // Action to disable/enable buttons after click
        setButtonsDisabled: (state, action) => {
            state.buttonsDisabled = action.payload; // true or false
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all approval data
        resetApprovalData: (state) => {
            state.statusList = [];
            state.currentParams = { MOID: '', ROID: '', ChkAmt: 0 };
            state.buttonsDisabled = false;
            state.approvalResult = null;
            state.errors.approvalAction = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },

        // Action to cache status list for specific params
        cacheStatusList: (state, action) => {
            const { params, data } = action.payload;
            const cacheKey = `${params.MOID}_${params.ROID}_${params.ChkAmt}`;
            state.cache[cacheKey] = data;
        },

        // Action to clear cache
        clearCache: (state) => {
            state.cache = {};
        }
    },
    extraReducers: (builder) => {
        // 1. Status List
        builder
            .addCase(fetchStatusList.pending, (state) => {
                state.loading.statusList = true;
                state.errors.statusList = null;
            })
            .addCase(fetchStatusList.fulfilled, (state, action) => {
                state.loading.statusList = false;
                state.statusList = action.payload.Data || [];

                // Cache the result
                if (action.meta.arg) {
                    const cacheKey = `${action.meta.arg.MOID}_${action.meta.arg.ROID}_${action.meta.arg.ChkAmt}`;
                    state.cache[cacheKey] = action.payload;
                }
            })
            .addCase(fetchStatusList.rejected, (state, action) => {
                state.loading.statusList = false;
                state.errors.statusList = action.payload;
                state.statusList = [];
            })

        // 2. Generic Approval Action
        builder
            .addCase(executeApprovalAction.pending, (state) => {
                state.loading.approvalAction = true;
                state.errors.approvalAction = null;
            })
            .addCase(executeApprovalAction.fulfilled, (state, action) => {
                state.loading.approvalAction = false;
                state.approvalResult = action.payload;
            })
            .addCase(executeApprovalAction.rejected, (state, action) => {
                state.loading.approvalAction = false;
                state.errors.approvalAction = action.payload;
            });
    },
});

// Export actions
export const { 
    setCurrentParams,
    setApprovalContext,
    clearStatusList,
    setShowReturnButton,
    setButtonsDisabled,
    clearError,
    resetApprovalData,
    clearApprovalResult,
    cacheStatusList,
    clearCache
} = approvalSlice.actions;

// Selectors
// =========

// Data selectors
export const selectStatusList = (state) => state.approval.statusList;
export const selectCurrentParams = (state) => state.approval.currentParams;
export const selectApprovalContext = (state) => state.approval.approvalContext;
export const selectApprovalResult = (state) => state.approval.approvalResult;
export const selectCache = (state) => state.approval.cache;
export const selectShowReturnButton = (state) => state.approval.showReturnButton;
export const selectButtonsDisabled = (state) => state.approval.buttonsDisabled;

// Loading selectors
export const selectLoading = (state) => state.approval.loading;
export const selectStatusListLoading = (state) => state.approval.loading.statusList;
export const selectApprovalActionLoading = (state) => state.approval.loading.approvalAction;

// Error selectors
export const selectErrors = (state) => state.approval.errors;
export const selectStatusListError = (state) => state.approval.errors.statusList;
export const selectApprovalActionError = (state) => state.approval.errors.approvalAction;

// Main selector for available actions based on type and return visibility
export const selectAvailableActions = (state) => {
    const statusList = state.approval.statusList;
    const showReturn = state.approval.showReturnButton === 'Yes';
    const buttonsDisabled = state.approval.buttonsDisabled;
    
    if (!Array.isArray(statusList)) return [];
    
    // Filter for the four button types we want
    const targetTypes = ['approve', 'verify', 'return', 'reject'];
    
    let availableActions = statusList
        .filter(status => {
            if (!status.Type || status.Type.trim() === '') return false;
            
            const type = status.Type.toLowerCase();
            
            // If return is disabled, exclude return actions
            if (!showReturn && type === 'return') return false;
            
            // Only include our target types
            return targetTypes.includes(type);
        })
        .map(status => ({
            type: status.Type,
            value: status.Value,
            text: status.Text || status.Type,
            enabled: !buttonsDisabled,
            className: getActionButtonClass(status.Type)
        }));
    
    return availableActions;
};

// Utility selectors
export const selectHasActions = (state) => selectAvailableActions(state).length > 0;
export const selectEnabledActions = (state) => selectAvailableActions(state).filter(action => action.enabled);
export const selectActionsCount = (state) => selectAvailableActions(state).length;
export const selectEnabledActionsCount = (state) => selectAvailableActions(state).filter(action => action.enabled).length;

// Action selectors by type
export const selectActionByType = (state, actionType) => 
    selectAvailableActions(state).find(
        action => action.type.toLowerCase() === actionType.toLowerCase()
    );

// Individual button selectors
export const selectApproveButton = (state) => selectActionByType(state, 'approve');
export const selectVerifyButton = (state) => selectActionByType(state, 'verify');
export const selectReturnButton = (state) => selectActionByType(state, 'return');
export const selectRejectButton = (state) => selectActionByType(state, 'reject');

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.approval.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.approval.errors).some(error => error !== null);

// Cache selectors
export const selectCachedStatusList = (state, params) => {
    const cacheKey = `${params.MOID}_${params.ROID}_${params.ChkAmt}`;
    return state.approval.cache[cacheKey];
};

// Debug selector to inspect current state
export const selectDebugInfo = (state) => ({
    statusList: state.approval.statusList,
    availableActions: selectAvailableActions(state),
    currentParams: state.approval.currentParams,
    approvalContext: state.approval.approvalContext,
    loading: state.approval.loading,
    errors: state.approval.errors,
    showReturnButton: state.approval.showReturnButton,
    buttonsDisabled: state.approval.buttonsDisabled
});

// Export reducer
export default approvalSlice.reducer;