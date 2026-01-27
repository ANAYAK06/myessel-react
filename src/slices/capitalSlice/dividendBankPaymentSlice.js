import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dividendBankPaymentAPI from '../../api/CapitalAPI/dividendBankPaymentApi';

// Async Thunks for Dividend Bank Payment APIs
// ============================================

// 1. Get Approved Distributions for Payment
export const fetchApprovedDistributionsForPayment = createAsyncThunk(
    'dividendBankPayment/fetchApprovedDistributionsForPayment',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Approved Distributions for Payment');
            const response = await dividendBankPaymentAPI.getApprovedDistributionsForPayment();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Approved Distributions for Payment');
        }
    }
);

// 2. Insert Dividend Bank Payment
export const insertDividendBankPayment = createAsyncThunk(
    'dividendBankPayment/insertDividendBankPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Inserting Dividend Bank Payment with data:', paymentData);
            const response = await dividendBankPaymentAPI.insertDividendBankPayment(paymentData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to insert Dividend Bank Payment');
        }
    }
);

// 3. Approve/Verify/Reject Dividend Bank Payment
export const approveDividendBankPayment = createAsyncThunk(
    'dividendBankPayment/approveDividendBankPayment',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Processing Dividend Bank Payment approval with data:', approvalData);
            const response = await dividendBankPaymentAPI.approveDividendBankPayment(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Dividend Bank Payment approval');
        }
    }
);

// 4. Fetch Verify Dividend Bank Payment Inbox by Role ID
export const fetchVerifyDividendBankPayment = createAsyncThunk(
    'dividendBankPayment/fetchVerifyDividendBankPayment',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Dividend Bank Payment Inbox for RoleID:', roleId);
            const response = await dividendBankPaymentAPI.getVerifyDividendBankPayment({ roleId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Bank Payment Verification Inbox');
        }
    }
);

