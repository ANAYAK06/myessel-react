import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as leaveAPI from '../../api/HRAPI/employeeLeaveAPI';

// Async Thunks for HR Leave Request APIs
// ===============================================

// 1. Fetch Verify Leave Requests Inbox by Role ID
export const fetchVerifyLeaveRequests = createAsyncThunk(
    'employeeleave/fetchVerifyLeaveRequests',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.getVerifyLeaveRequests({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify Leave Requests Inbox');
        }
    }
);

// 2. Fetch Single Employee Leave Request Details
export const fetchSingleEmpForLeaveRequest = createAsyncThunk(
    'employeeleave/fetchSingleEmpForLeaveRequest',
    async (empRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Leave Request Details for EmpRefno:', empRefno);
            const response = await leaveAPI.getSingleEmpForLeaveRequest({ empRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employee Leave Request Details');
        }
    }
);

// 4. Fetch Employee Data for Leave Request (search autocomplete)
export const fetchEmpDataForLeaveRequest = createAsyncThunk(
    'employeeleave/fetchEmpDataForLeaveRequest',
    async (prefix, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.getEmpDataForLeaveRequest(prefix);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch employee search results');
        }
    }
);

// 5. Fetch Employee Balance Leave
export const fetchEmpBalanceLeave = createAsyncThunk(
    'employeeleave/fetchEmpBalanceLeave',
    async (params, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.getEmpBalanceLeave(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch balance leave');
        }
    }
);

// 6. Save Leave Request
export const saveLeaveRequest = createAsyncThunk(
    'employeeleave/saveLeaveRequest',
    async (data, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.saveHRLeaveRequest(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save leave request');
        }
    }
);

// 7. Fetch Leave Request by Refno
export const fetchLeaveRequestByRefno = createAsyncThunk(
    'employeeleave/fetchLeaveRequestByRefno',
    async (data, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.getLeaveRequestByRefno(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch leave request by refno');
        }
    }
);

