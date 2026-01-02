import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffAPI from '../../api/HRAPI/StaffRegistrationVerificationAPI';

// Async Thunks for 4 Staff Registration APIs
// ==========================================

// 1. Fetch Verification Staff by Role ID
export const fetchVerificationStaff = createAsyncThunk(
    'staffregistration/fetchVerificationStaff',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verification Staff for RoleID:', roleId);
            const response = await staffAPI.getVerificationStaff(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verification Staff');
        }
    }
);

// 2. Fetch Verification Staff Data by ID
export const fetchVerificationStaffDataById = createAsyncThunk(
    'staffregistration/fetchVerificationStaffDataById',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Staff Data for:', params);
            const response = await staffAPI.getVerificationStaffDataById(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verification Staff Data');
        }
    }
);

// 3. Approve Staff Registration
export const approveStaffRegistration = createAsyncThunk(
    'staffregistration/approveStaffRegistration',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving Staff Registration with data:', {
                EmpRefNo: approvalData.EmpRefNo,
                Action: approvalData.Action,
                hasDocuments: approvalData.DocumentData?.length > 0
            });
            const response = await staffAPI.approveStaffRegistration(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Staff Registration');
        }
    }
);

// 4. Fetch Employee Documents
export const fetchEmployeeDocuments = createAsyncThunk(
    'staffregistration/fetchEmployeeDocuments',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Documents for:', empRefNo);
            const response = await staffAPI.getEmployeeDocuments(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
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
    employeeDocuments: [],

    // Loading states for each API
    loading: {
        verificationStaff: false,
        verificationStaffData: false,
        approveStaffRegistration: false,
        employeeDocuments: false,
    },

    // Error states for each API
    errors: {
        verificationStaff: null,
        verificationStaffData: null,
        approveStaffRegistration: null,
        employeeDocuments: null,
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
            state.employeeDocuments = []; // Also reset documents when resetting staff data
        },

        // Action to reset employee documents
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
            state.employeeDocuments = [];
            state.selectedRoleId = null;
            state.selectedEmpRefNo = null;
            state.approvalStatus = null;
            // Also reset all errors
            state.errors = {
                verificationStaff: null,
                verificationStaffData: null,
                approveStaffRegistration: null,
                employeeDocuments: null,
            };
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
            state.approvalStatus = null; // Also reset approval status
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Staff - HANDLE API RESPONSE STRUCTURE
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
                console.log('✅ Verification Staff loaded:', state.verificationStaff.length, 'records');
            })
            .addCase(fetchVerificationStaff.rejected, (state, action) => {
                state.loading.verificationStaff = false;
                state.errors.verificationStaff = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verificationStaff = [];
            })

        // 2. Verification Staff Data by ID - HANDLE API RESPONSE STRUCTURE
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
                console.log('✅ Verification Staff Data loaded for:', state.verificationStaffData?.EmpRefNo);
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
                console.log('✅ Staff Registration Approval successful');
            })
            .addCase(approveStaffRegistration.rejected, (state, action) => {
                state.loading.approveStaffRegistration = false;
                state.errors.approveStaffRegistration = action.payload;
                state.approvalStatus = 'failed';
            })

        // 4. Employee Documents
        builder
            .addCase(fetchEmployeeDocuments.pending, (state) => {
                state.loading.employeeDocuments = true;
                state.errors.employeeDocuments = null;
            })
            .addCase(fetchEmployeeDocuments.fulfilled, (state, action) => {
                state.loading.employeeDocuments = false;
                // Extract Data array from API response
                state.employeeDocuments = action.payload?.Data || [];
                console.log('✅ Employee Documents loaded:', state.employeeDocuments.length, 'documents');
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
    resetEmployeeDocuments,
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
export const selectEmployeeDocuments = (state) => state.staffregistration.employeeDocuments;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationStaffArray = (state) => {
    const staff = state.staffregistration.verificationStaff;
    return Array.isArray(staff) ? staff : [];
};

export const selectEmployeeDocumentsArray = (state) => {
    const documents = state.staffregistration.employeeDocuments;
    return Array.isArray(documents) ? documents : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffregistration.loading;
export const selectVerificationStaffLoading = (state) => state.staffregistration.loading.verificationStaff;
export const selectVerificationStaffDataLoading = (state) => state.staffregistration.loading.verificationStaffData;
export const selectApproveStaffRegistrationLoading = (state) => state.staffregistration.loading.approveStaffRegistration;
export const selectEmployeeDocumentsLoading = (state) => state.staffregistration.loading.employeeDocuments;

// Error selectors
export const selectErrors = (state) => state.staffregistration.errors;
export const selectVerificationStaffError = (state) => state.staffregistration.errors.verificationStaff;
export const selectVerificationStaffDataError = (state) => state.staffregistration.errors.verificationStaffData;
export const selectApproveStaffRegistrationError = (state) => state.staffregistration.errors.approveStaffRegistration;
export const selectEmployeeDocumentsError = (state) => state.staffregistration.errors.employeeDocuments;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffregistration.selectedRoleId;
export const selectSelectedEmpRefNo = (state) => state.staffregistration.selectedEmpRefNo;
export const selectApprovalStatus = (state) => state.staffregistration.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffregistration.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffregistration.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectStaffRegistrationSummary = (state) => {
    const staffArray = Array.isArray(state.staffregistration.verificationStaff) 
        ? state.staffregistration.verificationStaff 
        : [];
    const documentsArray = Array.isArray(state.staffregistration.employeeDocuments) 
        ? state.staffregistration.employeeDocuments 
        : [];
    
    return {
        totalStaff: staffArray.length,
        selectedStaff: state.staffregistration.verificationStaffData,
        approvalStatus: state.staffregistration.approvalStatus,
        isProcessing: state.staffregistration.loading.approveStaffRegistration,
        totalDocuments: documentsArray.length,
        hasDocuments: documentsArray.length > 0,
        hasStaffItems: staffArray.length > 0,
        isEmpty: staffArray.length === 0 && !state.staffregistration.loading.verificationStaff
    };
};

// Staff Data specific selector
export const selectVerificationStaffDataSummary = (state) => {
    return {
        data: state.staffregistration.verificationStaffData,
        isLoading: state.staffregistration.loading.verificationStaffData,
        error: state.staffregistration.errors.verificationStaffData,
        hasData: state.staffregistration.verificationStaffData !== null,
        isEmpty: state.staffregistration.verificationStaffData === null 
            && !state.staffregistration.loading.verificationStaffData
    };
};

// Employee Documents specific selector
export const selectEmployeeDocumentsSummary = (state) => {
    const documentsArray = Array.isArray(state.staffregistration.employeeDocuments) 
        ? state.staffregistration.employeeDocuments 
        : [];
    
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