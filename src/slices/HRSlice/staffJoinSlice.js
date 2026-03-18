import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffRegistrationAPI from '../../api/HRAPI/staffRegistrationAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Fetch All Employee Groups
export const fetchAllEmpGroups = createAsyncThunk(
    'staffJoin/fetchAllEmpGroups',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Employee Groups');
            const response = await staffRegistrationAPI.getAllEmpGroups();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employee Groups');
        }
    }
);

// 2. Fetch All Employee Categories
export const fetchAllEmpCategories = createAsyncThunk(
    'staffJoin/fetchAllEmpCategories',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Employee Categories');
            const response = await staffRegistrationAPI.getAllEmpCategories();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employee Categories');
        }
    }
);

// 3. Save Staff Registration (→ spInsertStaffRegistration)
export const saveStaffRegistration = createAsyncThunk(
    'staffJoin/saveStaffRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Staff Registration:', params);
            const response = await staffRegistrationAPI.saveStaffRegistration(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Staff Registration');
        }
    }
);

// 4. Update Rejoin Staff Registration (→ UpdateRejoinStaffRegistration)
export const updateRejoinStaffRegistration = createAsyncThunk(
    'staffJoin/updateRejoinStaffRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Updating Rejoin Staff Registration:', params);
            const response = await staffRegistrationAPI.updateRejoinStaffRegistration(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to update Rejoin Staff Registration');
        }
    }
);

// 5. Update Staff Registration (→ UpdateStaffRegistration)
export const updateStaffRegistration = createAsyncThunk(
    'staffJoin/updateStaffRegistration',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Updating Staff Registration:', params);
            const response = await staffRegistrationAPI.updateStaffRegistration(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to update Staff Registration');
        }
    }
);

// 6. Fetch Old Employee For Rejoin
export const fetchOldEmpForRejoin = createAsyncThunk(
    'staffJoin/fetchOldEmpForRejoin',
    async ({ category, prefix, groupId }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Old Employee For Rejoin:', { category, prefix, groupId });
            const response = await staffRegistrationAPI.getOldEmpForRejoin({ category, prefix, groupId });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch old employee for rejoin');
        }
    }
);

// 7. Fetch Employee Degrees
export const fetchEmpDegrees = createAsyncThunk(
    'staffJoin/fetchEmpDegrees',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Degrees');
            const response = await staffRegistrationAPI.getEmpDegrees();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee degrees');
        }
    }
);

// 8. Fetch Employee Document Types
export const fetchEmpDocuments = createAsyncThunk(
    'staffJoin/fetchEmpDocuments',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Document Types');
            const response = await staffRegistrationAPI.getEmpDocuments();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee document types');
        }
    }
);

// 9. Fetch Report-To Role
export const fetchReportToRole = createAsyncThunk(
    'staffJoin/fetchReportToRole',
    async (categoryId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Report-To Role:', categoryId);
            const response = await staffRegistrationAPI.getReportToRole(categoryId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch report-to role');
        }
    }
);

// 10. Fetch All Designations
export const fetchAllDesignations = createAsyncThunk(
    'staffJoin/fetchAllDesignations',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Designations');
            const response = await staffRegistrationAPI.getAllDesignations();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch designations');
        }
    }
);

// 11. Save Designation (→ spInsertDesignation)
export const saveDesignation = createAsyncThunk(
    'staffJoin/saveDesignation',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Designation:', params);
            const response = await staffRegistrationAPI.saveDesignation(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save designation');
        }
    }
);

// 12. Fetch All Departments
export const fetchAllDepartments = createAsyncThunk(
    'staffJoin/fetchAllDepartments',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Departments');
            const response = await staffRegistrationAPI.getAllDepartments();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch departments');
        }
    }
);

// 13. Save Department (→ spInsertDepartment)
export const saveDepartment = createAsyncThunk(
    'staffJoin/saveDepartment',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Department:', params);
            const response = await staffRegistrationAPI.saveDepartment(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save department');
        }
    }
);

