import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as roleAPI from '../../api/RolesAPI/rolesAPI'

// Async Thunks for User Role Management APIs
// ==========================================

// 1. Fetch Role Design
export const fetchRoleDesign = createAsyncThunk(
    'userrole/fetchRoleDesign',
    async (_, { rejectWithValue }) => {
        try {
            const response = await roleAPI.getRoleDesign();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Role Design');
        }
    }
);

// 2. Save New User Role
export const saveNewUserRole = createAsyncThunk(
    'userrole/saveNewUserRole',
    async (roleData, { rejectWithValue }) => {
        try {
            const response = await roleAPI.saveNewUserRole(roleData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save New User Role');
        }
    }
);

// 3. Update User Role (for updating existing role)
export const updateUserRole = createAsyncThunk(
    'userrole/updateUserRole',
    async (roleData, { rejectWithValue }) => {
        try {
            // Ensure Action is set to "Update"
            const updateData = {
                ...roleData,
                businessRole: {
                    ...roleData.businessRole,
                    Action: 'Update'
                }
            };
            const response = await roleAPI.updateUserRole(updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update User Role');
        }
    }
);

// 4. Delete User Role (uses same API as update but with Action = "Delete")
export const deleteUserRole = createAsyncThunk(
    'userrole/deleteUserRole',
    async (roleData, { rejectWithValue }) => {
        try {
            // Ensure Action is set to "Delete"
            const deleteData = {
                ...roleData,
                businessRole: {
                    ...roleData.businessRole,
                    Action: 'Delete'
                }
            };
            const response = await roleAPI.updateUserRole(deleteData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete User Role');
        }
    }
);

// 5. Fetch Verification Pending Role Design by Role ID
export const fetchVerificationPendingRoleDesign = createAsyncThunk(
    'userrole/fetchVerificationPendingRoleDesign',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await roleAPI.getVerificationPendingRoleDesign(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification Pending Role Design');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    roleDesign: [],
    verificationPendingRoleDesign: [],
    saveResult: null,
    updateResult: null,
    deleteResult: null,

    // Loading states for each API
    loading: {
        roleDesign: false,
        saveNewUserRole: false,
        updateUserRole: false,
        deleteUserRole: false,
        verificationPendingRoleDesign: false,
    },

    // Error states for each API
    errors: {
        roleDesign: null,
        saveNewUserRole: null,
        updateUserRole: null,
        deleteUserRole: null,
        verificationPendingRoleDesign: null,
    },

    // UI State
    selectedRoleId: null,
    selectedUserRoleID: null,
    operationStatus: null, // 'saved', 'updated', 'deleted'
};

// User Role Management Slice
// ==========================
const userRoleManagementSlice = createSlice({
    name: 'userrole',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        
        // Action to set selected user role ID
        setSelectedUserRoleID: (state, action) => {
            state.selectedUserRoleID = action.payload;
        },
        
        // Action to set operation status
        setOperationStatus: (state, action) => {
            state.operationStatus = action.payload;
        },
        
        // Action to reset role design data
        resetRoleDesignData: (state) => {
            state.roleDesign = [];
            state.verificationPendingRoleDesign = [];
        },

        // Action to reset operation results
        resetOperationResults: (state) => {
            state.saveResult = null;
            state.updateResult = null;
            state.deleteResult = null;
            state.operationStatus = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all user role data
        resetUserRoleData: (state) => {
            state.roleDesign = [];
            state.verificationPendingRoleDesign = [];
            state.saveResult = null;
            state.updateResult = null;
            state.deleteResult = null;
            state.selectedRoleId = null;
            state.selectedUserRoleID = null;
            state.operationStatus = null;
        },

        // Action to clear save result
        clearSaveResult: (state) => {
            state.saveResult = null;
        },

        // Action to clear update result
        clearUpdateResult: (state) => {
            state.updateResult = null;
        },

        // Action to clear delete result
        clearDeleteResult: (state) => {
            state.deleteResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Role Design - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchRoleDesign.pending, (state) => {
                state.loading.roleDesign = true;
                state.errors.roleDesign = null;
            })
            .addCase(fetchRoleDesign.fulfilled, (state, action) => {
                state.loading.roleDesign = false;
                // 🔧 Extract Data array from API response
                // API returns: { Data: [...], IsSuccessful: true/false, ResponseCode: 200 }
                state.roleDesign = action.payload?.Data || [];
            })
            .addCase(fetchRoleDesign.rejected, (state, action) => {
                state.loading.roleDesign = false;
                state.errors.roleDesign = action.payload;
                // 🔧 Reset to empty array on error to prevent filter issues
                state.roleDesign = [];
            })

        // 2. Save New User Role
        builder
            .addCase(saveNewUserRole.pending, (state) => {
                state.loading.saveNewUserRole = true;
                state.errors.saveNewUserRole = null;
            })
            .addCase(saveNewUserRole.fulfilled, (state, action) => {
                state.loading.saveNewUserRole = false;
                state.saveResult = action.payload;
                state.operationStatus = 'saved';
            })
            .addCase(saveNewUserRole.rejected, (state, action) => {
                state.loading.saveNewUserRole = false;
                state.errors.saveNewUserRole = action.payload;
            })

        // 3. Update User Role
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.loading.updateUserRole = true;
                state.errors.updateUserRole = null;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.loading.updateUserRole = false;
                state.updateResult = action.payload;
                state.operationStatus = 'updated';
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.loading.updateUserRole = false;
                state.errors.updateUserRole = action.payload;
            })

        // 4. Delete User Role
        builder
            .addCase(deleteUserRole.pending, (state) => {
                state.loading.deleteUserRole = true;
                state.errors.deleteUserRole = null;
            })
            .addCase(deleteUserRole.fulfilled, (state, action) => {
                state.loading.deleteUserRole = false;
                state.deleteResult = action.payload;
                state.operationStatus = 'deleted';
            })
            .addCase(deleteUserRole.rejected, (state, action) => {
                state.loading.deleteUserRole = false;
                state.errors.deleteUserRole = action.payload;
            })

        // 5. Verification Pending Role Design
        builder
            .addCase(fetchVerificationPendingRoleDesign.pending, (state) => {
                state.loading.verificationPendingRoleDesign = true;
                state.errors.verificationPendingRoleDesign = null;
            })
            .addCase(fetchVerificationPendingRoleDesign.fulfilled, (state, action) => {
                state.loading.verificationPendingRoleDesign = false;
                // 🔧 Extract Data array from API response
                state.verificationPendingRoleDesign = action.payload?.Data || [];
            })
            .addCase(fetchVerificationPendingRoleDesign.rejected, (state, action) => {
                state.loading.verificationPendingRoleDesign = false;
                state.errors.verificationPendingRoleDesign = action.payload;
                // 🔧 Reset to empty array on error
                state.verificationPendingRoleDesign = [];
            });
    },
});

// Export actions
export const { 
    setSelectedRoleId,
    setSelectedUserRoleID,
    setOperationStatus,
    resetRoleDesignData,
    resetOperationResults,
    clearError,
    resetUserRoleData,
    clearSaveResult,
    clearUpdateResult,
    clearDeleteResult
} = userRoleManagementSlice.actions;

// Selectors
// =========

// Data selectors
export const selectRoleDesign = (state) => state.userrole.roleDesign;
export const selectVerificationPendingRoleDesign = (state) => state.userrole.verificationPendingRoleDesign;
export const selectSaveResult = (state) => state.userrole.saveResult;
export const selectUpdateResult = (state) => state.userrole.updateResult;
export const selectDeleteResult = (state) => state.userrole.deleteResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectRoleDesignArray = (state) => {
    const roles = state.userrole.roleDesign;
    return Array.isArray(roles) ? roles : [];
};

export const selectVerificationPendingRoleDesignArray = (state) => {
    const roles = state.userrole.verificationPendingRoleDesign;
    return Array.isArray(roles) ? roles : [];
};

// Loading selectors
export const selectLoading = (state) => state.userrole.loading;
export const selectRoleDesignLoading = (state) => state.userrole.loading.roleDesign;
export const selectSaveNewUserRoleLoading = (state) => state.userrole.loading.saveNewUserRole;
export const selectUpdateUserRoleLoading = (state) => state.userrole.loading.updateUserRole;
export const selectDeleteUserRoleLoading = (state) => state.userrole.loading.deleteUserRole;
export const selectVerificationPendingRoleDesignLoading = (state) => state.userrole.loading.verificationPendingRoleDesign;

// Error selectors
export const selectErrors = (state) => state.userrole.errors;
export const selectRoleDesignError = (state) => state.userrole.errors.roleDesign;
export const selectSaveNewUserRoleError = (state) => state.userrole.errors.saveNewUserRole;
export const selectUpdateUserRoleError = (state) => state.userrole.errors.updateUserRole;
export const selectDeleteUserRoleError = (state) => state.userrole.errors.deleteUserRole;
export const selectVerificationPendingRoleDesignError = (state) => state.userrole.errors.verificationPendingRoleDesign;

// UI State selectors
export const selectSelectedRoleId = (state) => state.userrole.selectedRoleId;
export const selectSelectedUserRoleID = (state) => state.userrole.selectedUserRoleID;
export const selectOperationStatus = (state) => state.userrole.operationStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.userrole.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.userrole.errors).some(error => error !== null);

// 🔧 Specific combined selectors with safe array handling
export const selectUserRoleSummary = (state) => {
    const rolesArray = Array.isArray(state.userrole.roleDesign) ? state.userrole.roleDesign : [];
    const pendingRolesArray = Array.isArray(state.userrole.verificationPendingRoleDesign) ? state.userrole.verificationPendingRoleDesign : [];
    
    return {
        totalRoles: rolesArray.length,
        totalPendingRoles: pendingRolesArray.length,
        operationStatus: state.userrole.operationStatus,
        isProcessing: state.userrole.loading.saveNewUserRole || 
                      state.userrole.loading.updateUserRole || 
                      state.userrole.loading.deleteUserRole,
        hasRoles: rolesArray.length > 0,
        hasPendingRoles: pendingRolesArray.length > 0
    };
};

// Operation status helpers
export const selectOperationResult = (state) => ({
    save: state.userrole.saveResult,
    update: state.userrole.updateResult,
    delete: state.userrole.deleteResult,
    status: state.userrole.operationStatus,
    isSuccess: state.userrole.operationStatus !== null,
    isSaved: state.userrole.operationStatus === 'saved',
    isUpdated: state.userrole.operationStatus === 'updated',
    isDeleted: state.userrole.operationStatus === 'deleted'
});

// Export reducer
export default userRoleManagementSlice.reducer;