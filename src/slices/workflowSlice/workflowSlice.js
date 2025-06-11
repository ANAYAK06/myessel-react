// store/slices/workflowSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as workflowAPI from '../../api/businessinfoAPI/workflowAPI';

// Async thunks for API calls
export const fetchWorkflowLevels = createAsyncThunk(
    'workflow/fetchWorkflowLevels',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching workflow levels');
            const response = await workflowAPI.getAllWorkFlowLevels();
            console.log('✅ Workflow levels data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data && Array.isArray(response.Data)) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No workflow levels data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Workflow levels error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch workflow levels');
        }
    }
);

export const fetchUserRolesForAssign = createAsyncThunk(
    'workflow/fetchUserRolesForAssign',
    async (currentRoleId, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching user roles for assign, currentRoleId:', currentRoleId);
            const response = await workflowAPI.getUserRolesForRoleAssign(currentRoleId);
            console.log('✅ User roles for assign data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data && Array.isArray(response.Data)) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No user roles data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ User roles for assign error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch user roles for assign');
        }
    }
);

export const fetchMasterOperations = createAsyncThunk(
    'workflow/fetchMasterOperations',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching master operations');
            const response = await workflowAPI.getAllMasterOperations();
            console.log('✅ Master operations data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data && Array.isArray(response.Data)) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No master operations data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Master operations error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch master operations');
        }
    }
);

export const fetchWorkflowMasterOperations = createAsyncThunk(
    'workflow/fetchWorkflowMasterOperations',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching workflow master operations');
            const response = await workflowAPI.getWorkFlowMasterOperations();
            console.log('✅ Workflow master operations data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data && Array.isArray(response.Data)) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No workflow master operations data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Workflow master operations error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch workflow master operations');
        }
    }
);

export const fetchRoleOperationRoles = createAsyncThunk(
    'workflow/fetchRoleOperationRoles',
    async (masterOperationId, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching role operation roles, masterOperationId:', masterOperationId);
            const response = await workflowAPI.getRoleOperationRoles(masterOperationId);
            console.log('✅ Role operation roles data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data && Array.isArray(response.Data)) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No role operation roles data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Role operation roles error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch role operation roles');
        }
    }
);

export const fetchMasterWorkflowStatus = createAsyncThunk(
    'workflow/fetchMasterWorkflowStatus',
    async ({ masterIds, roleId }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching master workflow status, masterIds:', masterIds, 'roleId:', roleId);
            const response = await workflowAPI.getMasterWorkFlowStatus(masterIds, roleId);
            console.log('✅ Master workflow status data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No master workflow status data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Master workflow status error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch master workflow status');
        }
    }
);

export const fetchVerificationPendingForRole = createAsyncThunk(
    'workflow/fetchVerificationPendingForRole',
    async ({ roleId, masterId, levelNo }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching verification pending for role, roleId:', roleId, 'masterId:', masterId, 'levelNo:', levelNo);
            const response = await workflowAPI.getVerificationPendingForRole(roleId, masterId, levelNo);
            console.log('✅ Verification pending for role data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No verification pending data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Verification pending for role error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch verification pending for role');
        }
    }
);

export const fetchVerificationPendingForMaster = createAsyncThunk(
    'workflow/fetchVerificationPendingForMaster',
    async ({ masterId, checkType }, { rejectWithValue }) => {
        try {
            console.log('🔍 Fetching verification pending for master, masterId:', masterId, 'checkType:', checkType);
            const response = await workflowAPI.getVerificationPendingForMasterid(masterId, checkType);
            console.log('✅ Verification pending for master data:', response.Data);
            
            if (response && response.IsSuccessful === true && response.Data) {
                return response.Data;
            } else if (response && response.Data) {
                return response.Data;
            } else {
                const errorMessage = response?.Message || 'No verification pending data available';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Verification pending for master error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to fetch verification pending for master');
        }
    }
);

export const saveApprovalHierarchy = createAsyncThunk(
    'workflow/saveApprovalHierarchy',
    async (hierarchyData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving approval hierarchy, data:', hierarchyData);
            const response = await workflowAPI.saveApprovalHierarchy(hierarchyData);
            console.log('✅ Save approval hierarchy response:', response);
            
            if (response && response.IsSuccessful === true) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save approval hierarchy';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save approval hierarchy error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save approval hierarchy');
        }
    }
);