// 5. Fetch Dividend Bank Payment Details by Reference Number
export const fetchDividendBankPaymentByRefno = createAsyncThunk(
    'dividendBankPayment/fetchDividendBankPaymentByRefno',
    async (transactionRefno, { rejectWithValue }) => {  // ✅ Receives transactionRefno directly
        try {
            console.log('🔄 Thunk: Fetching Dividend Bank Payment Details for RefNo:', transactionRefno);
            const response = await dividendBankPaymentAPI.getDividendBankPaymentByRefno({ transactionRefno });  
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Dividend Bank Payment Details');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    approvedDistributions: [],
    verifyDividendBankPaymentInbox: [],
    dividendBankPaymentDetails: {
        paymentMaster: null,
        shareholderDetails: [],
        bankTransactionInfo: null
    },
    insertResult: null,
    approvalResult: null,

    // Loading states for each API
    loading: {
        approvedDistributions: false,
        insertDividendBankPayment: false,
        approveDividendBankPayment: false,
        verifyDividendBankPayment: false,
        dividendBankPaymentDetails: false,
    },

    // Error states for each API
    errors: {
        approvedDistributions: null,
        insertDividendBankPayment: null,
        approveDividendBankPayment: null,
        verifyDividendBankPayment: null,
        dividendBankPaymentDetails: null,
    },

    // UI State
    selectedDistributionId: null,
    selectedBankId: null,
    selectedRoleId: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
    paymentMode: null,
};

// Dividend Bank Payment Slice
// ============================
const dividendBankPaymentSlice = createSlice({
    name: 'dividendBankPayment',
    initialState,
    reducers: {
        // Action to set selected distribution ID
        setSelectedDistributionId: (state, action) => {
            state.selectedDistributionId = action.payload;
        },

        // Action to set selected bank ID
        setSelectedBankId: (state, action) => {
            state.selectedBankId = action.payload;
        },

        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected transaction reference number
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },

        // Action to set payment mode
        setPaymentMode: (state, action) => {
            state.paymentMode = action.payload;
        },
        
        // Action to reset dividend bank payment details
        resetDividendBankPaymentDetails: (state) => {
            state.dividendBankPaymentDetails = {
                paymentMaster: null,
                shareholderDetails: [],
                bankTransactionInfo: null
            };
            state.approvalResult = null;
        },

        // Action to clear insert result
        clearInsertResult: (state) => {
            state.insertResult = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },

        // Action to clear approved distributions
        clearApprovedDistributions: (state) => {
            state.approvedDistributions = [];
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all dividend bank payment data
        resetDividendBankPaymentData: (state) => {
            state.approvedDistributions = [];
            state.verifyDividendBankPaymentInbox = [];
            state.dividendBankPaymentDetails = {
                paymentMaster: null,
                shareholderDetails: [],
                bankTransactionInfo: null
            };
            state.insertResult = null;
            state.approvalResult = null;
            state.selectedDistributionId = null;
            state.selectedBankId = null;
            state.selectedRoleId = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus = null;
            state.paymentMode = null;
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch Approved Distributions for Payment - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchApprovedDistributionsForPayment.pending, (state) => {
                state.loading.approvedDistributions = true;
                state.errors.approvedDistributions = null;
            })
            .addCase(fetchApprovedDistributionsForPayment.fulfilled, (state, action) => {
                state.loading.approvedDistributions = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.approvedDistributions = action.payload?.Data || [];
            })
            .addCase(fetchApprovedDistributionsForPayment.rejected, (state, action) => {
                state.loading.approvedDistributions = false;
                state.errors.approvedDistributions = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.approvedDistributions = [];
            })

        // 2. Insert Dividend Bank Payment - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(insertDividendBankPayment.pending, (state) => {
                state.loading.insertDividendBankPayment = true;
                state.errors.insertDividendBankPayment = null;
            })
            .addCase(insertDividendBankPayment.fulfilled, (state, action) => {
                state.loading.insertDividendBankPayment = false;
                // 🔧 Extract Data from API response
                // API returns: { Data: "Submited$958672403", IsSuccessful: true, ResponseCode: 200 }
                state.insertResult = action.payload?.Data || action.payload;
            })
            .addCase(insertDividendBankPayment.rejected, (state, action) => {
                state.loading.insertDividendBankPayment = false;
                state.errors.insertDividendBankPayment = action.payload;
                state.insertResult = null;
            })

        // 3. Approve Dividend Bank Payment - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(approveDividendBankPayment.pending, (state) => {
                state.loading.approveDividendBankPayment = true;
                state.errors.approveDividendBankPayment = null;
            })
            .addCase(approveDividendBankPayment.fulfilled, (state, action) => {
                state.loading.approveDividendBankPayment = false;
                // 🔧 Extract Data from API response
                state.approvalResult = action.payload?.Data || action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveDividendBankPayment.rejected, (state, action) => {
                state.loading.approveDividendBankPayment = false;
                state.errors.approveDividendBankPayment = action.payload;
            })

        // 4. Verify Dividend Bank Payment Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyDividendBankPayment.pending, (state) => {
                state.loading.verifyDividendBankPayment = true;
                state.errors.verifyDividendBankPayment = null;
            })
            .addCase(fetchVerifyDividendBankPayment.fulfilled, (state, action) => {
                state.loading.verifyDividendBankPayment = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true, ResponseCode: 200 }
                state.verifyDividendBankPaymentInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyDividendBankPayment.rejected, (state, action) => {
                state.loading.verifyDividendBankPayment = false;
                state.errors.verifyDividendBankPayment = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.verifyDividendBankPaymentInbox = [];
            })

        // 5. Dividend Bank Payment Details by RefNo - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchDividendBankPaymentByRefno.pending, (state) => {
                state.loading.dividendBankPaymentDetails = true;
                state.errors.dividendBankPaymentDetails = null;
            })
            .addCase(fetchDividendBankPaymentByRefno.fulfilled, (state, action) => {
                state.loading.dividendBankPaymentDetails = false;
                // 🔧 Extract nested Data from API response
                // API returns: { Data: { PaymentMaster: {...}, ShareholderDetails: [...], BankTransactionInfo: {...} }, IsSuccessful: true }
                const data = action.payload?.Data;
                if (data) {
                    state.dividendBankPaymentDetails = {
                        paymentMaster: data.PaymentMaster || null,
                        shareholderDetails: data.ShareholderDetails || [],
                        bankTransactionInfo: data.BankTransactionInfo || null
                    };
                }
            })
            .addCase(fetchDividendBankPaymentByRefno.rejected, (state, action) => {
                state.loading.dividendBankPaymentDetails = false;
                state.errors.dividendBankPaymentDetails = action.payload;
                // 🔧 Reset on error
                state.dividendBankPaymentDetails = {
                    paymentMaster: null,
                    shareholderDetails: [],
                    bankTransactionInfo: null
                };
            });
    },
});

