import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as supplierInvoiceAPI from '../../api/VendorInvoiceAPI/supplierInvoiceVerificationAPI';

// Async Thunks for 3 Supplier Invoice APIs
// =========================================

// 1. Fetch Verification Supplier Invoices by Role ID and User ID
export const fetchVerificationSupplierInvoices = createAsyncThunk(
    'supplierinvoice/fetchVerificationSupplierInvoices',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await supplierInvoiceAPI.getVerificationSupplierInvoice(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Supplier Invoices');
        }
    }
);

// 2. Fetch Supplier Invoice by Invoice Number
export const fetchSupplierInvoiceByNo = createAsyncThunk(
    'supplierinvoice/fetchSupplierInvoiceByNo',
    async (invoiceNo, { rejectWithValue }) => {
        try {
            const response = await supplierInvoiceAPI.getSupplierInvoiceByNo(invoiceNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Supplier Invoice Data');
        }
    }
);

// 3. Approve Supplier Invoice
export const approveSupplierInvoice = createAsyncThunk(
    'supplierinvoice/approveSupplierInvoice',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await supplierInvoiceAPI.approveSupplierInvoice(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Supplier Invoice');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verificationSupplierInvoices: [],
    supplierInvoiceData: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        verificationSupplierInvoices: false,
        supplierInvoiceData: false,
        approveSupplierInvoice: false,
    },

    // Error states for each API
    errors: {
        verificationSupplierInvoices: null,
        supplierInvoiceData: null,
        approveSupplierInvoice: null,
    },

    // UI State
    selectedRoleId: null,
    selectedUserId: null,
    selectedInvoiceNo: null,
    selectedSupplierCode: null,
    approvalStatus: null,
};

// Supplier Invoice Slice
// ======================
const supplierInvoiceSlice = createSlice({
    name: 'supplierinvoice',
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
        
        // Action to set selected invoice number
        setSelectedInvoiceNo: (state, action) => {
            state.selectedInvoiceNo = action.payload;
        },
        
        // Action to set selected supplier code
        setSelectedSupplierCode: (state, action) => {
            state.selectedSupplierCode = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset supplier invoice data
        resetSupplierInvoiceData: (state) => {
            state.supplierInvoiceData = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all supplier invoice data
        resetSupplierInvoiceState: (state) => {
            state.verificationSupplierInvoices = [];
            state.supplierInvoiceData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedInvoiceNo = null;
            state.selectedSupplierCode = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verification Supplier Invoices - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerificationSupplierInvoices.pending, (state) => {
                state.loading.verificationSupplierInvoices = true;
                state.errors.verificationSupplierInvoices = null;
            })
            .addCase(fetchVerificationSupplierInvoices.fulfilled, (state, action) => {
                state.loading.verificationSupplierInvoices = false;
                // Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verificationSupplierInvoices = action.payload?.Data || [];
            })
            .addCase(fetchVerificationSupplierInvoices.rejected, (state, action) => {
                state.loading.verificationSupplierInvoices = false;
                state.errors.verificationSupplierInvoices = action.payload;
                // Reset to empty array on error to prevent filter issues
                state.verificationSupplierInvoices = [];
            })

        // 2. Supplier Invoice Data by Invoice Number - HANDLES API RESPONSE STRUCTURE
        builder
            .addCase(fetchSupplierInvoiceByNo.pending, (state) => {
                state.loading.supplierInvoiceData = true;
                state.errors.supplierInvoiceData = null;
            })
            .addCase(fetchSupplierInvoiceByNo.fulfilled, (state, action) => {
                state.loading.supplierInvoiceData = false;
                // Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.supplierInvoiceData = action.payload?.Data || null;
            })
            .addCase(fetchSupplierInvoiceByNo.rejected, (state, action) => {
                state.loading.supplierInvoiceData = false;
                state.errors.supplierInvoiceData = action.payload;
                // Reset on error
                state.supplierInvoiceData = null;
            })

        // 3. Approve Supplier Invoice
        builder
            .addCase(approveSupplierInvoice.pending, (state) => {
                state.loading.approveSupplierInvoice = true;
                state.errors.approveSupplierInvoice = null;
            })
            .addCase(approveSupplierInvoice.fulfilled, (state, action) => {
                state.loading.approveSupplierInvoice = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveSupplierInvoice.rejected, (state, action) => {
                state.loading.approveSupplierInvoice = false;
                state.errors.approveSupplierInvoice = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedInvoiceNo,
    setSelectedSupplierCode,
    setApprovalStatus,
    resetSupplierInvoiceData,
    clearError,
    resetSupplierInvoiceState,
    clearApprovalResult
} = supplierInvoiceSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerificationSupplierInvoices = (state) => state.supplierinvoice.verificationSupplierInvoices;
export const selectSupplierInvoiceData = (state) => state.supplierinvoice.supplierInvoiceData;
export const selectApprovalResult = (state) => state.supplierinvoice.approvalResult;

// Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerificationSupplierInvoicesArray = (state) => {
    const invoices = state.supplierinvoice.verificationSupplierInvoices;
    return Array.isArray(invoices) ? invoices : [];
};

// Loading selectors
export const selectLoading = (state) => state.supplierinvoice.loading;
export const selectVerificationSupplierInvoicesLoading = (state) => state.supplierinvoice.loading.verificationSupplierInvoices;
export const selectSupplierInvoiceDataLoading = (state) => state.supplierinvoice.loading.supplierInvoiceData;
export const selectApproveSupplierInvoiceLoading = (state) => state.supplierinvoice.loading.approveSupplierInvoice;

// Error selectors
export const selectErrors = (state) => state.supplierinvoice.errors;
export const selectVerificationSupplierInvoicesError = (state) => state.supplierinvoice.errors.verificationSupplierInvoices;
export const selectSupplierInvoiceDataError = (state) => state.supplierinvoice.errors.supplierInvoiceData;
export const selectApproveSupplierInvoiceError = (state) => state.supplierinvoice.errors.approveSupplierInvoice;

// UI State selectors
export const selectSelectedRoleId = (state) => state.supplierinvoice.selectedRoleId;
export const selectSelectedUserId = (state) => state.supplierinvoice.selectedUserId;
export const selectSelectedInvoiceNo = (state) => state.supplierinvoice.selectedInvoiceNo;
export const selectSelectedSupplierCode = (state) => state.supplierinvoice.selectedSupplierCode;
export const selectApprovalStatus = (state) => state.supplierinvoice.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.supplierinvoice.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.supplierinvoice.errors).some(error => error !== null);

// Specific combined selectors with safe array handling
export const selectSupplierInvoiceSummary = (state) => {
    const invoicesArray = Array.isArray(state.supplierinvoice.verificationSupplierInvoices) ? state.supplierinvoice.verificationSupplierInvoices : [];
    
    return {
        totalInvoices: invoicesArray.length,
        selectedInvoice: state.supplierinvoice.supplierInvoiceData,
        approvalStatus: state.supplierinvoice.approvalStatus,
        isProcessing: state.supplierinvoice.loading.approveSupplierInvoice,
        hasInvoices: invoicesArray.length > 0
    };
};

// Supplier Invoice specific selectors
export const selectSupplierInvoiceDetails = (state) => {
    const invoicesArray = Array.isArray(state.supplierinvoice.verificationSupplierInvoices) ? state.supplierinvoice.verificationSupplierInvoices : [];
    
    return {
        invoices: invoicesArray,
        totalInvoices: invoicesArray.length,
        selectedInvoiceData: state.supplierinvoice.supplierInvoiceData,
        isLoading: state.supplierinvoice.loading.supplierInvoiceData,
        error: state.supplierinvoice.errors.supplierInvoiceData,
        hasInvoices: invoicesArray.length > 0,
        isEmpty: invoicesArray.length === 0 && !state.supplierinvoice.loading.verificationSupplierInvoices
    };
};

// Export reducer
export default supplierInvoiceSlice.reducer;