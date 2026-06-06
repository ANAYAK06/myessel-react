import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffSalaryDeductionArrearAPI from '../../api/HRAPI/staffSalaryDeductionArrearAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Fetch Salary Deduction Employees (search by prefix)
export const fetchSalaryDeductionEmp = createAsyncThunk(
    'salaryDeductionArrear/fetchSalaryDeductionEmp',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Salary Deduction Employees:', params);
            const response = await staffSalaryDeductionArrearAPI.getSalaryDeductionEmp(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Salary Deduction Employees');
        }
    }
);

// 2. Fetch Salary Pending Years for Employee
export const fetchSalaryPendingYear = createAsyncThunk(
    'salaryDeductionArrear/fetchSalaryPendingYear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Salary Pending Years:', params);
            const response = await staffSalaryDeductionArrearAPI.getSalaryPendingYear(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Salary Pending Years');
        }
    }
);

// 3. Bind Salary Deduction Months
export const fetchBindSalaryDeductionMonths = createAsyncThunk(
    'salaryDeductionArrear/fetchBindSalaryDeductionMonths',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Salary Deduction Months:', params);
            const response = await staffSalaryDeductionArrearAPI.bindSalaryDeductionMonths(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Salary Deduction Months');
        }
    }
);

// 4. Fetch Employee Deductions For Month
export const fetchEmpDeductionsForMonth = createAsyncThunk(
    'salaryDeductionArrear/fetchEmpDeductionsForMonth',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Deductions For Month:', params);
            const response = await staffSalaryDeductionArrearAPI.getEmpDeductionsForMonth(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employee Deductions For Month');
        }
    }
);

// 5. Save Single Employee Salary Deduction (→ spInsertSingleEmpSalaryDeduction)
export const saveSingleEmpSalaryDeduction = createAsyncThunk(
    'salaryDeductionArrear/saveSingleEmpSalaryDeduction',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Single Employee Salary Deduction:', params);
            const response = await staffSalaryDeductionArrearAPI.saveSingleEmpSalaryDeduction(params);
            const { isSuccess, responseStr } = resolveDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || 'Save Deduction failed');
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Single Employee Salary Deduction');
        }
    }
);

// 6. Update Single Employee Salary Deduction (→ UpdateSingleEmpSalaryDeduction)
export const updateSingleSalaryDeduction = createAsyncThunk(
    'salaryDeductionArrear/updateSingleSalaryDeduction',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Updating Single Employee Salary Deduction:', params);
            const response = await staffSalaryDeductionArrearAPI.updateSingleSalaryDeduction(params);
            const { isSuccess, responseStr } = resolveDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || 'Update Deduction failed');
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to update Single Employee Salary Deduction');
        }
    }
);

// 7. Save Salary Deductions Bulk (→ spInsertEmpSalaryDeduction)
export const saveSalaryDeductions = createAsyncThunk(
    'salaryDeductionArrear/saveSalaryDeductions',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Salary Deductions (Bulk):', params);
            const response = await staffSalaryDeductionArrearAPI.saveSalaryDeductions(params);
            const { isSuccess, isDuplicate, responseStr } = resolveBulkDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || (isDuplicate ? 'Salary already exists for selected employees' : 'Save Salary Deductions failed'));
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Salary Deductions');
        }
    }
);

// 8. Fetch Pending Salary Deductions (GET) → records saved via single-emp flow, pending bulk submission
export const fetchPendingSalaryDeductions = createAsyncThunk(
    'salaryDeductionArrear/fetchPendingSalaryDeductions',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Pending Salary Deductions');
            const response = await staffSalaryDeductionArrearAPI.getPendingSalaryDeductions();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Pending Salary Deductions');
        }
    }
);

// 9. Fetch Salary Deductions by EmpTransactionRefNo
export const fetchSalaryDeductionsByEmpTransNo = createAsyncThunk(
    'salaryDeductionArrear/fetchSalaryDeductionsByEmpTransNo',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Salary Deductions by EmpTransactionRefNo:', params);
            const response = await staffSalaryDeductionArrearAPI.getSalaryDeductionsByEmpTransNo(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Salary Deductions by EmpTransactionRefNo');
        }
    }
);

// 10. Fetch Arrear Heads
export const fetchArearHeads = createAsyncThunk(
    'salaryDeductionArrear/fetchArearHeads',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Arrear Heads');
            const response = await staffSalaryDeductionArrearAPI.getArearHeads();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Arrear Heads');
        }
    }
);

// 11. Fetch Arrears Cost Centers for Employee
export const fetchArearsCC = createAsyncThunk(
    'salaryDeductionArrear/fetchArearsCC',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Arrears Cost Centers:', params);
            const response = await staffSalaryDeductionArrearAPI.getArearsCC(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Arrears Cost Centers');
        }
    }
);

// 12. Save Arrear (→ spInsertArearHead)
export const saveArear = createAsyncThunk(
    'salaryDeductionArrear/saveArear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Arrear:', params);
            const response = await staffSalaryDeductionArrearAPI.saveArear(params);
            const { isSuccess, responseStr } = resolveDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || 'Save Arrear failed');
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Arrear');
        }
    }
);


// 13. Fetch Pending Salary Arrears (GET) → records saved via single-arrear flow, pending bulk submission
export const fetchPendingSalaryArear = createAsyncThunk(
    'salaryDeductionArrear/fetchPendingSalaryArear',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Pending Salary Arrears');
            const response = await staffSalaryDeductionArrearAPI.getPendingSalaryArear();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Pending Salary Arrears');
        }
    }
);

