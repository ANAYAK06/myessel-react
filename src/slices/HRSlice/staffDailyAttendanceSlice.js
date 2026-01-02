import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as attendanceAPI from '../../api/HRAPI/staffDailyAttendanceAPI';

// Async Thunks for 3 Daily Staff Attendance APIs
// ===============================================

// 1. Fetch Verification Attendance Inbox by Role ID
export const fetchVerificationAttendance = createAsyncThunk(
    'staffdailyattendance/fetchVerificationAttendance',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getVerificationAttendance({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Attendance Inbox');
        }
    }
);

// 2. Fetch Attendance Details by Transaction Number
export const fetchAttendanceByTransactionNo = createAsyncThunk(
    'staffdailyattendance/fetchAttendanceByTransactionNo',
    async (transNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Attendance Details for TransNo:', transNo);
            const response = await attendanceAPI.getAttendanceByTransactionNo({ transNo });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Attendance Details');
        }
    }
);

// 3. Approve Staff Attendance
export const approveStaffAttendance = createAsyncThunk(
    'staffdailyattendance/approveStaffAttendance',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.approveStaffAttendance(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Staff Attendance');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationAttendanceInbox: [],
    attendanceDetails: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verificationAttendance: false,
        attendanceDetails: false,
        approveAttendance: false,
    },

    // Error states for each API
    errors: {
        verificationAttendance: null,
        attendanceDetails: null,
        approveAttendance: null,
    },

    // UI State
    selectedRoleId: null,
    selectedTransNo: null,
    approvalStatus: null,
};

// Staff Daily Attendance Slice
// ============================
const staffDailyAttendanceSlice = createSlice({
    name: 'staffdailyattendance',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected transaction number
        setSelectedTransNo: (state, action) => {
            state.selectedTransNo = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset attendance details
        resetAttendanceDetails: (state) => {
            state.attendanceDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all staff daily attendance data
        resetStaffDailyAttendanceData: (state) => {
            state.verificationAttendanceInbox = [];
            state.attendanceDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedTransNo = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Attendance Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationAttendance.pending, (state) => {
                state.loading.verificationAttendance = true;
                state.errors.verificationAttendance = null;
            })
            .addCase(fetchVerificationAttendance.fulfilled, (state, action) => {
                state.loading.verificationAttendance = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verificationAttendanceInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerificationAttendance.rejected, (state, action) => {
                state.loading.verificationAttendance = false;
                state.errors.verificationAttendance = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verificationAttendanceInbox = [];
            })

        // 2. Attendance Details by Transaction Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchAttendanceByTransactionNo.pending, (state) => {
                state.loading.attendanceDetails = true;
                state.errors.attendanceDetails = null;
            })
            .addCase(fetchAttendanceByTransactionNo.fulfilled, (state, action) => {
                state.loading.attendanceDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.attendanceDetails = action.payload?.Data || null;
            })
            .addCase(fetchAttendanceByTransactionNo.rejected, (state, action) => {
                state.loading.attendanceDetails = false;
                state.errors.attendanceDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.attendanceDetails = null;
            })

        // 3. Approve Staff Attendance
        builder
            .addCase(approveStaffAttendance.pending, (state) => {
                state.loading.approveAttendance = true;
                state.errors.approveAttendance = null;
            })
            .addCase(approveStaffAttendance.fulfilled, (state, action) => {
                state.loading.approveAttendance = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveStaffAttendance.rejected, (state, action) => {
                state.loading.approveAttendance = false;
                state.errors.approveAttendance = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedTransNo,
    setApprovalStatus,
    resetAttendanceDetails,
    clearError,
    resetStaffDailyAttendanceData,
    clearApprovalResult
} = staffDailyAttendanceSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationAttendanceInbox = (state) => state.staffdailyattendance.verificationAttendanceInbox;
export const selectAttendanceDetails = (state) => state.staffdailyattendance.attendanceDetails;
export const selectApprovalResult = (state) => state.staffdailyattendance.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationAttendanceInboxArray = (state) => {
    const inbox = state.staffdailyattendance.verificationAttendanceInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffdailyattendance.loading;
export const selectVerificationAttendanceLoading = (state) => state.staffdailyattendance.loading.verificationAttendance;
export const selectAttendanceDetailsLoading = (state) => state.staffdailyattendance.loading.attendanceDetails;
export const selectApproveAttendanceLoading = (state) => state.staffdailyattendance.loading.approveAttendance;

// Error selectors
export const selectErrors = (state) => state.staffdailyattendance.errors;
export const selectVerificationAttendanceError = (state) => state.staffdailyattendance.errors.verificationAttendance;
export const selectAttendanceDetailsError = (state) => state.staffdailyattendance.errors.attendanceDetails;
export const selectApproveAttendanceError = (state) => state.staffdailyattendance.errors.approveAttendance;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffdailyattendance.selectedRoleId;
export const selectSelectedTransNo = (state) => state.staffdailyattendance.selectedTransNo;
export const selectApprovalStatus = (state) => state.staffdailyattendance.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffdailyattendance.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffdailyattendance.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectStaffDailyAttendanceSummary = (state) => {
    const inboxArray = Array.isArray(state.staffdailyattendance.verificationAttendanceInbox) 
        ? state.staffdailyattendance.verificationAttendanceInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedAttendance: state.staffdailyattendance.attendanceDetails,
        approvalStatus: state.staffdailyattendance.approvalStatus,
        isProcessing: state.staffdailyattendance.loading.approveAttendance,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.staffdailyattendance.loading.verificationAttendance
    };
};

// Attendance Details specific selector
export const selectAttendanceDetailsSummary = (state) => {
    return {
        details: state.staffdailyattendance.attendanceDetails,
        isLoading: state.staffdailyattendance.loading.attendanceDetails,
        error: state.staffdailyattendance.errors.attendanceDetails,
        hasDetails: state.staffdailyattendance.attendanceDetails !== null,
        isEmpty: state.staffdailyattendance.attendanceDetails === null 
            && !state.staffdailyattendance.loading.attendanceDetails
    };
};

// Export reducer
export default staffDailyAttendanceSlice.reducer;