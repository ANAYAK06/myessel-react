import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as costCenterCreationAPI from '../../api/CostCenterAPI/costCenterCreationAPI';

// Async Thunks
export const fetchCostCenterDetails = createAsyncThunk(
    'costCenterCreation/fetchCostCenterDetails',
    async (_, { rejectWithValue }) => {
        try {
            const response = await costCenterCreationAPI.getCostCenterDetails();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Center Details');
        }
    }
);

export const checkCCCodeExistence = createAsyncThunk(
    'costCenterCreation/checkCCCodeExistence',
    async (ccCode, { rejectWithValue }) => {
        try {
            const response = await costCenterCreationAPI.checkCCCodeExist(ccCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check CC Code existence');
        }
    }
);

export const saveNewCostCenter = createAsyncThunk(
    'costCenterCreation/saveNewCostCenter',
    async (costCenterData, { rejectWithValue }) => {
        try {
            const response = await costCenterCreationAPI.saveNewCostCenter(costCenterData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save Cost Center');
        }
    }
);

export const fetchCostCenterStatesList = createAsyncThunk(
    'costCenterCreation/fetchCostCenterStatesList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await costCenterCreationAPI.getCostCenterStatesList();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Cost Center States List');
        }
    }
);

export const fetchGroupRegions = createAsyncThunk(
    'costCenterCreation/fetchGroupRegions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await costCenterCreationAPI.getGroupRegions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Group Regions');
        }
    }
);

const initialState = {
    costCenterDetails: [],
    ccCodeExists: null,
    saveResult: null,
    statesList: [],
    groupRegions: [],
    loading: {
        costCenterDetails: false,
        ccCodeCheck: false,
        saveCostCenter: false,
        statesList: false,
        groupRegions: false,
    },
    errors: {
        costCenterDetails: null,
        ccCodeCheck: null,
        saveCostCenter: null,
        statesList: null,
        groupRegions: null,
    },
    formData: {
        CCCode: '',
        CCName: '',
        GroupId: null,
        RegionId: null,
        StateId: null,
        Createdby: null,
    },
};

