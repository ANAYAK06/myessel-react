import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as clientPOAPI from '../../api/ClientPOAPI/clientPoVerificationAPI';

// Async Thunks
export const fetchVerificationClientPOs = createAsyncThunk(
    'clientPO/fetchVerificationClientPOs',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getVerificationClientPO(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Client POs');
        }
    }
);

export const fetchClientPOByNoForVerify = createAsyncThunk(
    'clientPO/fetchClientPOByNoForVerify',
    async ({ poNumber }, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.getVerificationClientPObyNo(poNumber);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Client PO Verification Data');
        }
    }
);

export const approveClientPO = createAsyncThunk(
    'clientPO/approveClientPO',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await clientPOAPI.approveClientPO(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Client PO');
        }
    }
);

const initialState = {
    verificationClientPOs: [],
    clientPOData: null,
    approvalResult: null,
    loading: {
        verificationClientPOs: false,
        clientPOData: false,
        approveClientPO: false,
    },
    errors: {
        verificationClientPOs: null,
        clientPOData: null,
        approveClientPO: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedPoNumber: null,
    approvalStatus: null,
};

const clientPOSlice = createSlice({
    name: 'clientPO',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedPoNumber: (state, action) => {
            state.selectedPoNumber = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetClientPOData: (state) => {
            state.clientPOData = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetClientPOState: (state) => {
            state.verificationClientPOs = [];
            state.clientPOData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedPoNumber = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerificationClientPOs.pending, (state) => {
                state.loading.verificationClientPOs = true;
                state.errors.verificationClientPOs = null;
            })
            .addCase(fetchVerificationClientPOs.fulfilled, (state, action) => {
                state.loading.verificationClientPOs = false;
                state.verificationClientPOs = action.payload?.Data || [];
            })
            .addCase(fetchVerificationClientPOs.rejected, (state, action) => {
                state.loading.verificationClientPOs = false;
                state.errors.verificationClientPOs = action.payload;
                state.verificationClientPOs = [];
            })

            .addCase(fetchClientPOByNoForVerify.pending, (state) => {
                state.loading.clientPOData = true;
                state.errors.clientPOData = null;
            })
            .addCase(fetchClientPOByNoForVerify.fulfilled, (state, action) => {
                state.loading.clientPOData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemDescList: apiResponse.Data.ItemDescList 
                            ? [...apiResponse.Data.ItemDescList.map(item => ({...item}))]
                            : []
                    };
                    state.clientPOData = extractedData;
                } else {
                    state.clientPOData = null;
                }
            })
            .addCase(fetchClientPOByNoForVerify.rejected, (state, action) => {
                state.loading.clientPOData = false;
                state.errors.clientPOData = action.payload;
                state.clientPOData = null;
            })

            .addCase(approveClientPO.pending, (state) => {
                state.loading.approveClientPO = true;
                state.errors.approveClientPO = null;
            })
            .addCase(approveClientPO.fulfilled, (state, action) => {
                state.loading.approveClientPO = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveClientPO.rejected, (state, action) => {
                state.loading.approveClientPO = false;
                state.errors.approveClientPO = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedPoNumber,
    setApprovalStatus,
    resetClientPOData,
    clearError,
    resetClientPOState,
    clearApprovalResult
} = clientPOSlice.actions;

// Selectors
export const selectVerificationClientPOs = (state) => state.clientPO.verificationClientPOs;
export const selectClientPOData = (state) => state.clientPO.clientPOData;
export const selectApprovalResult = (state) => state.clientPO.approvalResult;
export const selectVerificationClientPOsArray = (state) => {
    const clientPOs = state.clientPO.verificationClientPOs;
    return Array.isArray(clientPOs) ? clientPOs : [];
};

export const selectLoading = (state) => state.clientPO.loading;
export const selectVerificationClientPOsLoading = (state) => state.clientPO.loading.verificationClientPOs;
export const selectClientPODataLoading = (state) => state.clientPO.loading.clientPOData;
export const selectApproveClientPOLoading = (state) => state.clientPO.loading.approveClientPO;

export const selectErrors = (state) => state.clientPO.errors;
export const selectVerificationClientPOsError = (state) => state.clientPO.errors.verificationClientPOs;
export const selectClientPODataError = (state) => state.clientPO.errors.clientPOData;
export const selectApproveClientPOError = (state) => state.clientPO.errors.approveClientPO;

export const selectSelectedRoleId = (state) => state.clientPO.selectedRoleId;
export const selectSelectedUserId = (state) => state.clientPO.selectedUserId;
export const selectSelectedPoNumber = (state) => state.clientPO.selectedPoNumber;
export const selectApprovalStatus = (state) => state.clientPO.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.clientPO.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.clientPO.errors).some(error => error !== null);

export const selectClientPOSummary = (state) => {
    const clientPOsArray = Array.isArray(state.clientPO.verificationClientPOs) ? state.clientPO.verificationClientPOs : [];
    return {
        totalClientPOs: clientPOsArray.length,
        selectedClientPO: state.clientPO.clientPOData,
        approvalStatus: state.clientPO.approvalStatus,
        isProcessing: state.clientPO.loading.approveClientPO,
        hasClientPOs: clientPOsArray.length > 0
    };
};

export const selectClientPODetails = (state) => {
    const clientPOsArray = Array.isArray(state.clientPO.verificationClientPOs) ? state.clientPO.verificationClientPOs : [];
    return {
        clientPOs: clientPOsArray,
        totalClientPOs: clientPOsArray.length,
        selectedClientPOData: state.clientPO.clientPOData,
        isLoading: state.clientPO.loading.clientPOData,
        error: state.clientPO.errors.clientPOData,
        hasClientPOs: clientPOsArray.length > 0,
        isEmpty: clientPOsArray.length === 0 && !state.clientPO.loading.verificationClientPOs
    };
};

export default clientPOSlice.reducer;