// 3. Approve HR Leave Request
export const approveHRLeaveRequest = createAsyncThunk(
    'employeeleave/approveHRLeaveRequest',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await leaveAPI.approveHRLeaveRequest(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve HR Leave Request');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    verifyLeaveRequestsInbox: [],
    leaveRequestDetails: null,
    approvalResult: null,

    // Creation flow
    empSearchList: [],
    selectedEmpData: null,
    balanceLeave: null,
    saveResult: null,
    saveStatus: null,          // null | 'pending' | 'success' | 'failed'
    leaveRequestByRefno: null, // used in verification detail

    // Loading states for each API
    loading: {
        verifyLeaveRequests: false,
        leaveRequestDetails: false,
        approveLeaveRequest: false,
        empSearch: false,
        balanceLeave: false,
        saveLeaveRequest: false,
        leaveRequestByRefno: false,
    },

    // Error states for each API
    errors: {
        verifyLeaveRequests: null,
        leaveRequestDetails: null,
        approveLeaveRequest: null,
        empSearch: null,
        balanceLeave: null,
        saveLeaveRequest: null,
        leaveRequestByRefno: null,
    },

    // UI State
    selectedRoleId: null,
    selectedEmpRefno: null,
    approvalStatus: null,
};

// Employee Leave Request Slice
// ============================
const employeeLeaveSlice = createSlice({
    name: 'employeeleave',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected employee reference number
        setSelectedEmpRefno: (state, action) => {
            state.selectedEmpRefno = action.payload;
        },
        
        // Action to set approval status
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        
        // Action to reset leave request details
        resetLeaveRequestDetails: (state) => {
            state.leaveRequestDetails = null;
            state.approvalResult = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all employee leave data
        resetEmployeeLeaveData: (state) => {
            state.verifyLeaveRequestsInbox = [];
            state.leaveRequestDetails = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedEmpRefno = null;
            state.approvalStatus = null;
            state.empSearchList = [];
            state.balanceLeave = null;
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.saveLeaveRequest = null;
        },

        // Action to clear approval result
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },

        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.saveLeaveRequest = null;
        },
        clearSelectedEmpData: (state) => {
            state.selectedEmpData = null;
            state.balanceLeave = null;
            state.empSearchList = [];
        },
        clearLeaveRequestByRefno: (state) => {
            state.leaveRequestByRefno = null;
            state.errors.leaveRequestByRefno = null;
        },
    },
    extraReducers: (builder) => {
        // 1. Verify Leave Requests Inbox - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchVerifyLeaveRequests.pending, (state) => {
                state.loading.verifyLeaveRequests = true;
                state.errors.verifyLeaveRequests = null;
            })
            .addCase(fetchVerifyLeaveRequests.fulfilled, (state, action) => {
                state.loading.verifyLeaveRequests = false;
                // 🔧 FIXED: Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: false, ResponseCode: 200 }
                state.verifyLeaveRequestsInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyLeaveRequests.rejected, (state, action) => {
                state.loading.verifyLeaveRequests = false;
                state.errors.verifyLeaveRequests = action.payload;
                // 🔧 FIXED: Reset to empty array on error to prevent filter issues
                state.verifyLeaveRequestsInbox = [];
            })

        // 2. Leave Request Details by Employee Reference Number - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchSingleEmpForLeaveRequest.pending, (state) => {
                state.loading.leaveRequestDetails = true;
                state.errors.leaveRequestDetails = null;
            })
            .addCase(fetchSingleEmpForLeaveRequest.fulfilled, (state, action) => {
                state.loading.leaveRequestDetails = false;
                // 🔧 FIXED: Extract Data object from API response
                // API returns: { Data: {...}, IsSuccessful: false, ResponseCode: 200 }
                state.leaveRequestDetails = action.payload?.Data || null;
            })
            .addCase(fetchSingleEmpForLeaveRequest.rejected, (state, action) => {
                state.loading.leaveRequestDetails = false;
                state.errors.leaveRequestDetails = action.payload;
                // 🔧 FIXED: Reset on error
                state.leaveRequestDetails = null;
            })

        // 3. Approve HR Leave Request
        builder
            .addCase(approveHRLeaveRequest.pending, (state) => {
                state.loading.approveLeaveRequest = true;
                state.errors.approveLeaveRequest = null;
            })
            .addCase(approveHRLeaveRequest.fulfilled, (state, action) => {
                state.loading.approveLeaveRequest = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveHRLeaveRequest.rejected, (state, action) => {
                state.loading.approveLeaveRequest = false;
                state.errors.approveLeaveRequest = action.payload;
            });

        // 4. fetchEmpDataForLeaveRequest
        builder
            .addCase(fetchEmpDataForLeaveRequest.pending, (state) => {
                state.loading.empSearch = true;
                state.errors.empSearch = null;
            })
            .addCase(fetchEmpDataForLeaveRequest.fulfilled, (state, action) => {
                state.loading.empSearch = false;
                state.empSearchList = action.payload?.Data || [];
            })
            .addCase(fetchEmpDataForLeaveRequest.rejected, (state, action) => {
                state.loading.empSearch = false;
                state.errors.empSearch = action.payload;
                state.empSearchList = [];
            });

        // 5. fetchEmpBalanceLeave
        builder
            .addCase(fetchEmpBalanceLeave.pending, (state) => {
                state.loading.balanceLeave = true;
                state.errors.balanceLeave = null;
            })
            .addCase(fetchEmpBalanceLeave.fulfilled, (state, action) => {
                state.loading.balanceLeave = false;
                state.balanceLeave = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchEmpBalanceLeave.rejected, (state, action) => {
                state.loading.balanceLeave = false;
                state.errors.balanceLeave = action.payload;
            });

        // 6. saveLeaveRequest
        builder
            .addCase(saveLeaveRequest.pending, (state) => {
                state.loading.saveLeaveRequest = true;
                state.errors.saveLeaveRequest = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveLeaveRequest.fulfilled, (state, action) => {
                state.loading.saveLeaveRequest = false;
                state.saveResult = action.payload;
                const dataVal = action.payload?.Data ?? '';
                const dataStr = typeof dataVal === 'string' ? dataVal.toLowerCase() : '';
                if (dataStr.includes('submit')) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.saveLeaveRequest = typeof dataVal === 'string' && dataVal ? dataVal : 'Save failed. Please try again.';
                }
            })
            .addCase(saveLeaveRequest.rejected, (state, action) => {
                state.loading.saveLeaveRequest = false;
                state.errors.saveLeaveRequest = action.payload;
                state.saveStatus = 'failed';
            });

        // 7. fetchLeaveRequestByRefno
        builder
            .addCase(fetchLeaveRequestByRefno.pending, (state) => {
                state.loading.leaveRequestByRefno = true;
                state.errors.leaveRequestByRefno = null;
                state.leaveRequestByRefno = null;
            })
            .addCase(fetchLeaveRequestByRefno.fulfilled, (state, action) => {
                state.loading.leaveRequestByRefno = false;
                state.leaveRequestByRefno = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchLeaveRequestByRefno.rejected, (state, action) => {
                state.loading.leaveRequestByRefno = false;
                state.errors.leaveRequestByRefno = action.payload;
                state.leaveRequestByRefno = null;
            });
    },
});

