

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sppoAmendAPI from '../../api/SpPOAPI/spPoAmendAPI';

// Async Thunks
export const fetchVerificationSPPOAmend = createAsyncThunk(
    'sppoAmend/fetchVerificationSPPOAmend',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await sppoAmendAPI.getVerificationSPPOAmend(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification SPPO Amendment');
        }
    }
);

export const fetchSPPOAmendById = createAsyncThunk(
    'sppoAmend/fetchSPPOAmendById',
    async ({ roleId, amendId, userId }, { rejectWithValue }) => {
        try {
            const response = await sppoAmendAPI.getSPPOAmendById(roleId, amendId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SPPO Amendment Data');
        }
    }
);

export const approveSPPOAmend = createAsyncThunk(
    'sppoAmend/approveSPPOAmend',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await sppoAmendAPI.approveSPPOAmend(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve SPPO Amendment');
        }
    }
);

export const fetchPOUploadedDocs = createAsyncThunk(
    'sppoAmend/fetchPOUploadedDocs',
    async ({ poNo, forType }, { rejectWithValue }) => {
        try {
            const response = await sppoAmendAPI.getPOUploadedDocs(poNo, forType);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PO Uploaded Documents');
        }
    }
);

const initialState = {
    verificationSPPOAmend: [],
    sppoAmendData: null,
    poUploadedDocs: [],
    approvalResult: null,
    loading: {
        verificationSPPOAmend: false,
        sppoAmendData: false,
        approveSPPOAmend: false,
        poUploadedDocs: false,
    },
    errors: {
        verificationSPPOAmend: null,
        sppoAmendData: null,
        approveSPPOAmend: null,
        poUploadedDocs: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedAmendId: null,
    selectedPONo: null,
    approvalStatus: null,
};

const sppoAmendSlice = createSlice({
    name: 'sppoAmend',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedAmendId: (state, action) => {
            state.selectedAmendId = action.payload;
        },
        setSelectedPONo: (state, action) => {
            state.selectedPONo = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetSPPOAmendData: (state) => {
            state.sppoAmendData = null;
            state.approvalResult = null;
            state.poUploadedDocs = [];
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetSPPOAmendState: (state) => {
            state.verificationSPPOAmend = [];
            state.sppoAmendData = null;
            state.poUploadedDocs = [];
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedAmendId = null;
            state.selectedPONo = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Verification SPPO Amendment List
            .addCase(fetchVerificationSPPOAmend.pending, (state) => {
                state.loading.verificationSPPOAmend = true;
                state.errors.verificationSPPOAmend = null;
            })
            .addCase(fetchVerificationSPPOAmend.fulfilled, (state, action) => {
                state.loading.verificationSPPOAmend = false;
                state.verificationSPPOAmend = action.payload?.Data || [];
            })
            .addCase(fetchVerificationSPPOAmend.rejected, (state, action) => {
                state.loading.verificationSPPOAmend = false;
                state.errors.verificationSPPOAmend = action.payload;
                state.verificationSPPOAmend = [];
            })

            // Fetch SPPO Amendment by ID
            .addCase(fetchSPPOAmendById.pending, (state) => {
                state.loading.sppoAmendData = true;
                state.errors.sppoAmendData = null;
            })
            .addCase(fetchSPPOAmendById.fulfilled, (state, action) => {
                state.loading.sppoAmendData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemList: apiResponse.Data.ItemList 
                            ? [...apiResponse.Data.ItemList.map(item => ({...item}))]
                            : []
                    };
                    state.sppoAmendData = extractedData;
                } else {
                    state.sppoAmendData = null;
                }
            })
            .addCase(fetchSPPOAmendById.rejected, (state, action) => {
                state.loading.sppoAmendData = false;
                state.errors.sppoAmendData = action.payload;
                state.sppoAmendData = null;
            })

            // Approve SPPO Amendment
            .addCase(approveSPPOAmend.pending, (state) => {
                state.loading.approveSPPOAmend = true;
                state.errors.approveSPPOAmend = null;
            })
            .addCase(approveSPPOAmend.fulfilled, (state, action) => {
                state.loading.approveSPPOAmend = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveSPPOAmend.rejected, (state, action) => {
                state.loading.approveSPPOAmend = false;
                state.errors.approveSPPOAmend = action.payload;
            })

            // Fetch PO Uploaded Documents
            .addCase(fetchPOUploadedDocs.pending, (state) => {
                state.loading.poUploadedDocs = true;
                state.errors.poUploadedDocs = null;
            })
            .addCase(fetchPOUploadedDocs.fulfilled, (state, action) => {
                state.loading.poUploadedDocs = false;
                state.poUploadedDocs = action.payload?.Data || [];
            })
            .addCase(fetchPOUploadedDocs.rejected, (state, action) => {
                state.loading.poUploadedDocs = false;
                state.errors.poUploadedDocs = action.payload;
                state.poUploadedDocs = [];
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedAmendId,
    setSelectedPONo,
    setApprovalStatus,
    resetSPPOAmendData,
    clearError,
    resetSPPOAmendState,
    clearApprovalResult
} = sppoAmendSlice.actions;

// Selectors
export const selectVerificationSPPOAmend = (state) => state.sppoAmend.verificationSPPOAmend;
export const selectSPPOAmendData = (state) => state.sppoAmend.sppoAmendData;
export const selectPOUploadedDocs = (state) => state.sppoAmend.poUploadedDocs;
export const selectApprovalResult = (state) => state.sppoAmend.approvalResult;
export const selectVerificationSPPOAmendArray = (state) => {
    const sppoAmend = state.sppoAmend.verificationSPPOAmend;
    return Array.isArray(sppoAmend) ? sppoAmend : [];
};

export const selectLoading = (state) => state.sppoAmend.loading;
export const selectVerificationSPPOAmendLoading = (state) => state.sppoAmend.loading.verificationSPPOAmend;
export const selectSPPOAmendDataLoading = (state) => state.sppoAmend.loading.sppoAmendData;
export const selectApproveSPPOAmendLoading = (state) => state.sppoAmend.loading.approveSPPOAmend;
export const selectPOUploadedDocsLoading = (state) => state.sppoAmend.loading.poUploadedDocs;

export const selectErrors = (state) => state.sppoAmend.errors;
export const selectVerificationSPPOAmendError = (state) => state.sppoAmend.errors.verificationSPPOAmend;
export const selectSPPOAmendDataError = (state) => state.sppoAmend.errors.sppoAmendData;
export const selectApproveSPPOAmendError = (state) => state.sppoAmend.errors.approveSPPOAmend;
export const selectPOUploadedDocsError = (state) => state.sppoAmend.errors.poUploadedDocs;

export const selectSelectedRoleId = (state) => state.sppoAmend.selectedRoleId;
export const selectSelectedUserId = (state) => state.sppoAmend.selectedUserId;
export const selectSelectedAmendId = (state) => state.sppoAmend.selectedAmendId;
export const selectSelectedPONo = (state) => state.sppoAmend.selectedPONo;
export const selectApprovalStatus = (state) => state.sppoAmend.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.sppoAmend.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.sppoAmend.errors).some(error => error !== null);

export const selectSPPOAmendSummary = (state) => {
    const sppoAmendArray = Array.isArray(state.sppoAmend.verificationSPPOAmend) ? state.sppoAmend.verificationSPPOAmend : [];
    return {
        totalSPPOAmend: sppoAmendArray.length,
        selectedSPPOAmend: state.sppoAmend.sppoAmendData,
        approvalStatus: state.sppoAmend.approvalStatus,
        isProcessing: state.sppoAmend.loading.approveSPPOAmend,
        hasSPPOAmend: sppoAmendArray.length > 0
    };
};

export const selectSPPOAmendDetails = (state) => {
    const sppoAmendArray = Array.isArray(state.sppoAmend.verificationSPPOAmend) ? state.sppoAmend.verificationSPPOAmend : [];
    return {
        sppoAmend: sppoAmendArray,
        totalSPPOAmend: sppoAmendArray.length,
        selectedSPPOAmendData: state.sppoAmend.sppoAmendData,
        isLoading: state.sppoAmend.loading.sppoAmendData,
        error: state.sppoAmend.errors.sppoAmendData,
        hasSPPOAmend: sppoAmendArray.length > 0,
        isEmpty: sppoAmendArray.length === 0 && !state.sppoAmend.loading.verificationSPPOAmend
    };
};

export default sppoAmendSlice.reducer;