export const saveRoleOperations = createAsyncThunk(
    'workflow/saveRoleOperations',
    async (operationsData, { rejectWithValue }) => {
        try {
            console.log('🔍 Saving role operations, data:', operationsData);
            const response = await workflowAPI.saveRoleOperations(operationsData);
            console.log('✅ Save role operations response:', response);
            
            if (response && response.IsSuccessful === true) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to save role operations';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Save role operations error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to save role operations');
        }
    }
);

export const updateApprovalHierarchy = createAsyncThunk(
    'workflow/updateApprovalHierarchy',
    async (hierarchyData, { rejectWithValue }) => {
        try {
            console.log('🔍 Updating approval hierarchy, data:', hierarchyData);
            const response = await workflowAPI.updateApprovalHierarchy(hierarchyData);
            console.log('✅ Update approval hierarchy response:', response);
            
            if (response && response.IsSuccessful === true) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to update approval hierarchy';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Update approval hierarchy error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to update approval hierarchy');
        }
    }
);

export const updateMasterOperationStatus = createAsyncThunk(
    'workflow/updateMasterOperationStatus',
    async (statusData, { rejectWithValue }) => {
        try {
            console.log('🔍 Updating master operation status, data:', statusData);
            const response = await workflowAPI.updateMasterOperaionStatus(statusData);
            console.log('✅ Update master operation status response:', response);
            
            if (response && response.IsSuccessful === true) {
                return response.Data || { success: true, message: response.Message };
            } else {
                const errorMessage = response?.Message || 'Failed to update master operation status';
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            console.error('❌ Update master operation status error:', error);
            return rejectWithValue(error.Message || error.message || 'Failed to update master operation status');
        }
    }
);

const initialState = {
    // Data states
    workflowLevels: [],
    userRolesForAssign: [],
    masterOperations: [],
    workflowMasterOperations: [],
    roleOperationRoles: [],
    masterWorkflowStatus: [],
    verificationPendingForRole: [],
    verificationPendingForMaster: [],
    
    // Loading states
    loading: {
        workflowLevels: false,
        userRolesForAssign: false,
        masterOperations: false,
        workflowMasterOperations: false,
        roleOperationRoles: false,
        masterWorkflowStatus: false,
        verificationPendingForRole: false,
        verificationPendingForMaster: false,
        saving: false,
        updating: false
    },
    
    // Error states
    errors: {
        workflowLevels: null,
        userRolesForAssign: null,
        masterOperations: null,
        workflowMasterOperations: null,
        roleOperationRoles: null,
        masterWorkflowStatus: null,
        verificationPendingForRole: null,
        verificationPendingForMaster: null,
        saving: null,
        updating: null
    },
    
    // UI state
    activeTab: 'workflow-creation',
    editMode: false,
    selectedWorkflow: null,
    lastUpdated: null,
    
    // Cache timestamps to prevent unnecessary API calls
    cacheTimestamps: {
        workflowLevels: null,
        userRolesForAssign: null,
        masterOperations: null,
        workflowMasterOperations: null,
        roleOperationRoles: null,
        masterWorkflowStatus: null,
        verificationPendingForRole: null,
        verificationPendingForMaster: null
    }
};

const workflowSlice = createSlice({
    name: 'workflow',
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },
        setSelectedWorkflow: (state, action) => {
            state.selectedWorkflow = action.payload;
        },
        clearErrors: (state) => {
            state.errors = {
                workflowLevels: null,
                userRolesForAssign: null,
                masterOperations: null,
                workflowMasterOperations: null,
                roleOperationRoles: null,
                masterWorkflowStatus: null,
                verificationPendingForRole: null,
                verificationPendingForMaster: null,
                saving: null,
                updating: null
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
        updateMasterOperation: (state, action) => {
            const { index, updatedOperation } = action.payload;
            if (state.masterOperations[index]) {
                state.masterOperations[index] = { ...state.masterOperations[index], ...updatedOperation };
            }
        },
        resetWorkflowData: (state) => {
            state.selectedWorkflow = null;
            state.editMode = false;
            state.verificationPendingForRole = [];
            state.verificationPendingForMaster = [];
            state.masterWorkflowStatus = [];
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

        // User Roles For Assign
        builder
            .addCase(fetchUserRolesForAssign.pending, (state) => {
                state.loading.userRolesForAssign = true;
                state.errors.userRolesForAssign = null;
            })
            .addCase(fetchUserRolesForAssign.fulfilled, (state, action) => {
                state.loading.userRolesForAssign = false;
                state.userRolesForAssign = action.payload;
                state.cacheTimestamps.userRolesForAssign = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchUserRolesForAssign.rejected, (state, action) => {
                state.loading.userRolesForAssign = false;
                state.errors.userRolesForAssign = action.payload || 'Failed to fetch user roles for assign';
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

        // Workflow Master Operations
        builder
            .addCase(fetchWorkflowMasterOperations.pending, (state) => {
                state.loading.workflowMasterOperations = true;
                state.errors.workflowMasterOperations = null;
            })
            .addCase(fetchWorkflowMasterOperations.fulfilled, (state, action) => {
                state.loading.workflowMasterOperations = false;
                state.workflowMasterOperations = action.payload;
                state.cacheTimestamps.workflowMasterOperations = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchWorkflowMasterOperations.rejected, (state, action) => {
                state.loading.workflowMasterOperations = false;
                state.errors.workflowMasterOperations = action.payload || 'Failed to fetch workflow master operations';
            })

        // Role Operation Roles
        builder
            .addCase(fetchRoleOperationRoles.pending, (state) => {
                state.loading.roleOperationRoles = true;
                state.errors.roleOperationRoles = null;
            })
            .addCase(fetchRoleOperationRoles.fulfilled, (state, action) => {
                state.loading.roleOperationRoles = false;
                state.roleOperationRoles = action.payload;
                state.cacheTimestamps.roleOperationRoles = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchRoleOperationRoles.rejected, (state, action) => {
                state.loading.roleOperationRoles = false;
                state.errors.roleOperationRoles = action.payload || 'Failed to fetch role operation roles';
            })

        // Master Workflow Status
        builder
            .addCase(fetchMasterWorkflowStatus.pending, (state) => {
                state.loading.masterWorkflowStatus = true;
                state.errors.masterWorkflowStatus = null;
            })
            .addCase(fetchMasterWorkflowStatus.fulfilled, (state, action) => {
                state.loading.masterWorkflowStatus = false;
                state.masterWorkflowStatus = action.payload;
                state.cacheTimestamps.masterWorkflowStatus = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchMasterWorkflowStatus.rejected, (state, action) => {
                state.loading.masterWorkflowStatus = false;
                state.errors.masterWorkflowStatus = action.payload || 'Failed to fetch master workflow status';
            })

        // Verification Pending For Role
        builder
            .addCase(fetchVerificationPendingForRole.pending, (state) => {
                state.loading.verificationPendingForRole = true;
                state.errors.verificationPendingForRole = null;
            })
            .addCase(fetchVerificationPendingForRole.fulfilled, (state, action) => {
                state.loading.verificationPendingForRole = false;
                state.verificationPendingForRole = action.payload;
                state.cacheTimestamps.verificationPendingForRole = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchVerificationPendingForRole.rejected, (state, action) => {
                state.loading.verificationPendingForRole = false;
                state.errors.verificationPendingForRole = action.payload || 'Failed to fetch verification pending for role';
            })

        // Verification Pending For Master
        builder
            .addCase(fetchVerificationPendingForMaster.pending, (state) => {
                state.loading.verificationPendingForMaster = true;
                state.errors.verificationPendingForMaster = null;
            })
            .addCase(fetchVerificationPendingForMaster.fulfilled, (state, action) => {
                state.loading.verificationPendingForMaster = false;
                state.verificationPendingForMaster = action.payload;
                state.cacheTimestamps.verificationPendingForMaster = Date.now();
                state.lastUpdated = Date.now();
            })
            .addCase(fetchVerificationPendingForMaster.rejected, (state, action) => {
                state.loading.verificationPendingForMaster = false;
                state.errors.verificationPendingForMaster = action.payload || 'Failed to fetch verification pending for master';
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
            })
            .addCase(saveRoleOperations.rejected, (state, action) => {
                state.loading.saving = false;
                state.errors.saving = action.payload || 'Failed to save role operations';
            })

        // Update Approval Hierarchy
        builder
            .addCase(updateApprovalHierarchy.pending, (state) => {
                state.loading.updating = true;
                state.errors.updating = null;
            })
            .addCase(updateApprovalHierarchy.fulfilled, (state, action) => {
                state.loading.updating = false;
                state.lastUpdated = Date.now();
            })
            .addCase(updateApprovalHierarchy.rejected, (state, action) => {
                state.loading.updating = false;
                state.errors.updating = action.payload || 'Failed to update approval hierarchy';
            })

        // Update Master Operation Status
        builder
            .addCase(updateMasterOperationStatus.pending, (state) => {
                state.loading.updating = true;
                state.errors.updating = null;
            })
            .addCase(updateMasterOperationStatus.fulfilled, (state, action) => {
                state.loading.updating = false;
                state.lastUpdated = Date.now();
            })
            .addCase(updateMasterOperationStatus.rejected, (state, action) => {
                state.loading.updating = false;
                state.errors.updating = action.payload || 'Failed to update master operation status';
            });
    }
});

// Action creators are generated for each case reducer function
export const {
    setActiveTab,
    setEditMode,
    setSelectedWorkflow,
    clearErrors,
    clearSpecificError,
    updateWorkflowLevel,
    addWorkflowLevel,
    removeWorkflowLevel,
    updateMasterOperation,
    resetWorkflowData
} = workflowSlice.actions;

// Selectors
export const selectWorkflowLevels = (state) => state.workflow.workflowLevels;
export const selectUserRolesForAssign = (state) => state.workflow.userRolesForAssign;
export const selectMasterOperations = (state) => state.workflow.masterOperations;
export const selectWorkflowMasterOperations = (state) => state.workflow.workflowMasterOperations;
export const selectRoleOperationRoles = (state) => state.workflow.roleOperationRoles;
export const selectMasterWorkflowStatus = (state) => state.workflow.masterWorkflowStatus;
export const selectVerificationPendingForRole = (state) => state.workflow.verificationPendingForRole;
export const selectVerificationPendingForMaster = (state) => state.workflow.verificationPendingForMaster;
export const selectLoading = (state) => state.workflow.loading;
export const selectErrors = (state) => state.workflow.errors;
export const selectActiveTab = (state) => state.workflow.activeTab;
export const selectEditMode = (state) => state.workflow.editMode;
export const selectSelectedWorkflow = (state) => state.workflow.selectedWorkflow;
export const selectLastUpdated = (state) => state.workflow.lastUpdated;

// Complex selectors
export const selectIsAnyLoading = (state) => {
    const loading = state.workflow.loading;
    return Object.values(loading).some(isLoading => isLoading);
};

export const selectHasAnyError = (state) => {
    const errors = state.workflow.errors;
    return Object.values(errors).some(error => error !== null);
};

export const selectIsSaving = (state) => {
    return state.workflow.loading.saving || state.workflow.loading.updating;
};

// Thunk for refreshing all workflow data
export const refreshAllWorkflowData = () => async (dispatch) => {
    const promises = [
        dispatch(fetchWorkflowLevels()),
        dispatch(fetchMasterOperations()),
        dispatch(fetchWorkflowMasterOperations())
    ];
    
    try {
        await Promise.all(promises);
    } catch (error) {
        console.error('Error refreshing workflow data:', error);
    }
};

// Thunk for smart data fetching (only fetch if cache is old)
export const smartFetchWorkflowData = (maxCacheAge = 5 * 60 * 1000) => (dispatch, getState) => {
    const state = getState();
    const now = Date.now();
    const { cacheTimestamps } = state.workflow;
    
    const promises = [];
    
    // Check each data type and fetch if cache is old or doesn't exist
    if (!cacheTimestamps.workflowLevels || now - cacheTimestamps.workflowLevels > maxCacheAge) {
        promises.push(dispatch(fetchWorkflowLevels()));
    }
    
    if (!cacheTimestamps.masterOperations || now - cacheTimestamps.masterOperations > maxCacheAge) {
        promises.push(dispatch(fetchMasterOperations()));
    }
    
    if (!cacheTimestamps.workflowMasterOperations || now - cacheTimestamps.workflowMasterOperations > maxCacheAge) {
        promises.push(dispatch(fetchWorkflowMasterOperations()));
    }
    
    return Promise.all(promises);
};

export default workflowSlice.reducer;