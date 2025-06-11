// store/slices/businessInfoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as businessInfoAPI from '../../api/businessinfoAPI/businessinfoAPI';

// Async thunks for API calls
export const fetchWorkflowLevels = createAsyncThunk(
    'businessInfo/fetchWorkflowLevels',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling fetchWorkflowLevels API');
            
            const response = await businessInfoAPI.getAllWorkFlowLevels();
            
            console.log('🎯 Workflow Levels API Response:', response);
            console.log('🎯 Response.Data:', response.Data);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if API call was successful and has data
            if (response && response.IsSuccessful === true && response.Data) {
                console.log('✅ Workflow levels fetched successfully');
                return response.Data;
            }
            // Fallback: check for data even if success flag is false
            else if (response && response.Data && Array.isArray(response.Data)) {
                console.log('✅ Workflow levels found (ignoring success flag)');
                return response.Data;
            }
            else {
                console.log('❌ No valid workflow levels data found');
                const errorMessage = response?.Message || 'No workflow levels data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Workflow Levels API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to fetch workflow levels');
        }
    }
);

export const fetchUserRoles = createAsyncThunk(
    'businessInfo/fetchUserRoles',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling fetchUserRoles API');
            
            const response = await businessInfoAPI.getAllUserRoles();
            
            console.log('🎯 User Roles API Response:', response);
            console.log('🎯 Response.Data:', response.Data);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if API call was successful and has data
            if (response && response.IsSuccessful === true && response.Data) {
                console.log('✅ User roles fetched successfully');
                return response.Data;
            }
            // Fallback: check for data even if success flag is false
            else if (response && response.Data && Array.isArray(response.Data)) {
                console.log('✅ User roles found (ignoring success flag)');
                return response.Data;
            }
            else {
                console.log('❌ No valid user roles data found');
                const errorMessage = response?.Message || 'No user roles data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 User Roles API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to fetch user roles');
        }
    }
);

export const fetchMasterOperations = createAsyncThunk(
    'businessInfo/fetchMasterOperations',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling fetchMasterOperations API');
            
            const response = await businessInfoAPI.getAllMasterOperations();
            
            console.log('🎯 Master Operations API Response:', response);
            console.log('🎯 Response.Data:', response.Data);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if API call was successful and has data
            if (response && response.IsSuccessful === true && response.Data) {
                console.log('✅ Master operations fetched successfully');
                return response.Data;
            }
            // Fallback: check for data even if success flag is false
            else if (response && response.Data && Array.isArray(response.Data)) {
                console.log('✅ Master operations found (ignoring success flag)');
                return response.Data;
            }
            else {
                console.log('❌ No valid master operations data found');
                const errorMessage = response?.Message || 'No master operations data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Master Operations API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to fetch master operations');
        }
    }
);

export const fetchWorkflowOperations = createAsyncThunk(
    'businessInfo/fetchWorkflowOperations',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling fetchWorkflowOperations API');
            
            const response = await businessInfoAPI.getWorkFlowMasterOperations();
            
            console.log('🎯 Workflow Operations API Response:', response);
            console.log('🎯 Response.Data:', response.Data);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if API call was successful and has data
            if (response && response.IsSuccessful === true && response.Data) {
                console.log('✅ Workflow operations fetched successfully');
                return response.Data;
            }
            // Fallback: check for data even if success flag is false
            else if (response && response.Data && Array.isArray(response.Data)) {
                console.log('✅ Workflow operations found (ignoring success flag)');
                return response.Data;
            }
            else {
                console.log('❌ No valid workflow operations data found');
                const errorMessage = response?.Message || 'No workflow operations data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Workflow Operations API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to fetch workflow operations');
        }
    }
);

export const saveApprovalHierarchy = createAsyncThunk(
    'businessInfo/saveApprovalHierarchy',
    async (hierarchyData, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling saveApprovalHierarchy API with:', hierarchyData);
            
            const response = await businessInfoAPI.saveApprovalHierarchy(hierarchyData);
            
            console.log('🎯 Save Approval Hierarchy Response:', response);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if save operation was successful
            if (response && response.IsSuccessful === true) {
                console.log('✅ Approval hierarchy saved successfully');
                return response.Data || { success: true, message: response.Message };
            }
            else {
                console.log('❌ Save approval hierarchy failed');
                const errorMessage = response?.Message || 'Failed to save approval hierarchy';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Save Approval Hierarchy API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to save approval hierarchy');
        }
    }
);