// 14. Update Single Employee Arrear (→ spUpdateArear)
export const updateArear = createAsyncThunk(
    'salaryDeductionArrear/updateArear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Updating Arrear:', params);
            const response = await staffSalaryDeductionArrearAPI.updateArear(params);
            const { isSuccess, responseStr } = resolveDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || 'Update Arrear failed');
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to update Arrear');
        }
    }
);

// 15. Save Salary Arrears Bulk (→ spInsertEmpSalaryArear)
export const saveSalaryArears = createAsyncThunk(
    'salaryDeductionArrear/saveSalaryArears',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Salary Arrears (Bulk):', params);
            const response = await staffSalaryDeductionArrearAPI.saveSalaryArears(params);
            const { isSuccess, isDuplicate, responseStr } = resolveBulkDeductionStatus(response);
            if (!isSuccess) return rejectWithValue(responseStr || (isDuplicate ? 'Arrear already exists for selected employees' : 'Save Salary Arrears failed'));
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Salary Arrears');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Salary Deduction Data ──────────────────
    salaryDeductionEmployees: [],
    salaryPendingYears: [],
    salaryDeductionMonths: [],
    empDeductionsForMonth: null,
    deductionSaveResult: null,
    deductionUpdateResult: null,
    deductionBulkSaveResult: null,
    pendingSalaryDeductions: [],
    salaryDeductionsByTransNo: null,

    // ── Arrear Data ────────────────────────────
    arearHeads: [],
    arearsCostCenters: [],
    arearSaveResult: null,
    arearUpdateResult: null,
    arearBulkSaveResult: null,
    pendingSalaryArears: [],

    // ── Loading States ─────────────────────────
    loading: {
        salaryDeductionEmployees: false,
        salaryPendingYears: false,
        salaryDeductionMonths: false,
        empDeductionsForMonth: false,
        saveDeduction: false,
        updateDeduction: false,
        saveBulkDeduction: false,
        pendingSalaryDeductions: false,
        salaryDeductionsByTransNo: false,
        arearHeads: false,
        arearsCostCenters: false,
        saveArear: false,
        updateArear: false,
        saveBulkArear: false,
        pendingSalaryArears: false,
    },

    // ── Error States ───────────────────────────
    errors: {
        salaryDeductionEmployees: null,
        salaryPendingYears: null,
        salaryDeductionMonths: null,
        empDeductionsForMonth: null,
        saveDeduction: null,
        updateDeduction: null,
        saveBulkDeduction: null,
        pendingSalaryDeductions: null,
        salaryDeductionsByTransNo: null,
        arearHeads: null,
        arearsCostCenters: null,
        saveArear: null,
        updateArear: null,
        saveBulkArear: null,
        pendingSalaryArears: null,
    },

    // ── UI / Filter Selections ─────────────────
    // Shared
    selectedEmpRefNo: null,
    selectedYear: null,
    selectedMonth: null,

    // Deduction specific
    deductionSaveStatus: null,
    deductionUpdateStatus: null,
    deductionBulkSaveStatus: null,

    // Arrear specific
    selectedArearHead: null,
    selectedArearCCCode: null,
    arearSaveStatus: null,
    arearUpdateStatus: null,
    arearBulkSaveStatus: null,
};

// ==============================================
// HELPERS
// ==============================================

// Resolve save status from API response (handles "Submited" / "Submited" spelling)
const resolveDeductionStatus = (payload) => {
    const data = payload?.Data;
    const responseStr = typeof data === 'string' ? data : (payload?.Message || '');

    // Success only when Data is a non-string (actual saved record object)
    // OR when Data/Message explicitly contains a success keyword.
    // IsSuccessful/ResponseCode alone are NOT sufficient — the backend returns
    // IsSuccessful:true even for business-logic failures like "Already Exist".
    const isSuccess = typeof data !== 'string'
        ? (data !== null && data !== undefined)
        : (
            responseStr.toLowerCase().includes('submit') ||
            responseStr.toLowerCase().includes('success') ||
            responseStr.toLowerCase().includes('saved')
        );

    return { isSuccess, responseStr };
};