const costCenterCreationSlice = createSlice({
    name: 'costCenterCreation',
    initialState,
    reducers: {
        setFormData: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        resetFormData: (state) => {
            state.formData = {
                CCCode: '',
                CCName: '',
                GroupId: null,
                RegionId: null,
                StateId: null,
                Createdby: null,
            };
        },
        setCCCode: (state, action) => {
            state.formData.CCCode = action.payload;
        },
        setCCName: (state, action) => {
            state.formData.CCName = action.payload;
        },
        setGroupId: (state, action) => {
            state.formData.GroupId = action.payload;
        },
        setRegionId: (state, action) => {
            state.formData.RegionId = action.payload;
        },
        setStateId: (state, action) => {
            state.formData.StateId = action.payload;
        },
        setCreatedby: (state, action) => {
            state.formData.Createdby = action.payload;
        },
        resetCCCodeExists: (state) => {
            state.ccCodeExists = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetCostCenterCreationState: (state) => {
            state.costCenterDetails = [];
            state.ccCodeExists = null;
            state.saveResult = null;
            state.statesList = [];
            state.groupRegions = [];
            state.formData = {
                CCCode: '',
                CCName: '',
                GroupId: null,
                RegionId: null,
                StateId: null,
                Createdby: null,
            };
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCostCenterDetails.pending, (state) => {
                state.loading.costCenterDetails = true;
                state.errors.costCenterDetails = null;
            })
            .addCase(fetchCostCenterDetails.fulfilled, (state, action) => {
                state.loading.costCenterDetails = false;
                state.costCenterDetails = action.payload?.Data || [];
            })
            .addCase(fetchCostCenterDetails.rejected, (state, action) => {
                state.loading.costCenterDetails = false;
                state.errors.costCenterDetails = action.payload;
                state.costCenterDetails = [];
            })

            .addCase(checkCCCodeExistence.pending, (state) => {
                state.loading.ccCodeCheck = true;
                state.errors.ccCodeCheck = null;
                state.ccCodeExists = null;
            })
            .addCase(checkCCCodeExistence.fulfilled, (state, action) => {
                state.loading.ccCodeCheck = false;

                // Extract the Data array from the API response
                const dataArray = action.payload?.Data || [];

                // Check if the array has items: length > 0 means code EXISTS (taken)
                const codeExists = Array.isArray(dataArray) && dataArray.length > 0;

                // Store the boolean result
                state.ccCodeExists = codeExists;

                console.log('✅ CC Code Check Result:', {
                    dataLength: dataArray.length,
                    exists: codeExists,
                    message: codeExists ? '❌ Code already exists (Data has items)' : '✅ Code is available (Data is empty)'
                });
            })
            .addCase(checkCCCodeExistence.rejected, (state, action) => {
                state.loading.ccCodeCheck = false;
                state.errors.ccCodeCheck = action.payload;
                state.ccCodeExists = null;
            })

            .addCase(saveNewCostCenter.pending, (state) => {
                state.loading.saveCostCenter = true;
                state.errors.saveCostCenter = null;
            })
            .addCase(saveNewCostCenter.fulfilled, (state, action) => {
                state.loading.saveCostCenter = false;
                state.saveResult = action.payload;
            })
            .addCase(saveNewCostCenter.rejected, (state, action) => {
                state.loading.saveCostCenter = false;
                state.errors.saveCostCenter = action.payload;
            })

            .addCase(fetchCostCenterStatesList.pending, (state) => {
                state.loading.statesList = true;
                state.errors.statesList = null;
            })
            .addCase(fetchCostCenterStatesList.fulfilled, (state, action) => {
                state.loading.statesList = false;
                state.statesList = action.payload?.Data || [];
            })
            .addCase(fetchCostCenterStatesList.rejected, (state, action) => {
                state.loading.statesList = false;
                state.errors.statesList = action.payload;
                state.statesList = [];
            })

            .addCase(fetchGroupRegions.pending, (state) => {
                state.loading.groupRegions = true;
                state.errors.groupRegions = null;
            })
            .addCase(fetchGroupRegions.fulfilled, (state, action) => {
                state.loading.groupRegions = false;

                // Extract Groups array from nested Data.Groups structure
                const groupsArray = action.payload?.Data?.Groups || [];
                state.groupRegions = groupsArray;

                console.log('✅ Groups Loaded:', {
                    totalGroups: groupsArray.length,
                    groups: groupsArray.map(g => `${g.GroupID}: ${g.GroupName}`)
                });
            })
            .addCase(fetchGroupRegions.rejected, (state, action) => {
                state.loading.groupRegions = false;
                state.errors.groupRegions = action.payload;
                state.groupRegions = [];
            })
    },
});

export const {
    setFormData,
    resetFormData,
    setCCCode,
    setCCName,
    setGroupId,
    setRegionId,
    setStateId,
    setCreatedby,
    resetCCCodeExists,
    clearError,
    resetCostCenterCreationState,
    clearSaveResult
} = costCenterCreationSlice.actions;

// Selectors
export const selectCostCenterDetails = (state) => state.costCenterCreation.costCenterDetails;
export const selectCCCodeExists = (state) => state.costCenterCreation.ccCodeExists;
export const selectSaveResult = (state) => state.costCenterCreation.saveResult;
export const selectStatesList = (state) => state.costCenterCreation.statesList;
export const selectGroupRegions = (state) => state.costCenterCreation.groupRegions;

export const selectCostCenterDetailsArray = (state) => {
    const details = state.costCenterCreation.costCenterDetails;
    return Array.isArray(details) ? details : [];
};

export const selectStatesListArray = (state) => {
    const states = state.costCenterCreation.statesList;
    return Array.isArray(states) ? states : [];
};

export const selectGroupRegionsArray = (state) => {
    const regions = state.costCenterCreation.groupRegions;
    return Array.isArray(regions) ? regions : [];
};

export const selectLoading = (state) => state.costCenterCreation.loading;
export const selectCostCenterDetailsLoading = (state) => state.costCenterCreation.loading.costCenterDetails;
export const selectCCCodeCheckLoading = (state) => state.costCenterCreation.loading.ccCodeCheck;
export const selectSaveCostCenterLoading = (state) => state.costCenterCreation.loading.saveCostCenter;
export const selectStatesListLoading = (state) => state.costCenterCreation.loading.statesList;
export const selectGroupRegionsLoading = (state) => state.costCenterCreation.loading.groupRegions;

export const selectErrors = (state) => state.costCenterCreation.errors;
export const selectCostCenterDetailsError = (state) => state.costCenterCreation.errors.costCenterDetails;
export const selectCCCodeCheckError = (state) => state.costCenterCreation.errors.ccCodeCheck;
export const selectSaveCostCenterError = (state) => state.costCenterCreation.errors.saveCostCenter;
export const selectStatesListError = (state) => state.costCenterCreation.errors.statesList;
export const selectGroupRegionsError = (state) => state.costCenterCreation.errors.groupRegions;

export const selectFormData = (state) => state.costCenterCreation.formData;
export const selectCCCodeFromForm = (state) => state.costCenterCreation.formData.CCCode;
export const selectCCNameFromForm = (state) => state.costCenterCreation.formData.CCName;
export const selectGroupIdFromForm = (state) => state.costCenterCreation.formData.GroupId;
export const selectRegionIdFromForm = (state) => state.costCenterCreation.formData.RegionId;
export const selectStateIdFromForm = (state) => state.costCenterCreation.formData.StateId;
export const selectCreatedbyFromForm = (state) => state.costCenterCreation.formData.Createdby;

export const selectIsAnyLoading = (state) => Object.values(state.costCenterCreation.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.costCenterCreation.errors).some(error => error !== null);

export const selectCostCenterCreationSummary = (state) => {
    const detailsArray = Array.isArray(state.costCenterCreation.costCenterDetails) ? state.costCenterCreation.costCenterDetails : [];
    return {
        totalCostCenters: detailsArray.length,
        ccCodeExists: state.costCenterCreation.ccCodeExists,
        isProcessing: state.costCenterCreation.loading.saveCostCenter,
        hasCostCenters: detailsArray.length > 0,
        formValid: !!(state.costCenterCreation.formData.CCCode && state.costCenterCreation.formData.CCName),
    };
};

export const selectDropdownData = (state) => {
    const statesArray = Array.isArray(state.costCenterCreation.statesList) ? state.costCenterCreation.statesList : [];
    const regionsArray = Array.isArray(state.costCenterCreation.groupRegions) ? state.costCenterCreation.groupRegions : [];

    return {
        states: statesArray,
        regions: regionsArray,
        isStatesLoading: state.costCenterCreation.loading.statesList,
        isRegionsLoading: state.costCenterCreation.loading.groupRegions,
        hasStates: statesArray.length > 0,
        hasRegions: regionsArray.length > 0,
    };
};

export const selectFormValidation = (state) => {
    const form = state.costCenterCreation.formData;
    return {
        isCCCodeValid: !!form.CCCode && form.CCCode.trim().length > 0,
        isCCNameValid: !!form.CCName && form.CCName.trim().length > 0,
        isGroupIdValid: form.GroupId !== null,
        isRegionIdValid: form.RegionId !== null,
        isStateIdValid: form.StateId !== null,
        isFormValid: !!(
            form.CCCode && form.CCCode.trim().length > 0 &&
            form.CCName && form.CCName.trim().length > 0 &&
            form.GroupId !== null &&
            form.RegionId !== null &&
            form.StateId !== null
        ),
    };
};

export default costCenterCreationSlice.reducer;