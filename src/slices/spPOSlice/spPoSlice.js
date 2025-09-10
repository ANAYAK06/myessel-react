import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as sppoAPI from '../../api/SpPOAPI/sppoApi';

// Async Thunks
export const fetchVerificationSPPOs = createAsyncThunk(
    'sppo/fetchVerificationSPPOs',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await sppoAPI.getVerificationSPPO(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification SPPOs');
        }
    }
);

export const fetchSPPOByNoForVerify = createAsyncThunk(
    'sppo/fetchSPPOByNoForVerify',
    async ({ sppono, ccCode, vendorCode, amendId }, { rejectWithValue }) => {
        try {
            const response = await sppoAPI.getSPPObyNoForVerify(sppono, ccCode, vendorCode, amendId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch SPPO Verification Data');
        }
    }
);

export const approveSPPO = createAsyncThunk(
    'sppo/approveSPPO',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await sppoAPI.approveSPPO(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve SPPO');
        }
    }
);

const initialState = {
    verificationSPPOs: [],
    sppoData: null,
    approvalResult: null,
    loading: {
        verificationSPPOs: false,
        sppoData: false,
        approveSPPO: false,
    },
    errors: {
        verificationSPPOs: null,
        sppoData: null,
        approveSPPO: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedSppono: null,
    selectedCCCode: null,
    selectedVendorCode: null,
    selectedAmendId: null,
    approvalStatus: null,
};

const sppoSlice = createSlice({
    name: 'sppo',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedSppono: (state, action) => {
            state.selectedSppono = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedVendorCode: (state, action) => {
            state.selectedVendorCode = action.payload;
        },
        setSelectedAmendId: (state, action) => {
            state.selectedAmendId = action.payload;
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
        resetSPPOState: (state) => {
            state.verificationSPPOs = [];
            state.sppoData = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedSppono = null;
            state.selectedCCCode = null;
            state.selectedVendorCode = null;
            state.selectedAmendId = null;
            state.approvalStatus = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVerificationSPPOs.pending, (state) => {
                state.loading.verificationSPPOs = true;
                state.errors.verificationSPPOs = null;
            })
            .addCase(fetchVerificationSPPOs.fulfilled, (state, action) => {
                state.loading.verificationSPPOs = false;
                state.verificationSPPOs = action.payload?.Data || [];
            })
            .addCase(fetchVerificationSPPOs.rejected, (state, action) => {
                state.loading.verificationSPPOs = false;
                state.errors.verificationSPPOs = action.payload;
                state.verificationSPPOs = [];
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
                        ItemDescList: apiResponse.Data.ItemDescList 
                            ? [...apiResponse.Data.ItemDescList.map(item => ({...item}))]
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

            .addCase(approveSPPO.pending, (state) => {
                state.loading.approveSPPO = true;
                state.errors.approveSPPO = null;
            })
            .addCase(approveSPPO.fulfilled, (state, action) => {
                state.loading.approveSPPO = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveSPPO.rejected, (state, action) => {
                state.loading.approveSPPO = false;
                state.errors.approveSPPO = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedSppono,
    setSelectedCCCode,
    setSelectedVendorCode,
    setSelectedAmendId,
    setApprovalStatus,
    resetSPPOData,
    clearError,
    resetSPPOState,
    clearApprovalResult
} = sppoSlice.actions;

// Selectors
export const selectVerificationSPPOs = (state) => state.sppo.verificationSPPOs;
export const selectSPPOData = (state) => state.sppo.sppoData;
export const selectApprovalResult = (state) => state.sppo.approvalResult;
export const selectVerificationSPPOsArray = (state) => {
    const sppos = state.sppo.verificationSPPOs;
    return Array.isArray(sppos) ? sppos : [];
};

export const selectLoading = (state) => state.sppo.loading;
export const selectVerificationSPPOsLoading = (state) => state.sppo.loading.verificationSPPOs;
export const selectSPPODataLoading = (state) => state.sppo.loading.sppoData;
export const selectApproveSPPOLoading = (state) => state.sppo.loading.approveSPPO;

export const selectErrors = (state) => state.sppo.errors;
export const selectVerificationSPPOsError = (state) => state.sppo.errors.verificationSPPOs;
export const selectSPPODataError = (state) => state.sppo.errors.sppoData;
export const selectApproveSPPOError = (state) => state.sppo.errors.approveSPPO;

export const selectSelectedRoleId = (state) => state.sppo.selectedRoleId;
export const selectSelectedUserId = (state) => state.sppo.selectedUserId;
export const selectSelectedSppono = (state) => state.sppo.selectedSppono;
export const selectSelectedCCCode = (state) => state.sppo.selectedCCCode;
export const selectSelectedVendorCode = (state) => state.sppo.selectedVendorCode;
export const selectSelectedAmendId = (state) => state.sppo.selectedAmendId;
export const selectApprovalStatus = (state) => state.sppo.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.sppo.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.sppo.errors).some(error => error !== null);

export const selectSPPOSummary = (state) => {
    const spposArray = Array.isArray(state.sppo.verificationSPPOs) ? state.sppo.verificationSPPOs : [];
    return {
        totalSPPOs: spposArray.length,
        selectedSPPO: state.sppo.sppoData,
        approvalStatus: state.sppo.approvalStatus,
        isProcessing: state.sppo.loading.approveSPPO,
        hasSPPOs: spposArray.length > 0
    };
};

export const selectSPPODetails = (state) => {
    const spposArray = Array.isArray(state.sppo.verificationSPPOs) ? state.sppo.verificationSPPOs : [];
    return {
        sppos: spposArray,
        totalSPPOs: spposArray.length,
        selectedSPPOData: state.sppo.sppoData,
        isLoading: state.sppo.loading.sppoData,
        error: state.sppo.errors.sppoData,
        hasSPPOs: spposArray.length > 0,
        isEmpty: spposArray.length === 0 && !state.sppo.loading.verificationSPPOs
    };
};

export default sppoSlice.reducer;