// 14. Fetch Employee Banks
export const fetchEmployeeBanks = createAsyncThunk(
    'staffJoin/fetchEmployeeBanks',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Banks');
            const response = await staffRegistrationAPI.getEmployeeBanks();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee banks');
        }
    }
);

// 15. Save Employee Bank (→ spInsertEmployeeBank)
export const saveEmployeeBank = createAsyncThunk(
    'staffJoin/saveEmployeeBank',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Employee Bank:', params);
            const response = await staffRegistrationAPI.saveEmployeeBank(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save employee bank');
        }
    }
);

// 16. Fetch All Cost Centers
export const fetchAllCostCenters = createAsyncThunk(
    'staffJoin/fetchAllCostCenters',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Cost Centers');
            const response = await staffRegistrationAPI.getAllCostCenters();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch cost centers');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Lookup Data ────────────────────────────
    empGroups: [],
    empCategories: [],
    empDegrees: [],
    empDocuments: [],
    reportToRole: [],
    designations: [],
    departments: [],
    employeeBanks: [],
    costCenters: [],
    oldEmpForRejoin: [],

    // ── Operation Results ──────────────────────
    saveResult: null,
    updateResult: null,
    updateRejoinResult: null,
    saveDesignationResult: null,
    saveDepartmentResult: null,
    saveEmployeeBankResult: null,

    // ── Status Tracking ────────────────────────
    saveStatus: null,               // null | 'pending' | 'success' | 'failed'
    updateStatus: null,
    updateRejoinStatus: null,
    saveDesignationStatus: null,
    saveDepartmentStatus: null,
    saveEmployeeBankStatus: null,

    // ── Loading States ─────────────────────────
    loading: {
        empGroups: false,
        empCategories: false,
        empDegrees: false,
        empDocuments: false,
        reportToRole: false,
        designations: false,
        departments: false,
        employeeBanks: false,
        costCenters: false,
        oldEmpForRejoin: false,
        save: false,
        update: false,
        updateRejoin: false,
        saveDesignation: false,
        saveDepartment: false,
        saveEmployeeBank: false,
    },

    // ── Error States ───────────────────────────
    errors: {
        empGroups: null,
        empCategories: null,
        empDegrees: null,
        empDocuments: null,
        reportToRole: null,
        designations: null,
        departments: null,
        employeeBanks: null,
        costCenters: null,
        oldEmpForRejoin: null,
        save: null,
        update: null,
        updateRejoin: null,
        saveDesignation: null,
        saveDepartment: null,
        saveEmployeeBank: null,
    },

    // ── UI / Form State ────────────────────────
    selectedGroupId: null,
    selectedCategoryId: null,
    currentMode: null,   // null | 'new' | 'edit' | 'rejoin'
};

// ==============================================
// HELPERS
// ==============================================