// Resolve bulk save status — SP returns "Submited", "Salary For Employees Error Already Exists", or SQL error string
const resolveBulkDeductionStatus = (payload) => {
    const responseStr = typeof payload === 'string'
        ? payload
        : (payload?.Data || payload?.Message || '');

    const isSuccess =
        typeof responseStr === 'string' && responseStr.toLowerCase().includes('submit');

    const isDuplicate =
        typeof responseStr === 'string' && responseStr.toLowerCase().includes('already exists');

    return { isSuccess, isDuplicate, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const staffSalaryDeductionArrearSlice = createSlice({
    name: 'salaryDeductionArrear',
    initialState,
    reducers: {
        // ── Shared filter actions ──────────────────────────────────────────────
        setSelectedEmpRefNo: (state, action) => {
            state.selectedEmpRefNo = action.payload;
            // Reset dependent data when employee changes
            state.salaryPendingYears = [];
            state.salaryDeductionMonths = [];
            state.empDeductionsForMonth = null;
            state.arearsCostCenters = [];
            state.selectedYear = null;
            state.selectedMonth = null;
            state.selectedArearCCCode = null;
        },

        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
            // Reset dependent data when year changes
            state.salaryDeductionMonths = [];
            state.empDeductionsForMonth = null;
            state.selectedMonth = null;
        },

        setSelectedMonth: (state, action) => {
            state.selectedMonth = action.payload;
            // Reset deduction detail when month changes
            state.empDeductionsForMonth = null;
        },

        // ── Arrear specific actions ────────────────────────────────────────────
        setSelectedArearHead: (state, action) => {
            state.selectedArearHead = action.payload;
        },

        setSelectedArearCCCode: (state, action) => {
            state.selectedArearCCCode = action.payload;
        },

        // ── Save status actions ────────────────────────────────────────────────
        setDeductionSaveStatus: (state, action) => {
            state.deductionSaveStatus = action.payload;
        },

        setDeductionUpdateStatus: (state, action) => {
            state.deductionUpdateStatus = action.payload;
        },

        setDeductionBulkSaveStatus: (state, action) => {
            state.deductionBulkSaveStatus = action.payload;
        },

        setArearSaveStatus: (state, action) => {
            state.arearSaveStatus = action.payload;
        },

        // ── Clear actions ──────────────────────────────────────────────────────
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        clearDeductionSaveResult: (state) => {
            state.deductionSaveResult = null;
            state.deductionSaveStatus = null;
            state.errors.saveDeduction = null;
        },

        clearDeductionUpdateResult: (state) => {
            state.deductionUpdateResult = null;
            state.deductionUpdateStatus = null;
            state.errors.updateDeduction = null;
        },

        clearDeductionBulkSaveResult: (state) => {
            state.deductionBulkSaveResult = null;
            state.deductionBulkSaveStatus = null;
            state.errors.saveBulkDeduction = null;
        },

        clearArearSaveResult: (state) => {
            state.arearSaveResult = null;
            state.arearSaveStatus = null;
            state.errors.saveArear = null;
        },

        clearArearUpdateResult: (state) => {
            state.arearUpdateResult = null;
            state.arearUpdateStatus = null;
            state.errors.updateArear = null;
        },

        clearArearBulkSaveResult: (state) => {
            state.arearBulkSaveResult = null;
            state.arearBulkSaveStatus = null;
            state.errors.saveBulkArear = null;
        },

        clearPendingSalaryArears: (state) => {
            state.pendingSalaryArears = [];
            state.errors.pendingSalaryArears = null;
        },

        clearPendingSalaryDeductions: (state) => {
            state.pendingSalaryDeductions = [];
            state.errors.pendingSalaryDeductions = null;
        },

        clearSalaryDeductionsByTransNo: (state) => {
            state.salaryDeductionsByTransNo = null;
            state.errors.salaryDeductionsByTransNo = null;
        },

        resetDeductionData: (state) => {
            state.salaryDeductionEmployees = [];
            state.salaryPendingYears = [];
            state.salaryDeductionMonths = [];
            state.empDeductionsForMonth = null;
            state.deductionSaveResult = null;
            state.deductionSaveStatus = null;
            state.deductionUpdateResult = null;
            state.deductionUpdateStatus = null;
            state.deductionBulkSaveResult = null;
            state.deductionBulkSaveStatus = null;
            state.selectedEmpRefNo = null;
            state.selectedYear = null;
            state.selectedMonth = null;
            state.errors.salaryDeductionEmployees = null;
            state.errors.salaryPendingYears = null;
            state.errors.salaryDeductionMonths = null;
            state.errors.empDeductionsForMonth = null;
            state.errors.saveDeduction = null;
            state.errors.updateDeduction = null;
            state.errors.saveBulkDeduction = null;
            state.salaryDeductionsByTransNo = null;
            state.errors.salaryDeductionsByTransNo = null;
            // NOTE: pendingSalaryDeductions intentionally NOT reset here —
            // it is loaded from the server on mount and should persist across form resets
        },

        resetArearData: (state) => {
            state.arearHeads = [];
            state.arearsCostCenters = [];
            state.arearSaveResult = null;
            state.arearSaveStatus = null;
            state.arearUpdateResult = null;
            state.arearUpdateStatus = null;
            state.arearBulkSaveResult = null;
            state.arearBulkSaveStatus = null;
            state.selectedArearHead = null;
            state.selectedArearCCCode = null;
            state.errors.arearHeads = null;
            state.errors.arearsCostCenters = null;
            state.errors.saveArear = null;
            state.errors.updateArear = null;
            state.errors.saveBulkArear = null;
            // NOTE: pendingSalaryArears intentionally NOT reset here —
            // it is loaded from the server on mount and should persist across form resets
        },

        resetAll: (state) => {
            Object.assign(state, initialState);
        },
    },

    extraReducers: (builder) => {
        // ── 1. Fetch Salary Deduction Employees ───────────────────────────────
        builder
            .addCase(fetchSalaryDeductionEmp.pending, (state) => {
                state.loading.salaryDeductionEmployees = true;
                state.errors.salaryDeductionEmployees = null;
            })
            .addCase(fetchSalaryDeductionEmp.fulfilled, (state, action) => {
                state.loading.salaryDeductionEmployees = false;
                console.log('✅ Salary Deduction Employees fulfilled:', action.payload);
                state.salaryDeductionEmployees = action.payload?.Data || [];
            })
            .addCase(fetchSalaryDeductionEmp.rejected, (state, action) => {
                state.loading.salaryDeductionEmployees = false;
                state.errors.salaryDeductionEmployees = action.payload;
                state.salaryDeductionEmployees = [];
            });

        // ── 2. Fetch Salary Pending Years ─────────────────────────────────────
        builder
            .addCase(fetchSalaryPendingYear.pending, (state) => {
                state.loading.salaryPendingYears = true;
                state.errors.salaryPendingYears = null;
            })
            .addCase(fetchSalaryPendingYear.fulfilled, (state, action) => {
                state.loading.salaryPendingYears = false;
                console.log('✅ Salary Pending Years fulfilled:', action.payload);
                state.salaryPendingYears = action.payload?.Data || [];
            })
            .addCase(fetchSalaryPendingYear.rejected, (state, action) => {
                state.loading.salaryPendingYears = false;
                state.errors.salaryPendingYears = action.payload;
                state.salaryPendingYears = [];
            });

        // ── 3. Bind Salary Deduction Months ───────────────────────────────────
        builder
            .addCase(fetchBindSalaryDeductionMonths.pending, (state) => {
                state.loading.salaryDeductionMonths = true;
                state.errors.salaryDeductionMonths = null;
            })
            .addCase(fetchBindSalaryDeductionMonths.fulfilled, (state, action) => {
                state.loading.salaryDeductionMonths = false;
                console.log('✅ Salary Deduction Months fulfilled:', action.payload);
                // API returns: { Data: { PendingStatus: "No", MonthsList: [{MonthNo, MonthName}] } }
                state.salaryDeductionMonths = action.payload?.Data?.MonthsList || action.payload?.Data || [];
            })
            .addCase(fetchBindSalaryDeductionMonths.rejected, (state, action) => {
                state.loading.salaryDeductionMonths = false;
                state.errors.salaryDeductionMonths = action.payload;
                state.salaryDeductionMonths = [];
            });

        // ── 4. Fetch Employee Deductions For Month ────────────────────────────
        builder
            .addCase(fetchEmpDeductionsForMonth.pending, (state) => {
                state.loading.empDeductionsForMonth = true;
                state.errors.empDeductionsForMonth = null;
            })
            .addCase(fetchEmpDeductionsForMonth.fulfilled, (state, action) => {
                state.loading.empDeductionsForMonth = false;
                console.log('✅ Employee Deductions For Month fulfilled:', action.payload);
                // API returns full Data object: { CCCode, lstDeduction: [{HeadName, HeadType, Amount}], ...}
                state.empDeductionsForMonth = action.payload?.Data || null;
            })
            .addCase(fetchEmpDeductionsForMonth.rejected, (state, action) => {
                state.loading.empDeductionsForMonth = false;
                state.errors.empDeductionsForMonth = action.payload;
                state.empDeductionsForMonth = null;
            });

        // ── 5. Save Single Employee Salary Deduction ──────────────────────────
        builder
            .addCase(saveSingleEmpSalaryDeduction.pending, (state) => {
                state.loading.saveDeduction = true;
                state.errors.saveDeduction = null;
                state.deductionSaveStatus = 'pending';
            })
            .addCase(saveSingleEmpSalaryDeduction.fulfilled, (state, action) => {
                state.loading.saveDeduction = false;
                console.log('✅ Save Single Employee Salary Deduction fulfilled - Raw Response:', action.payload);
                state.deductionSaveResult = action.payload;
                const { isSuccess, responseStr } = resolveDeductionStatus(action.payload);
                if (isSuccess) {
                    state.deductionSaveStatus = 'success';
                } else {
                    state.deductionSaveStatus = 'failed';
                    state.errors.saveDeduction = responseStr || 'Save Deduction failed';
                }
            })
            .addCase(saveSingleEmpSalaryDeduction.rejected, (state, action) => {
                state.loading.saveDeduction = false;
                state.errors.saveDeduction = action.payload;
                state.deductionSaveStatus = 'failed';
                state.deductionSaveResult = null;
            });

        // ── 6. Update Single Employee Salary Deduction ────────────────────────
        builder
            .addCase(updateSingleSalaryDeduction.pending, (state) => {
                state.loading.updateDeduction = true;
                state.errors.updateDeduction = null;
                state.deductionUpdateStatus = 'pending';
            })
            .addCase(updateSingleSalaryDeduction.fulfilled, (state, action) => {
                state.loading.updateDeduction = false;
                console.log('✅ Update Single Employee Salary Deduction fulfilled - Raw Response:', action.payload);
                state.deductionUpdateResult = action.payload;
                const { isSuccess, responseStr } = resolveDeductionStatus(action.payload);
                if (isSuccess) {
                    state.deductionUpdateStatus = 'success';
                } else {
                    state.deductionUpdateStatus = 'failed';
                    state.errors.updateDeduction = responseStr || 'Update Deduction failed';
                }
            })
            .addCase(updateSingleSalaryDeduction.rejected, (state, action) => {
                state.loading.updateDeduction = false;
                state.errors.updateDeduction = action.payload;
                state.deductionUpdateStatus = 'failed';
                state.deductionUpdateResult = null;
            });

        // ── 7. Save Salary Deductions Bulk ────────────────────────────────────
        builder
            .addCase(saveSalaryDeductions.pending, (state) => {
                state.loading.saveBulkDeduction = true;
                state.errors.saveBulkDeduction = null;
                state.deductionBulkSaveStatus = 'pending';
            })
            .addCase(saveSalaryDeductions.fulfilled, (state, action) => {
                state.loading.saveBulkDeduction = false;
                console.log('✅ Save Salary Deductions (Bulk) fulfilled - Raw Response:', action.payload);
                state.deductionBulkSaveResult = action.payload;
                const { isSuccess, isDuplicate, responseStr } = resolveBulkDeductionStatus(action.payload);
                if (isSuccess) {
                    state.deductionBulkSaveStatus = 'success';
                } else if (isDuplicate) {
                    state.deductionBulkSaveStatus = 'duplicate';
                    state.errors.saveBulkDeduction = responseStr || 'Salary already exists for selected employees';
                } else {
                    state.deductionBulkSaveStatus = 'failed';
                    state.errors.saveBulkDeduction = responseStr || 'Save Salary Deductions failed';
                }
            })
            .addCase(saveSalaryDeductions.rejected, (state, action) => {
                state.loading.saveBulkDeduction = false;
                state.errors.saveBulkDeduction = action.payload;
                state.deductionBulkSaveStatus = 'failed';
                state.deductionBulkSaveResult = null;
            });

        // ── 8. Fetch Pending Salary Deductions ────────────────────────────────
        // Populates the group submission table from the server.
        // Called on mount and after bulk submit to keep the queue in sync.
        // API expected response structure:
        //   { Data: [ { Id, EmpRefno, EmpName, Month, Year, CCCode,
        //               DeductionHeads, DeductionAmounts, EmpTransactionRefNo } ] }
        builder
            .addCase(fetchPendingSalaryDeductions.pending, (state) => {
                state.loading.pendingSalaryDeductions = true;
                state.errors.pendingSalaryDeductions = null;
            })
            .addCase(fetchPendingSalaryDeductions.fulfilled, (state, action) => {
                state.loading.pendingSalaryDeductions = false;
                console.log('✅ Pending Salary Deductions fulfilled - raw payload:', action.payload);
                const data = action.payload?.Data || action.payload?.data || [];
                const arr  = Array.isArray(data) ? data : [];
                if (arr.length > 0) {
                    console.log('🔍 First pending record keys:', Object.keys(arr[0]));
                    console.log('🔍 First pending record:', arr[0]);
                }
                state.pendingSalaryDeductions = arr;
            })
            .addCase(fetchPendingSalaryDeductions.rejected, (state, action) => {
                state.loading.pendingSalaryDeductions = false;
                state.errors.pendingSalaryDeductions = action.payload;
                state.pendingSalaryDeductions = [];
            });

        // ── 9. Fetch Salary Deductions by EmpTransactionRefNo ───────────────
        builder
            .addCase(fetchSalaryDeductionsByEmpTransNo.pending, (state) => {
                state.loading.salaryDeductionsByTransNo = true;
                state.errors.salaryDeductionsByTransNo = null;
            })
            .addCase(fetchSalaryDeductionsByEmpTransNo.fulfilled, (state, action) => {
                state.loading.salaryDeductionsByTransNo = false;
                console.log('✅ Salary Deductions by EmpTransNo fulfilled:', action.payload);
                state.salaryDeductionsByTransNo = action.payload?.Data || null;
            })
            .addCase(fetchSalaryDeductionsByEmpTransNo.rejected, (state, action) => {
                state.loading.salaryDeductionsByTransNo = false;
                state.errors.salaryDeductionsByTransNo = action.payload;
                state.salaryDeductionsByTransNo = null;
            });

        // ── 10. Fetch Arrear Heads ─────────────────────────────────────────────
        builder
            .addCase(fetchArearHeads.pending, (state) => {
                state.loading.arearHeads = true;
                state.errors.arearHeads = null;
            })
            .addCase(fetchArearHeads.fulfilled, (state, action) => {
                state.loading.arearHeads = false;
                console.log('✅ Arrear Heads fulfilled:', action.payload);
                state.arearHeads = action.payload?.Data || [];
            })
            .addCase(fetchArearHeads.rejected, (state, action) => {
                state.loading.arearHeads = false;
                state.errors.arearHeads = action.payload;
                state.arearHeads = [];
            });

        // ── 10. Fetch Arrears Cost Centers ────────────────────────────────────
        builder
            .addCase(fetchArearsCC.pending, (state) => {
                state.loading.arearsCostCenters = true;
                state.errors.arearsCostCenters = null;
            })
            .addCase(fetchArearsCC.fulfilled, (state, action) => {
                state.loading.arearsCostCenters = false;
                console.log('✅ Arrears Cost Centers fulfilled:', action.payload);
                state.arearsCostCenters = action.payload?.Data || [];
            })
            .addCase(fetchArearsCC.rejected, (state, action) => {
                state.loading.arearsCostCenters = false;
                state.errors.arearsCostCenters = action.payload;
                state.arearsCostCenters = [];
            });

        // ── 12. Save Arrear ───────────────────────────────────────────────────
        builder
            .addCase(saveArear.pending, (state) => {
                state.loading.saveArear = true;
                state.errors.saveArear = null;
                state.arearSaveStatus = 'pending';
            })
            .addCase(saveArear.fulfilled, (state, action) => {
                state.loading.saveArear = false;
                console.log('✅ Save Arrear fulfilled - Raw Response:', action.payload);
                state.arearSaveResult = action.payload;
                const { isSuccess, responseStr } = resolveDeductionStatus(action.payload);
                if (isSuccess) {
                    state.arearSaveStatus = 'success';
                } else {
                    state.arearSaveStatus = 'failed';
                    state.errors.saveArear = responseStr || 'Save Arrear failed';
                }
            })
            .addCase(saveArear.rejected, (state, action) => {
                state.loading.saveArear = false;
                state.errors.saveArear = action.payload;
                state.arearSaveStatus = 'failed';
                state.arearSaveResult = null;
            });

        // ── 13. Fetch Pending Salary Arrears ─────────────────────────────────
        // Populates the arrear group submission table from the server.
        builder
            .addCase(fetchPendingSalaryArear.pending, (state) => {
                state.loading.pendingSalaryArears = true;
                state.errors.pendingSalaryArears = null;
            })
            .addCase(fetchPendingSalaryArear.fulfilled, (state, action) => {
                state.loading.pendingSalaryArears = false;
                console.log('✅ Pending Salary Arrears fulfilled:', action.payload);
                const data = action.payload?.Data || action.payload?.data || [];
                state.pendingSalaryArears = Array.isArray(data) ? data : [];
            })
            .addCase(fetchPendingSalaryArear.rejected, (state, action) => {
                state.loading.pendingSalaryArears = false;
                state.errors.pendingSalaryArears = action.payload;
                state.pendingSalaryArears = [];
            });

        // ── 14. Update Single Employee Arrear ─────────────────────────────────
        builder
            .addCase(updateArear.pending, (state) => {
                state.loading.updateArear = true;
                state.errors.updateArear = null;
                state.arearUpdateStatus = 'pending';
            })
            .addCase(updateArear.fulfilled, (state, action) => {
                state.loading.updateArear = false;
                console.log('✅ Update Arrear fulfilled - Raw Response:', action.payload);
                state.arearUpdateResult = action.payload;
                const { isSuccess, responseStr } = resolveDeductionStatus(action.payload);
                if (isSuccess) {
                    state.arearUpdateStatus = 'success';
                } else {
                    state.arearUpdateStatus = 'failed';
                    state.errors.updateArear = responseStr || 'Update Arrear failed';
                }
            })
            .addCase(updateArear.rejected, (state, action) => {
                state.loading.updateArear = false;
                state.errors.updateArear = action.payload;
                state.arearUpdateStatus = 'failed';
                state.arearUpdateResult = null;
            });

        // ── 15. Save Salary Arrears Bulk ──────────────────────────────────────
        builder
            .addCase(saveSalaryArears.pending, (state) => {
                state.loading.saveBulkArear = true;
                state.errors.saveBulkArear = null;
                state.arearBulkSaveStatus = 'pending';
            })
            .addCase(saveSalaryArears.fulfilled, (state, action) => {
                state.loading.saveBulkArear = false;
                console.log('✅ Save Salary Arrears (Bulk) fulfilled - Raw Response:', action.payload);
                state.arearBulkSaveResult = action.payload;
                const { isSuccess, isDuplicate, responseStr } = resolveBulkDeductionStatus(action.payload);
                if (isSuccess) {
                    state.arearBulkSaveStatus = 'success';
                } else if (isDuplicate) {
                    state.arearBulkSaveStatus = 'duplicate';
                    state.errors.saveBulkArear = responseStr || 'Arrear already exists for selected employees';
                } else {
                    state.arearBulkSaveStatus = 'failed';
                    state.errors.saveBulkArear = responseStr || 'Save Salary Arrears failed';
                }
            })
            .addCase(saveSalaryArears.rejected, (state, action) => {
                state.loading.saveBulkArear = false;
                state.errors.saveBulkArear = action.payload;
                state.arearBulkSaveStatus = 'failed';
                state.arearBulkSaveResult = null;
            });

    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedEmpRefNo,
    setSelectedYear,
    setSelectedMonth,
    setSelectedArearHead,
    setSelectedArearCCCode,
    setDeductionSaveStatus,
    setDeductionUpdateStatus,
    setDeductionBulkSaveStatus,
    setArearSaveStatus,
    clearError,
    clearDeductionSaveResult,
    clearDeductionUpdateResult,
    clearDeductionBulkSaveResult,
    clearArearSaveResult,
    clearPendingSalaryDeductions,
    clearSalaryDeductionsByTransNo,
    clearArearUpdateResult,
    clearArearBulkSaveResult,
    clearPendingSalaryArears,
    resetDeductionData,
    resetArearData,
    resetAll,
} = staffSalaryDeductionArrearSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Salary Deduction Data Selectors ───────────────────────────────────────────
export const selectSalaryDeductionEmployees       = (state) => state.salaryDeductionArrear.salaryDeductionEmployees;
export const selectSalaryPendingYears             = (state) => state.salaryDeductionArrear.salaryPendingYears;
export const selectSalaryDeductionMonths          = (state) => state.salaryDeductionArrear.salaryDeductionMonths;
export const selectEmpDeductionsForMonth          = (state) => state.salaryDeductionArrear.empDeductionsForMonth;
export const selectDeductionSaveResult            = (state) => state.salaryDeductionArrear.deductionSaveResult;
export const selectDeductionUpdateResult          = (state) => state.salaryDeductionArrear.deductionUpdateResult;
export const selectDeductionBulkSaveResult        = (state) => state.salaryDeductionArrear.deductionBulkSaveResult;

export const selectSalaryDeductionsByTransNo        = (state) => state.salaryDeductionArrear.salaryDeductionsByTransNo;
export const selectSalaryDeductionsByTransNoLoading  = (state) => state.salaryDeductionArrear.loading.salaryDeductionsByTransNo;
export const selectSalaryDeductionsByTransNoError    = (state) => state.salaryDeductionArrear.errors.salaryDeductionsByTransNo;

// ── Pending Salary Deductions Selectors ───────────────────────────────────────
export const selectPendingSalaryDeductions        = (state) => state.salaryDeductionArrear.pendingSalaryDeductions;
export const selectPendingSalaryDeductionsArray   = (state) => {
    const data = state.salaryDeductionArrear.pendingSalaryDeductions;
    return Array.isArray(data) ? data : [];
};
export const selectPendingSalaryDeductionsLoading = (state) => state.salaryDeductionArrear.loading.pendingSalaryDeductions;
export const selectPendingSalaryDeductionsError   = (state) => state.salaryDeductionArrear.errors.pendingSalaryDeductions;

// ── Arrear Data Selectors ─────────────────────────────────────────────────────
export const selectArearHeads                     = (state) => state.salaryDeductionArrear.arearHeads;
export const selectArearsCostCenters              = (state) => state.salaryDeductionArrear.arearsCostCenters;
export const selectArearSaveResult                = (state) => state.salaryDeductionArrear.arearSaveResult;
export const selectArearUpdateResult              = (state) => state.salaryDeductionArrear.arearUpdateResult;
export const selectArearBulkSaveResult            = (state) => state.salaryDeductionArrear.arearBulkSaveResult;

// ── Pending Salary Arrears Selectors ──────────────────────────────────────────
export const selectPendingSalaryArears            = (state) => state.salaryDeductionArrear.pendingSalaryArears;
export const selectPendingSalaryArearsArray       = (state) => {
    const data = state.salaryDeductionArrear.pendingSalaryArears;
    return Array.isArray(data) ? data : [];
};
export const selectPendingSalaryArearsLoading     = (state) => state.salaryDeductionArrear.loading.pendingSalaryArears;
export const selectPendingSalaryArearsError       = (state) => state.salaryDeductionArrear.errors.pendingSalaryArears;

// ── Safe Array Selectors ──────────────────────────────────────────────────────
export const selectSalaryDeductionEmployeesArray  = (state) => {
    const data = state.salaryDeductionArrear.salaryDeductionEmployees;
    return Array.isArray(data) ? data : [];
};
export const selectSalaryPendingYearsArray        = (state) => {
    const data = state.salaryDeductionArrear.salaryPendingYears;
    return Array.isArray(data) ? data : [];
};
export const selectSalaryDeductionMonthsArray     = (state) => {
    const data = state.salaryDeductionArrear.salaryDeductionMonths;
    return Array.isArray(data) ? data : [];
};
export const selectArearHeadsArray                = (state) => {
    const data = state.salaryDeductionArrear.arearHeads;
    return Array.isArray(data) ? data : [];
};
export const selectArearsCostCentersArray         = (state) => {
    const data = state.salaryDeductionArrear.arearsCostCenters;
    return Array.isArray(data) ? data : [];
};

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                        = (state) => state.salaryDeductionArrear.loading;
export const selectSalaryDeductionEmployeesLoading= (state) => state.salaryDeductionArrear.loading.salaryDeductionEmployees;
export const selectSalaryPendingYearsLoading      = (state) => state.salaryDeductionArrear.loading.salaryPendingYears;
export const selectSalaryDeductionMonthsLoading   = (state) => state.salaryDeductionArrear.loading.salaryDeductionMonths;
export const selectEmpDeductionsForMonthLoading   = (state) => state.salaryDeductionArrear.loading.empDeductionsForMonth;
export const selectSaveDeductionLoading           = (state) => state.salaryDeductionArrear.loading.saveDeduction;
export const selectUpdateDeductionLoading         = (state) => state.salaryDeductionArrear.loading.updateDeduction;
export const selectSaveBulkDeductionLoading       = (state) => state.salaryDeductionArrear.loading.saveBulkDeduction;
export const selectArearHeadsLoading              = (state) => state.salaryDeductionArrear.loading.arearHeads;
export const selectArearsCostCentersLoading       = (state) => state.salaryDeductionArrear.loading.arearsCostCenters;
export const selectSaveArearLoading               = (state) => state.salaryDeductionArrear.loading.saveArear;
export const selectUpdateArearLoading             = (state) => state.salaryDeductionArrear.loading.updateArear;
export const selectSaveBulkArearLoading           = (state) => state.salaryDeductionArrear.loading.saveBulkArear;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                         = (state) => state.salaryDeductionArrear.errors;
export const selectSalaryDeductionEmployeesError  = (state) => state.salaryDeductionArrear.errors.salaryDeductionEmployees;
export const selectSalaryPendingYearsError        = (state) => state.salaryDeductionArrear.errors.salaryPendingYears;
export const selectSalaryDeductionMonthsError     = (state) => state.salaryDeductionArrear.errors.salaryDeductionMonths;
export const selectEmpDeductionsForMonthError     = (state) => state.salaryDeductionArrear.errors.empDeductionsForMonth;
export const selectSaveDeductionError             = (state) => state.salaryDeductionArrear.errors.saveDeduction;
export const selectUpdateDeductionError           = (state) => state.salaryDeductionArrear.errors.updateDeduction;
export const selectSaveBulkDeductionError         = (state) => state.salaryDeductionArrear.errors.saveBulkDeduction;
export const selectArearHeadsError                = (state) => state.salaryDeductionArrear.errors.arearHeads;
export const selectArearsCostCentersError         = (state) => state.salaryDeductionArrear.errors.arearsCostCenters;
export const selectSaveArearError                 = (state) => state.salaryDeductionArrear.errors.saveArear;
export const selectUpdateArearError               = (state) => state.salaryDeductionArrear.errors.updateArear;
export const selectSaveBulkArearError             = (state) => state.salaryDeductionArrear.errors.saveBulkArear;

// ── UI / Filter Selectors ─────────────────────────────────────────────────────
export const selectSelectedEmpRefNo               = (state) => state.salaryDeductionArrear.selectedEmpRefNo;
export const selectSelectedYear                   = (state) => state.salaryDeductionArrear.selectedYear;
export const selectSelectedMonth                  = (state) => state.salaryDeductionArrear.selectedMonth;
export const selectSelectedArearHead              = (state) => state.salaryDeductionArrear.selectedArearHead;
export const selectSelectedArearCCCode            = (state) => state.salaryDeductionArrear.selectedArearCCCode;
export const selectDeductionSaveStatus            = (state) => state.salaryDeductionArrear.deductionSaveStatus;
export const selectDeductionUpdateStatus          = (state) => state.salaryDeductionArrear.deductionUpdateStatus;
export const selectDeductionBulkSaveStatus        = (state) => state.salaryDeductionArrear.deductionBulkSaveStatus;
export const selectArearSaveStatus                = (state) => state.salaryDeductionArrear.arearSaveStatus;
export const selectArearUpdateStatus              = (state) => state.salaryDeductionArrear.arearUpdateStatus;
export const selectArearBulkSaveStatus            = (state) => state.salaryDeductionArrear.arearBulkSaveStatus;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.salaryDeductionArrear.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.salaryDeductionArrear.errors).some(error => error !== null);

// Deduction workflow summary
export const selectDeductionSummary = (state) => {
    const employees = Array.isArray(state.salaryDeductionArrear.salaryDeductionEmployees)
        ? state.salaryDeductionArrear.salaryDeductionEmployees : [];
    const years = Array.isArray(state.salaryDeductionArrear.salaryPendingYears)
        ? state.salaryDeductionArrear.salaryPendingYears : [];
    const months = Array.isArray(state.salaryDeductionArrear.salaryDeductionMonths)
        ? state.salaryDeductionArrear.salaryDeductionMonths : [];

    return {
        totalEmployees:    employees.length,
        totalPendingYears: years.length,
        totalPendingMonths: months.length,
        hasDeductionData:  state.salaryDeductionArrear.empDeductionsForMonth !== null,
        saveStatus:        state.salaryDeductionArrear.deductionSaveStatus,
        updateStatus:      state.salaryDeductionArrear.deductionUpdateStatus,
        bulkSaveStatus:    state.salaryDeductionArrear.deductionBulkSaveStatus,
        isProcessing:      state.salaryDeductionArrear.loading.saveDeduction,
        isUpdating:        state.salaryDeductionArrear.loading.updateDeduction,
        isBulkSaving:      state.salaryDeductionArrear.loading.saveBulkDeduction,
        hasEmployeeSelected: state.salaryDeductionArrear.selectedEmpRefNo !== null,
        hasYearSelected:   state.salaryDeductionArrear.selectedYear !== null,
        hasMonthSelected:  state.salaryDeductionArrear.selectedMonth !== null,
    };
};

// Arrear workflow summary
export const selectArearSummary = (state) => {
    const heads = Array.isArray(state.salaryDeductionArrear.arearHeads)
        ? state.salaryDeductionArrear.arearHeads : [];
    const costCenters = Array.isArray(state.salaryDeductionArrear.arearsCostCenters)
        ? state.salaryDeductionArrear.arearsCostCenters : [];

    return {
        totalArearHeads:    heads.length,
        totalCostCenters:   costCenters.length,
        saveStatus:         state.salaryDeductionArrear.arearSaveStatus,
        updateStatus:       state.salaryDeductionArrear.arearUpdateStatus,
        bulkSaveStatus:     state.salaryDeductionArrear.arearBulkSaveStatus,
        isProcessing:       state.salaryDeductionArrear.loading.saveArear,
        isUpdating:         state.salaryDeductionArrear.loading.updateArear,
        isBulkSaving:       state.salaryDeductionArrear.loading.saveBulkArear,
        hasArearHeadSelected: state.salaryDeductionArrear.selectedArearHead !== null,
        hasCCCodeSelected:  state.salaryDeductionArrear.selectedArearCCCode !== null,
    };
};

// Filter selections summary
export const selectFilterSelections = (state) => ({
    empRefNo:    state.salaryDeductionArrear.selectedEmpRefNo,
    year:        state.salaryDeductionArrear.selectedYear,
    month:       state.salaryDeductionArrear.selectedMonth,
    arearHead:   state.salaryDeductionArrear.selectedArearHead,
    arearCCCode: state.salaryDeductionArrear.selectedArearCCCode,
    hasEmpRefNo: state.salaryDeductionArrear.selectedEmpRefNo !== null,
    hasYear:     state.salaryDeductionArrear.selectedYear !== null,
    hasMonth:    state.salaryDeductionArrear.selectedMonth !== null,
});

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffSalaryDeductionArrearSlice.reducer;