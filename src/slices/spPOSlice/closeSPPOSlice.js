import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as closeSPPOAPI from '../../api/SpPOAPI/closeSPPOAPI';

// Async Thunks
export const fetchVerificationSPPOClose = createAsyncThunk(
    'closeSPPO/fetchVerificationSPPOClose',
    async ({ roleId, userId, type }, { rejectWithValue }) => {
        try {
            const response = await closeSPPOAPI.getVerificationSPPOClose(roleId, userId, type);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification SPPO Close');
        }
    }
);

export const fetchSPPOByNoForVerify = createAsyncThunk(
    'closeSPPO/fetchSPPOByNoForVerify',
    async ({ sppoNo, ccCode, vendorCode }, { rejectWithValue }) => {
        try {
            const response = await closeSPPOAPI.getSPPObyNo(sppoNo, ccCode, vendorCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SPPO Verification Data');
        }
    }
);

export const approveCloseSPPO = createAsyncThunk(
    'closeSPPO/approveCloseSPPO',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await closeSPPOAPI.approveCloseSPPO(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve Close SPPO');
        }
    }
);

const initialState = {
    verificationSPPOClose: [],
    sppoData: null,
    approvalResult: null,
    loading: {
        verificationSPPOClose: false,
        sppoData: false,
        approveCloseSPPO: false,
    },
    errors: {
        verificationSPPOClose: null,
        sppoData: null,
        approveCloseSPPO: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedType: null,
    selectedSppoNo: null,
    selectedCCCode: null,
    selectedVendorCode: null,
    approvalStatus: null,
};

const closeSPPOSlice = createSlice({
    name: 'closeSPPO',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedType: (state, action) => {
            state.selectedType = action.payload;
        },
        setSelectedSppoNo: (state, action) => {
            state.selectedSppoNo = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedVendorCode: (state, action) => {
            state.selectedVendorCode = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetSPPOData: (state) => {
            state.sppoData = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetCloseSPPOState: (state) => {
            state.verificationSPPOClose = [];
            state.sppoData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedType = null;
            state.selectedSppoNo = null;
            state.selectedCCCode = null;
            state.selectedVendorCode = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerificationSPPOClose.pending, (state) => {
                state.loading.verificationSPPOClose = true;
                state.errors.verificationSPPOClose = null;
            })
            .addCase(fetchVerificationSPPOClose.fulfilled, (state, action) => {
                state.loading.verificationSPPOClose = false;
                state.verificationSPPOClose = action.payload?.Data || [];
            })
            .addCase(fetchVerificationSPPOClose.rejected, (state, action) => {
                state.loading.verificationSPPOClose = false;
                state.errors.verificationSPPOClose = action.payload;
                state.verificationSPPOClose = [];
            })

            .addCase(fetchSPPOByNoForVerify.pending, (state) => {
                state.loading.sppoData = true;
                state.errors.sppoData = null;
            })
            .addCase(fetchSPPOByNoForVerify.fulfilled, (state, action) => {
                state.loading.sppoData = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        ItemList: apiResponse.Data.ItemList 
                            ? [...apiResponse.Data.ItemList.map(item => ({...item}))]
                            : []
                    };
                    state.sppoData = extractedData;
                } else {
                    state.sppoData = null;
                }
            })
            .addCase(fetchSPPOByNoForVerify.rejected, (state, action) => {
                state.loading.sppoData = false;
                state.errors.sppoData = action.payload;
                state.sppoData = null;
            })

            .addCase(approveCloseSPPO.pending, (state) => {
                state.loading.approveCloseSPPO = true;
                state.errors.approveCloseSPPO = null;
            })
            .addCase(approveCloseSPPO.fulfilled, (state, action) => {
                state.loading.approveCloseSPPO = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveCloseSPPO.rejected, (state, action) => {
                state.loading.approveCloseSPPO = false;
                state.errors.approveCloseSPPO = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedType,
    setSelectedSppoNo,
    setSelectedCCCode,
    setSelectedVendorCode,
    setApprovalStatus,
    resetSPPOData,
    clearError,
    resetCloseSPPOState,
    clearApprovalResult
} = closeSPPOSlice.actions;

// Selectors
export const selectVerificationSPPOClose = (state) => state.closeSPPO.verificationSPPOClose;
export const selectSPPOData = (state) => state.closeSPPO.sppoData;
export const selectApprovalResult = (state) => state.closeSPPO.approvalResult;
export const selectVerificationSPPOCloseArray = (state) => {
    const sppoClose = state.closeSPPO.verificationSPPOClose;
    return Array.isArray(sppoClose) ? sppoClose : [];
};

export const selectLoading = (state) => state.closeSPPO.loading;
export const selectVerificationSPPOCloseLoading = (state) => state.closeSPPO.loading.verificationSPPOClose;
export const selectSPPODataLoading = (state) => state.closeSPPO.loading.sppoData;
export const selectApproveCloseSPPOLoading = (state) => state.closeSPPO.loading.approveCloseSPPO;

export const selectErrors = (state) => state.closeSPPO.errors;
export const selectVerificationSPPOCloseError = (state) => state.closeSPPO.errors.verificationSPPOClose;
export const selectSPPODataError = (state) => state.closeSPPO.errors.sppoData;
export const selectApproveCloseSPPOError = (state) => state.closeSPPO.errors.approveCloseSPPO;

export const selectSelectedRoleId = (state) => state.closeSPPO.selectedRoleId;
export const selectSelectedUserId = (state) => state.closeSPPO.selectedUserId;
export const selectSelectedType = (state) => state.closeSPPO.selectedType;
export const selectSelectedSppoNo = (state) => state.closeSPPO.selectedSppoNo;
export const selectSelectedCCCode = (state) => state.closeSPPO.selectedCCCode;
export const selectSelectedVendorCode = (state) => state.closeSPPO.selectedVendorCode;
export const selectApprovalStatus = (state) => state.closeSPPO.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.closeSPPO.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.closeSPPO.errors).some(error => error !== null);

export const selectSPPOCloseSummary = (state) => {
    const sppoCloseArray = Array.isArray(state.closeSPPO.verificationSPPOClose) ? state.closeSPPO.verificationSPPOClose : [];
    return {
        totalSPPOClose: sppoCloseArray.length,
        selectedSPPO: state.closeSPPO.sppoData,
        approvalStatus: state.closeSPPO.approvalStatus,
        isProcessing: state.closeSPPO.loading.approveCloseSPPO,
        hasSPPOClose: sppoCloseArray.length > 0
    };
};

export const selectSPPOCloseDetails = (state) => {
    const sppoCloseArray = Array.isArray(state.closeSPPO.verificationSPPOClose) ? state.closeSPPO.verificationSPPOClose : [];
    return {
        sppoClose: sppoCloseArray,
        totalSPPOClose: sppoCloseArray.length,
        selectedSPPOData: state.closeSPPO.sppoData,
        isLoading: state.closeSPPO.loading.sppoData,
        error: state.closeSPPO.errors.sppoData,
        hasSPPOClose: sppoCloseArray.length > 0,
        isEmpty: sppoCloseArray.length === 0 && !state.closeSPPO.loading.verificationSPPOClose
    };
};

export default closeSPPOSlice.reducer;