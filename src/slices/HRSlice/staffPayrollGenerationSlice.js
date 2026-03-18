import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffPayrollGenerationAPI from '../../api/HRAPI/staffPayrollGenerationAPI';

// Async Thunks for Staff Payroll Generation APIs
// ================================================

// 1. Fetch Salary Employee Cost Centers
export const fetchSalaryEmpCC = createAsyncThunk(
    'staffpayroll/fetchSalaryEmpCC',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Salary Employee Cost Centers:', params);
            const response = await staffPayrollGenerationAPI.getSalaryEmpCC(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Salary Employee Cost Centers');
        }
    }
);

// 2. Fetch Cost Center Payroll Employees
export const fetchCCPayrollEmp = createAsyncThunk(
    'staffpayroll/fetchCCPayrollEmp',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Cost Center Payroll Employees:', params);
            const response = await staffPayrollGenerationAPI.getCCPayrollEmp(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Cost Center Payroll Employees');
        }
    }
);

// 3. Check Employee Payroll Requirements
export const checkEmpPayRollRequirements = createAsyncThunk(
    'staffpayroll/checkEmpPayRollRequirements',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Checking Employee Payroll Requirements:', params);
            const response = await staffPayrollGenerationAPI.checkEmpPayRollRequirements(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to check Employee Payroll Requirements');
        }
    }
);

// 4. Fetch Employee Wise Generated Payroll Data
export const fetchEmployeeWiseGeneratedPayRollData = createAsyncThunk(
    'staffpayroll/fetchEmployeeWiseGeneratedPayRollData',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Wise Generated Payroll Data:', params);
            const response = await staffPayrollGenerationAPI.getEmployeeWiseGeneratedPayRollData(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employee Wise Generated Payroll Data');
        }
    }
);

// 5. Fetch Bonus Heads for Employee
export const fetchBonusHeadsForEmployee = createAsyncThunk(
    'staffpayroll/fetchBonusHeadsForEmployee',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Bonus Heads for Employee:', params);
            const response = await staffPayrollGenerationAPI.getBonusHeadsForEmployee(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Bonus Heads for Employee');
        }
    }
);

// 6. Save Single Employee Salary (individual submission → spInsertSingleEmpSalary)
export const savePayRollForSingleEmp = createAsyncThunk(
    'staffpayroll/savePayRollForSingleEmp',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Single Employee Salary:', params);
            // ✅ FIXED: Calls saveSingleEmployeeSalary (was incorrectly savePayRollForSingleEmp)
            const response = await staffPayrollGenerationAPI.saveSingleEmployeeSalary(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Single Employee Salary');
        }
    }
);