// Export actions
export const { 
    setSelectedDistributionId,
    setSelectedBankId,
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    setPaymentMode,
    resetDividendBankPaymentDetails,
    clearInsertResult,
    clearApprovalResult,
    clearApprovedDistributions,
    clearError,
    resetDividendBankPaymentData,
} = dividendBankPaymentSlice.actions;

// Selectors
// =========

// Data selectors
export const selectApprovedDistributions = (state) => 
    state.dividendBankPayment.approvedDistributions;
export const selectVerifyDividendBankPaymentInbox = (state) => 
    state.dividendBankPayment.verifyDividendBankPaymentInbox;
export const selectDividendBankPaymentDetails = (state) => 
    state.dividendBankPayment.dividendBankPaymentDetails;
export const selectPaymentMaster = (state) => 
    state.dividendBankPayment.dividendBankPaymentDetails.paymentMaster;
export const selectShareholderDetails = (state) => 
    state.dividendBankPayment.dividendBankPaymentDetails.shareholderDetails;
export const selectBankTransactionInfo = (state) => 
    state.dividendBankPayment.dividendBankPaymentDetails.bankTransactionInfo;
export const selectInsertResult = (state) => 
    state.dividendBankPayment.insertResult;
export const selectApprovalResult = (state) => 
    state.dividendBankPayment.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectApprovedDistributionsArray = (state) => {
    const distributions = state.dividendBankPayment.approvedDistributions;
    return Array.isArray(distributions) ? distributions : [];
};

export const selectVerifyDividendBankPaymentInboxArray = (state) => {
    const inbox = state.dividendBankPayment.verifyDividendBankPaymentInbox;
    return Array.isArray(inbox) ? inbox : [];
};

export const selectShareholderDetailsArray = (state) => {
    const details = state.dividendBankPayment.dividendBankPaymentDetails.shareholderDetails;
    return Array.isArray(details) ? details : [];
};

// Loading selectors
export const selectLoading = (state) => state.dividendBankPayment.loading;
export const selectApprovedDistributionsLoading = (state) => 
    state.dividendBankPayment.loading.approvedDistributions;
export const selectInsertDividendBankPaymentLoading = (state) => 
    state.dividendBankPayment.loading.insertDividendBankPayment;
export const selectApproveDividendBankPaymentLoading = (state) => 
    state.dividendBankPayment.loading.approveDividendBankPayment;
export const selectVerifyDividendBankPaymentLoading = (state) => 
    state.dividendBankPayment.loading.verifyDividendBankPayment;
export const selectDividendBankPaymentDetailsLoading = (state) => 
    state.dividendBankPayment.loading.dividendBankPaymentDetails;

// Error selectors
export const selectErrors = (state) => state.dividendBankPayment.errors;
export const selectApprovedDistributionsError = (state) => 
    state.dividendBankPayment.errors.approvedDistributions;
export const selectInsertDividendBankPaymentError = (state) => 
    state.dividendBankPayment.errors.insertDividendBankPayment;
export const selectApproveDividendBankPaymentError = (state) => 
    state.dividendBankPayment.errors.approveDividendBankPayment;
export const selectVerifyDividendBankPaymentError = (state) => 
    state.dividendBankPayment.errors.verifyDividendBankPayment;
export const selectDividendBankPaymentDetailsError = (state) => 
    state.dividendBankPayment.errors.dividendBankPaymentDetails;

// UI State selectors
export const selectSelectedDistributionId = (state) => 
    state.dividendBankPayment.selectedDistributionId;
export const selectSelectedBankId = (state) => 
    state.dividendBankPayment.selectedBankId;
export const selectSelectedRoleId = (state) => 
    state.dividendBankPayment.selectedRoleId;
export const selectSelectedTransactionRefno = (state) => 
    state.dividendBankPayment.selectedTransactionRefno;
export const selectApprovalStatus = (state) => 
    state.dividendBankPayment.approvalStatus;
export const selectPaymentMode = (state) => 
    state.dividendBankPayment.paymentMode;

// Combined selectors
export const selectIsAnyLoading = (state) => 
    Object.values(state.dividendBankPayment.loading).some(loading => loading);
