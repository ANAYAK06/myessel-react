import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffCMSPayVerificationAPI from '../../api/HRAPI/staffCMSPayVerificationAPI';

// Async Thunks for 3 CMS Pay Verification APIs
// =============================================

// 1. Fetch Verify CMS Pay Inbox by Role ID
export const fetchVerifyCMSPay = createAsyncThunk(
    'staffcmspayverification/fetchVerifyCMSPay',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify CMS Pay Inbox for RoleID:', roleId);
            const response = await staffCMSPayVerificationAPI.getVerifyCMSPay({ roleId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verify CMS Pay Inbox');
        }
    }
);

// 2. Fetch CMS Data by Transaction Number
export const fetchCMSDataByTransNo = createAsyncThunk(
    'staffcmspayverification/fetchCMSDataByTransNo',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching CMS Data by Transaction Number for:', params);
            const response = await staffCMSPayVerificationAPI.getCMSDataByTransNo(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch CMS Data by Transaction Number');
        }
    }
);

// 3. Approve CMS Pay
export const approveCMSPay = createAsyncThunk(
    'staffcmspayverification/approveCMSPay',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving CMS Pay with data:', approvalData);
            const response = await staffCMSPayVerificationAPI.approveCMSPay(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve CMS Pay');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyCMSPayInbox: [],
    cmsPayDetails: null,
    cmsReportData: [],
    approvalResult: null,

    // Loading states for each API
    loading: {
        verifyCMSPay: false,
        cmsPayDetails: false,
        approveCMSPay: false,
    },

    // Error states for each API
    errors: {
        verifyCMSPay: null,
        cmsPayDetails: null,
        approveCMSPay: null,
    },

    // UI State
    selectedRoleId: null,
    selectedCMSTransactionNo: null,
    selectedConsolidateNo: null,
    selectedTransactionRefno: null,
    approvalStatus: null,
};

// Staff CMS Pay Verification Slice
// =================================
const staffCMSPayVerificationSlice = createSlice({
    name: 'staffcmspayverification',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected CMS transaction number
        setSelectedCMSTransactionNo: (state, action) => {
            state.selectedCMSTransactionNo = action.payload;
        },

        // Action to set selected consolidate number
        setSelectedConsolidateNo: (state, action) => {
            state.selectedConsolidateNo = action.payload;
        },

        // Action to set selected transaction reference number
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset CMS pay details
        resetCMSPayDetails: (state) => {
            state.cmsPayDetails = null;
            state.cmsReportData = [];
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all CMS pay verification data
        resetCMSPayVerificationData: (state) => {
            state.verifyCMSPayInbox = [];
            state.cmsPayDetails = null;
            state.cmsReportData = [];
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedCMSTransactionNo = null;
            state.selectedConsolidateNo = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Verify CMS Pay Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyCMSPay.pending, (state) => {
                state.loading.verifyCMSPay = true;
                state.errors.verifyCMSPay = null;
            })
            .addCase(fetchVerifyCMSPay.fulfilled, (state, action) => {
                state.loading.verifyCMSPay = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: boolean, ResponseCode: number }
                console.log('✅ Fulfilled: Verify CMS Pay Inbox Response:', action.payload);
                state.verifyCMSPayInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyCMSPay.rejected, (state, action) => {
                state.loading.verifyCMSPay = false;
                state.errors.verifyCMSPay = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyCMSPayInbox = [];
            })

        // 2. CMS Data by Transaction Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchCMSDataByTransNo.pending, (state) => {
                state.loading.cmsPayDetails = true;
                state.errors.cmsPayDetails = null;
            })
            .addCase(fetchCMSDataByTransNo.fulfilled, (state, action) => {
                state.loading.cmsPayDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: { CMSPaymentFormat + CMSReportData }, IsSuccessful: boolean, ResponseCode: number }
                console.log('✅ Fulfilled: CMS Data by Transaction Number Response:', action.payload);
                const data = action.payload?.Data || null;
                
                if (data) {
                    // Store main CMS payment format data
                    state.cmsPayDetails = data;
                    // Store CMS report data separately for easier access
                    state.cmsReportData = data.CMSReportData || [];
                } else {
                    state.cmsPayDetails = null;
                    state.cmsReportData = [];
                }
            })
            .addCase(fetchCMSDataByTransNo.rejected, (state, action) => {
                state.loading.cmsPayDetails = false;
                state.errors.cmsPayDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.cmsPayDetails = null;
                state.cmsReportData = [];
            })

        // 3. Approve CMS Pay
        builder
            .addCase(approveCMSPay.pending, (state) => {
                state.loading.approveCMSPay = true;
                state.errors.approveCMSPay = null;
            })
            .addCase(approveCMSPay.fulfilled, (state, action) => {
                state.loading.approveCMSPay = false;
                console.log('✅ Fulfilled: Approve CMS Pay Response:', action.payload);
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveCMSPay.rejected, (state, action) => {
                state.loading.approveCMSPay = false;
                state.errors.approveCMSPay = action.payload;
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedCMSTransactionNo,
    setSelectedConsolidateNo,
    setSelectedTransactionRefno,
    setApprovalStatus,
    resetCMSPayDetails,
    clearError,
    resetCMSPayVerificationData,
    clearApprovalResult
} = staffCMSPayVerificationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyCMSPayInbox = (state) => state.staffcmspayverification.verifyCMSPayInbox;
export const selectCMSPayDetails = (state) => state.staffcmspayverification.cmsPayDetails;
export const selectCMSReportData = (state) => state.staffcmspayverification.cmsReportData;
export const selectApprovalResult = (state) => state.staffcmspayverification.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyCMSPayInboxArray = (state) => {
    const inbox = state.staffcmspayverification.verifyCMSPayInbox;
    return Array.isArray(inbox) ? inbox : [];
};

export const selectCMSReportDataArray = (state) => {
    const reportData = state.staffcmspayverification.cmsReportData;
    return Array.isArray(reportData) ? reportData : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffcmspayverification.loading;
export const selectVerifyCMSPayLoading = (state) => state.staffcmspayverification.loading.verifyCMSPay;
export const selectCMSPayDetailsLoading = (state) => state.staffcmspayverification.loading.cmsPayDetails;
export const selectApproveCMSPayLoading = (state) => state.staffcmspayverification.loading.approveCMSPay;

// Error selectors
export const selectErrors = (state) => state.staffcmspayverification.errors;
export const selectVerifyCMSPayError = (state) => state.staffcmspayverification.errors.verifyCMSPay;
export const selectCMSPayDetailsError = (state) => state.staffcmspayverification.errors.cmsPayDetails;
export const selectApproveCMSPayError = (state) => state.staffcmspayverification.errors.approveCMSPay;

// UI State selectors
export const selectSelectedRoleId = (state) => state.staffcmspayverification.selectedRoleId;
export const selectSelectedCMSTransactionNo = (state) => state.staffcmspayverification.selectedCMSTransactionNo;
export const selectSelectedConsolidateNo = (state) => state.staffcmspayverification.selectedConsolidateNo;
export const selectSelectedTransactionRefno = (state) => state.staffcmspayverification.selectedTransactionRefno;
export const selectApprovalStatus = (state) => state.staffcmspayverification.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffcmspayverification.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffcmspayverification.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectCMSPayVerificationSummary = (state) => {
    const inboxArray = Array.isArray(state.staffcmspayverification.verifyCMSPayInbox) 
        ? state.staffcmspayverification.verifyCMSPayInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedCMSPay: state.staffcmspayverification.cmsPayDetails,
        reportDataCount: Array.isArray(state.staffcmspayverification.cmsReportData) 
            ? state.staffcmspayverification.cmsReportData.length 
            : 0,
        approvalStatus: state.staffcmspayverification.approvalStatus,
        isProcessing: state.staffcmspayverification.loading.approveCMSPay,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.staffcmspayverification.loading.verifyCMSPay
    };
};

// CMS Pay Details specific selector
export const selectCMSPayDetailsSummary = (state) => {
    return {
        details: state.staffcmspayverification.cmsPayDetails,
        reportData: state.staffcmspayverification.cmsReportData,
        isLoading: state.staffcmspayverification.loading.cmsPayDetails,
        error: state.staffcmspayverification.errors.cmsPayDetails,
        hasDetails: state.staffcmspayverification.cmsPayDetails !== null,
        hasReportData: Array.isArray(state.staffcmspayverification.cmsReportData) 
            && state.staffcmspayverification.cmsReportData.length > 0,
        isEmpty: state.staffcmspayverification.cmsPayDetails === null 
            && !state.staffcmspayverification.loading.cmsPayDetails
    };
};

// Export reducer
export default staffCMSPayVerificationSlice.reducer;