// 7. Save Payroll (Bulk Submission - matches old MVC app → spInsertHRPayroll)
export const savePayRoll = createAsyncThunk(
    'staffpayroll/savePayRoll',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Payroll (Bulk):', params);
            const response = await staffPayrollGenerationAPI.savePayRoll(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save Payroll');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    salaryEmpCostCenters: [],
    ccPayrollEmployees: [],
    payrollRequirements: null,
    employeeWisePayrollData: null,
    bonusHeads: [],
    saveResult: null,

    // Loading states for each API
    loading: {
        salaryEmpCC: false,
        ccPayrollEmp: false,
        payrollRequirements: false,
        employeeWisePayrollData: false,
        bonusHeads: false,
        savePayroll: false,
    },

    // Error states for each API
    errors: {
        salaryEmpCC: null,
        ccPayrollEmp: null,
        payrollRequirements: null,
        employeeWisePayrollData: null,
        bonusHeads: null,
        savePayroll: null,
    },

    // UI State - Filter selections
    selectedYear: null,
    selectedMonth: null,
    selectedCCCode: null,
    selectedEmployees: [],      // Array for multiple employees
    selectedEmployeeId: null,   // For bonus heads
    selectedBonusType: null,

    // Save status
    saveStatus: null,
};

// Staff Payroll Generation Slice
// ===============================
const staffPayrollGenerationSlice = createSlice({
    name: 'staffpayroll',
    initialState,
    reducers: {
        // Filter selection actions
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
            // Reset dependent selections when year changes
            state.selectedMonth = null;
            state.selectedCCCode = null;
            state.salaryEmpCostCenters = [];
            state.ccPayrollEmployees = [];
            state.payrollRequirements = null;
            state.employeeWisePayrollData = null;
            state.bonusHeads = [];
            state.selectedEmployees = [];
            state.selectedEmployeeId = null;
        },

        setSelectedMonth: (state, action) => {
            state.selectedMonth = action.payload;
            // Reset dependent selections when month changes
            state.selectedCCCode = null;
            state.salaryEmpCostCenters = [];
            state.ccPayrollEmployees = [];
            state.payrollRequirements = null;
            state.employeeWisePayrollData = null;
            state.bonusHeads = [];
            state.selectedEmployees = [];
            state.selectedEmployeeId = null;
        },

        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
            // Reset dependent selections when CC code changes
            state.ccPayrollEmployees = [];
            state.payrollRequirements = null;
            state.employeeWisePayrollData = null;
            state.bonusHeads = [];
            state.selectedEmployees = [];
            state.selectedEmployeeId = null;
        },

        setSelectedEmployees: (state, action) => {
            state.selectedEmployees = action.payload; // Array of employee ref numbers
            // Reset dependent selections when employees change
            state.payrollRequirements = null;
            state.employeeWisePayrollData = null;
            state.bonusHeads = [];
        },

        setSelectedEmployeeId: (state, action) => {
            state.selectedEmployeeId = action.payload;
            // Reset bonus heads when employee changes
            state.bonusHeads = [];
        },

        setSelectedBonusType: (state, action) => {
            state.selectedBonusType = action.payload;
        },

        // Action to set save status
        setSaveStatus: (state, action) => {
            state.saveStatus = action.payload;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all Payroll data
        resetPayrollData: (state) => {
            state.salaryEmpCostCenters = [];
            state.ccPayrollEmployees = [];
            state.payrollRequirements = null;
            state.employeeWisePayrollData = null;
            state.bonusHeads = [];
            state.saveResult = null;
            state.selectedYear = null;
            state.selectedMonth = null;
            state.selectedCCCode = null;
            state.selectedEmployees = [];
            state.selectedEmployeeId = null;
            state.selectedBonusType = null;
            state.saveStatus = null;

            // Reset all errors
            Object.keys(state.errors).forEach(key => {
                state.errors[key] = null;
            });

            // Reset all loading states
            Object.keys(state.loading).forEach(key => {
                state.loading[key] = false;
            });
        },

        // Action to clear save result
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.savePayroll = null;
        },

        // Action to reset payroll requirements
        resetPayrollRequirements: (state) => {
            state.payrollRequirements = null;
            state.errors.payrollRequirements = null;
        },

        // Action to reset employee wise payroll data
        resetEmployeeWisePayrollData: (state) => {
            state.employeeWisePayrollData = null;
            state.errors.employeeWisePayrollData = null;
        },

        // Action to reset bonus heads
        resetBonusHeads: (state) => {
            state.bonusHeads = [];
            state.errors.bonusHeads = null;
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch Salary Employee Cost Centers
        builder
            .addCase(fetchSalaryEmpCC.pending, (state) => {
                state.loading.salaryEmpCC = true;
                state.errors.salaryEmpCC = null;
            })
            .addCase(fetchSalaryEmpCC.fulfilled, (state, action) => {
                state.loading.salaryEmpCC = false;
                console.log('✅ Salary Employee Cost Centers fulfilled:', action.payload);
                state.salaryEmpCostCenters = action.payload?.Data || [];
            })
            .addCase(fetchSalaryEmpCC.rejected, (state, action) => {
                state.loading.salaryEmpCC = false;
                state.errors.salaryEmpCC = action.payload;
                state.salaryEmpCostCenters = [];
            });

        // 2. Fetch Cost Center Payroll Employees
        builder
            .addCase(fetchCCPayrollEmp.pending, (state) => {
                state.loading.ccPayrollEmp = true;
                state.errors.ccPayrollEmp = null;
            })
            .addCase(fetchCCPayrollEmp.fulfilled, (state, action) => {
                state.loading.ccPayrollEmp = false;
                console.log('✅ Cost Center Payroll Employees fulfilled:', action.payload);
                state.ccPayrollEmployees = action.payload?.Data || [];
            })
            .addCase(fetchCCPayrollEmp.rejected, (state, action) => {
                state.loading.ccPayrollEmp = false;
                state.errors.ccPayrollEmp = action.payload;
                state.ccPayrollEmployees = [];
            });

        // 3. Check Employee Payroll Requirements
        builder
            .addCase(checkEmpPayRollRequirements.pending, (state) => {
                state.loading.payrollRequirements = true;
                state.errors.payrollRequirements = null;
            })
            .addCase(checkEmpPayRollRequirements.fulfilled, (state, action) => {
                state.loading.payrollRequirements = false;
                console.log('✅ Employee Payroll Requirements fulfilled:', action.payload);
                state.payrollRequirements = action.payload?.Data || action.payload || null;
            })
            .addCase(checkEmpPayRollRequirements.rejected, (state, action) => {
                state.loading.payrollRequirements = false;
                state.errors.payrollRequirements = action.payload;
                state.payrollRequirements = null;
            });

        // 4. Fetch Employee Wise Generated Payroll Data
        builder
            .addCase(fetchEmployeeWiseGeneratedPayRollData.pending, (state) => {
                state.loading.employeeWisePayrollData = true;
                state.errors.employeeWisePayrollData = null;
            })
            .addCase(fetchEmployeeWiseGeneratedPayRollData.fulfilled, (state, action) => {
                state.loading.employeeWisePayrollData = false;
                console.log('✅ Employee Wise Generated Payroll Data fulfilled:', action.payload);
                state.employeeWisePayrollData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchEmployeeWiseGeneratedPayRollData.rejected, (state, action) => {
                state.loading.employeeWisePayrollData = false;
                state.errors.employeeWisePayrollData = action.payload;
                state.employeeWisePayrollData = null;
            });

        // 5. Fetch Bonus Heads for Employee
        builder
            .addCase(fetchBonusHeadsForEmployee.pending, (state) => {
                state.loading.bonusHeads = true;
                state.errors.bonusHeads = null;
            })
            .addCase(fetchBonusHeadsForEmployee.fulfilled, (state, action) => {
                state.loading.bonusHeads = false;
                console.log('✅ Bonus Heads for Employee fulfilled:', action.payload);
                state.bonusHeads = action.payload?.Data || [];
            })
            .addCase(fetchBonusHeadsForEmployee.rejected, (state, action) => {
                state.loading.bonusHeads = false;
                state.errors.bonusHeads = action.payload;
                state.bonusHeads = [];
            });

        // 6. Save Single Employee Salary (→ spInsertSingleEmpSalary)
        builder
            .addCase(savePayRollForSingleEmp.pending, (state) => {
                state.loading.savePayroll = true;
                state.errors.savePayroll = null;
                state.saveStatus = 'pending';
            })
            .addCase(savePayRollForSingleEmp.fulfilled, (state, action) => {
                state.loading.savePayroll = false;
                console.log('✅ Save Single Employee Salary fulfilled - Raw Response:', action.payload);

                state.saveResult = action.payload;

                const responseStr = typeof action.payload === 'string'
                    ? action.payload
                    : (action.payload?.Data || action.payload?.Message || '');

                const isSuccess =
                    (typeof responseStr === 'string' && (
                        responseStr.toLowerCase().includes('success') ||
                        responseStr.toLowerCase().includes('submitted') ||
                        responseStr.toLowerCase().includes('saved')
                    )) ||
                    action.payload?.IsSuccessful === true ||
                    action.payload?.ResponseCode === 200;

                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.savePayroll = responseStr || 'Save failed';
                }
            })
            .addCase(savePayRollForSingleEmp.rejected, (state, action) => {
                state.loading.savePayroll = false;
                state.errors.savePayroll = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });

        // 7. Save Payroll - Bulk Submission (→ spInsertHRPayroll)
        builder
            .addCase(savePayRoll.pending, (state) => {
                state.loading.savePayroll = true;
                state.errors.savePayroll = null;
                state.saveStatus = 'pending';
            })
            .addCase(savePayRoll.fulfilled, (state, action) => {
                state.loading.savePayroll = false;
                console.log('✅ Save Payroll (Bulk) fulfilled - Raw Response:', action.payload);

                state.saveResult = action.payload;

                const responseStr = typeof action.payload === 'string'
                    ? action.payload
                    : (action.payload?.Data || action.payload?.Message || '');

                const isSuccess =
                    (typeof responseStr === 'string' && (
                        responseStr.toLowerCase().includes('success') ||
                        responseStr.toLowerCase().includes('submitted') ||
                        responseStr.toLowerCase().includes('saved')
                    )) ||
                    action.payload?.IsSuccessful === true ||
                    action.payload?.ResponseCode === 200;

                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.savePayroll = responseStr || 'Save failed';
                }
            })
            .addCase(savePayRoll.rejected, (state, action) => {
                state.loading.savePayroll = false;
                state.errors.savePayroll = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });
    },
});

