import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffAPI from '../../api/HRAPI/StaffRegistrationVerificationAPI';

// Async Thunks for 3 Staff Registration APIs
// ==========================================

// 1. Fetch Verification Staff by Role ID
export const fetchVerificationStaff = createAsyncThunk(
    'staffregistration/fetchVerificationStaff',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getVerificationStaff(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Staff');
        }
    }
);

// 2. Fetch Verification Staff Data by ID
export const fetchVerificationStaffDataById = createAsyncThunk(
    'staffregistration/fetchVerificationStaffDataById',
    async (params, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getVerificationStaffDataById(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Staff Data');
        }
    }
);

// 3. Approve Staff Registration
export const approveStaffRegistration = createAsyncThunk(
    'staffregistration/approveStaffRegistration',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await staffAPI.approveStaffRegistration(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Staff Registration');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationStaff: [],
    verificationStaffData: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verificationStaff: false,
        verificationStaffData: false,
        approveStaffRegistration: false,
    },

    // Error states for each API
    errors: {
        verificationStaff: null,
        verificationStaffData: null,
        approveStaffRegistration: null,
    },

    // UI State
    selectedRoleId: null,
    selectedEmpRefNo: null,
    approvalStatus: null,
};

// Staff Registration Slice
// ========================
const staffRegistrationSlice = createSlice({
    name: 'staffregistration',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected employee reference number
        setSelectedEmpRefNo: (state, action) => {
            state.selectedEmpRefNo = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset verification staff data
        resetVerificationStaffData: (state) => {
            state.verificationStaffData = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all staff registration data
        resetStaffRegistrationData: (state) => {
            state.verificationStaff = [];
            state.verificationStaffData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedEmpRefNo = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Staff
        builder
            .addCase(fetchVerificationStaff.pending, (state) => {
                state.loading.verificationStaff = true;
                state.errors.verificationStaff = null;
            })
            .addCase(fetchVerificationStaff.fulfilled, (state, action) => {
                state.loading.verificationStaff = false;
                state.verificationStaff = action.payload;
            })
            .addCase(fetchVerificationStaff.rejected, (state, action) => {
                state.loading.verificationStaff = false;
                state.errors.verificationStaff = action.payload;
            })

        // 2. Verification Staff Data by ID
        builder
            .addCase(fetchVerificationStaffDataById.pending, (state) => {
                state.loading.verificationStaffData = true;
                state.errors.verificationStaffData = null;
            })
            .addCase(fetchVerificationStaffDataById.fulfilled, (state, action) => {
                state.loading.verificationStaffData = false;
                state.verificationStaffData = action.payload;
            })
            .addCase(fetchVerificationStaffDataById.rejected, (state, action) => {
                state.loading.verificationStaffData = false;
                state.errors.verificationStaffData = action.payload;
            })

        // 3. Approve Staff Registration
        builder
            .addCase(approveStaffRegistration.pending, (state) => {
                state.loading.approveStaffRegistration = true;
                state.errors.approveStaffRegistration = null;
            })
            .addCase(approveStaffRegistration.fulfilled, (state, action) => {
                state.loading.approveStaffRegistration = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveStaffRegistration.rejected, (state, action) => {
                state.loading.approveStaffRegistration = false;
                state.errors.approveStaffRegistration = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedEmpRefNo,
    setApprovalStatus,
    resetVerificationStaffData,
    clearError,
    resetStaffRegistrationData,
    clearApprovalResult
} = staffRegistrationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationStaff = (state) => state.staffregistration.verificationStaff;
export const selectVerificationStaffData = (state) => state.staffregistration.verificationStaffData;
export const selectApprovalResult = (state) => state.staffregistration.approvalResult;

// Loading selectors
export const selectLoading = (state) => state.staffregistration.loading;
export const selectVerificationStaffLoading = (state) => state.staffregistration.loading.verificationStaff;
export const selectVerificationStaffDataLoading = (state) => state.staffregistration.loading.verificationStaffData;
export const selectApproveStaffRegistrationLoading = (state) => state.staffregistration.loading.approveStaffRegistration;

// Error selectors
export const selectErrors = (state) => state.staffregistration.errors;
export const selectVerificationStaffError = (state) => state.staffregistration.errors.verificationStaff;
export const selectVerificationStaffDataError = (state) => state.staffregistration.errors.verificationStaffData;
export const selectApproveStaffRegistrationError = (state) => state.staffregistration.errors.approveStaffRegistration;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffregistration.selectedRoleId;
export const selectSelectedEmpRefNo = (state) => state.staffregistration.selectedEmpRefNo;
export const selectApprovalStatus = (state) => state.staffregistration.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffregistration.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffregistration.errors).some(error => error !== null);

// Specific combined selectors
export const selectStaffRegistrationSummary = (state) => ({
    totalStaff: state.staffregistration.verificationStaff.length,
    selectedStaff: state.staffregistration.verificationStaffData,
    approvalStatus: state.staffregistration.approvalStatus,
    isProcessing: state.staffregistration.loading.approveStaffRegistration
});

// Export reducer
export default staffRegistrationSlice.reducer;