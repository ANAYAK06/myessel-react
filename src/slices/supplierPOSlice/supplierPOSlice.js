import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierPOAPI from '../../api/SupplierPOAPI/supplierPOAPI';

// Async Thunks for 3 Supplier PO APIs
// ====================================

// 1. Fetch Verification Supplier POs by Role ID, User ID, and CC Type
export const fetchVerificationSupplierPOs = createAsyncThunk(
    'supplierpo/fetchVerificationSupplierPOs',
    async ({ roleId, userId, ccType }, { rejectWithValue }) => {
        try {
            const response = await supplierPOAPI.getVerificationSupplierPO(roleId, userId, ccType);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Supplier POs');
        }
    }
);

// 2. Fetch Supplier PO by PO Number and Indent Number
export const fetchSupplierPOByNo = createAsyncThunk(
    'supplierpo/fetchSupplierPOByNo',
    async ({ poNo, indentNo }, { rejectWithValue }) => {
        try {
            const response = await supplierPOAPI.getVerificationSupplierPObyPO(poNo, indentNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier PO Data');
        }
    }
);

// 3. Approve Supplier PO
export const approveSupplierPO = createAsyncThunk(
    'supplierpo/approveSupplierPO',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await supplierPOAPI.approveSupplierPO(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Supplier PO');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationSupplierPOs: [],
    supplierPOData: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verificationSupplierPOs: false,
        supplierPOData: false,
        approveSupplierPO: false,
    },

    // Error states for each API
    errors: {
        verificationSupplierPOs: null,
        supplierPOData: null,
        approveSupplierPO: null,
    },

    // UI State
    selectedRoleId: null,
    selectedUserId: null,
    selectedCCType: null,
    selectedPONo: null,
    selectedIndentNo: null,
    selectedSupplierCode: null,
    approvalStatus: null,
};

// Supplier PO Slice
// ==================
const supplierPOSlice = createSlice({
    name: 'supplierpo',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected user ID
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        
        // Action to set selected CC Type
        setSelectedCCType: (state, action) => {
            state.selectedCCType = action.payload;
        },
        
        // Action to set selected PO number
        setSelectedPONo: (state, action) => {
            state.selectedPONo = action.payload;
        },
        
        // Action to set selected indent number
        setSelectedIndentNo: (state, action) => {
            state.selectedIndentNo = action.payload;
        },
        
        // Action to set selected supplier code
        setSelectedSupplierCode: (state, action) => {
            state.selectedSupplierCode = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset supplier PO data
        resetSupplierPOData: (state) => {
            state.supplierPOData = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all supplier PO data
        resetSupplierPOState: (state) => {
            state.verificationSupplierPOs = [];
            state.supplierPOData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedCCType = null;
            state.selectedPONo = null;
            state.selectedIndentNo = null;
            state.selectedSupplierCode = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Supplier POs - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationSupplierPOs.pending, (state) => {
                state.loading.verificationSupplierPOs = true;
                state.errors.verificationSupplierPOs = null;
            })
            .addCase(fetchVerificationSupplierPOs.fulfilled, (state, action) => {
                state.loading.verificationSupplierPOs = false;
                // Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verificationSupplierPOs = action.payload?.Data || [];
            })
            .addCase(fetchVerificationSupplierPOs.rejected, (state, action) => {
                state.loading.verificationSupplierPOs = false;
                state.errors.verificationSupplierPOs = action.payload;
                // Reset to empty array on error to prevent filter issues
                state.verificationSupplierPOs = [];
            })

        // 2. Supplier PO Data by PO Number and Indent Number - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchSupplierPOByNo.pending, (state) => {
                state.loading.supplierPOData = true;
                state.errors.supplierPOData = null;
            })
            .addCase(fetchSupplierPOByNo.fulfilled, (state, action) => {
                state.loading.supplierPOData = false;
                // Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.supplierPOData = action.payload?.Data || null;
            })
            .addCase(fetchSupplierPOByNo.rejected, (state, action) => {
                state.loading.supplierPOData = false;
                state.errors.supplierPOData = action.payload;
                // Reset on error
                state.supplierPOData = null;
            })

        // 3. Approve Supplier PO
        builder
            .addCase(approveSupplierPO.pending, (state) => {
                state.loading.approveSupplierPO = true;
                state.errors.approveSupplierPO = null;
            })
            .addCase(approveSupplierPO.fulfilled, (state, action) => {
                state.loading.approveSupplierPO = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveSupplierPO.rejected, (state, action) => {
                state.loading.approveSupplierPO = false;
                state.errors.approveSupplierPO = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedCCType,
    setSelectedPONo,
    setSelectedIndentNo,
    setSelectedSupplierCode,
    setApprovalStatus,
    resetSupplierPOData,
    clearError,
    resetSupplierPOState,
    clearApprovalResult
} = supplierPOSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationSupplierPOs = (state) => state.supplierpo.verificationSupplierPOs;
export const selectSupplierPOData = (state) => state.supplierpo.supplierPOData;
export const selectApprovalResult = (state) => state.supplierpo.approvalResult;

// Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationSupplierPOsArray = (state) => {
    const pos = state.supplierpo.verificationSupplierPOs;
    return Array.isArray(pos) ? pos : [];
};

// Loading selectors
export const selectLoading = (state) => state.supplierpo.loading;
export const selectVerificationSupplierPOsLoading = (state) => state.supplierpo.loading.verificationSupplierPOs;
export const selectSupplierPODataLoading = (state) => state.supplierpo.loading.supplierPOData;
export const selectApproveSupplierPOLoading = (state) => state.supplierpo.loading.approveSupplierPO;

// Error selectors
export const selectErrors = (state) => state.supplierpo.errors;
export const selectVerificationSupplierPOsError = (state) => state.supplierpo.errors.verificationSupplierPOs;
export const selectSupplierPODataError = (state) => state.supplierpo.errors.supplierPOData;
export const selectApproveSupplierPOError = (state) => state.supplierpo.errors.approveSupplierPO;

// UI State selectors
export const selectSelectedRoleId = (state) => state.supplierpo.selectedRoleId;
export const selectSelectedUserId = (state) => state.supplierpo.selectedUserId;
export const selectSelectedCCType = (state) => state.supplierpo.selectedCCType;
export const selectSelectedPONo = (state) => state.supplierpo.selectedPONo;
export const selectSelectedIndentNo = (state) => state.supplierpo.selectedIndentNo;
export const selectSelectedSupplierCode = (state) => state.supplierpo.selectedSupplierCode;
export const selectApprovalStatus = (state) => state.supplierpo.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.supplierpo.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.supplierpo.errors).some(error => error !== null);

// Specific combined selectors with safe array handling
export const selectSupplierPOSummary = (state) => {
    const posArray = Array.isArray(state.supplierpo.verificationSupplierPOs) ? state.supplierpo.verificationSupplierPOs : [];
    
    return {
        totalPOs: posArray.length,
        selectedPO: state.supplierpo.supplierPOData,
        approvalStatus: state.supplierpo.approvalStatus,
        isProcessing: state.supplierpo.loading.approveSupplierPO,
        hasPOs: posArray.length > 0
    };
};

// Supplier PO specific selectors
export const selectSupplierPODetails = (state) => {
    const posArray = Array.isArray(state.supplierpo.verificationSupplierPOs) ? state.supplierpo.verificationSupplierPOs : [];
    
    return {
        pos: posArray,
        totalPOs: posArray.length,
        selectedPOData: state.supplierpo.supplierPOData,
        isLoading: state.supplierpo.loading.supplierPOData,
        error: state.supplierpo.errors.supplierPOData,
        hasPOs: posArray.length > 0,
        isEmpty: posArray.length === 0 && !state.supplierpo.loading.verificationSupplierPOs
    };
};

// Export reducer
export default supplierPOSlice.reducer;