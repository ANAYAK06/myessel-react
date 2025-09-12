import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as costCenterAPI from '../../api/CostCenterAPI/costCenterApprovalAPI';

// Async Thunks
export const fetchApprovalCostCenterDetails = createAsyncThunk(
    'costCenter/fetchApprovalCostCenterDetails',
    async ({ roleId, uid }, { rejectWithValue }) => {
        try {
            const response = await costCenterAPI.getApprovalCostCenterDetails(roleId, uid);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Approval Cost Center Details');
        }
    }
);

export const fetchApprovalCCbyCC = createAsyncThunk(
    'costCenter/fetchApprovalCCbyCC',
    async ({ ccCode, userId }, { rejectWithValue }) => {
        try {
            const response = await costCenterAPI.getApprovalCCbyCC(ccCode, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Approval CC Data');
        }
    }
);

export const approveCostCenter = createAsyncThunk(
    'costCenter/approveCostCenter',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await costCenterAPI.approveCostCenter(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Cost Center');
        }
    }
);

const initialState = {
    approvalCostCenterDetails: [],
    ccData: null,
    approvalResult: null,
    loading: {
        approvalCostCenterDetails: false,
        ccData: false,
        approveCostCenter: false,
    },
    errors: {
        approvalCostCenterDetails: null,
        ccData: null,
        approveCostCenter: null,
    },
    selectedRoleId: null,
    selectedUID: null,
    selectedCCCode: null,
    selectedUserId: null,
    approvalStatus: null,
};

const costCenterSlice = createSlice({
    name: 'costCenter',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUID: (state, action) => {
            state.selectedUID = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetCCData: (state) => {
            state.ccData = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetCostCenterState: (state) => {
            state.approvalCostCenterDetails = [];
            state.ccData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUID = null;
            state.selectedCCCode = null;
            state.selectedUserId = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApprovalCostCenterDetails.pending, (state) => {
                state.loading.approvalCostCenterDetails = true;
                state.errors.approvalCostCenterDetails = null;
            })
            .addCase(fetchApprovalCostCenterDetails.fulfilled, (state, action) => {
                state.loading.approvalCostCenterDetails = false;
                state.approvalCostCenterDetails = action.payload?.Data || [];
            })
            .addCase(fetchApprovalCostCenterDetails.rejected, (state, action) => {
                state.loading.approvalCostCenterDetails = false;
                state.errors.approvalCostCenterDetails = action.payload;
                state.approvalCostCenterDetails = [];
            })

            .addCase(fetchApprovalCCbyCC.pending, (state) => {
                state.loading.ccData = true;
                state.errors.ccData = null;
            })
            .addCase(fetchApprovalCCbyCC.fulfilled, (state, action) => {
                state.loading.ccData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemDescList: apiResponse.Data.ItemDescList 
                            ? [...apiResponse.Data.ItemDescList.map(item => ({...item}))]
                            : []
                    };
                    state.ccData = extractedData;
                } else {
                    state.ccData = null;
                }
            })
            .addCase(fetchApprovalCCbyCC.rejected, (state, action) => {
                state.loading.ccData = false;
                state.errors.ccData = action.payload;
                state.ccData = null;
            })

            .addCase(approveCostCenter.pending, (state) => {
                state.loading.approveCostCenter = true;
                state.errors.approveCostCenter = null;
            })
            .addCase(approveCostCenter.fulfilled, (state, action) => {
                state.loading.approveCostCenter = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveCostCenter.rejected, (state, action) => {
                state.loading.approveCostCenter = false;
                state.errors.approveCostCenter = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUID,
    setSelectedCCCode,
    setSelectedUserId,
    setApprovalStatus,
    resetCCData,
    clearError,
    resetCostCenterState,
    clearApprovalResult
} = costCenterSlice.actions;

// Selectors
export const selectApprovalCostCenterDetails = (state) => state.costCenter.approvalCostCenterDetails;
export const selectCCData = (state) => state.costCenter.ccData;
export const selectApprovalResult = (state) => state.costCenter.approvalResult;
export const selectApprovalCostCenterDetailsArray = (state) => {
    const details = state.costCenter.approvalCostCenterDetails;
    return Array.isArray(details) ? details : [];
};

export const selectLoading = (state) => state.costCenter.loading;
export const selectApprovalCostCenterDetailsLoading = (state) => state.costCenter.loading.approvalCostCenterDetails;
export const selectCCDataLoading = (state) => state.costCenter.loading.ccData;
export const selectApproveCostCenterLoading = (state) => state.costCenter.loading.approveCostCenter;

export const selectErrors = (state) => state.costCenter.errors;
export const selectApprovalCostCenterDetailsError = (state) => state.costCenter.errors.approvalCostCenterDetails;
export const selectCCDataError = (state) => state.costCenter.errors.ccData;
export const selectApproveCostCenterError = (state) => state.costCenter.errors.approveCostCenter;

export const selectSelectedRoleId = (state) => state.costCenter.selectedRoleId;
export const selectSelectedUID = (state) => state.costCenter.selectedUID;
export const selectSelectedCCCode = (state) => state.costCenter.selectedCCCode;
export const selectSelectedUserId = (state) => state.costCenter.selectedUserId;
export const selectApprovalStatus = (state) => state.costCenter.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.costCenter.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.costCenter.errors).some(error => error !== null);

export const selectCostCenterSummary = (state) => {
    const detailsArray = Array.isArray(state.costCenter.approvalCostCenterDetails) ? state.costCenter.approvalCostCenterDetails : [];
    return {
        totalCostCenters: detailsArray.length,
        selectedCC: state.costCenter.ccData,
        approvalStatus: state.costCenter.approvalStatus,
        isProcessing: state.costCenter.loading.approveCostCenter,
        hasCostCenters: detailsArray.length > 0
    };
};

export const selectCostCenterDetails = (state) => {
    const detailsArray = Array.isArray(state.costCenter.approvalCostCenterDetails) ? state.costCenter.approvalCostCenterDetails : [];
    return {
        costCenters: detailsArray,
        totalCostCenters: detailsArray.length,
        selectedCCData: state.costCenter.ccData,
        isLoading: state.costCenter.loading.ccData,
        error: state.costCenter.errors.ccData,
        hasCostCenters: detailsArray.length > 0,
        isEmpty: detailsArray.length === 0 && !state.costCenter.loading.approvalCostCenterDetails
    };
};

export default costCenterSlice.reducer;