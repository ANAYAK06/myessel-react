import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as vendorPaymentAPI from '../../api/VendorPaymentAPI/vendorPaymentAPI';

// Async Thunks for 3 Vendor Payment APIs
// =======================================

// 1. Fetch Verification Vendor Payments by Role ID
export const fetchVerificationVendorPayments = createAsyncThunk(
    'vendorpayment/fetchVerificationVendorPayments',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await vendorPaymentAPI.getVerificationVendorPayments(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Vendor Payments');
        }
    }
);

// 2. Fetch Verification Vendor Payment by Reference Number
export const fetchVerificationVendorPayByRefno = createAsyncThunk(
    'vendorpayment/fetchVerificationVendorPayByRefno',
    async (params, { rejectWithValue }) => {
        try {
            const response = await vendorPaymentAPI.getVerificationVendorPayByRefno(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Vendor Payment Data');
        }
    }
);

// 3. Approve Vendor Payment
export const approveVendorPayment = createAsyncThunk(
    'vendorpayment/approveVendorPayment',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await vendorPaymentAPI.approveVendorPayment(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Vendor Payment');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationVendorPayments: [],
    verificationVendorPaymentData: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verificationVendorPayments: false,
        verificationVendorPaymentData: false,
        approveVendorPayment: false,
    },

    // Error states for each API
    errors: {
        verificationVendorPayments: null,
        verificationVendorPaymentData: null,
        approveVendorPayment: null,
    },

    // UI State
    selectedRoleId: null,
    selectedRefNo: null,
    selectedTransType: null,
    selectedVendorCode: null,
    approvalStatus: null,
};

// Vendor Payment Slice
// ====================
const vendorPaymentSlice = createSlice({
    name: 'vendorpayment',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected reference number
        setSelectedRefNo: (state, action) => {
            state.selectedRefNo = action.payload;
        },
        
        // Action to set selected transaction type
        setSelectedTransType: (state, action) => {
            state.selectedTransType = action.payload;
        },
        
        // Action to set selected vendor code
        setSelectedVendorCode: (state, action) => {
            state.selectedVendorCode = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset verification vendor payment data
        resetVerificationVendorPaymentData: (state) => {
            state.verificationVendorPaymentData = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all vendor payment data
        resetVendorPaymentData: (state) => {
            state.verificationVendorPayments = [];
            state.verificationVendorPaymentData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedRefNo = null;
            state.selectedTransType = null;
            state.selectedVendorCode = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Vendor Payments - UPDATED TO HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationVendorPayments.pending, (state) => {
                state.loading.verificationVendorPayments = true;
                state.errors.verificationVendorPayments = null;
            })
            .addCase(fetchVerificationVendorPayments.fulfilled, (state, action) => {
                state.loading.verificationVendorPayments = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verificationVendorPayments = action.payload?.Data || [];
            })
            .addCase(fetchVerificationVendorPayments.rejected, (state, action) => {
                state.loading.verificationVendorPayments = false;
                state.errors.verificationVendorPayments = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verificationVendorPayments = [];
            })

        // 2. Verification Vendor Payment Data by RefNo - UPDATED TO HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationVendorPayByRefno.pending, (state) => {
                state.loading.verificationVendorPaymentData = true;
                state.errors.verificationVendorPaymentData = null;
            })
            .addCase(fetchVerificationVendorPayByRefno.fulfilled, (state, action) => {
                state.loading.verificationVendorPaymentData = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.verificationVendorPaymentData = action.payload?.Data || null;
            })
            .addCase(fetchVerificationVendorPayByRefno.rejected, (state, action) => {
                state.loading.verificationVendorPaymentData = false;
                state.errors.verificationVendorPaymentData = action.payload;
                // 🔧 FIXED: Reset on error
                state.verificationVendorPaymentData = null;
            })

        // 3. Approve Vendor Payment
        builder
            .addCase(approveVendorPayment.pending, (state) => {
                state.loading.approveVendorPayment = true;
                state.errors.approveVendorPayment = null;
            })
            .addCase(approveVendorPayment.fulfilled, (state, action) => {
                state.loading.approveVendorPayment = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveVendorPayment.rejected, (state, action) => {
                state.loading.approveVendorPayment = false;
                state.errors.approveVendorPayment = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedRefNo,
    setSelectedTransType,
    setSelectedVendorCode,
    setApprovalStatus,
    resetVerificationVendorPaymentData,
    clearError,
    resetVendorPaymentData,
    clearApprovalResult
} = vendorPaymentSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationVendorPayments = (state) => state.vendorpayment.verificationVendorPayments;
export const selectVerificationVendorPaymentData = (state) => state.vendorpayment.verificationVendorPaymentData;
export const selectApprovalResult = (state) => state.vendorpayment.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationVendorPaymentsArray = (state) => {
    const payments = state.vendorpayment.verificationVendorPayments;
    return Array.isArray(payments) ? payments : [];
};

// Loading selectors
export const selectLoading = (state) => state.vendorpayment.loading;
export const selectVerificationVendorPaymentsLoading = (state) => state.vendorpayment.loading.verificationVendorPayments;
export const selectVerificationVendorPaymentDataLoading = (state) => state.vendorpayment.loading.verificationVendorPaymentData;
export const selectApproveVendorPaymentLoading = (state) => state.vendorpayment.loading.approveVendorPayment;

// Error selectors
export const selectErrors = (state) => state.vendorpayment.errors;
export const selectVerificationVendorPaymentsError = (state) => state.vendorpayment.errors.verificationVendorPayments;
export const selectVerificationVendorPaymentDataError = (state) => state.vendorpayment.errors.verificationVendorPaymentData;
export const selectApproveVendorPaymentError = (state) => state.vendorpayment.errors.approveVendorPayment;

// UI State selectors
export const selectSelectedRoleId = (state) => state.vendorpayment.selectedRoleId;
export const selectSelectedRefNo = (state) => state.vendorpayment.selectedRefNo;
export const selectSelectedTransType = (state) => state.vendorpayment.selectedTransType;
export const selectSelectedVendorCode = (state) => state.vendorpayment.selectedVendorCode;
export const selectApprovalStatus = (state) => state.vendorpayment.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.vendorpayment.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.vendorpayment.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectVendorPaymentSummary = (state) => {
    const paymentsArray = Array.isArray(state.vendorpayment.verificationVendorPayments) ? state.vendorpayment.verificationVendorPayments : [];
    
    return {
        totalPayments: paymentsArray.length,
        selectedPayment: state.vendorpayment.verificationVendorPaymentData,
        approvalStatus: state.vendorpayment.approvalStatus,
        isProcessing: state.vendorpayment.loading.approveVendorPayment,
        hasPayments: paymentsArray.length > 0
    };
};

// Vendor Payment specific selectors
export const selectVendorPaymentDetails = (state) => {
    const paymentsArray = Array.isArray(state.vendorpayment.verificationVendorPayments) ? state.vendorpayment.verificationVendorPayments : [];
    
    return {
        payments: paymentsArray,
        totalPayments: paymentsArray.length,
        selectedPaymentData: state.vendorpayment.verificationVendorPaymentData,
        isLoading: state.vendorpayment.loading.verificationVendorPaymentData,
        error: state.vendorpayment.errors.verificationVendorPaymentData,
        hasPayments: paymentsArray.length > 0,
        isEmpty: paymentsArray.length === 0 && !state.vendorpayment.loading.verificationVendorPayments
    };
};

// Export reducer
export default vendorPaymentSlice.reducer;