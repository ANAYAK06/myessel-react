import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as empRoleAPI from '../../api/businessinfoAPI/roleAssignAPI';

// Async Thunks for Employee Role Assignment APIs
// ==============================================

// 1. Fetch All Employees by Current Role
export const fetchEmployeesByCurrentRole = createAsyncThunk(
    'empRoleAssignment/fetchEmployeesByCurrentRole',
    async (currentRoleId, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.getAllEmployeeDetailsByCurrentRole(currentRoleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch employees by current role');
        }
    }
);

// 2. Save Employee Role Assignment
export const saveEmployeeRoleAssignment = createAsyncThunk(
    'empRoleAssignment/saveEmployeeRoleAssignment',
    async (empRoleData, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.saveEmpRoleAssign(empRoleData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save employee role assignment');
        }
    }
);

// 3. Update Employee Role Assignment
export const updateEmployeeRoleAssignment = createAsyncThunk(
    'empRoleAssignment/updateEmployeeRoleAssignment',
    async (empRoleData, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.updateEmpRoleAssign(empRoleData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update employee role assignment');
        }
    }
);

// 4. Fetch All Employees
export const fetchAllEmployees = createAsyncThunk(
    'empRoleAssignment/fetchAllEmployees',
    async (_, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.getAllEmployeeDetails();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch all employees');
        }
    }
);

// 5. Fetch Employee Details by User
export const fetchEmployeeByUser = createAsyncThunk(
    'empRoleAssignment/fetchEmployeeByUser',
    async (userName, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.getEmployeeDetailsByUser(userName);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch employee details by user');
        }
    }
);

export const fetchUserCCByRoleId = createAsyncThunk(
    'empRoleAssignment/fetchUserCCByRoleId',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await empRoleAPI.getUserCCByRoleId(roleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch user cost centers by role');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    employeesByRole: [],
    allEmployees: [],
    employeeByUser: null,
    userCCByRole: [],
    saveResult: null,
    updateResult: null,

    // Loading states for each API
    loading: {
        employeesByRole: false,
        saveRoleAssignment: false,
        updateRoleAssignment: false,
        allEmployees: false,
        employeeByUser: false,
        userCCByRole: false,
    },

    // Error states for each API
    errors: {
        employeesByRole: null,
        saveRoleAssignment: null,
        updateRoleAssignment: null,
        allEmployees: null,
        employeeByUser: null,
        userCCByRole: null,
    },

    // UI State
    selectedRoleId: null,
    selectedEmployeeId: null,
    operationStatus: null, // 'saved', 'updated'
};

// Employee Role Assignment Slice
// ==============================
const employeeRoleAssignmentSlice = createSlice({
    name: 'empRoleAssignment',
    initialState,
    reducers: {
        // Action to set selected role ID
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },

        // Action to set selected employee ID
        setSelectedEmployeeId: (state, action) => {
            state.selectedEmployeeId = action.payload;
        },

        // Action to set operation status
        setOperationStatus: (state, action) => {
            state.operationStatus = action.payload;
        },

        // Action to reset employee data
        resetEmployeeData: (state) => {
            state.employeesByRole = [];
            state.employeeByUser = null;
        },

        // Action to reset operation results
        resetOperationResults: (state) => {
            state.saveResult = null;
            state.updateResult = null;
            state.operationStatus = null;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all employee role assignment data
        resetEmployeeRoleAssignmentData: (state) => {
            state.employeesByRole = [];
            state.allEmployees = [];
            state.employeeByUser = null;
            state.saveResult = null;
            state.updateResult = null;
            state.selectedRoleId = null;
            state.selectedEmployeeId = null;
            state.operationStatus = null;
            state.userCCByRole = [];
        },

        // Action to clear save result
        clearSaveResult: (state) => {
            state.saveResult = null;
        },

        // Action to clear update result
        clearUpdateResult: (state) => {
            state.updateResult = null;
        }
    },
    extraReducers: (builder) => {
        // 1. Employees by Current Role
        builder
            .addCase(fetchEmployeesByCurrentRole.pending, (state) => {
                state.loading.employeesByRole = true;
                state.errors.employeesByRole = null;
            })
            .addCase(fetchEmployeesByCurrentRole.fulfilled, (state, action) => {
                state.loading.employeesByRole = false;
                state.employeesByRole = action.payload?.Data || [];
            })
            .addCase(fetchEmployeesByCurrentRole.rejected, (state, action) => {
                state.loading.employeesByRole = false;
                state.errors.employeesByRole = action.payload;
                state.employeesByRole = [];
            })

        // 2. Save Employee Role Assignment
        builder
            .addCase(saveEmployeeRoleAssignment.pending, (state) => {
                state.loading.saveRoleAssignment = true;
                state.errors.saveRoleAssignment = null;
            })
            .addCase(saveEmployeeRoleAssignment.fulfilled, (state, action) => {
                state.loading.saveRoleAssignment = false;
                state.saveResult = action.payload;
                if (action.payload?.IsSuccessful) {
                    state.operationStatus = 'saved';
                }
            })
            .addCase(saveEmployeeRoleAssignment.rejected, (state, action) => {
                state.loading.saveRoleAssignment = false;
                state.errors.saveRoleAssignment = action.payload;
            })

        // 3. Update Employee Role Assignment
        builder
            .addCase(updateEmployeeRoleAssignment.pending, (state) => {
                state.loading.updateRoleAssignment = true;
                state.errors.updateRoleAssignment = null;
            })
            .addCase(updateEmployeeRoleAssignment.fulfilled, (state, action) => {
                state.loading.updateRoleAssignment = false;
                state.updateResult = action.payload;
                if (action.payload?.IsSuccessful) {
                    state.operationStatus = 'updated';
                }
            })
            .addCase(updateEmployeeRoleAssignment.rejected, (state, action) => {
                state.loading.updateRoleAssignment = false;
                state.errors.updateRoleAssignment = action.payload;
            })

        // 4. All Employees
        builder
            .addCase(fetchAllEmployees.pending, (state) => {
                state.loading.allEmployees = true;
                state.errors.allEmployees = null;
            })
            .addCase(fetchAllEmployees.fulfilled, (state, action) => {
                state.loading.allEmployees = false;
                state.allEmployees = action.payload?.Data || [];
            })
            .addCase(fetchAllEmployees.rejected, (state, action) => {
                state.loading.allEmployees = false;
                state.errors.allEmployees = action.payload;
                state.allEmployees = [];
            })

        // 5. Employee by User
        builder
            .addCase(fetchEmployeeByUser.pending, (state) => {
                state.loading.employeeByUser = true;
                state.errors.employeeByUser = null;
            })
            .addCase(fetchEmployeeByUser.fulfilled, (state, action) => {
                state.loading.employeeByUser = false;
                state.employeeByUser = action.payload?.Data || null;
            })
            .addCase(fetchEmployeeByUser.rejected, (state, action) => {
                state.loading.employeeByUser = false;
                state.errors.employeeByUser = action.payload;
                state.employeeByUser = null;
            });
        // 6. User Cost Centers by Role
        builder
            .addCase(fetchUserCCByRoleId.pending, (state) => {
                state.loading.userCCByRole = true;
                state.errors.userCCByRole = null;
            })
            .addCase(fetchUserCCByRoleId.fulfilled, (state, action) => {
                state.loading.userCCByRole = false;
                state.userCCByRole = action.payload?.Data || [];
            })
            .addCase(fetchUserCCByRoleId.rejected, (state, action) => {
                state.loading.userCCByRole = false;
                state.errors.userCCByRole = action.payload;
                state.userCCByRole = [];
            });
    },
});

// Export actions
export const {
    setSelectedRoleId,
    setSelectedEmployeeId,
    setOperationStatus,
    resetEmployeeData,
    resetOperationResults,
    clearError,
    resetEmployeeRoleAssignmentData,
    clearSaveResult,
    clearUpdateResult
} = employeeRoleAssignmentSlice.actions;

// Selectors
// =========

// Data selectors
export const selectEmployeesByRole = (state) => state.empRoleAssignment.employeesByRole;
export const selectAllEmployees = (state) => state.empRoleAssignment.allEmployees;
export const selectEmployeeByUser = (state) => state.empRoleAssignment.employeeByUser;
export const selectSaveResult = (state) => state.empRoleAssignment.saveResult;
export const selectUpdateResult = (state) => state.empRoleAssignment.updateResult;

// Safe array selectors
export const selectEmployeesByRoleArray = (state) => {
    const employees = state.empRoleAssignment.employeesByRole;
    return Array.isArray(employees) ? employees : [];
};

export const selectAllEmployeesArray = (state) => {
    const employees = state.empRoleAssignment.allEmployees;
    return Array.isArray(employees) ? employees : [];
};
export const selectUserCCByRole = (state) => state.empRoleAssignment.userCCByRole;
export const selectUserCCByRoleArray = (state) => {
    const userCC = state.empRoleAssignment.userCCByRole;
    return Array.isArray(userCC) ? userCC : [];
};
export const selectUserCCByRoleLoading = (state) => state.empRoleAssignment.loading.userCCByRole;
export const selectUserCCByRoleError = (state) => state.empRoleAssignment.errors.userCCByRole;


// Loading selectors
export const selectLoading = (state) => state.empRoleAssignment.loading;
export const selectEmployeesByRoleLoading = (state) => state.empRoleAssignment.loading.employeesByRole;
export const selectSaveRoleAssignmentLoading = (state) => state.empRoleAssignment.loading.saveRoleAssignment;
export const selectUpdateRoleAssignmentLoading = (state) => state.empRoleAssignment.loading.updateRoleAssignment;
export const selectAllEmployeesLoading = (state) => state.empRoleAssignment.loading.allEmployees;
export const selectEmployeeByUserLoading = (state) => state.empRoleAssignment.loading.employeeByUser;

// Error selectors
export const selectErrors = (state) => state.empRoleAssignment.errors;
export const selectEmployeesByRoleError = (state) => state.empRoleAssignment.errors.employeesByRole;
export const selectSaveRoleAssignmentError = (state) => state.empRoleAssignment.errors.saveRoleAssignment;
export const selectUpdateRoleAssignmentError = (state) => state.empRoleAssignment.errors.updateRoleAssignment;
export const selectAllEmployeesError = (state) => state.empRoleAssignment.errors.allEmployees;
export const selectEmployeeByUserError = (state) => state.empRoleAssignment.errors.employeeByUser;

// UI State selectors
export const selectSelectedRoleId = (state) => state.empRoleAssignment.selectedRoleId;
export const selectSelectedEmployeeId = (state) => state.empRoleAssignment.selectedEmployeeId;
export const selectOperationStatus = (state) => state.empRoleAssignment.operationStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.empRoleAssignment.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.empRoleAssignment.errors).some(error => error !== null);

// Summary selector
export const selectEmployeeRoleAssignmentSummary = (state) => {
    const employeesByRoleArray = Array.isArray(state.empRoleAssignment.employeesByRole) ? state.empRoleAssignment.employeesByRole : [];
    const allEmployeesArray = Array.isArray(state.empRoleAssignment.allEmployees) ? state.empRoleAssignment.allEmployees : [];
    const userCCArray = Array.isArray(state.empRoleAssignment.userCCByRole) ? state.empRoleAssignment.userCCByRole : []; // ADD THIS LINE

    return {
        totalEmployeesByRole: employeesByRoleArray.length,
        totalAllEmployees: allEmployeesArray.length,
        totalUserCC: userCCArray.length,
        selectedEmployee: state.empRoleAssignment.employeeByUser,
        operationStatus: state.empRoleAssignment.operationStatus,
        isProcessing: state.empRoleAssignment.loading.saveRoleAssignment ||
            state.empRoleAssignment.loading.updateRoleAssignment,
        hasEmployees: allEmployeesArray.length > 0,
        hasUserCC: userCCArray.length > 0
    };
};
// Operation result selector
export const selectOperationResult = (state) => ({
    save: state.empRoleAssignment.saveResult,
    update: state.empRoleAssignment.updateResult,
    status: state.empRoleAssignment.operationStatus,
    isSuccess: state.empRoleAssignment.operationStatus !== null,
    isSaved: state.empRoleAssignment.operationStatus === 'saved',
    isUpdated: state.empRoleAssignment.operationStatus === 'updated'
});

// Export reducer
export default employeeRoleAssignmentSlice.reducer;