// Export actions
export const {
    setSelectedYear,
    setSelectedMonth,
    setSelectedCCCode,
    setSelectedEmployees,
    setSelectedEmployeeId,
    setSelectedBonusType,
    setSaveStatus,
    clearError,
    resetPayrollData,
    clearSaveResult,
    resetPayrollRequirements,
    resetEmployeeWisePayrollData,
    resetBonusHeads,
} = staffPayrollGenerationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectSalaryEmpCostCenters = (state) => state.staffpayroll.salaryEmpCostCenters;
export const selectCCPayrollEmployees = (state) => state.staffpayroll.ccPayrollEmployees;
export const selectPayrollRequirements = (state) => state.staffpayroll.payrollRequirements;
export const selectEmployeeWisePayrollData = (state) => state.staffpayroll.employeeWisePayrollData;
export const selectBonusHeads = (state) => state.staffpayroll.bonusHeads;
export const selectSaveResult = (state) => state.staffpayroll.saveResult;

// Safe array selectors - prevents .filter() / .map() errors on null/undefined
export const selectSalaryEmpCostCentersArray = (state) => {
    const centers = state.staffpayroll.salaryEmpCostCenters;
    return Array.isArray(centers) ? centers : [];
};

export const selectCCPayrollEmployeesArray = (state) => {
    const employees = state.staffpayroll.ccPayrollEmployees;
    return Array.isArray(employees) ? employees : [];
};

