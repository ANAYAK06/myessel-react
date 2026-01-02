import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lbObjectivesAPI from '../../api/HRAPI/labourObjectivesandGoalsAPI';

// Async Thunks for 3 Labour Based Appraisal APIs
// ===============================================

// 1. Fetch Verify LB Object Goals Inbox by Role ID
export const fetchVerifyLBObjectGoals = createAsyncThunk(
    'labourobjectivesgoals/fetchVerifyLBObjectGoals',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await lbObjectivesAPI.getVerifyLBObjectGoals({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify LB Object Goals Inbox');
        }
    }
);

// 2. Fetch LB Appraisal Details by ID and Labour ID
export const fetchLBAppraisalById = createAsyncThunk(
    'labourobjectivesgoals/fetchLBAppraisalById',
    async ({ id, labourId }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching LB Appraisal Details for ID:', id, 'LabourId:', labourId);
            const response = await lbObjectivesAPI.getLBAppraisalById({ id, labourId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch LB Appraisal Details');
        }
    }
);

// 3. Approve LB Objects
export const approveLBObjects = createAsyncThunk(
    'labourobjectivesgoals/approveLBObjects',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving LB Objects with data:', approvalData);
            const response = await lbObjectivesAPI.approveLBObjects(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve LB Objects');
        }
    }
);
// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyLBObjectGoalsInbox: [],
    lbAppraisalDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyLBObjectGoals: false,
        lbAppraisalDetails: false,
        approveLBObjects: false,
    },

    // Error states for each API
    errors: {
        verifyLBObjectGoals: null,
        lbAppraisalDetails: null,
        approveLBObjects: null,
    },

    // UI State
    selectedRoleId: null,
    selectedId: null,
    selectedLabourId: null,
    approvalStatus: null,
};

// Labour Objectives and Goals Slice
// ==================================
const labourObjectivesGoalsSlice = createSlice({
    name: 'labourobjectivesgoals',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected ID
        setSelectedId: (state, action) => {
            state.selectedId = action.payload;
        },
        
        // Action to set selected labour ID
        setSelectedLabourId: (state, action) => {
            state.selectedLabourId = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset appraisal details
        resetLBAppraisalDetails: (state) => {
            state.lbAppraisalDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all labour objectives and goals data
        resetLabourObjectivesGoalsData: (state) => {
            state.verifyLBObjectGoalsInbox = [];
            state.lbAppraisalDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedId = null;
            state.selectedLabourId = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verify LB Object Goals Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyLBObjectGoals.pending, (state) => {
                state.loading.verifyLBObjectGoals = true;
                state.errors.verifyLBObjectGoals = null;
            })
            .addCase(fetchVerifyLBObjectGoals.fulfilled, (state, action) => {
                state.loading.verifyLBObjectGoals = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyLBObjectGoalsInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyLBObjectGoals.rejected, (state, action) => {
                state.loading.verifyLBObjectGoals = false;
                state.errors.verifyLBObjectGoals = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyLBObjectGoalsInbox = [];
            })

        // 2. LB Appraisal Details by ID - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchLBAppraisalById.pending, (state) => {
                state.loading.lbAppraisalDetails = true;
                state.errors.lbAppraisalDetails = null;
            })
            .addCase(fetchLBAppraisalById.fulfilled, (state, action) => {
                state.loading.lbAppraisalDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.lbAppraisalDetails = action.payload?.Data || null;
            })
            .addCase(fetchLBAppraisalById.rejected, (state, action) => {
                state.loading.lbAppraisalDetails = false;
                state.errors.lbAppraisalDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.lbAppraisalDetails = null;
            })

        // 3. Approve LB Objects
        builder
            .addCase(approveLBObjects.pending, (state) => {
                state.loading.approveLBObjects = true;
                state.errors.approveLBObjects = null;
            })
            .addCase(approveLBObjects.fulfilled, (state, action) => {
                state.loading.approveLBObjects = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveLBObjects.rejected, (state, action) => {
                state.loading.approveLBObjects = false;
                state.errors.approveLBObjects = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedId,
    setSelectedLabourId,
    setApprovalStatus,
    resetLBAppraisalDetails,
    clearError,
    resetLabourObjectivesGoalsData,
    clearApprovalResult
} = labourObjectivesGoalsSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyLBObjectGoalsInbox = (state) => state.labourobjectivesgoals.verifyLBObjectGoalsInbox;
export const selectLBAppraisalDetails = (state) => state.labourobjectivesgoals.lbAppraisalDetails;
export const selectApprovalResult = (state) => state.labourobjectivesgoals.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyLBObjectGoalsInboxArray = (state) => {
    const inbox = state.labourobjectivesgoals.verifyLBObjectGoalsInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.labourobjectivesgoals.loading;
export const selectVerifyLBObjectGoalsLoading = (state) => state.labourobjectivesgoals.loading.verifyLBObjectGoals;
export const selectLBAppraisalDetailsLoading = (state) => state.labourobjectivesgoals.loading.lbAppraisalDetails;
export const selectApproveLBObjectsLoading = (state) => state.labourobjectivesgoals.loading.approveLBObjects;

// Error selectors
export const selectErrors = (state) => state.labourobjectivesgoals.errors;
export const selectVerifyLBObjectGoalsError = (state) => state.labourobjectivesgoals.errors.verifyLBObjectGoals;
export const selectLBAppraisalDetailsError = (state) => state.labourobjectivesgoals.errors.lbAppraisalDetails;
export const selectApproveLBObjectsError = (state) => state.labourobjectivesgoals.errors.approveLBObjects;

// UI State selectors
export const selectSelectedRoleId = (state) => state.labourobjectivesgoals.selectedRoleId;
export const selectSelectedId = (state) => state.labourobjectivesgoals.selectedId;
export const selectSelectedLabourId = (state) => state.labourobjectivesgoals.selectedLabourId;
export const selectApprovalStatus = (state) => state.labourobjectivesgoals.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.labourobjectivesgoals.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.labourobjectivesgoals.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectLabourObjectivesGoalsSummary = (state) => {
    const inboxArray = Array.isArray(state.labourobjectivesgoals.verifyLBObjectGoalsInbox) 
        ? state.labourobjectivesgoals.verifyLBObjectGoalsInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedAppraisal: state.labourobjectivesgoals.lbAppraisalDetails,
        approvalStatus: state.labourobjectivesgoals.approvalStatus,
        isProcessing: state.labourobjectivesgoals.loading.approveLBObjects,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.labourobjectivesgoals.loading.verifyLBObjectGoals
    };
};

// LB Appraisal Details specific selector
export const selectLBAppraisalDetailsSummary = (state) => {
    return {
        details: state.labourobjectivesgoals.lbAppraisalDetails,
        isLoading: state.labourobjectivesgoals.loading.lbAppraisalDetails,
        error: state.labourobjectivesgoals.errors.lbAppraisalDetails,
        hasDetails: state.labourobjectivesgoals.lbAppraisalDetails !== null,
        isEmpty: state.labourobjectivesgoals.lbAppraisalDetails === null 
            && !state.labourobjectivesgoals.loading.lbAppraisalDetails
    };
};

// Export reducer
export default labourObjectivesGoalsSlice.reducer;