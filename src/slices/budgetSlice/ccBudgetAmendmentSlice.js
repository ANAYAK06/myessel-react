import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ccBudgetAmendmentAPI from '../../api/BudgetAPI/ccBudgetAmendmentAPI';

// Async Thunks
export const fetchApprovalCCAmendBudgetDetails = createAsyncThunk(
    'ccBudgetAmendment/fetchApprovalCCAmendBudgetDetails',
    async ({ roleId, uid }, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.getApprovalCCAmendBudgetDetails(roleId, uid);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Approval CC Amend Budget Details');
        }
    }
);

export const fetchApprovalCCAmendBudgetById = createAsyncThunk(
    'ccBudgetAmendment/fetchApprovalCCAmendBudgetById',
    async ({ amendId, amendType }, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.getApprovalCCAmendBudgetById(amendId, amendType);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch CC Amend Budget by ID');
        }
    }
);

export const fetchCCUploadDocsExists = createAsyncThunk(
    'ccBudgetAmendment/fetchCCUploadDocsExists',
    async ({ ccCode, uid }, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.getCCUploadDocsExists(ccCode, uid);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check CC Upload Documents');
        }
    }
);

export const approveCCBudgetAmend = createAsyncThunk(
    'ccBudgetAmendment/approveCCBudgetAmend',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.approveCostCenterBudgetAmend(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve CC Budget Amendment');
        }
    }
);

export const saveCCBudgetAmend = createAsyncThunk(
    'ccBudgetAmendment/saveCCBudgetAmend',
    async (budgetData, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.saveCCAmendBudget(budgetData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save CC Budget Amendment');
        }
    }
);

