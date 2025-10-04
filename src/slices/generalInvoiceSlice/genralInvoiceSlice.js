import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as generalInvoiceAPI from '../../api/GeneralInvoiceAPI/generalInvoiceAPI';

// Async Thunks
export const fetchVerificationGeneralInvoice = createAsyncThunk(
    'generalInvoice/fetchVerificationGeneralInvoice',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await generalInvoiceAPI.getVerificationGeneralInvoice(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification General Invoice');
        }
    }
);

export const fetchGeneralInvoiceByNo = createAsyncThunk(
    'generalInvoice/fetchGeneralInvoiceByNo',
    async (invNo, { rejectWithValue }) => {
        try {
            const response = await generalInvoiceAPI.getGeneralInvoiceByNo(invNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch General Invoice Data');
        }
    }
);

export const approveGeneralInvoice = createAsyncThunk(
    'generalInvoice/approveGeneralInvoice',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await generalInvoiceAPI.approveGeneralInvoice(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve General Invoice');
        }
    }
);

const initialState = {
    verificationGeneralInvoices: [],
    invoiceData: null,
    approvalResult: null,
    loading: {
        verificationGeneralInvoices: false,
        invoiceData: false,
        approveGeneralInvoice: false,
    },
    errors: {
        verificationGeneralInvoices: null,
        invoiceData: null,
        approveGeneralInvoice: null,
    },
    selectedRoleId: null,
    selectedInvNo: null,
    selectedUserId: null,
    approvalStatus: null,
};

const generalInvoiceSlice = createSlice({
    name: 'generalInvoice',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedInvNo: (state, action) => {
            state.selectedInvNo = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetInvoiceData: (state) => {
            state.invoiceData = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetGeneralInvoiceState: (state) => {
            state.verificationGeneralInvoices = [];
            state.invoiceData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedInvNo = null;
            state.selectedUserId = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerificationGeneralInvoice.pending, (state) => {
                state.loading.verificationGeneralInvoices = true;
                state.errors.verificationGeneralInvoices = null;
            })
            .addCase(fetchVerificationGeneralInvoice.fulfilled, (state, action) => {
                state.loading.verificationGeneralInvoices = false;
                state.verificationGeneralInvoices = action.payload?.Data || [];
            })
            .addCase(fetchVerificationGeneralInvoice.rejected, (state, action) => {
                state.loading.verificationGeneralInvoices = false;
                state.errors.verificationGeneralInvoices = action.payload;
                state.verificationGeneralInvoices = [];
            })

            .addCase(fetchGeneralInvoiceByNo.pending, (state) => {
                state.loading.invoiceData = true;
                state.errors.invoiceData = null;
            })
            .addCase(fetchGeneralInvoiceByNo.fulfilled, (state, action) => {
                state.loading.invoiceData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemDescList: apiResponse.Data.ItemDescList 
                            ? [...apiResponse.Data.ItemDescList.map(item => ({...item}))]
                            : []
                    };
                    state.invoiceData = extractedData;
                } else {
                    state.invoiceData = null;
                }
            })
            .addCase(fetchGeneralInvoiceByNo.rejected, (state, action) => {
                state.loading.invoiceData = false;
                state.errors.invoiceData = action.payload;
                state.invoiceData = null;
            })

            .addCase(approveGeneralInvoice.pending, (state) => {
                state.loading.approveGeneralInvoice = true;
                state.errors.approveGeneralInvoice = null;
            })
            .addCase(approveGeneralInvoice.fulfilled, (state, action) => {
                state.loading.approveGeneralInvoice = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveGeneralInvoice.rejected, (state, action) => {
                state.loading.approveGeneralInvoice = false;
                state.errors.approveGeneralInvoice = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedInvNo,
    setSelectedUserId,
    setApprovalStatus,
    resetInvoiceData,
    clearError,
    resetGeneralInvoiceState,
    clearApprovalResult
} = generalInvoiceSlice.actions;

// Selectors
export const selectVerificationGeneralInvoices = (state) => state.generalInvoice.verificationGeneralInvoices;
export const selectInvoiceData = (state) => state.generalInvoice.invoiceData;
export const selectApprovalResult = (state) => state.generalInvoice.approvalResult;
export const selectVerificationGeneralInvoicesArray = (state) => {
    const invoices = state.generalInvoice.verificationGeneralInvoices;
    return Array.isArray(invoices) ? invoices : [];
};

export const selectLoading = (state) => state.generalInvoice.loading;
export const selectVerificationGeneralInvoicesLoading = (state) => state.generalInvoice.loading.verificationGeneralInvoices;
export const selectInvoiceDataLoading = (state) => state.generalInvoice.loading.invoiceData;
export const selectApproveGeneralInvoiceLoading = (state) => state.generalInvoice.loading.approveGeneralInvoice;

export const selectErrors = (state) => state.generalInvoice.errors;
export const selectVerificationGeneralInvoicesError = (state) => state.generalInvoice.errors.verificationGeneralInvoices;
export const selectInvoiceDataError = (state) => state.generalInvoice.errors.invoiceData;
export const selectApproveGeneralInvoiceError = (state) => state.generalInvoice.errors.approveGeneralInvoice;

export const selectSelectedRoleId = (state) => state.generalInvoice.selectedRoleId;
export const selectSelectedInvNo = (state) => state.generalInvoice.selectedInvNo;
export const selectSelectedUserId = (state) => state.generalInvoice.selectedUserId;
export const selectApprovalStatus = (state) => state.generalInvoice.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.generalInvoice.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.generalInvoice.errors).some(error => error !== null);

export const selectGeneralInvoiceSummary = (state) => {
    const invoicesArray = Array.isArray(state.generalInvoice.verificationGeneralInvoices) ? state.generalInvoice.verificationGeneralInvoices : [];
    return {
        totalInvoices: invoicesArray.length,
        selectedInvoice: state.generalInvoice.invoiceData,
        approvalStatus: state.generalInvoice.approvalStatus,
        isProcessing: state.generalInvoice.loading.approveGeneralInvoice,
        hasInvoices: invoicesArray.length > 0
    };
};

export const selectGeneralInvoiceDetails = (state) => {
    const invoicesArray = Array.isArray(state.generalInvoice.verificationGeneralInvoices) ? state.generalInvoice.verificationGeneralInvoices : [];
    return {
        invoices: invoicesArray,
        totalInvoices: invoicesArray.length,
        selectedInvoiceData: state.generalInvoice.invoiceData,
        isLoading: state.generalInvoice.loading.invoiceData,
        error: state.generalInvoice.errors.invoiceData,
        hasInvoices: invoicesArray.length > 0,
        isEmpty: invoicesArray.length === 0 && !state.generalInvoice.loading.verificationGeneralInvoices
    };
};

export default generalInvoiceSlice.reducer;