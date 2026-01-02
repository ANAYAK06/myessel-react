import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lostDamagedItemsAPI from '../../api/Stock/lostDamagedItemsVerificationAPI';

// Async Thunks
export const fetchVerificationLDItems = createAsyncThunk(
    'lostDamagedItems/fetchVerificationLDItems',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await lostDamagedItemsAPI.getVerificationLDItems(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Lost/Damaged Items');
        }
    }
);

export const fetchLDItemsByRefnoForVerify = createAsyncThunk(
    'lostDamagedItems/fetchLDItemsByRefnoForVerify',
    async ({ refNo }, { rejectWithValue }) => {
        try {
            const response = await lostDamagedItemsAPI.getVerificationLDItemsbyRefno(refNo);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Lost/Damaged Items Verification Data');
        }
    }
);

export const approveLostDamagedItems = createAsyncThunk(
    'lostDamagedItems/approveLostDamagedItems',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await lostDamagedItemsAPI.approveLostDamagedItems(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Lost/Damaged Items');
        }
    }
);

const initialState = {
    verificationLDItems: [],
    ldItemData: null,
    approvalResult: null,
    loading: {
        verificationLDItems: false,
        ldItemData: false,
        approveLostDamagedItems: false,
    },
    errors: {
        verificationLDItems: null,
        ldItemData: null,
        approveLostDamagedItems: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedRefNo: null,
    approvalStatus: null,
};

const lostDamagedItemsSlice = createSlice({
    name: 'lostDamagedItems',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedRefNo: (state, action) => {
            state.selectedRefNo = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetLDItemData: (state) => {
            state.ldItemData = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetLostDamagedItemsState: (state) => {
            state.verificationLDItems = [];
            state.ldItemData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedRefNo = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerificationLDItems.pending, (state) => {
                state.loading.verificationLDItems = true;
                state.errors.verificationLDItems = null;
            })
            .addCase(fetchVerificationLDItems.fulfilled, (state, action) => {
                state.loading.verificationLDItems = false;
                state.verificationLDItems = action.payload?.Data || [];
            })
            .addCase(fetchVerificationLDItems.rejected, (state, action) => {
                state.loading.verificationLDItems = false;
                state.errors.verificationLDItems = action.payload;
                state.verificationLDItems = [];
            })

            .addCase(fetchLDItemsByRefnoForVerify.pending, (state) => {
                state.loading.ldItemData = true;
                state.errors.ldItemData = null;
            })
            .addCase(fetchLDItemsByRefnoForVerify.fulfilled, (state, action) => {
                state.loading.ldItemData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemDescList: apiResponse.Data.ItemDescList 
                            ? [...apiResponse.Data.ItemDescList.map(item => ({...item}))]
                            : []
                    };
                    state.ldItemData = extractedData;
                } else {
                    state.ldItemData = null;
                }
            })
            .addCase(fetchLDItemsByRefnoForVerify.rejected, (state, action) => {
                state.loading.ldItemData = false;
                state.errors.ldItemData = action.payload;
                state.ldItemData = null;
            })

            .addCase(approveLostDamagedItems.pending, (state) => {
                state.loading.approveLostDamagedItems = true;
                state.errors.approveLostDamagedItems = null;
            })
            .addCase(approveLostDamagedItems.fulfilled, (state, action) => {
                state.loading.approveLostDamagedItems = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveLostDamagedItems.rejected, (state, action) => {
                state.loading.approveLostDamagedItems = false;
                state.errors.approveLostDamagedItems = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedRefNo,
    setApprovalStatus,
    resetLDItemData,
    clearError,
    resetLostDamagedItemsState,
    clearApprovalResult
} = lostDamagedItemsSlice.actions;

// Selectors
export const selectVerificationLDItems = (state) => state.lostDamagedItems.verificationLDItems;
export const selectLDItemData = (state) => state.lostDamagedItems.ldItemData;
export const selectApprovalResult = (state) => state.lostDamagedItems.approvalResult;
export const selectVerificationLDItemsArray = (state) => {
    const ldItems = state.lostDamagedItems.verificationLDItems;
    return Array.isArray(ldItems) ? ldItems : [];
};

export const selectLoading = (state) => state.lostDamagedItems.loading;
export const selectVerificationLDItemsLoading = (state) => state.lostDamagedItems.loading.verificationLDItems;
export const selectLDItemDataLoading = (state) => state.lostDamagedItems.loading.ldItemData;
export const selectApproveLostDamagedItemsLoading = (state) => state.lostDamagedItems.loading.approveLostDamagedItems;

export const selectErrors = (state) => state.lostDamagedItems.errors;
export const selectVerificationLDItemsError = (state) => state.lostDamagedItems.errors.verificationLDItems;
export const selectLDItemDataError = (state) => state.lostDamagedItems.errors.ldItemData;
export const selectApproveLostDamagedItemsError = (state) => state.lostDamagedItems.errors.approveLostDamagedItems;

export const selectSelectedRoleId = (state) => state.lostDamagedItems.selectedRoleId;
export const selectSelectedUserId = (state) => state.lostDamagedItems.selectedUserId;
export const selectSelectedRefNo = (state) => state.lostDamagedItems.selectedRefNo;
export const selectApprovalStatus = (state) => state.lostDamagedItems.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.lostDamagedItems.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.lostDamagedItems.errors).some(error => error !== null);

export const selectLDItemsSummary = (state) => {
    const ldItemsArray = Array.isArray(state.lostDamagedItems.verificationLDItems) ? state.lostDamagedItems.verificationLDItems : [];
    return {
        totalLDItems: ldItemsArray.length,
        selectedLDItem: state.lostDamagedItems.ldItemData,
        approvalStatus: state.lostDamagedItems.approvalStatus,
        isProcessing: state.lostDamagedItems.loading.approveLostDamagedItems,
        hasLDItems: ldItemsArray.length > 0
    };
};

export const selectLDItemDetails = (state) => {
    const ldItemsArray = Array.isArray(state.lostDamagedItems.verificationLDItems) ? state.lostDamagedItems.verificationLDItems : [];
    return {
        ldItems: ldItemsArray,
        totalLDItems: ldItemsArray.length,
        selectedLDItemData: state.lostDamagedItems.ldItemData,
        isLoading: state.lostDamagedItems.loading.ldItemData,
        error: state.lostDamagedItems.errors.ldItemData,
        hasLDItems: ldItemsArray.length > 0,
        isEmpty: ldItemsArray.length === 0 && !state.lostDamagedItems.loading.verificationLDItems
    };
};

export default lostDamagedItemsSlice.reducer;