export const updateCCBudgetAmend = createAsyncThunk(
    'ccBudgetAmendment/updateCCBudgetAmend',
    async (updateData, { rejectWithValue }) => {
        try {
            const response = await ccBudgetAmendmentAPI.updateCCAmendBudget(updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update CC Budget Amendment');
        }
    }
);

const initialState = {
    approvalCCAmendBudgetDetails: [],
    ccAmendBudgetData: null,
    docsExistData: null,
    approvalResult: null,
    saveResult: null,
    updateResult: null,
    loading: {
        approvalCCAmendBudgetDetails: false,
        ccAmendBudgetData: false,
        docsExist: false,
        approveCCBudgetAmend: false,
        saveCCBudgetAmend: false,
        updateCCBudgetAmend: false,
    },
    errors: {
        approvalCCAmendBudgetDetails: null,
        ccAmendBudgetData: null,
        docsExist: null,
        approveCCBudgetAmend: null,
        saveCCBudgetAmend: null,
        updateCCBudgetAmend: null,
    },
    selectedRoleId: null,
    selectedUID: null,
    selectedAmendId: null,
    selectedAmendType: null,
    selectedCCCode: null,
    approvalStatus: null,
};

const ccBudgetAmendmentSlice = createSlice({
    name: 'ccBudgetAmendment',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUID: (state, action) => {
            state.selectedUID = action.payload;
        },
        setSelectedAmendId: (state, action) => {
            state.selectedAmendId = action.payload;
        },
        setSelectedAmendType: (state, action) => {
            state.selectedAmendType = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetCCAmendBudgetData: (state) => {
            state.ccAmendBudgetData = null;
            state.approvalResult = null;
            state.saveResult = null;
            state.updateResult = null;
            state.docsExistData = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetCCBudgetAmendmentState: (state) => {
            state.approvalCCAmendBudgetDetails = [];
            state.ccAmendBudgetData = null;
            state.docsExistData = null;
            state.approvalResult = null;
            state.saveResult = null;
            state.updateResult = null;
            state.selectedRoleId = null;
            state.selectedUID = null;
            state.selectedAmendId = null;
            state.selectedAmendType = null;
            state.selectedCCCode = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
        },
        clearUpdateResult: (state) => {
            state.updateResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Approval CC Amend Budget Details
            .addCase(fetchApprovalCCAmendBudgetDetails.pending, (state) => {
                state.loading.approvalCCAmendBudgetDetails = true;
                state.errors.approvalCCAmendBudgetDetails = null;
            })
            .addCase(fetchApprovalCCAmendBudgetDetails.fulfilled, (state, action) => {
                state.loading.approvalCCAmendBudgetDetails = false;
                state.approvalCCAmendBudgetDetails = action.payload?.Data || [];
            })
            .addCase(fetchApprovalCCAmendBudgetDetails.rejected, (state, action) => {
                state.loading.approvalCCAmendBudgetDetails = false;
                state.errors.approvalCCAmendBudgetDetails = action.payload;
                state.approvalCCAmendBudgetDetails = [];
            })

            // Fetch Approval CC Amend Budget By ID
            .addCase(fetchApprovalCCAmendBudgetById.pending, (state) => {
                state.loading.ccAmendBudgetData = true;
                state.errors.ccAmendBudgetData = null;
            })
            .addCase(fetchApprovalCCAmendBudgetById.fulfilled, (state, action) => {
                state.loading.ccAmendBudgetData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemList: apiResponse.Data.ItemList 
                            ? [...apiResponse.Data.ItemList.map(item => ({...item}))]
                            : [],
                        BudgetDetails: apiResponse.Data.BudgetDetails 
                            ? [...apiResponse.Data.BudgetDetails.map(detail => ({...detail}))]
                            : []
                    };
                    state.ccAmendBudgetData = extractedData;
                } else {
                    state.ccAmendBudgetData = null;
                }
            })
            .addCase(fetchApprovalCCAmendBudgetById.rejected, (state, action) => {
                state.loading.ccAmendBudgetData = false;
                state.errors.ccAmendBudgetData = action.payload;
                state.ccAmendBudgetData = null;
            })

            // Fetch CC Upload Docs Exists
            .addCase(fetchCCUploadDocsExists.pending, (state) => {
                state.loading.docsExist = true;
                state.errors.docsExist = null;
            })
            .addCase(fetchCCUploadDocsExists.fulfilled, (state, action) => {
                state.loading.docsExist = false;
                state.docsExistData = action.payload;
            })
            .addCase(fetchCCUploadDocsExists.rejected, (state, action) => {
                state.loading.docsExist = false;
                state.errors.docsExist = action.payload;
                state.docsExistData = null;
            })

            // Approve CC Budget Amend
            .addCase(approveCCBudgetAmend.pending, (state) => {
                state.loading.approveCCBudgetAmend = true;
                state.errors.approveCCBudgetAmend = null;
            })
            .addCase(approveCCBudgetAmend.fulfilled, (state, action) => {
                state.loading.approveCCBudgetAmend = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveCCBudgetAmend.rejected, (state, action) => {
                state.loading.approveCCBudgetAmend = false;
                state.errors.approveCCBudgetAmend = action.payload;
            })

            // Save CC Budget Amend
            .addCase(saveCCBudgetAmend.pending, (state) => {
                state.loading.saveCCBudgetAmend = true;
                state.errors.saveCCBudgetAmend = null;
            })
            .addCase(saveCCBudgetAmend.fulfilled, (state, action) => {
                state.loading.saveCCBudgetAmend = false;
                state.saveResult = action.payload;
            })
            .addCase(saveCCBudgetAmend.rejected, (state, action) => {
                state.loading.saveCCBudgetAmend = false;
                state.errors.saveCCBudgetAmend = action.payload;
            })

            // Update CC Budget Amend
            .addCase(updateCCBudgetAmend.pending, (state) => {
                state.loading.updateCCBudgetAmend = true;
                state.errors.updateCCBudgetAmend = null;
            })
            .addCase(updateCCBudgetAmend.fulfilled, (state, action) => {
                state.loading.updateCCBudgetAmend = false;
                state.updateResult = action.payload;
            })
            .addCase(updateCCBudgetAmend.rejected, (state, action) => {
                state.loading.updateCCBudgetAmend = false;
                state.errors.updateCCBudgetAmend = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUID,
    setSelectedAmendId,
    setSelectedAmendType,
    setSelectedCCCode,
    setApprovalStatus,
    resetCCAmendBudgetData,
    clearError,
    resetCCBudgetAmendmentState,
    clearApprovalResult,
    clearSaveResult,
    clearUpdateResult
} = ccBudgetAmendmentSlice.actions;

// Selectors
export const selectApprovalCCAmendBudgetDetails = (state) => state.ccBudgetAmendment.approvalCCAmendBudgetDetails;
export const selectCCAmendBudgetData = (state) => state.ccBudgetAmendment.ccAmendBudgetData;
export const selectDocsExistData = (state) => state.ccBudgetAmendment.docsExistData;
export const selectApprovalResult = (state) => state.ccBudgetAmendment.approvalResult;
export const selectSaveResult = (state) => state.ccBudgetAmendment.saveResult;
export const selectUpdateResult = (state) => state.ccBudgetAmendment.updateResult;

export const selectApprovalCCAmendBudgetDetailsArray = (state) => {
    const details = state.ccBudgetAmendment.approvalCCAmendBudgetDetails;
    return Array.isArray(details) ? details : [];
};

export const selectLoading = (state) => state.ccBudgetAmendment.loading;
export const selectApprovalCCAmendBudgetDetailsLoading = (state) => state.ccBudgetAmendment.loading.approvalCCAmendBudgetDetails;
export const selectCCAmendBudgetDataLoading = (state) => state.ccBudgetAmendment.loading.ccAmendBudgetData;
export const selectDocsExistLoading = (state) => state.ccBudgetAmendment.loading.docsExist;
export const selectApproveCCBudgetAmendLoading = (state) => state.ccBudgetAmendment.loading.approveCCBudgetAmend;
export const selectSaveCCBudgetAmendLoading = (state) => state.ccBudgetAmendment.loading.saveCCBudgetAmend;
export const selectUpdateCCBudgetAmendLoading = (state) => state.ccBudgetAmendment.loading.updateCCBudgetAmend;

export const selectErrors = (state) => state.ccBudgetAmendment.errors;
export const selectApprovalCCAmendBudgetDetailsError = (state) => state.ccBudgetAmendment.errors.approvalCCAmendBudgetDetails;
export const selectCCAmendBudgetDataError = (state) => state.ccBudgetAmendment.errors.ccAmendBudgetData;
export const selectDocsExistError = (state) => state.ccBudgetAmendment.errors.docsExist;
export const selectApproveCCBudgetAmendError = (state) => state.ccBudgetAmendment.errors.approveCCBudgetAmend;
export const selectSaveCCBudgetAmendError = (state) => state.ccBudgetAmendment.errors.saveCCBudgetAmend;
export const selectUpdateCCBudgetAmendError = (state) => state.ccBudgetAmendment.errors.updateCCBudgetAmend;

export const selectSelectedRoleId = (state) => state.ccBudgetAmendment.selectedRoleId;
export const selectSelectedUID = (state) => state.ccBudgetAmendment.selectedUID;
export const selectSelectedAmendId = (state) => state.ccBudgetAmendment.selectedAmendId;
export const selectSelectedAmendType = (state) => state.ccBudgetAmendment.selectedAmendType;
export const selectSelectedCCCode = (state) => state.ccBudgetAmendment.selectedCCCode;
export const selectApprovalStatus = (state) => state.ccBudgetAmendment.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.ccBudgetAmendment.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.ccBudgetAmendment.errors).some(error => error !== null);

export const selectCCBudgetAmendmentSummary = (state) => {
    const detailsArray = Array.isArray(state.ccBudgetAmendment.approvalCCAmendBudgetDetails) ? state.ccBudgetAmendment.approvalCCAmendBudgetDetails : [];
    return {
        totalAmendments: detailsArray.length,
        selectedAmendment: state.ccBudgetAmendment.ccAmendBudgetData,
        approvalStatus: state.ccBudgetAmendment.approvalStatus,
        isProcessing: state.ccBudgetAmendment.loading.approveCCBudgetAmend || 
                     state.ccBudgetAmendment.loading.saveCCBudgetAmend || 
                     state.ccBudgetAmendment.loading.updateCCBudgetAmend,
        hasAmendments: detailsArray.length > 0,
        docsExist: state.ccBudgetAmendment.docsExistData
    };
};

export const selectCCBudgetAmendmentDetails = (state) => {
    const detailsArray = Array.isArray(state.ccBudgetAmendment.approvalCCAmendBudgetDetails) ? state.ccBudgetAmendment.approvalCCAmendBudgetDetails : [];
    return {
        amendments: detailsArray,
        totalAmendments: detailsArray.length,
        selectedAmendmentData: state.ccBudgetAmendment.ccAmendBudgetData,
        isLoading: state.ccBudgetAmendment.loading.ccAmendBudgetData,
        error: state.ccBudgetAmendment.errors.ccAmendBudgetData,
        hasAmendments: detailsArray.length > 0,
        isEmpty: detailsArray.length === 0 && !state.ccBudgetAmendment.loading.approvalCCAmendBudgetDetails,
        docsExistData: state.ccBudgetAmendment.docsExistData
    };
};

export default ccBudgetAmendmentSlice.reducer;