export const saveRoleOperations = createAsyncThunk(
    'businessInfo/saveRoleOperations',
    async (operationsData, { rejectWithValue }) => {
        try {
            console.log('🔍 Calling saveRoleOperations API with:', operationsData);
            
            const response = await businessInfoAPI.saveRoleOperations(operationsData);
            
            console.log('🎯 Save Role Operations Response:', response);
            console.log('🎯 IsSuccessful:', response.IsSuccessful);
            
            // Check if save operation was successful
            if (response && response.IsSuccessful === true) {
                console.log('✅ Role operations saved successfully');
                return response.Data || { success: true, message: response.Message };
            }
            else {
                console.log('❌ Save role operations failed');
                const errorMessage = response?.Message || 'Failed to save role operations';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('🚨 Save Role Operations API Error:', error);
            if (error.Message) {
                return rejectWithValue(error.Message);
            }
            return rejectWithValue(error.message || 'Failed to save role operations');
        }
    }
);

const initialState = {
    // Data states
    workflowLevels: [],
    userRoles: [],
    masterOperations: [],
    workflowOperations: [],
    
    // Loading states
    loading: {
        workflowLevels: false,
        userRoles: false,
        masterOperations: false,
        workflowOperations: false,
        saving: false
    },
    
    // Error states
    errors: {
        workflowLevels: null,
        userRoles: null,
        masterOperations: null,
        workflowOperations: null,
        saving: null
    },
    
    // UI state
    activeTab: 'approval-hierarchy',
    lastUpdated: null,
    
    // Cache timestamps to prevent unnecessary API calls
    cacheTimestamps: {
        workflowLevels: null,
        userRoles: null,
        masterOperations: null,
        workflowOperations: null
    }
};

const businessInfoSlice = createSlice({
    name: 'businessInfo',
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        clearErrors: (state) => {
            state.errors = {
                workflowLevels: null,
                userRoles: null,
                masterOperations: null,
                workflowOperations: null,
                saving: null
            };
        },
        clearSpecificError: (state, action) => {
            const errorType = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        updateWorkflowLevel: (state, action) => {
            const { index, updatedLevel } = action.payload;
            if (state.workflowLevels[index]) {
                state.workflowLevels[index] = { ...state.workflowLevels[index], ...updatedLevel };
            }
        },
        addWorkflowLevel: (state, action) => {
            state.workflowLevels.push(action.payload);
        },
        removeWorkflowLevel: (state, action) => {
            const index = action.payload;
            state.workflowLevels.splice(index, 1);
        },
        updateUserRole: (state, action) => {
            const { index, updatedRole } = action.payload;
            if (state.userRoles[index]) {
                state.userRoles[index] = { ...state.userRoles[index], ...updatedRole };
            }
        }
    },
    extraReducers: (builder) => {
        // Workflow Levels
        builder
            .addCase(fetchWorkflowLevels.pending, (state) => {
                state.loading.workflowLevels = true;
                state.errors.workflowLevels = null;
            })
            .addCase(fetchWorkflowLevels.fulfilled, (state, action) => {
                state.loading.workflowLevels = false;
                state.workflowLevels = action.payload;
                state.cacheTimestamps.workflowLevels = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchWorkflowLevels.rejected, (state, action) => {
                state.loading.workflowLevels = false;
                state.errors.workflowLevels = action.payload || 'Failed to fetch workflow levels';
            })

        // User Roles
        builder
            .addCase(fetchUserRoles.pending, (state) => {
                state.loading.userRoles = true;
                state.errors.userRoles = null;
            })
            .addCase(fetchUserRoles.fulfilled, (state, action) => {
                state.loading.userRoles = false;
                state.userRoles = action.payload;
                state.cacheTimestamps.userRoles = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchUserRoles.rejected, (state, action) => {
                state.loading.userRoles = false;
                state.errors.userRoles = action.payload || 'Failed to fetch user roles';
            })

        // Master Operations
        builder
            .addCase(fetchMasterOperations.pending, (state) => {
                state.loading.masterOperations = true;
                state.errors.masterOperations = null;
            })
            .addCase(fetchMasterOperations.fulfilled, (state, action) => {
                state.loading.masterOperations = false;
                state.masterOperations = action.payload;
                state.cacheTimestamps.masterOperations = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchMasterOperations.rejected, (state, action) => {
                state.loading.masterOperations = false;
                state.errors.masterOperations = action.payload || 'Failed to fetch master operations';
            })

        // Workflow Operations
        builder
            .addCase(fetchWorkflowOperations.pending, (state) => {
                state.loading.workflowOperations = true;
                state.errors.workflowOperations = null;
            })
            .addCase(fetchWorkflowOperations.fulfilled, (state, action) => {
                state.loading.workflowOperations = false;
                state.workflowOperations = action.payload;
                state.cacheTimestamps.workflowOperations = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchWorkflowOperations.rejected, (state, action) => {
                state.loading.workflowOperations = false;
                state.errors.workflowOperations = action.payload || 'Failed to fetch workflow operations';
            })

        // Save Approval Hierarchy
        builder
            .addCase(saveApprovalHierarchy.pending, (state) => {
                state.loading.saving = true;
                state.errors.saving = null;
            })
            .addCase(saveApprovalHierarchy.fulfilled, (state, action) => {
                state.loading.saving = false;
                state.lastUpdated = Date.now();
                // Optionally update the local state with the saved data
                // state.workflowLevels = action.payload;
            })
            .addCase(saveApprovalHierarchy.rejected, (state, action) => {
                state.loading.saving = false;
                state.errors.saving = action.payload || 'Failed to save approval hierarchy';
            })

        // Save Role Operations
        builder
            .addCase(saveRoleOperations.pending, (state) => {
                state.loading.saving = true;
                state.errors.saving = null;
            })
            .addCase(saveRoleOperations.fulfilled, (state, action) => {
                state.loading.saving = false;
                state.lastUpdated = Date.now();
                // Optionally update the local state with the saved data
                // state.workflowOperations = action.payload;
            })
            .addCase(saveRoleOperations.rejected, (state, action) => {
                state.loading.saving = false;
                state.errors.saving = action.payload || 'Failed to save role operations';
            });
    }
});

// Action creators are generated for each case reducer function
export const {
    setActiveTab,
    clearErrors,
    clearSpecificError,
    updateWorkflowLevel,
    addWorkflowLevel,
    removeWorkflowLevel,
    updateUserRole
} = businessInfoSlice.actions;

// Selectors
export const selectWorkflowLevels = (state) => state.businessInfo.workflowLevels;
export const selectUserRoles = (state) => state.businessInfo.userRoles;
export const selectMasterOperations = (state) => state.businessInfo.masterOperations;
export const selectWorkflowOperations = (state) => state.businessInfo.workflowOperations;
export const selectLoading = (state) => state.businessInfo.loading;
export const selectErrors = (state) => state.businessInfo.errors;
export const selectActiveTab = (state) => state.businessInfo.activeTab;
export const selectLastUpdated = (state) => state.businessInfo.lastUpdated;

// Complex selectors
export const selectIsAnyLoading = (state) => {
    const loading = state.businessInfo.loading;
    return Object.values(loading).some(isLoading => isLoading);
};

export const selectHasAnyError = (state) => {
    const errors = state.businessInfo.errors;
    return Object.values(errors).some(error => error !== null);
};

// Thunk for refreshing all data
export const refreshAllData = () => async (dispatch) => {
    const promises = [
        dispatch(fetchWorkflowLevels()),
        dispatch(fetchUserRoles()),
        dispatch(fetchMasterOperations()),
        dispatch(fetchWorkflowOperations())
    ];
    
    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
};

// Thunk for smart data fetching (only fetch if cache is old)
export const smartFetchData = (maxCacheAge = 5 * 60 * 1000) => (dispatch, getState) => {
    const state = getState();
    const now = Date.now();
    const { cacheTimestamps } = state.businessInfo;
    
    const promises = [];
    
    // Check each data type and fetch if cache is old or doesn't exist
    if (!cacheTimestamps.workflowLevels || now - cacheTimestamps.workflowLevels > maxCacheAge) {
        promises.push(dispatch(fetchWorkflowLevels()));
    }
    
    if (!cacheTimestamps.userRoles || now - cacheTimestamps.userRoles > maxCacheAge) {
        promises.push(dispatch(fetchUserRoles()));
    }
    
    if (!cacheTimestamps.masterOperations || now - cacheTimestamps.masterOperations > maxCacheAge) {
        promises.push(dispatch(fetchMasterOperations()));
    }
    
    if (!cacheTimestamps.workflowOperations || now - cacheTimestamps.workflowOperations > maxCacheAge) {
        promises.push(dispatch(fetchWorkflowOperations()));
    }
    
    return Promise.all(promises);
};

export default businessInfoSlice.reducer;