// Export actions
export const {
    setSelectedRoleId,
    setSelectedEmpRefno,
    setApprovalStatus,
    resetLeaveRequestDetails,
    clearError,
    resetEmployeeLeaveData,
    clearApprovalResult,
    clearSaveResult,
    clearSelectedEmpData,
    clearLeaveRequestByRefno,
} = employeeLeaveSlice.actions;

// Selectors
// =========

// Data selectors
export const selectVerifyLeaveRequestsInbox = (state) => state.employeeleave.verifyLeaveRequestsInbox;
export const selectLeaveRequestDetails = (state) => state.employeeleave.leaveRequestDetails;
export const selectApprovalResult = (state) => state.employeeleave.approvalResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectVerifyLeaveRequestsInboxArray = (state) => {
    const inbox = state.employeeleave.verifyLeaveRequestsInbox;
    return Array.isArray(inbox) ? inbox : [];
};

// Loading selectors
export const selectLoading = (state) => state.employeeleave.loading;
export const selectVerifyLeaveRequestsLoading = (state) => state.employeeleave.loading.verifyLeaveRequests;
export const selectLeaveRequestDetailsLoading = (state) => state.employeeleave.loading.leaveRequestDetails;
export const selectApproveLeaveRequestLoading = (state) => state.employeeleave.loading.approveLeaveRequest;

// Error selectors
export const selectErrors = (state) => state.employeeleave.errors;
export const selectVerifyLeaveRequestsError = (state) => state.employeeleave.errors.verifyLeaveRequests;
export const selectLeaveRequestDetailsError = (state) => state.employeeleave.errors.leaveRequestDetails;
export const selectApproveLeaveRequestError = (state) => state.employeeleave.errors.approveLeaveRequest;

// UI State selectors
export const selectSelectedRoleId = (state) => state.employeeleave.selectedRoleId;
export const selectSelectedEmpRefno = (state) => state.employeeleave.selectedEmpRefno;
export const selectApprovalStatus = (state) => state.employeeleave.approvalStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.employeeleave.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.employeeleave.errors).some(error => error !== null);

// 🔧 UPDATED: Specific combined selectors with safe array handling
export const selectEmployeeLeaveSummary = (state) => {
    const inboxArray = Array.isArray(state.employeeleave.verifyLeaveRequestsInbox) 
        ? state.employeeleave.verifyLeaveRequestsInbox 
        : [];
    
    return {
        totalInbox: inboxArray.length,
        selectedLeaveRequest: state.employeeleave.leaveRequestDetails,
        approvalStatus: state.employeeleave.approvalStatus,
        isProcessing: state.employeeleave.loading.approveLeaveRequest,
        hasInboxItems: inboxArray.length > 0,
        isEmpty: inboxArray.length === 0 && !state.employeeleave.loading.verifyLeaveRequests
    };
};

// Leave Request Details specific selector
export const selectLeaveRequestDetailsSummary = (state) => {
    return {
        details: state.employeeleave.leaveRequestDetails,
        isLoading: state.employeeleave.loading.leaveRequestDetails,
        error: state.employeeleave.errors.leaveRequestDetails,
        hasDetails: state.employeeleave.leaveRequestDetails !== null,
        isEmpty: state.employeeleave.leaveRequestDetails === null 
            && !state.employeeleave.loading.leaveRequestDetails
    };
};

// New selectors for creation flow and refno lookup
export const selectEmpSearchList = (state) => Array.isArray(state.employeeleave.empSearchList) ? state.employeeleave.empSearchList : [];
export const selectBalanceLeave = (state) => state.employeeleave.balanceLeave;
export const selectSaveResult = (state) => state.employeeleave.saveResult;
export const selectSaveStatus = (state) => state.employeeleave.saveStatus;
export const selectSaveLeaveRequestLoading = (state) => state.employeeleave.loading.saveLeaveRequest;
export const selectSaveLeaveRequestError = (state) => state.employeeleave.errors.saveLeaveRequest;
export const selectEmpSearchLoading = (state) => state.employeeleave.loading.empSearch;
export const selectBalanceLeaveLoading = (state) => state.employeeleave.loading.balanceLeave;
export const selectLeaveRequestByRefno = (state) => state.employeeleave.leaveRequestByRefno;
export const selectLeaveRequestByRefnoLoading = (state) => state.employeeleave.loading.leaveRequestByRefno;

// Export reducer
export default employeeLeaveSlice.reducer;