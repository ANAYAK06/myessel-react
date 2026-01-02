import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffObjectivesAPI from '../../api/HRAPI/staffObjectivesandGoalsAPI';

// Async Thunks for 3 Staff Objectives And Goals APIs
// ===================================================

// 1. Fetch Verify Objects And Goals Inbox by Role ID
export const fetchVerifyObjectsAndGoals = createAsyncThunk(
    'staffobjectivesgoals/fetchVerifyObjectsAndGoals',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await staffObjectivesAPI.getVerifyObjectsAndGoals({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify Objects And Goals Inbox');
        }
    }
);

// 2. Fetch Appraisal Details by ID and Employee Reference Number
export const fetchAppraisalById = createAsyncThunk(
    'staffobjectivesgoals/fetchAppraisalById',
    async ({ id, empRefNo }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Appraisal Details for ID:', id, 'EmpRefNo:', empRefNo);
            const response = await staffObjectivesAPI.getAppraisalById({ id, empRefNo });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Appraisal Details');
        }
    }
);

// 3. Approve Emp Objects
export const approveEmpObjects = createAsyncThunk(
    'staffobjectivesgoals/approveEmpObjects',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving Emp Objects with data:', approvalData);
            const response = await staffObjectivesAPI.approveEmpObjects(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Emp Objects');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyObjectsAndGoalsInbox: [],
    appraisalDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyObjectsAndGoals: false,
        appraisalDetails: false,
        approveEmpObjects: false,
    },

    // Error states for each API
    errors: {
        verifyObjectsAndGoals: null,
        appraisalDetails: null,
        approveEmpObjects: null,
    },

    // UI State
    selectedRoleId: null,
    selectedId: null,
    selectedEmpRefNo: null,
    approvalStatus: null,
};

// Staff Objectives and Goals Slice
// =================================
const staffObjectivesGoalsSlice = createSlice({
    name: 'staffobjectivesgoals',
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
        
        // Action to set selected employee reference number
        setSelectedEmpRefNo: (state, action) => {
            state.selectedEmpRefNo = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset appraisal details
        resetAppraisalDetails: (state) => {
            state.appraisalDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all staff objectives and goals data
        resetStaffObjectivesGoalsData: (state) => {
            state.verifyObjectsAndGoalsInbox = [];
            state.appraisalDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedId = null;
            state.selectedEmpRefNo = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verify Objects And Goals Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyObjectsAndGoals.pending, (state) => {
                state.loading.verifyObjectsAndGoals = true;
                state.errors.verifyObjectsAndGoals = null;
            })
            .addCase(fetchVerifyObjectsAndGoals.fulfilled, (state, action) => {
                state.loading.verifyObjectsAndGoals = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyObjectsAndGoalsInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyObjectsAndGoals.rejected, (state, action) => {
                state.loading.verifyObjectsAndGoals = false;
                state.errors.verifyObjectsAndGoals = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyObjectsAndGoalsInbox = [];
            })

        // 2. Appraisal Details by ID - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchAppraisalById.pending, (state) => {
                state.loading.appraisalDetails = true;
                state.errors.appraisalDetails = null;
            })
            .addCase(fetchAppraisalById.fulfilled, (state, action) => {
                state.loading.appraisalDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.appraisalDetails = action.payload?.Data || null;
            })
            .addCase(fetchAppraisalById.rejected, (state, action) => {
                state.loading.appraisalDetails = false;
                state.errors.appraisalDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.appraisalDetails = null;
            })

        // 3. Approve Emp Objects
        builder
            .addCase(approveEmpObjects.pending, (state) => {
                state.loading.approveEmpObjects = true;
                state.errors.approveEmpObjects = null;
            })
            .addCase(approveEmpObjects.fulfilled, (state, action) => {
                state.loading.approveEmpObjects = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveEmpObjects.rejected, (state, action) => {
                state.loading.approveEmpObjects = false;
                state.errors.approveEmpObjects = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedId,
    setSelectedEmpRefNo,
    setApprovalStatus,
    resetAppraisalDetails,
    clearError,
    resetStaffObjectivesGoalsData,
    clearApprovalResult
} = staffObjectivesGoalsSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyObjectsAndGoalsInbox = (state) => state.staffobjectivesgoals.verifyObjectsAndGoalsInbox;
export const selectAppraisalDetails = (state) => state.staffobjectivesgoals.appraisalDetails;
export const selectApprovalResult = (state) => state.staffobjectivesgoals.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyObjectsAndGoalsInboxArray = (state) => {
    const inbox = state.staffobjectivesgoals.verifyObjectsAndGoalsInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffobjectivesgoals.loading;
export const selectVerifyObjectsAndGoalsLoading = (state) => state.staffobjectivesgoals.loading.verifyObjectsAndGoals;
export const selectAppraisalDetailsLoading = (state) => state.staffobjectivesgoals.loading.appraisalDetails;
export const selectApproveEmpObjectsLoading = (state) => state.staffobjectivesgoals.loading.approveEmpObjects;

// Error selectors
export const selectErrors = (state) => state.staffobjectivesgoals.errors;
export const selectVerifyObjectsAndGoalsError = (state) => state.staffobjectivesgoals.errors.verifyObjectsAndGoals;
export const selectAppraisalDetailsError = (state) => state.staffobjectivesgoals.errors.appraisalDetails;
export const selectApproveEmpObjectsError = (state) => state.staffobjectivesgoals.errors.approveEmpObjects;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffobjectivesgoals.selectedRoleId;
export const selectSelectedId = (state) => state.staffobjectivesgoals.selectedId;
export const selectSelectedEmpRefNo = (state) => state.staffobjectivesgoals.selectedEmpRefNo;
export const selectApprovalStatus = (state) => state.staffobjectivesgoals.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffobjectivesgoals.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffobjectivesgoals.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectStaffObjectivesGoalsSummary = (state) => {
    const inboxArray = Array.isArray(state.staffobjectivesgoals.verifyObjectsAndGoalsInbox) 
        ? state.staffobjectivesgoals.verifyObjectsAndGoalsInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedAppraisal: state.staffobjectivesgoals.appraisalDetails,
        approvalStatus: state.staffobjectivesgoals.approvalStatus,
        isProcessing: state.staffobjectivesgoals.loading.approveEmpObjects,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.staffobjectivesgoals.loading.verifyObjectsAndGoals
    };
};

// Appraisal Details specific selector
export const selectAppraisalDetailsSummary = (state) => {
    return {
        details: state.staffobjectivesgoals.appraisalDetails,
        isLoading: state.staffobjectivesgoals.loading.appraisalDetails,
        error: state.staffobjectivesgoals.errors.appraisalDetails,
        hasDetails: state.staffobjectivesgoals.appraisalDetails !== null,
        isEmpty: state.staffobjectivesgoals.appraisalDetails === null 
            && !state.staffobjectivesgoals.loading.appraisalDetails
    };
};

// Export reducer
export default staffObjectivesGoalsSlice.reducer;