export const selectHasAnyError = (state) => 
    Object.values(state.dividendBankPayment.errors).some(error => error !== null);

// 🔧 Specific combined selectors with safe array handling
export const selectDividendBankPaymentSummary = (state) => {
    const inboxArray = Array.isArray(state.dividendBankPayment.verifyDividendBankPaymentInbox) 
        ? state.dividendBankPayment.verifyDividendBankPaymentInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedPayment: state.dividendBankPayment.dividendBankPaymentDetails,
        approvalStatus: state.dividendBankPayment.approvalStatus,
        isProcessing: state.dividendBankPayment.loading.approveDividendBankPayment,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.dividendBankPayment.loading.verifyDividendBankPayment
    };
};

// Approved Distributions Summary
export const selectApprovedDistributionsSummary = (state) => {
    const distributions = Array.isArray(state.dividendBankPayment.approvedDistributions) 
        ? state.dividendBankPayment.approvedDistributions 
        : [];
    
    return {
        distributions,
        totalDistributions: distributions.length,
        isLoading: state.dividendBankPayment.loading.approvedDistributions,
        error: state.dividendBankPayment.errors.approvedDistributions,
        hasData: distributions.length > 0,
        isEmpty: distributions.length === 0 && !state.dividendBankPayment.loading.approvedDistributions
    };
};

// Dividend Bank Payment Details specific selector
export const selectDividendBankPaymentDetailsSummary = (state) => {
    const shareholderDetailsArray = Array.isArray(state.dividendBankPayment.dividendBankPaymentDetails.shareholderDetails) 
        ? state.dividendBankPayment.dividendBankPaymentDetails.shareholderDetails 
        : [];
    
    return {
        paymentMaster: state.dividendBankPayment.dividendBankPaymentDetails.paymentMaster,
        shareholderDetails: shareholderDetailsArray,
        bankTransactionInfo: state.dividendBankPayment.dividendBankPaymentDetails.bankTransactionInfo,
        totalShareholderDetails: shareholderDetailsArray.length,
        isLoading: state.dividendBankPayment.loading.dividendBankPaymentDetails,
        error: state.dividendBankPayment.errors.dividendBankPaymentDetails,
        hasDetails: state.dividendBankPayment.dividendBankPaymentDetails.paymentMaster !== null,
        isEmpty: state.dividendBankPayment.dividendBankPaymentDetails.paymentMaster === null 
            && !state.dividendBankPayment.loading.dividendBankPaymentDetails
    };
};

// Insert operation status selector
export const selectInsertOperationStatus = (state) => {
    return {
        result: state.dividendBankPayment.insertResult,
        isLoading: state.dividendBankPayment.loading.insertDividendBankPayment,
        error: state.dividendBankPayment.errors.insertDividendBankPayment,
        isSuccess: state.dividendBankPayment.insertResult !== null,
        isFailed: state.dividendBankPayment.errors.insertDividendBankPayment !== null
    };
};

// Approval operation status selector
export const selectApprovalOperationStatus = (state) => {
    return {
        result: state.dividendBankPayment.approvalResult,
        isLoading: state.dividendBankPayment.loading.approveDividendBankPayment,
        error: state.dividendBankPayment.errors.approveDividendBankPayment,
        isSuccess: state.dividendBankPayment.approvalResult !== null,
        isFailed: state.dividendBankPayment.errors.approveDividendBankPayment !== null,
        status: state.dividendBankPayment.approvalStatus
    };
};

// Selected Payment Info Summary
export const selectSelectedPaymentInfo = (state) => {
    return {
        distributionId: state.dividendBankPayment.selectedDistributionId,
        bankId: state.dividendBankPayment.selectedBankId,
        paymentMode: state.dividendBankPayment.paymentMode,
        transactionRefno: state.dividendBankPayment.selectedTransactionRefno,
        hasSelection: state.dividendBankPayment.selectedDistributionId !== null 
            && state.dividendBankPayment.selectedBankId !== null,
        isComplete: state.dividendBankPayment.selectedDistributionId !== null 
            && state.dividendBankPayment.selectedBankId !== null 
            && state.dividendBankPayment.paymentMode !== null
    };
};

// Export reducer
export default dividendBankPaymentSlice.reducer;