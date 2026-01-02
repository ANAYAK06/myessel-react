import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dailyIssueAPI from '../../api/Stock/dailyIssueVerificationAPI';

// Async Thunks
export const fetchVerifyDailyIssueGrid = createAsyncThunk(
    'dailyIssue/fetchVerifyDailyIssueGrid',
    async ({ roleId, created, userId }, { rejectWithValue }) => {
        try {
            const response = await dailyIssueAPI.getVerifyDailyIssueGrid(roleId, created, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Daily Issue Grid');
        }
    }
);

export const fetchDailyIssueDetails = createAsyncThunk(
    'dailyIssue/fetchDailyIssueDetails',
    async ({ tranNo, ccCode }, { rejectWithValue }) => {
        try {
            const response = await dailyIssueAPI.getDailyIssueDetails(tranNo, ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Daily Issue Details');
        }
    }
);

export const fetchDailyIssueRemarks = createAsyncThunk(
    'dailyIssue/fetchDailyIssueRemarks',
    async ({ refNo }, { rejectWithValue }) => {
        try {
            const response = await dailyIssueAPI.getDailyIssueRemarks(refNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Daily Issue Remarks');
        }
    }
);

export const approveDailyIssue = createAsyncThunk(
    'dailyIssue/approveDailyIssue',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await dailyIssueAPI.approveDailyIssue(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Daily Issue');
        }
    }
);

const initialState = {
    dailyIssueGrid: [],
    dailyIssueDetails: null,
    dailyIssueRemarks: [],
    approvalResult: null,
    loading: {
        dailyIssueGrid: false,
        dailyIssueDetails: false,
        dailyIssueRemarks: false,
        approveDailyIssue: false,
    },
    errors: {
        dailyIssueGrid: null,
        dailyIssueDetails: null,
        dailyIssueRemarks: null,
        approveDailyIssue: null,
    },
    selectedRoleId: null,
    selectedCreated: null,
    selectedUserId: null,
    selectedTranNo: null,
    selectedCCCode: null,
    selectedRefNo: null,
    approvalStatus: null,
};

const dailyIssueSlice = createSlice({
    name: 'dailyIssue',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedCreated: (state, action) => {
            state.selectedCreated = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedTranNo: (state, action) => {
            state.selectedTranNo = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedRefNo: (state, action) => {
            state.selectedRefNo = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetDailyIssueDetails: (state) => {
            state.dailyIssueDetails = null;
            state.dailyIssueRemarks = [];
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetDailyIssueState: (state) => {
            state.dailyIssueGrid = [];
            state.dailyIssueDetails = null;
            state.dailyIssueRemarks = [];
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedCreated = null;
            state.selectedUserId = null;
            state.selectedTranNo = null;
            state.selectedCCCode = null;
            state.selectedRefNo = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerifyDailyIssueGrid.pending, (state) => {
                state.loading.dailyIssueGrid = true;
                state.errors.dailyIssueGrid = null;
            })
            .addCase(fetchVerifyDailyIssueGrid.fulfilled, (state, action) => {
                state.loading.dailyIssueGrid = false;
                state.dailyIssueGrid = action.payload?.Data || [];
            })
            .addCase(fetchVerifyDailyIssueGrid.rejected, (state, action) => {
                state.loading.dailyIssueGrid = false;
                state.errors.dailyIssueGrid = action.payload;
                state.dailyIssueGrid = [];
            })

            .addCase(fetchDailyIssueDetails.pending, (state) => {
                state.loading.dailyIssueDetails = true;
                state.errors.dailyIssueDetails = null;
            })
            .addCase(fetchDailyIssueDetails.fulfilled, (state, action) => {
                state.loading.dailyIssueDetails = false;
                const apiResponse = action.payload;
                
                console.log('🔍 Processing Daily Issue Details in Redux:', apiResponse);
                
                if (apiResponse?.Data) {
                    // Check if Data is an array (items list) or object
                    if (Array.isArray(apiResponse.Data)) {
                        console.log('📦 Data is an array with', apiResponse.Data.length, 'items');
                        
                        // Data is the ItemList array - create object structure
                        // Extract common fields from first item
                        const firstItem = apiResponse.Data[0] || {};
                        
                        const extractedData = {
                            Tranno: firstItem.Tranno || firstItem.TranNo || '',
                            FromCC: firstItem.FromCC || firstItem.CCCode || '',
                            Date: firstItem.Date || '',
                            MOID: firstItem.MOID || apiResponse.MOID || null,
                            Status: firstItem.Status || '',
                            Remarks: firstItem.Remarks || '',
                            ItemList: apiResponse.Data.map(item => ({...item}))
                        };
                        
                        console.log('✅ Processed Data Object:', extractedData);
                        console.log('🎯 MOID extracted:', extractedData.MOID);
                        state.dailyIssueDetails = extractedData;
                    } else {
                        console.log('📦 Data is an object');
                        // Data is already an object, might have ItemList
                        const extractedData = {
                            ...apiResponse.Data,
                            ItemList: apiResponse.Data.ItemList 
                                ? [...apiResponse.Data.ItemList.map(item => ({...item}))]
                                : []
                        };
                        console.log('✅ Processed Data Object:', extractedData);
                        console.log('🎯 MOID extracted:', extractedData.MOID);
                        state.dailyIssueDetails = extractedData;
                    }
                } else {
                    console.log('⚠️ No Data property in API response');
                    state.dailyIssueDetails = null;
                }
            })
            .addCase(fetchDailyIssueDetails.rejected, (state, action) => {
                state.loading.dailyIssueDetails = false;
                state.errors.dailyIssueDetails = action.payload;
                state.dailyIssueDetails = null;
            })

            .addCase(fetchDailyIssueRemarks.pending, (state) => {
                state.loading.dailyIssueRemarks = true;
                state.errors.dailyIssueRemarks = null;
            })
            .addCase(fetchDailyIssueRemarks.fulfilled, (state, action) => {
                state.loading.dailyIssueRemarks = false;
                state.dailyIssueRemarks = action.payload?.Data || [];
            })
            .addCase(fetchDailyIssueRemarks.rejected, (state, action) => {
                state.loading.dailyIssueRemarks = false;
                state.errors.dailyIssueRemarks = action.payload;
                state.dailyIssueRemarks = [];
            })

            .addCase(approveDailyIssue.pending, (state) => {
                state.loading.approveDailyIssue = true;
                state.errors.approveDailyIssue = null;
            })
            .addCase(approveDailyIssue.fulfilled, (state, action) => {
                state.loading.approveDailyIssue = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveDailyIssue.rejected, (state, action) => {
                state.loading.approveDailyIssue = false;
                state.errors.approveDailyIssue = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedCreated,
    setSelectedUserId,
    setSelectedTranNo,
    setSelectedCCCode,
    setSelectedRefNo,
    setApprovalStatus,
    resetDailyIssueDetails,
    clearError,
    resetDailyIssueState,
    clearApprovalResult
} = dailyIssueSlice.actions;

// Selectors
export const selectDailyIssueGrid = (state) => state.dailyIssue.dailyIssueGrid;
export const selectDailyIssueDetails = (state) => state.dailyIssue.dailyIssueDetails;
export const selectDailyIssueRemarks = (state) => state.dailyIssue.dailyIssueRemarks;
export const selectApprovalResult = (state) => state.dailyIssue.approvalResult;
export const selectDailyIssueGridArray = (state) => {
    const grid = state.dailyIssue.dailyIssueGrid;
    return Array.isArray(grid) ? grid : [];
};

export const selectLoading = (state) => state.dailyIssue.loading;
export const selectDailyIssueGridLoading = (state) => state.dailyIssue.loading.dailyIssueGrid;
export const selectDailyIssueDetailsLoading = (state) => state.dailyIssue.loading.dailyIssueDetails;
export const selectDailyIssueRemarksLoading = (state) => state.dailyIssue.loading.dailyIssueRemarks;
export const selectApproveDailyIssueLoading = (state) => state.dailyIssue.loading.approveDailyIssue;

export const selectErrors = (state) => state.dailyIssue.errors;
export const selectDailyIssueGridError = (state) => state.dailyIssue.errors.dailyIssueGrid;
export const selectDailyIssueDetailsError = (state) => state.dailyIssue.errors.dailyIssueDetails;
export const selectDailyIssueRemarksError = (state) => state.dailyIssue.errors.dailyIssueRemarks;
export const selectApproveDailyIssueError = (state) => state.dailyIssue.errors.approveDailyIssue;

export const selectSelectedRoleId = (state) => state.dailyIssue.selectedRoleId;
export const selectSelectedCreated = (state) => state.dailyIssue.selectedCreated;
export const selectSelectedUserId = (state) => state.dailyIssue.selectedUserId;
export const selectSelectedTranNo = (state) => state.dailyIssue.selectedTranNo;
export const selectSelectedCCCode = (state) => state.dailyIssue.selectedCCCode;
export const selectSelectedRefNo = (state) => state.dailyIssue.selectedRefNo;
export const selectApprovalStatus = (state) => state.dailyIssue.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.dailyIssue.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.dailyIssue.errors).some(error => error !== null);

export const selectDailyIssueSummary = (state) => {
    const gridArray = Array.isArray(state.dailyIssue.dailyIssueGrid) ? state.dailyIssue.dailyIssueGrid : [];
    return {
        totalIssues: gridArray.length,
        selectedIssue: state.dailyIssue.dailyIssueDetails,
        approvalStatus: state.dailyIssue.approvalStatus,
        isProcessing: state.dailyIssue.loading.approveDailyIssue,
        hasIssues: gridArray.length > 0
    };
};

export const selectDailyIssueFullDetails = (state) => {
    const gridArray = Array.isArray(state.dailyIssue.dailyIssueGrid) ? state.dailyIssue.dailyIssueGrid : [];
    return {
        grid: gridArray,
        totalIssues: gridArray.length,
        selectedDetails: state.dailyIssue.dailyIssueDetails,
        remarks: state.dailyIssue.dailyIssueRemarks,
        isLoading: state.dailyIssue.loading.dailyIssueDetails,
        error: state.dailyIssue.errors.dailyIssueDetails,
        hasIssues: gridArray.length > 0,
        isEmpty: gridArray.length === 0 && !state.dailyIssue.loading.dailyIssueGrid
    };
};

export default dailyIssueSlice.reducer;