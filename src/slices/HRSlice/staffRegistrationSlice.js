import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffAPI from '../../api/HRAPI/StaffRegistrationVerificationAPI';

// Async Thunks for 4 Staff Registration APIs
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

// 4. Fetch Employee Documents
export const fetchEmployeeDocuments = createAsyncThunk(
    'staffregistration/fetchEmployeeDocuments',
    async (empRefNo, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getEmployeeDocuments(empRefNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Documents');
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
    employeeDocuments: [], // NEW: Employee documents data

    // Loading states for each API
    loading: {
        verificationStaff: false,
        verificationStaffData: false,
        approveStaffRegistration: false,
        employeeDocuments: false, // NEW: Loading state for employee documents
    },

    // Error states for each API
    errors: {
        verificationStaff: null,
        verificationStaffData: null,
        approveStaffRegistration: null,
        employeeDocuments: null, // NEW: Error state for employee documents
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

        // NEW: Action to reset employee documents
        resetEmployeeDocuments: (state) => {
            state.employeeDocuments = [];
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
            state.employeeDocuments = []; // NEW: Reset employee documents
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
        // 1. Verification Staff - UPDATED TO HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationStaff.pending, (state) => {
                state.loading.verificationStaff = true;
                state.errors.verificationStaff = null;
            })
            .addCase(fetchVerificationStaff.fulfilled, (state, action) => {
                state.loading.verificationStaff = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verificationStaff = action.payload?.Data || [];
            })
            .addCase(fetchVerificationStaff.rejected, (state, action) => {
                state.loading.verificationStaff = false;
                state.errors.verificationStaff = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verificationStaff = [];
            })

        // 2. Verification Staff Data by ID - UPDATED TO HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationStaffDataById.pending, (state) => {
                state.loading.verificationStaffData = true;
                state.errors.verificationStaffData = null;
            })
            .addCase(fetchVerificationStaffDataById.fulfilled, (state, action) => {
                state.loading.verificationStaffData = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.verificationStaffData = action.payload?.Data || null;
            })
            .addCase(fetchVerificationStaffDataById.rejected, (state, action) => {
                state.loading.verificationStaffData = false;
                state.errors.verificationStaffData = action.payload;
                // 🔧 FIXED: Reset on error
                state.verificationStaffData = null;
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
            })

        // 4. NEW: Employee Documents
        builder
            .addCase(fetchEmployeeDocuments.pending, (state) => {
                state.loading.employeeDocuments = true;
                state.errors.employeeDocuments = null;
            })
            .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
                state.loading.employeeDocuments = false;
                // Extract Data array from API response, following same pattern
                state.employeeDocuments = action.payload?.Data || [];
            })
            .addCase(fetchEmployeeDocuments.rejected, (state, action) => {
                state.loading.employeeDocuments = false;
                state.errors.employeeDocuments = action.payload;
                // Reset to empty array on error
                state.employeeDocuments = [];
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedEmpRefNo,
    setApprovalStatus,
    resetVerificationStaffData,
    resetEmployeeDocuments, // NEW: Export new action
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
export const selectEmployeeDocuments = (state) => state.staffregistration.employeeDocuments; // NEW: Employee documents selector

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationStaffArray = (state) => {
    const staff = state.staffregistration.verificationStaff;
    return Array.isArray(staff) ? staff : [];
};

export const selectEmployeeDocumentsArray = (state) => { // NEW: Safe array selector for employee documents
    const documents = state.staffregistration.employeeDocuments;
    return Array.isArray(documents) ? documents : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffregistration.loading;
export const selectVerificationStaffLoading = (state) => state.staffregistration.loading.verificationStaff;
export const selectVerificationStaffDataLoading = (state) => state.staffregistration.loading.verificationStaffData;
export const selectApproveStaffRegistrationLoading = (state) => state.staffregistration.loading.approveStaffRegistration;
export const selectEmployeeDocumentsLoading = (state) => state.staffregistration.loading.employeeDocuments; // NEW: Employee documents loading

// Error selectors
export const selectErrors = (state) => state.staffregistration.errors;
export const selectVerificationStaffError = (state) => state.staffregistration.errors.verificationStaff;
export const selectVerificationStaffDataError = (state) => state.staffregistration.errors.verificationStaffData;
export const selectApproveStaffRegistrationError = (state) => state.staffregistration.errors.approveStaffRegistration;
export const selectEmployeeDocumentsError = (state) => state.staffregistration.errors.employeeDocuments; // NEW: Employee documents error

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffregistration.selectedRoleId;
export const selectSelectedEmpRefNo = (state) => state.staffregistration.selectedEmpRefNo;
export const selectApprovalStatus = (state) => state.staffregistration.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffregistration.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffregistration.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectStaffRegistrationSummary = (state) => {
    const staffArray = Array.isArray(state.staffregistration.verificationStaff) ? state.staffregistration.verificationStaff : [];
    const documentsArray = Array.isArray(state.staffregistration.employeeDocuments) ? state.staffregistration.employeeDocuments : [];
    
    return {
        totalStaff: staffArray.length,
        selectedStaff: state.staffregistration.verificationStaffData,
        approvalStatus: state.staffregistration.approvalStatus,
        isProcessing: state.staffregistration.loading.approveStaffRegistration,
        totalDocuments: documentsArray.length, // NEW: Include document count
        hasDocuments: documentsArray.length > 0 // NEW: Helper for UI conditional rendering
    };
};

// NEW: Employee Documents specific selectors
export const selectEmployeeDocumentsSummary = (state) => {
    const documentsArray = Array.isArray(state.staffregistration.employeeDocuments) ? state.staffregistration.employeeDocuments : [];
    
    return {
        documents: documentsArray,
        totalDocuments: documentsArray.length,
        isLoading: state.staffregistration.loading.employeeDocuments,
        error: state.staffregistration.errors.employeeDocuments,
        hasDocuments: documentsArray.length > 0,
        isEmpty: documentsArray.length === 0 && !state.staffregistration.loading.employeeDocuments
    };
};

// Export reducer
export default staffRegistrationSlice.reducer;