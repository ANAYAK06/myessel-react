import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as attendanceAPI from '../../api/HRAPI/monthlyAttendanceAPI';

// Async Thunks for 3 Excel Attendance APIs
// =========================================

// 1. Fetch Verify Excel Attendance Inbox by Role ID
export const fetchVerifyExcelAttendance = createAsyncThunk(
    'monthlyattendance/fetchVerifyExcelAttendance',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getVerifyExcelAttendance({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Excel Attendance Verification Inbox');
        }
    }
);

// 2. Fetch Excel Attendance Details by ID
export const fetchExcelAttendanceDetails = createAsyncThunk(
    'monthlyattendance/fetchExcelAttendanceDetails',
    async (payload, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Excel Attendance Details with payload:', payload);
            const response = await attendanceAPI.getExcelAttendance(payload);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Excel Attendance Details');
        }
    }
);
// 3. Approve Excel Month Attendance
export const approveExcelAttendance = createAsyncThunk(
    'monthlyattendance/approveExcelAttendance',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.approveExcelMonthAttendance(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Excel Month Attendance');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyExcelAttendanceInbox: [],
    excelAttendanceDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyExcelAttendance: false,
        excelAttendanceDetails: false,
        approveExcelAttendance: false,
    },

    // Error states for each API
    errors: {
        verifyExcelAttendance: null,
        excelAttendanceDetails: null,
        approveExcelAttendance: null,
    },

    // UI State
    selectedRoleId: null,
    selectedAttendanceId: null,
    approvalStatus: null,
};

// Monthly Attendance Slice
// ========================
const monthlyAttendanceSlice = createSlice({
    name: 'monthlyattendance',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected attendance ID
        setSelectedAttendanceId: (state, action) => {
            state.selectedAttendanceId = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset excel attendance details
        resetExcelAttendanceDetails: (state) => {
            state.excelAttendanceDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all monthly attendance data
        resetMonthlyAttendanceData: (state) => {
            state.verifyExcelAttendanceInbox = [];
            state.excelAttendanceDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedAttendanceId = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verify Excel Attendance Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyExcelAttendance.pending, (state) => {
                state.loading.verifyExcelAttendance = true;
                state.errors.verifyExcelAttendance = null;
            })
            .addCase(fetchVerifyExcelAttendance.fulfilled, (state, action) => {
                state.loading.verifyExcelAttendance = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyExcelAttendanceInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyExcelAttendance.rejected, (state, action) => {
                state.loading.verifyExcelAttendance = false;
                state.errors.verifyExcelAttendance = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyExcelAttendanceInbox = [];
            })

        // 2. Excel Attendance Details by ID - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchExcelAttendanceDetails.pending, (state) => {
                state.loading.excelAttendanceDetails = true;
                state.errors.excelAttendanceDetails = null;
            })
            .addCase(fetchExcelAttendanceDetails.fulfilled, (state, action) => {
                state.loading.excelAttendanceDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.excelAttendanceDetails = action.payload?.Data || null;
            })
            .addCase(fetchExcelAttendanceDetails.rejected, (state, action) => {
                state.loading.excelAttendanceDetails = false;
                state.errors.excelAttendanceDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.excelAttendanceDetails = null;
            })

        // 3. Approve Excel Attendance
        builder
            .addCase(approveExcelAttendance.pending, (state) => {
                state.loading.approveExcelAttendance = true;
                state.errors.approveExcelAttendance = null;
            })
            .addCase(approveExcelAttendance.fulfilled, (state, action) => {
                state.loading.approveExcelAttendance = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveExcelAttendance.rejected, (state, action) => {
                state.loading.approveExcelAttendance = false;
                state.errors.approveExcelAttendance = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedAttendanceId,
    setApprovalStatus,
    resetExcelAttendanceDetails,
    clearError,
    resetMonthlyAttendanceData,
    clearApprovalResult
} = monthlyAttendanceSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyExcelAttendanceInbox = (state) => state.monthlyattendance.verifyExcelAttendanceInbox;
export const selectExcelAttendanceDetails = (state) => state.monthlyattendance.excelAttendanceDetails;
export const selectApprovalResult = (state) => state.monthlyattendance.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyExcelAttendanceInboxArray = (state) => {
    const inbox = state.monthlyattendance.verifyExcelAttendanceInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.monthlyattendance.loading;
export const selectVerifyExcelAttendanceLoading = (state) => state.monthlyattendance.loading.verifyExcelAttendance;
export const selectExcelAttendanceDetailsLoading = (state) => state.monthlyattendance.loading.excelAttendanceDetails;
export const selectApproveExcelAttendanceLoading = (state) => state.monthlyattendance.loading.approveExcelAttendance;

// Error selectors
export const selectErrors = (state) => state.monthlyattendance.errors;
export const selectVerifyExcelAttendanceError = (state) => state.monthlyattendance.errors.verifyExcelAttendance;
export const selectExcelAttendanceDetailsError = (state) => state.monthlyattendance.errors.excelAttendanceDetails;
export const selectApproveExcelAttendanceError = (state) => state.monthlyattendance.errors.approveExcelAttendance;

// UI State selectors
export const selectSelectedRoleId = (state) => state.monthlyattendance.selectedRoleId;
export const selectSelectedAttendanceId = (state) => state.monthlyattendance.selectedAttendanceId;
export const selectApprovalStatus = (state) => state.monthlyattendance.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.monthlyattendance.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.monthlyattendance.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectMonthlyAttendanceSummary = (state) => {
    const inboxArray = Array.isArray(state.monthlyattendance.verifyExcelAttendanceInbox) 
        ? state.monthlyattendance.verifyExcelAttendanceInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedAttendance: state.monthlyattendance.excelAttendanceDetails,
        approvalStatus: state.monthlyattendance.approvalStatus,
        isProcessing: state.monthlyattendance.loading.approveExcelAttendance,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.monthlyattendance.loading.verifyExcelAttendance
    };
};

// Excel Attendance Details specific selector
export const selectExcelAttendanceDetailsSummary = (state) => {
    return {
        details: state.monthlyattendance.excelAttendanceDetails,
        isLoading: state.monthlyattendance.loading.excelAttendanceDetails,
        error: state.monthlyattendance.errors.excelAttendanceDetails,
        hasDetails: state.monthlyattendance.excelAttendanceDetails !== null,
        isEmpty: state.monthlyattendance.excelAttendanceDetails === null 
            && !state.monthlyattendance.loading.excelAttendanceDetails
    };
};

// Export reducer
export default monthlyAttendanceSlice.reducer;