export const selectBonusHeadsArray = (state) => {
    const heads = state.staffpayroll.bonusHeads;
    return Array.isArray(heads) ? heads : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffpayroll.loading;
export const selectSalaryEmpCCLoading = (state) => state.staffpayroll.loading.salaryEmpCC;
export const selectCCPayrollEmpLoading = (state) => state.staffpayroll.loading.ccPayrollEmp;
export const selectPayrollRequirementsLoading = (state) => state.staffpayroll.loading.payrollRequirements;
export const selectEmployeeWisePayrollDataLoading = (state) => state.staffpayroll.loading.employeeWisePayrollData;
export const selectBonusHeadsLoading = (state) => state.staffpayroll.loading.bonusHeads;
export const selectSavePayrollLoading = (state) => state.staffpayroll.loading.savePayroll;

// Error selectors
export const selectErrors = (state) => state.staffpayroll.errors;
export const selectSalaryEmpCCError = (state) => state.staffpayroll.errors.salaryEmpCC;
export const selectCCPayrollEmpError = (state) => state.staffpayroll.errors.ccPayrollEmp;
export const selectPayrollRequirementsError = (state) => state.staffpayroll.errors.payrollRequirements;
export const selectEmployeeWisePayrollDataError = (state) => state.staffpayroll.errors.employeeWisePayrollData;
export const selectBonusHeadsError = (state) => state.staffpayroll.errors.bonusHeads;
export const selectSavePayrollError = (state) => state.staffpayroll.errors.savePayroll;

// UI State selectors
export const selectSelectedYear = (state) => state.staffpayroll.selectedYear;
export const selectSelectedMonth = (state) => state.staffpayroll.selectedMonth;
export const selectSelectedCCCode = (state) => state.staffpayroll.selectedCCCode;
export const selectSelectedEmployees = (state) => state.staffpayroll.selectedEmployees;
export const selectSelectedEmployeeId = (state) => state.staffpayroll.selectedEmployeeId;
export const selectSelectedBonusType = (state) => state.staffpayroll.selectedBonusType;
export const selectSaveStatus = (state) => state.staffpayroll.saveStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffpayroll.loading).some(Boolean);
export const selectHasAnyError = (state) => Object.values(state.staffpayroll.errors).some(error => error !== null);

// Payroll Generation workflow summary selector
export const selectPayrollSummary = (state) => {
    const centersArray = Array.isArray(state.staffpayroll.salaryEmpCostCenters) ? state.staffpayroll.salaryEmpCostCenters : [];
    const employeesArray = Array.isArray(state.staffpayroll.ccPayrollEmployees) ? state.staffpayroll.ccPayrollEmployees : [];
    const bonusArray = Array.isArray(state.staffpayroll.bonusHeads) ? state.staffpayroll.bonusHeads : [];

    return {
        totalCostCenters: centersArray.length,
        totalEmployees: employeesArray.length,
        totalBonusHeads: bonusArray.length,
        hasPayrollRequirements: state.staffpayroll.payrollRequirements !== null,
        hasEmployeeWisePayrollData: state.staffpayroll.employeeWisePayrollData !== null,
        saveStatus: state.staffpayroll.saveStatus,
        isProcessing: state.staffpayroll.loading.savePayroll,
        hasCostCenters: centersArray.length > 0,
        hasEmployees: employeesArray.length > 0,
        hasBonusHeads: bonusArray.length > 0,
    };
};

// Filter selections summary selector
export const selectFilterSelections = (state) => {
    return {
        year: state.staffpayroll.selectedYear,
        month: state.staffpayroll.selectedMonth,
        ccCode: state.staffpayroll.selectedCCCode,
        employees: state.staffpayroll.selectedEmployees,
        employeeId: state.staffpayroll.selectedEmployeeId,
        bonusType: state.staffpayroll.selectedBonusType,
        hasYearSelected: state.staffpayroll.selectedYear !== null,
        hasMonthSelected: state.staffpayroll.selectedMonth !== null,
        hasCCCodeSelected: state.staffpayroll.selectedCCCode !== null,
        hasEmployeesSelected: state.staffpayroll.selectedEmployees.length > 0,
        hasEmployeeIdSelected: state.staffpayroll.selectedEmployeeId !== null,
        hasBonusTypeSelected: state.staffpayroll.selectedBonusType !== null,
    };
};

// Export reducer
export default staffPayrollGenerationSlice.reducer;