// Resolve save/update status from API response
// SP returns "Submited" (with single t) on success
const resolveRegistrationStatus = (payload) => {
    const responseStr = typeof payload === 'string'
        ? payload
        : (payload?.Data || payload?.Message || '');

    const isSuccess =
        (typeof responseStr === 'string' && (
            responseStr.toLowerCase().includes('submit') ||
            responseStr.toLowerCase().includes('success') ||
            responseStr.toLowerCase().includes('saved')
        )) ||
        payload?.IsSuccessful === true ||
        payload?.ResponseCode === 200;

    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const staffJoinSlice = createSlice({
    name: 'staffJoin',
    initialState,
    reducers: {
        // ── UI / Form actions ──────────────────────────────────────────────────
        setSelectedGroupId: (state, action) => {
            state.selectedGroupId = action.payload;
        },

        setSelectedCategoryId: (state, action) => {
            state.selectedCategoryId = action.payload;
            // Clear report-to role when category changes
            state.reportToRole = [];
            state.errors.reportToRole = null;
        },

        setCurrentMode: (state, action) => {
            state.currentMode = action.payload;
            // Reset all operation results when mode changes
            state.saveResult = null;
            state.updateResult = null;
            state.updateRejoinResult = null;
            state.saveDesignationResult = null;
            state.saveDepartmentResult = null;
            state.saveEmployeeBankResult = null;
            state.saveStatus = null;
            state.updateStatus = null;
            state.updateRejoinStatus = null;
            state.saveDesignationStatus = null;
            state.saveDepartmentStatus = null;
            state.saveEmployeeBankStatus = null;
            state.errors.save = null;
            state.errors.update = null;
            state.errors.updateRejoin = null;
            state.errors.saveDesignation = null;
            state.errors.saveDepartment = null;
            state.errors.saveEmployeeBank = null;
            // Clear rejoin search results
            state.oldEmpForRejoin = [];
            state.errors.oldEmpForRejoin = null;
        },

        // ── Status setter actions ──────────────────────────────────────────────
        setSaveStatus: (state, action) => {
            state.saveStatus = action.payload;
        },

        setUpdateStatus: (state, action) => {
            state.updateStatus = action.payload;
        },

        setUpdateRejoinStatus: (state, action) => {
            state.updateRejoinStatus = action.payload;
        },

        // ── Clear actions ──────────────────────────────────────────────────────
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },

        clearUpdateResult: (state) => {
            state.updateResult = null;
            state.updateStatus = null;
            state.errors.update = null;
        },

        clearUpdateRejoinResult: (state) => {
            state.updateRejoinResult = null;
            state.updateRejoinStatus = null;
            state.errors.updateRejoin = null;
        },

        clearDesignationResult: (state) => {
            state.saveDesignationResult = null;
            state.saveDesignationStatus = null;
            state.errors.saveDesignation = null;
        },

        clearDepartmentResult: (state) => {
            state.saveDepartmentResult = null;
            state.saveDepartmentStatus = null;
            state.errors.saveDepartment = null;
        },

        clearEmployeeBankResult: (state) => {
            state.saveEmployeeBankResult = null;
            state.saveEmployeeBankStatus = null;
            state.errors.saveEmployeeBank = null;
        },

        clearOldEmpForRejoin: (state) => {
            state.oldEmpForRejoin = [];
            state.errors.oldEmpForRejoin = null;
        },

        clearAllResults: (state) => {
            state.saveResult = null;
            state.updateResult = null;
            state.updateRejoinResult = null;
            state.saveDesignationResult = null;
            state.saveDepartmentResult = null;
            state.saveEmployeeBankResult = null;
            state.saveStatus = null;
            state.updateStatus = null;
            state.updateRejoinStatus = null;
            state.saveDesignationStatus = null;
            state.saveDepartmentStatus = null;
            state.saveEmployeeBankStatus = null;
            state.errors.save = null;
            state.errors.update = null;
            state.errors.updateRejoin = null;
            state.errors.saveDesignation = null;
            state.errors.saveDepartment = null;
            state.errors.saveEmployeeBank = null;
        },

        resetAll: (state) => {
            Object.assign(state, initialState);
        },
    },

    extraReducers: (builder) => {
        // ── 1. Fetch All Employee Groups ──────────────────────────────────────
        builder
            .addCase(fetchAllEmpGroups.pending, (state) => {
                state.loading.empGroups = true;
                state.errors.empGroups = null;
            })
            .addCase(fetchAllEmpGroups.fulfilled, (state, action) => {
                state.loading.empGroups = false;
                console.log('✅ All Employee Groups fulfilled:', action.payload);
                state.empGroups = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllEmpGroups.rejected, (state, action) => {
                state.loading.empGroups = false;
                state.errors.empGroups = action.payload;
                state.empGroups = [];
            });

        // ── 2. Fetch All Employee Categories ──────────────────────────────────
        builder
            .addCase(fetchAllEmpCategories.pending, (state) => {
                state.loading.empCategories = true;
                state.errors.empCategories = null;
            })
            .addCase(fetchAllEmpCategories.fulfilled, (state, action) => {
                state.loading.empCategories = false;
                console.log('✅ All Employee Categories fulfilled:', action.payload);
                state.empCategories = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllEmpCategories.rejected, (state, action) => {
                state.loading.empCategories = false;
                state.errors.empCategories = action.payload;
                state.empCategories = [];
            });

        // ── 3. Save Staff Registration ─────────────────────────────────────────
        builder
            .addCase(saveStaffRegistration.pending, (state) => {
                state.loading.save = true;
                state.errors.save = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveStaffRegistration.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save Staff Registration fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.save = responseStr || 'Save Staff Registration failed';
                }
            })
            .addCase(saveStaffRegistration.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });

        // ── 4. Update Rejoin Staff Registration ───────────────────────────────
        builder
            .addCase(updateRejoinStaffRegistration.pending, (state) => {
                state.loading.updateRejoin = true;
                state.errors.updateRejoin = null;
                state.updateRejoinStatus = 'pending';
            })
            .addCase(updateRejoinStaffRegistration.fulfilled, (state, action) => {
                state.loading.updateRejoin = false;
                console.log('✅ Update Rejoin Staff Registration fulfilled - Raw Response:', action.payload);
                state.updateRejoinResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.updateRejoinStatus = 'success';
                } else {
                    state.updateRejoinStatus = 'failed';
                    state.errors.updateRejoin = responseStr || 'Update Rejoin Staff Registration failed';
                }
            })
            .addCase(updateRejoinStaffRegistration.rejected, (state, action) => {
                state.loading.updateRejoin = false;
                state.errors.updateRejoin = action.payload;
                state.updateRejoinStatus = 'failed';
                state.updateRejoinResult = null;
            });

        // ── 5. Update Staff Registration ──────────────────────────────────────
        builder
            .addCase(updateStaffRegistration.pending, (state) => {
                state.loading.update = true;
                state.errors.update = null;
                state.updateStatus = 'pending';
            })
            .addCase(updateStaffRegistration.fulfilled, (state, action) => {
                state.loading.update = false;
                console.log('✅ Update Staff Registration fulfilled - Raw Response:', action.payload);
                state.updateResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.updateStatus = 'success';
                } else {
                    state.updateStatus = 'failed';
                    state.errors.update = responseStr || 'Update Staff Registration failed';
                }
            })
            .addCase(updateStaffRegistration.rejected, (state, action) => {
                state.loading.update = false;
                state.errors.update = action.payload;
                state.updateStatus = 'failed';
                state.updateResult = null;
            });

        // ── 6. Fetch Old Employee For Rejoin ──────────────────────────────────
        builder
            .addCase(fetchOldEmpForRejoin.pending, (state) => {
                state.loading.oldEmpForRejoin = true;
                state.errors.oldEmpForRejoin = null;
                state.oldEmpForRejoin = [];
            })
            .addCase(fetchOldEmpForRejoin.fulfilled, (state, action) => {
                state.loading.oldEmpForRejoin = false;
                console.log('✅ Old Employee For Rejoin fulfilled:', action.payload);
                state.oldEmpForRejoin = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchOldEmpForRejoin.rejected, (state, action) => {
                state.loading.oldEmpForRejoin = false;
                state.errors.oldEmpForRejoin = action.payload;
                state.oldEmpForRejoin = [];
            });

        // ── 7. Fetch Employee Degrees ─────────────────────────────────────────
        builder
            .addCase(fetchEmpDegrees.pending, (state) => {
                state.loading.empDegrees = true;
                state.errors.empDegrees = null;
            })
            .addCase(fetchEmpDegrees.fulfilled, (state, action) => {
                state.loading.empDegrees = false;
                console.log('✅ Employee Degrees fulfilled:', action.payload);
                state.empDegrees = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmpDegrees.rejected, (state, action) => {
                state.loading.empDegrees = false;
                state.errors.empDegrees = action.payload;
                state.empDegrees = [];
            });

        // ── 8. Fetch Employee Document Types ──────────────────────────────────
        builder
            .addCase(fetchEmpDocuments.pending, (state) => {
                state.loading.empDocuments = true;
                state.errors.empDocuments = null;
            })
            .addCase(fetchEmpDocuments.fulfilled, (state, action) => {
                state.loading.empDocuments = false;
                console.log('✅ Employee Document Types fulfilled:', action.payload);
                state.empDocuments = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmpDocuments.rejected, (state, action) => {
                state.loading.empDocuments = false;
                state.errors.empDocuments = action.payload;
                state.empDocuments = [];
            });

        // ── 9. Fetch Report-To Role ───────────────────────────────────────────
        builder
            .addCase(fetchReportToRole.pending, (state) => {
                state.loading.reportToRole = true;
                state.errors.reportToRole = null;
            })
            .addCase(fetchReportToRole.fulfilled, (state, action) => {
                state.loading.reportToRole = false;
                console.log('✅ Report-To Role fulfilled:', action.payload);
                state.reportToRole = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchReportToRole.rejected, (state, action) => {
                state.loading.reportToRole = false;
                state.errors.reportToRole = action.payload;
                state.reportToRole = [];
            });

        // ── 10. Fetch All Designations ────────────────────────────────────────
        builder
            .addCase(fetchAllDesignations.pending, (state) => {
                state.loading.designations = true;
                state.errors.designations = null;
            })
            .addCase(fetchAllDesignations.fulfilled, (state, action) => {
                state.loading.designations = false;
                console.log('✅ All Designations fulfilled:', action.payload);
                state.designations = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllDesignations.rejected, (state, action) => {
                state.loading.designations = false;
                state.errors.designations = action.payload;
                state.designations = [];
            });

        // ── 11. Save Designation ──────────────────────────────────────────────
        builder
            .addCase(saveDesignation.pending, (state) => {
                state.loading.saveDesignation = true;
                state.errors.saveDesignation = null;
                state.saveDesignationStatus = 'pending';
            })
            .addCase(saveDesignation.fulfilled, (state, action) => {
                state.loading.saveDesignation = false;
                console.log('✅ Save Designation fulfilled - Raw Response:', action.payload);
                state.saveDesignationResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.saveDesignationStatus = 'success';
                } else {
                    state.saveDesignationStatus = 'failed';
                    state.errors.saveDesignation = responseStr || 'Save Designation failed';
                }
            })
            .addCase(saveDesignation.rejected, (state, action) => {
                state.loading.saveDesignation = false;
                state.errors.saveDesignation = action.payload;
                state.saveDesignationStatus = 'failed';
                state.saveDesignationResult = null;
            });

        // ── 12. Fetch All Departments ─────────────────────────────────────────
        builder
            .addCase(fetchAllDepartments.pending, (state) => {
                state.loading.departments = true;
                state.errors.departments = null;
            })
            .addCase(fetchAllDepartments.fulfilled, (state, action) => {
                state.loading.departments = false;
                console.log('✅ All Departments fulfilled:', action.payload);
                state.departments = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllDepartments.rejected, (state, action) => {
                state.loading.departments = false;
                state.errors.departments = action.payload;
                state.departments = [];
            });

        // ── 13. Save Department ───────────────────────────────────────────────
        builder
            .addCase(saveDepartment.pending, (state) => {
                state.loading.saveDepartment = true;
                state.errors.saveDepartment = null;
                state.saveDepartmentStatus = 'pending';
            })
            .addCase(saveDepartment.fulfilled, (state, action) => {
                state.loading.saveDepartment = false;
                console.log('✅ Save Department fulfilled - Raw Response:', action.payload);
                state.saveDepartmentResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.saveDepartmentStatus = 'success';
                } else {
                    state.saveDepartmentStatus = 'failed';
                    state.errors.saveDepartment = responseStr || 'Save Department failed';
                }
            })
            .addCase(saveDepartment.rejected, (state, action) => {
                state.loading.saveDepartment = false;
                state.errors.saveDepartment = action.payload;
                state.saveDepartmentStatus = 'failed';
                state.saveDepartmentResult = null;
            });

        // ── 14. Fetch Employee Banks ──────────────────────────────────────────
        builder
            .addCase(fetchEmployeeBanks.pending, (state) => {
                state.loading.employeeBanks = true;
                state.errors.employeeBanks = null;
            })
            .addCase(fetchEmployeeBanks.fulfilled, (state, action) => {
                state.loading.employeeBanks = false;
                console.log('✅ Employee Banks fulfilled:', action.payload);
                state.employeeBanks = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmployeeBanks.rejected, (state, action) => {
                state.loading.employeeBanks = false;
                state.errors.employeeBanks = action.payload;
                state.employeeBanks = [];
            });

        // ── 15. Save Employee Bank ────────────────────────────────────────────
        builder
            .addCase(saveEmployeeBank.pending, (state) => {
                state.loading.saveEmployeeBank = true;
                state.errors.saveEmployeeBank = null;
                state.saveEmployeeBankStatus = 'pending';
            })
            .addCase(saveEmployeeBank.fulfilled, (state, action) => {
                state.loading.saveEmployeeBank = false;
                console.log('✅ Save Employee Bank fulfilled - Raw Response:', action.payload);
                state.saveEmployeeBankResult = action.payload;
                const { isSuccess, responseStr } = resolveRegistrationStatus(action.payload);
                if (isSuccess) {
                    state.saveEmployeeBankStatus = 'success';
                } else {
                    state.saveEmployeeBankStatus = 'failed';
                    state.errors.saveEmployeeBank = responseStr || 'Save Employee Bank failed';
                }
            })
            .addCase(saveEmployeeBank.rejected, (state, action) => {
                state.loading.saveEmployeeBank = false;
                state.errors.saveEmployeeBank = action.payload;
                state.saveEmployeeBankStatus = 'failed';
                state.saveEmployeeBankResult = null;
            });

        // ── 16. Fetch All Cost Centers ────────────────────────────────────────
        builder
            .addCase(fetchAllCostCenters.pending, (state) => {
                state.loading.costCenters = true;
                state.errors.costCenters = null;
            })
            .addCase(fetchAllCostCenters.fulfilled, (state, action) => {
                state.loading.costCenters = false;
                console.log('✅ All Cost Centers fulfilled:', action.payload);
                state.costCenters = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllCostCenters.rejected, (state, action) => {
                state.loading.costCenters = false;
                state.errors.costCenters = action.payload;
                state.costCenters = [];
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedGroupId,
    setSelectedCategoryId,
    setCurrentMode,
    setSaveStatus,
    setUpdateStatus,
    setUpdateRejoinStatus,
    clearError,
    clearSaveResult,
    clearUpdateResult,
    clearUpdateRejoinResult,
    clearDesignationResult,
    clearDepartmentResult,
    clearEmployeeBankResult,
    clearOldEmpForRejoin,
    clearAllResults,
    resetAll,
} = staffJoinSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Lookup Data Selectors ─────────────────────────────────────────────────────
export const selectEmpGroups                  = (state) => state.staffJoin.empGroups;
export const selectEmpCategories              = (state) => state.staffJoin.empCategories;
export const selectEmpDegrees                 = (state) => state.staffJoin.empDegrees;
export const selectEmpDocuments               = (state) => state.staffJoin.empDocuments;
export const selectReportToRole               = (state) => state.staffJoin.reportToRole;
export const selectDesignations               = (state) => state.staffJoin.designations;
export const selectDepartments                = (state) => state.staffJoin.departments;
export const selectEmployeeBanks              = (state) => state.staffJoin.employeeBanks;
export const selectCostCenters                = (state) => state.staffJoin.costCenters;
export const selectOldEmpForRejoin            = (state) => state.staffJoin.oldEmpForRejoin;

// ── Safe Array Selectors ──────────────────────────────────────────────────────
export const selectEmpGroupsArray             = (state) => {
    const data = state.staffJoin.empGroups;
    return Array.isArray(data) ? data : [];
};
export const selectEmpCategoriesArray         = (state) => {
    const data = state.staffJoin.empCategories;
    return Array.isArray(data) ? data : [];
};
export const selectEmpDegreesArray            = (state) => {
    const data = state.staffJoin.empDegrees;
    return Array.isArray(data) ? data : [];
};
export const selectEmpDocumentsArray          = (state) => {
    const data = state.staffJoin.empDocuments;
    return Array.isArray(data) ? data : [];
};
export const selectReportToRoleArray          = (state) => {
    const data = state.staffJoin.reportToRole;
    return Array.isArray(data) ? data : [];
};
export const selectDesignationsArray          = (state) => {
    const data = state.staffJoin.designations;
    return Array.isArray(data) ? data : [];
};
export const selectDepartmentsArray           = (state) => {
    const data = state.staffJoin.departments;
    return Array.isArray(data) ? data : [];
};
export const selectEmployeeBanksArray         = (state) => {
    const data = state.staffJoin.employeeBanks;
    return Array.isArray(data) ? data : [];
};
export const selectCostCentersArray           = (state) => {
    const data = state.staffJoin.costCenters;
    return Array.isArray(data) ? data : [];
};
export const selectOldEmpForRejoinArray       = (state) => {
    const data = state.staffJoin.oldEmpForRejoin;
    return Array.isArray(data) ? data : [];
};

// ── Operation Result Selectors ────────────────────────────────────────────────
export const selectSaveResult                 = (state) => state.staffJoin.saveResult;
export const selectUpdateResult               = (state) => state.staffJoin.updateResult;
export const selectUpdateRejoinResult         = (state) => state.staffJoin.updateRejoinResult;
export const selectSaveDesignationResult      = (state) => state.staffJoin.saveDesignationResult;
export const selectSaveDepartmentResult       = (state) => state.staffJoin.saveDepartmentResult;
export const selectSaveEmployeeBankResult     = (state) => state.staffJoin.saveEmployeeBankResult;

// ── Status Selectors ──────────────────────────────────────────────────────────
export const selectSaveStatus                 = (state) => state.staffJoin.saveStatus;
export const selectUpdateStatus               = (state) => state.staffJoin.updateStatus;
export const selectUpdateRejoinStatus         = (state) => state.staffJoin.updateRejoinStatus;
export const selectSaveDesignationStatus      = (state) => state.staffJoin.saveDesignationStatus;
export const selectSaveDepartmentStatus       = (state) => state.staffJoin.saveDepartmentStatus;
export const selectSaveEmployeeBankStatus     = (state) => state.staffJoin.saveEmployeeBankStatus;

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                    = (state) => state.staffJoin.loading;
export const selectEmpGroupsLoading           = (state) => state.staffJoin.loading.empGroups;
export const selectEmpCategoriesLoading       = (state) => state.staffJoin.loading.empCategories;
export const selectEmpDegreesLoading          = (state) => state.staffJoin.loading.empDegrees;
export const selectEmpDocumentsLoading        = (state) => state.staffJoin.loading.empDocuments;
export const selectReportToRoleLoading        = (state) => state.staffJoin.loading.reportToRole;
export const selectDesignationsLoading        = (state) => state.staffJoin.loading.designations;
export const selectDepartmentsLoading         = (state) => state.staffJoin.loading.departments;
export const selectEmployeeBanksLoading       = (state) => state.staffJoin.loading.employeeBanks;
export const selectCostCentersLoading         = (state) => state.staffJoin.loading.costCenters;
export const selectOldEmpForRejoinLoading     = (state) => state.staffJoin.loading.oldEmpForRejoin;
export const selectSaveLoading                = (state) => state.staffJoin.loading.save;
export const selectUpdateLoading              = (state) => state.staffJoin.loading.update;
export const selectUpdateRejoinLoading        = (state) => state.staffJoin.loading.updateRejoin;
export const selectSaveDesignationLoading     = (state) => state.staffJoin.loading.saveDesignation;
export const selectSaveDepartmentLoading      = (state) => state.staffJoin.loading.saveDepartment;
export const selectSaveEmployeeBankLoading    = (state) => state.staffJoin.loading.saveEmployeeBank;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                     = (state) => state.staffJoin.errors;
export const selectEmpGroupsError             = (state) => state.staffJoin.errors.empGroups;
export const selectEmpCategoriesError         = (state) => state.staffJoin.errors.empCategories;
export const selectEmpDegreesError            = (state) => state.staffJoin.errors.empDegrees;
export const selectEmpDocumentsError          = (state) => state.staffJoin.errors.empDocuments;
export const selectReportToRoleError          = (state) => state.staffJoin.errors.reportToRole;
export const selectDesignationsError          = (state) => state.staffJoin.errors.designations;
export const selectDepartmentsError           = (state) => state.staffJoin.errors.departments;
export const selectEmployeeBanksError         = (state) => state.staffJoin.errors.employeeBanks;
export const selectCostCentersError           = (state) => state.staffJoin.errors.costCenters;
export const selectOldEmpForRejoinError       = (state) => state.staffJoin.errors.oldEmpForRejoin;
export const selectSaveError                  = (state) => state.staffJoin.errors.save;
export const selectUpdateError                = (state) => state.staffJoin.errors.update;
export const selectUpdateRejoinError          = (state) => state.staffJoin.errors.updateRejoin;
export const selectSaveDesignationError       = (state) => state.staffJoin.errors.saveDesignation;
export const selectSaveDepartmentError        = (state) => state.staffJoin.errors.saveDepartment;
export const selectSaveEmployeeBankError      = (state) => state.staffJoin.errors.saveEmployeeBank;

// ── UI / Form Selectors ───────────────────────────────────────────────────────
export const selectSelectedGroupId            = (state) => state.staffJoin.selectedGroupId;
export const selectSelectedCategoryId         = (state) => state.staffJoin.selectedCategoryId;
export const selectCurrentMode                = (state) => state.staffJoin.currentMode;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.staffJoin.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.staffJoin.errors).some((error) => error !== null);

// Registration workflow summary
export const selectRegistrationSummary = (state) => ({
    totalGroups:              Array.isArray(state.staffJoin.empGroups)
                                ? state.staffJoin.empGroups.length : 0,
    totalCategories:          Array.isArray(state.staffJoin.empCategories)
                                ? state.staffJoin.empCategories.length : 0,
    totalDesignations:        Array.isArray(state.staffJoin.designations)
                                ? state.staffJoin.designations.length : 0,
    totalDepartments:         Array.isArray(state.staffJoin.departments)
                                ? state.staffJoin.departments.length : 0,
    totalBanks:               Array.isArray(state.staffJoin.employeeBanks)
                                ? state.staffJoin.employeeBanks.length : 0,
    totalCostCenters:         Array.isArray(state.staffJoin.costCenters)
                                ? state.staffJoin.costCenters.length : 0,
    currentMode:              state.staffJoin.currentMode,
    saveStatus:               state.staffJoin.saveStatus,
    updateStatus:             state.staffJoin.updateStatus,
    updateRejoinStatus:       state.staffJoin.updateRejoinStatus,
    saveDesignationStatus:    state.staffJoin.saveDesignationStatus,
    saveDepartmentStatus:     state.staffJoin.saveDepartmentStatus,
    saveEmployeeBankStatus:   state.staffJoin.saveEmployeeBankStatus,
    isSaving:                 state.staffJoin.loading.save,
    isUpdating:               state.staffJoin.loading.update,
    isUpdatingRejoin:         state.staffJoin.loading.updateRejoin,
    hasGroupSelected:         state.staffJoin.selectedGroupId !== null,
    hasCategorySelected:      state.staffJoin.selectedCategoryId !== null,
});

// Filter selections summary
export const selectFormSelections = (state) => ({
    groupId:             state.staffJoin.selectedGroupId,
    categoryId:          state.staffJoin.selectedCategoryId,
    currentMode:         state.staffJoin.currentMode,
    hasGroupId:          state.staffJoin.selectedGroupId !== null,
    hasCategoryId:       state.staffJoin.selectedCategoryId !== null,
});

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffJoinSlice.reducer;