import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as salaryAPI from '../../api/HRReportAPI/salaryandwagesAPI';

// Async Thunks for Salary and Wages Report APIs
// ==============================================

// 1. Fetch All Employee Categories
export const fetchAllEmpCategories = createAsyncThunk(
    'salaryreport/fetchAllEmpCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getAllEmpCategories();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Categories');
        }
    }
);

// 2. Fetch PayRoll Cost Centres by Category
export const fetchPayRollCCbyCategory = createAsyncThunk(
    'salaryreport/fetchPayRollCCbyCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getPayRollCCbyCategory(categoryId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PayRoll Cost Centres');
        }
    }
);

// 3. Fetch PayRoll Groups
export const fetchPayRollGroups = createAsyncThunk(
    'salaryreport/fetchPayRollGroups',
    async (params, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getPayRollGroups(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PayRoll Groups');
        }
    }
);

// 4. Fetch PayRoll Employees
export const fetchPayRollEmployees = createAsyncThunk(
    'salaryreport/fetchPayRollEmployees',
    async (params, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getPayRollEmployees(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch PayRoll Employees');
        }
    }
);

// 5. Fetch Salary Contractors
export const fetchSalaryContractors = createAsyncThunk(
    'salaryreport/fetchSalaryContractors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getSalaryContractors();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Salary Contractors');
        }
    }
);

// 6. Fetch Employee Salary Months
export const fetchEmployeeSalaryMonths = createAsyncThunk(
    'salaryreport/fetchEmployeeSalaryMonths',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getEmployeeSalaryMonths(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Salary Months');
        }
    }
);

// 7. Fetch Employee Salary Years by Month
export const fetchEmpSalaryYearsByMonth = createAsyncThunk(
    'salaryreport/fetchEmpSalaryYearsByMonth',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getEmpSalaryYearsByMonth(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Salary Years by Month');
        }
    }
);

// ✅ 8. Fetch Employee Salary Years (NEW)
export const fetchEmployeeSalaryYears = createAsyncThunk(
    'salaryreport/fetchEmployeeSalaryYears',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getEmployeeSalaryYears(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Salary Years');
        }
    }
);

// 9. Fetch Labour Cost Centre for Salary Report
export const fetchLabourCCForSalaryReport = createAsyncThunk(
    'salaryreport/fetchLabourCCForSalaryReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getLabourCCForSalaryReport(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour Cost Centre');
        }
    }
);

// 10. Fetch Months Salary Report (Staff - Normal data)
export const fetchMonthsSalaryForReport = createAsyncThunk(
    'salaryreport/fetchMonthsSalaryForReport',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getMonthsSalaryForReport(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Months Salary Report (Staff)');
        }
    }
);

// 11. Fetch Single Employee Salary Data for Report (Staff - Details view)
export const fetchSingleEmpSalaryDataForReport = createAsyncThunk(
    'salaryreport/fetchSingleEmpSalaryDataForReport',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getSingleEmpSalaryDataForReport(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Single Employee Salary Data');
        }
    }
);

// 12. Fetch Employee Pay Slip Data (Staff)
export const fetchEmpPaySlipData = createAsyncThunk(
    'salaryreport/fetchEmpPaySlipData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getEmpPaySlipData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Employee Pay Slip Data');
        }
    }
);

// 13. Fetch Labour Pay Slip Data
export const fetchLBPaySlipData = createAsyncThunk(
    'salaryreport/fetchLBPaySlipData',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getLBPaySlipData(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour Pay Slip Data');
        }
    }
);

// 14. Fetch Labour Months Salary Report
export const fetchLBMonthsSalaryForReport = createAsyncThunk(
    'salaryreport/fetchLBMonthsSalaryForReport',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getLBMonthsSalaryForReport(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Labour Months Salary Report');
        }
    }
);

// 15. Fetch Single Labour Salary Data for Report (Details view)
export const fetchSingleLBSalaryDataForReport = createAsyncThunk(
    'salaryreport/fetchSingleLBSalaryDataForReport',
    async (reportData, { rejectWithValue }) => {
        try {
            const response = await salaryAPI.getSingleLBSalaryDataForReport(reportData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Single Labour Salary Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Dropdown/Filter Data
    empCategories: [],
    costCentres: [],
    payrollGroups: [],
    payrollEmployees: [],
    salaryContractors: [],
    salaryMonths: [],
    salaryYears: [],
    labourCostCentres: [],

    // Report Data - Staff
    staffMonthsSalaryReport: {},
    staffSingleEmpSalaryData: {},
    staffPaySlipData: {},

    // Report Data - Labour
    labourMonthsSalaryReport: {},
    labourSingleSalaryData: {},
    labourPaySlipData: {},

    // Loading states for each API
    loading: {
        empCategories: false,
        costCentres: false,
        payrollGroups: false,
        payrollEmployees: false,
        salaryContractors: false,
        salaryMonths: false,
        salaryYears: false,
        labourCostCentres: false,
        staffMonthsSalaryReport: false,
        staffSingleEmpSalaryData: false,
        staffPaySlipData: false,
        labourMonthsSalaryReport: false,
        labourSingleSalaryData: false,
        labourPaySlipData: false,
    },

    // Error states for each API
    errors: {
        empCategories: null,
        costCentres: null,
        payrollGroups: null,
        payrollEmployees: null,
        salaryContractors: null,
        salaryMonths: null,
        salaryYears: null,
        labourCostCentres: null,
        staffMonthsSalaryReport: null,
        staffSingleEmpSalaryData: null,
        staffPaySlipData: null,
        labourMonthsSalaryReport: null,
        labourSingleSalaryData: null,
        labourPaySlipData: null,
    },

    // UI State & Filters
    filters: {
        // Common Filters
        employeeType: 'Staff', // Staff or Labour
        empCategory: '',
        ccCode: '',
        groupId: '',
        year: '',
        fromMonth: '',
        toMonth: '',

        // Staff Specific
        empRefNo: '',

        // Labour Specific
        labourType: '', // "Own Labour" or "Contractor"
        contractorCode: '',
        labourId: '',

        // Pay Slip Specific
        transactionRefno: '',
        currentCC: '',
        categoryId: '',
        conslidateTransNo: '',
    }
};

// Salary and Wages Report Slice
// ==============================
const salaryReportSlice = createSlice({
    name: 'salaryreport',
    initialState,
    reducers: {
        // Action to set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Action to clear filters
        clearFilters: (state) => {
            state.filters = {
                employeeType: 'Staff',
                empCategory: '',
                ccCode: '',
                groupId: '',
                year: '',
                fromMonth: '',
                toMonth: '',
                empRefNo: '',
                labourType: '',
                contractorCode: '',
                labourId: '',
                transactionRefno: '',
                currentCC: '',
                categoryId: '',
                conslidateTransNo: '',
            };
        },

        // Action to set employee type (Staff or Labour)
        setEmployeeType: (state, action) => {
            state.filters.employeeType = action.payload;
        },

        // Action to set labour type
        setLabourType: (state, action) => {
            state.filters.labourType = action.payload;
        },

        // Action to set selected category
        setSelectedCategory: (state, action) => {
            state.filters.empCategory = action.payload;
        },

        // Action to set selected cost centre
        setSelectedCostCentre: (state, action) => {
            state.filters.ccCode = action.payload;
        },

        // Action to set selected group
        setSelectedGroup: (state, action) => {
            state.filters.groupId = action.payload;
        },

        // Action to set selected employee
        setSelectedEmployee: (state, action) => {
            state.filters.empRefNo = action.payload;
        },

        // Action to set selected labour
        setSelectedLabour: (state, action) => {
            state.filters.labourId = action.payload;
        },

        // Action to set year
        setYear: (state, action) => {
            state.filters.year = action.payload;
        },

        // Action to set from month
        setFromMonth: (state, action) => {
            state.filters.fromMonth = action.payload;
        },

        // Action to set to month
        setToMonth: (state, action) => {
            state.filters.toMonth = action.payload;
        },

        // Action to reset salary report data
        resetSalaryReportData: (state) => {
            state.staffMonthsSalaryReport = {};
            state.staffSingleEmpSalaryData = {};
            state.staffPaySlipData = {};
            state.labourMonthsSalaryReport = {};
            state.labourSingleSalaryData = {};
            state.labourPaySlipData = {};
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to clear groups when category changes
        clearGroupsData: (state) => {
            state.payrollGroups = [];
            state.payrollEmployees = [];
        },

        // Action to clear employees when group changes
        clearEmployeesData: (state) => {
            state.payrollEmployees = [];
        },

        // Action to clear cost centres when category changes
        clearCostCentresData: (state) => {
            state.costCentres = [];
            state.payrollGroups = [];
            state.payrollEmployees = [];
        },

        // Action to clear months when year changes
        clearMonthsData: (state) => {
            state.salaryMonths = [];
        },

        // Action to clear years when month changes
        clearYearsData: (state) => {
            state.salaryYears = [];
        }
    },
    extraReducers: (builder) => {
        // 1. Employee Categories
        builder
            .addCase(fetchAllEmpCategories.pending, (state) => {
                state.loading.empCategories = true;
                state.errors.empCategories = null;
            })
            .addCase(fetchAllEmpCategories.fulfilled, (state, action) => {
                state.loading.empCategories = false;
                state.empCategories = action.payload?.Data || action.payload || [];
                console.log('✅ Employee Categories extracted and stored:', state.empCategories);
            })
            .addCase(fetchAllEmpCategories.rejected, (state, action) => {
                state.loading.empCategories = false;
                state.errors.empCategories = action.payload;
            })

        // 2. PayRoll Cost Centres by Category
        builder
            .addCase(fetchPayRollCCbyCategory.pending, (state) => {
                state.loading.costCentres = true;
                state.errors.costCentres = null;
            })
            .addCase(fetchPayRollCCbyCategory.fulfilled, (state, action) => {
                state.loading.costCentres = false;
                state.costCentres = action.payload?.Data || action.payload || [];
                console.log('✅ Cost Centres extracted and stored:', state.costCentres);
            })
            .addCase(fetchPayRollCCbyCategory.rejected, (state, action) => {
                state.loading.costCentres = false;
                state.errors.costCentres = action.payload;
            })

        // 3. PayRoll Groups
        builder
            .addCase(fetchPayRollGroups.pending, (state) => {
                state.loading.payrollGroups = true;
                state.errors.payrollGroups = null;
            })
            .addCase(fetchPayRollGroups.fulfilled, (state, action) => {
                state.loading.payrollGroups = false;
                state.payrollGroups = action.payload?.Data || action.payload || [];
                console.log('✅ PayRoll Groups extracted and stored:', state.payrollGroups);
            })
            .addCase(fetchPayRollGroups.rejected, (state, action) => {
                state.loading.payrollGroups = false;
                state.errors.payrollGroups = action.payload;
            })

        // 4. PayRoll Employees
        builder
            .addCase(fetchPayRollEmployees.pending, (state) => {
                state.loading.payrollEmployees = true;
                state.errors.payrollEmployees = null;
            })
            .addCase(fetchPayRollEmployees.fulfilled, (state, action) => {
                state.loading.payrollEmployees = false;
                state.payrollEmployees = action.payload?.Data || action.payload || [];
                console.log('✅ PayRoll Employees extracted and stored:', state.payrollEmployees);
            })
            .addCase(fetchPayRollEmployees.rejected, (state, action) => {
                state.loading.payrollEmployees = false;
                state.errors.payrollEmployees = action.payload;
            })

        // 5. Salary Contractors
        builder
            .addCase(fetchSalaryContractors.pending, (state) => {
                state.loading.salaryContractors = true;
                state.errors.salaryContractors = null;
            })
            .addCase(fetchSalaryContractors.fulfilled, (state, action) => {
                state.loading.salaryContractors = false;
                state.salaryContractors = action.payload?.Data || action.payload || [];
                console.log('✅ Salary Contractors extracted and stored:', state.salaryContractors);
            })
            .addCase(fetchSalaryContractors.rejected, (state, action) => {
                state.loading.salaryContractors = false;
                state.errors.salaryContractors = action.payload;
            })

        // 6. Employee Salary Months
        builder
            .addCase(fetchEmployeeSalaryMonths.pending, (state) => {
                state.loading.salaryMonths = true;
                state.errors.salaryMonths = null;
            })
            .addCase(fetchEmployeeSalaryMonths.fulfilled, (state, action) => {
                state.loading.salaryMonths = false;
                state.salaryMonths = action.payload?.Data || action.payload || [];
                console.log('✅ Salary Months extracted and stored:', state.salaryMonths);
            })
            .addCase(fetchEmployeeSalaryMonths.rejected, (state, action) => {
                state.loading.salaryMonths = false;
                state.errors.salaryMonths = action.payload;
            })

        // 7. Employee Salary Years by Month
        builder
            .addCase(fetchEmpSalaryYearsByMonth.pending, (state) => {
                state.loading.salaryYears = true;
                state.errors.salaryYears = null;
            })
            .addCase(fetchEmpSalaryYearsByMonth.fulfilled, (state, action) => {
                state.loading.salaryYears = false;
                state.salaryYears = action.payload?.Data || action.payload || [];
                console.log('✅ Salary Years (by Month) extracted and stored:', state.salaryYears);
            })
            .addCase(fetchEmpSalaryYearsByMonth.rejected, (state, action) => {
                state.loading.salaryYears = false;
                state.errors.salaryYears = action.payload;
            })

        // ✅ 8. Employee Salary Years (NEW)
        builder
            .addCase(fetchEmployeeSalaryYears.pending, (state) => {
                state.loading.salaryYears = true;
                state.errors.salaryYears = null;
            })
            .addCase(fetchEmployeeSalaryYears.fulfilled, (state, action) => {
                state.loading.salaryYears = false;
                state.salaryYears = action.payload?.Data || action.payload || [];
                console.log('✅ Salary Years extracted and stored:', state.salaryYears);
            })
            .addCase(fetchEmployeeSalaryYears.rejected, (state, action) => {
                state.loading.salaryYears = false;
                state.errors.salaryYears = action.payload;
            })

        // 9. Labour Cost Centre for Salary Report
        builder
            .addCase(fetchLabourCCForSalaryReport.pending, (state) => {
                state.loading.labourCostCentres = true;
                state.errors.labourCostCentres = null;
            })
            .addCase(fetchLabourCCForSalaryReport.fulfilled, (state, action) => {
                state.loading.labourCostCentres = false;
                state.labourCostCentres = action.payload?.Data || action.payload || [];
                console.log('✅ Labour Cost Centres extracted and stored:', state.labourCostCentres);
            })
            .addCase(fetchLabourCCForSalaryReport.rejected, (state, action) => {
                state.loading.labourCostCentres = false;
                state.errors.labourCostCentres = action.payload;
            })

        // 10. Months Salary Report (Staff - Normal data)
        builder
            .addCase(fetchMonthsSalaryForReport.pending, (state) => {
                state.loading.staffMonthsSalaryReport = true;
                state.errors.staffMonthsSalaryReport = null;
            })
            .addCase(fetchMonthsSalaryForReport.fulfilled, (state, action) => {
                state.loading.staffMonthsSalaryReport = false;
                state.staffMonthsSalaryReport = action.payload || {};
                console.log('✅ Staff Months Salary Report stored:', state.staffMonthsSalaryReport);
            })
            .addCase(fetchMonthsSalaryForReport.rejected, (state, action) => {
                state.loading.staffMonthsSalaryReport = false;
                state.errors.staffMonthsSalaryReport = action.payload;
            })

        // 11. Single Employee Salary Data for Report (Staff - Details view)
        builder
            .addCase(fetchSingleEmpSalaryDataForReport.pending, (state) => {
                state.loading.staffSingleEmpSalaryData = true;
                state.errors.staffSingleEmpSalaryData = null;
            })
            .addCase(fetchSingleEmpSalaryDataForReport.fulfilled, (state, action) => {
                state.loading.staffSingleEmpSalaryData = false;
                state.staffSingleEmpSalaryData = action.payload || {};
                console.log('✅ Staff Single Employee Salary Data stored:', state.staffSingleEmpSalaryData);
            })
            .addCase(fetchSingleEmpSalaryDataForReport.rejected, (state, action) => {
                state.loading.staffSingleEmpSalaryData = false;
                state.errors.staffSingleEmpSalaryData = action.payload;
            })

        // 12. Employee Pay Slip Data (Staff)
        builder
            .addCase(fetchEmpPaySlipData.pending, (state) => {
                state.loading.staffPaySlipData = true;
                state.errors.staffPaySlipData = null;
            })
            .addCase(fetchEmpPaySlipData.fulfilled, (state, action) => {
                state.loading.staffPaySlipData = false;
                state.staffPaySlipData = action.payload || {};
                console.log('✅ Staff Pay Slip Data stored:', state.staffPaySlipData);
            })
            .addCase(fetchEmpPaySlipData.rejected, (state, action) => {
                state.loading.staffPaySlipData = false;
                state.errors.staffPaySlipData = action.payload;
            })

        // 13. Labour Pay Slip Data
        builder
            .addCase(fetchLBPaySlipData.pending, (state) => {
                state.loading.labourPaySlipData = true;
                state.errors.labourPaySlipData = null;
            })
            .addCase(fetchLBPaySlipData.fulfilled, (state, action) => {
                state.loading.labourPaySlipData = false;
                state.labourPaySlipData = action.payload || {};
                console.log('✅ Labour Pay Slip Data stored:', state.labourPaySlipData);
            })
            .addCase(fetchLBPaySlipData.rejected, (state, action) => {
                state.loading.labourPaySlipData = false;
                state.errors.labourPaySlipData = action.payload;
            })

        // 14. Labour Months Salary Report
        builder
            .addCase(fetchLBMonthsSalaryForReport.pending, (state) => {
                state.loading.labourMonthsSalaryReport = true;
                state.errors.labourMonthsSalaryReport = null;
            })
            .addCase(fetchLBMonthsSalaryForReport.fulfilled, (state, action) => {
                state.loading.labourMonthsSalaryReport = false;
                state.labourMonthsSalaryReport = action.payload || {};
                console.log('✅ Labour Months Salary Report stored:', state.labourMonthsSalaryReport);
            })
            .addCase(fetchLBMonthsSalaryForReport.rejected, (state, action) => {
                state.loading.labourMonthsSalaryReport = false;
                state.errors.labourMonthsSalaryReport = action.payload;
            })

        // 15. Single Labour Salary Data for Report (Details view)
        builder
            .addCase(fetchSingleLBSalaryDataForReport.pending, (state) => {
                state.loading.labourSingleSalaryData = true;
                state.errors.labourSingleSalaryData = null;
            })
            .addCase(fetchSingleLBSalaryDataForReport.fulfilled, (state, action) => {
                state.loading.labourSingleSalaryData = false;
                state.labourSingleSalaryData = action.payload || {};
                console.log('✅ Labour Single Salary Data stored:', state.labourSingleSalaryData);
            })
            .addCase(fetchSingleLBSalaryDataForReport.rejected, (state, action) => {
                state.loading.labourSingleSalaryData = false;
                state.errors.labourSingleSalaryData = action.payload;
            });
    },
});

// Export actions
export const {
    setFilters,
    clearFilters,
    setEmployeeType,
    setLabourType,
    setSelectedCategory,
    setSelectedCostCentre,
    setSelectedGroup,
    setSelectedEmployee,
    setSelectedLabour,
    setYear,
    setFromMonth,
    setToMonth,
    resetSalaryReportData,
    clearError,
    clearGroupsData,
    clearEmployeesData,
    clearCostCentresData,
    clearMonthsData,
    clearYearsData
} = salaryReportSlice.actions;

// Selectors
// =========

// Dropdown/Filter Data Selectors
export const selectEmpCategories = (state) => state.salaryreport.empCategories;
export const selectCostCentres = (state) => state.salaryreport.costCentres;
export const selectPayrollGroups = (state) => state.salaryreport.payrollGroups;
export const selectPayrollEmployees = (state) => state.salaryreport.payrollEmployees;
export const selectSalaryContractors = (state) => state.salaryreport.salaryContractors;
export const selectSalaryMonths = (state) => state.salaryreport.salaryMonths;
export const selectSalaryYears = (state) => state.salaryreport.salaryYears;
export const selectLabourCostCentres = (state) => state.salaryreport.labourCostCentres;

// Report Data Selectors - Staff
export const selectStaffMonthsSalaryReport = (state) => state.salaryreport.staffMonthsSalaryReport;
export const selectStaffSingleEmpSalaryData = (state) => state.salaryreport.staffSingleEmpSalaryData;
export const selectStaffPaySlipData = (state) => state.salaryreport.staffPaySlipData;

// Report Data Selectors - Labour
export const selectLabourMonthsSalaryReport = (state) => state.salaryreport.labourMonthsSalaryReport;
export const selectLabourSingleSalaryData = (state) => state.salaryreport.labourSingleSalaryData;
export const selectLabourPaySlipData = (state) => state.salaryreport.labourPaySlipData;

// Loading Selectors
export const selectLoading = (state) => state.salaryreport.loading;
export const selectEmpCategoriesLoading = (state) => state.salaryreport.loading.empCategories;
export const selectCostCentresLoading = (state) => state.salaryreport.loading.costCentres;
export const selectPayrollGroupsLoading = (state) => state.salaryreport.loading.payrollGroups;
export const selectPayrollEmployeesLoading = (state) => state.salaryreport.loading.payrollEmployees;
export const selectSalaryContractorsLoading = (state) => state.salaryreport.loading.salaryContractors;
export const selectSalaryMonthsLoading = (state) => state.salaryreport.loading.salaryMonths;
export const selectSalaryYearsLoading = (state) => state.salaryreport.loading.salaryYears;
export const selectLabourCostCentresLoading = (state) => state.salaryreport.loading.labourCostCentres;
export const selectStaffMonthsSalaryReportLoading = (state) => state.salaryreport.loading.staffMonthsSalaryReport;
export const selectStaffSingleEmpSalaryDataLoading = (state) => state.salaryreport.loading.staffSingleEmpSalaryData;
export const selectStaffPaySlipDataLoading = (state) => state.salaryreport.loading.staffPaySlipData;
export const selectLabourMonthsSalaryReportLoading = (state) => state.salaryreport.loading.labourMonthsSalaryReport;
export const selectLabourSingleSalaryDataLoading = (state) => state.salaryreport.loading.labourSingleSalaryData;
export const selectLabourPaySlipDataLoading = (state) => state.salaryreport.loading.labourPaySlipData;

// Error Selectors
export const selectErrors = (state) => state.salaryreport.errors;
export const selectEmpCategoriesError = (state) => state.salaryreport.errors.empCategories;
export const selectCostCentresError = (state) => state.salaryreport.errors.costCentres;
export const selectPayrollGroupsError = (state) => state.salaryreport.errors.payrollGroups;
export const selectPayrollEmployeesError = (state) => state.salaryreport.errors.payrollEmployees;
export const selectSalaryContractorsError = (state) => state.salaryreport.errors.salaryContractors;
export const selectSalaryMonthsError = (state) => state.salaryreport.errors.salaryMonths;
export const selectSalaryYearsError = (state) => state.salaryreport.errors.salaryYears;
export const selectLabourCostCentresError = (state) => state.salaryreport.errors.labourCostCentres;
export const selectStaffMonthsSalaryReportError = (state) => state.salaryreport.errors.staffMonthsSalaryReport;
export const selectStaffSingleEmpSalaryDataError = (state) => state.salaryreport.errors.staffSingleEmpSalaryData;
export const selectStaffPaySlipDataError = (state) => state.salaryreport.errors.staffPaySlipData;
export const selectLabourMonthsSalaryReportError = (state) => state.salaryreport.errors.labourMonthsSalaryReport;
export const selectLabourSingleSalaryDataError = (state) => state.salaryreport.errors.labourSingleSalaryData;
export const selectLabourPaySlipDataError = (state) => state.salaryreport.errors.labourPaySlipData;

// Filter Selectors
export const selectFilters = (state) => state.salaryreport.filters;
export const selectEmployeeType = (state) => state.salaryreport.filters.employeeType;
export const selectEmpCategory = (state) => state.salaryreport.filters.empCategory;
export const selectCCCode = (state) => state.salaryreport.filters.ccCode;
export const selectGroupId = (state) => state.salaryreport.filters.groupId;
export const selectYear = (state) => state.salaryreport.filters.year;
export const selectFromMonth = (state) => state.salaryreport.filters.fromMonth;
export const selectToMonth = (state) => state.salaryreport.filters.toMonth;
export const selectEmpRefNo = (state) => state.salaryreport.filters.empRefNo;
export const selectLabourType = (state) => state.salaryreport.filters.labourType;
export const selectContractorCode = (state) => state.salaryreport.filters.contractorCode;
export const selectLabourId = (state) => state.salaryreport.filters.labourId;

// Combined Selectors
export const selectIsAnyLoading = (state) => Object.values(state.salaryreport.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.salaryreport.errors).some(error => error !== null);

// Report-specific Selectors
export const selectIsStaffEmployee = (state) => state.salaryreport.filters.employeeType === 'Staff';
export const selectIsLabourEmployee = (state) => state.salaryreport.filters.employeeType === 'Labour';
export const selectIsOwnLabour = (state) => state.salaryreport.filters.labourType === 'Own Labour';
export const selectIsContractor = (state) => state.salaryreport.filters.labourType === 'Contractor';

// Combined data selector based on employee type
export const selectCurrentMonthsSalaryReport = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.staffMonthsSalaryReport 
        : state.salaryreport.labourMonthsSalaryReport;
};

// Combined single employee/labour data selector
export const selectCurrentSingleSalaryData = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.staffSingleEmpSalaryData 
        : state.salaryreport.labourSingleSalaryData;
};

// Combined pay slip data selector
export const selectCurrentPaySlipData = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.staffPaySlipData 
        : state.salaryreport.labourPaySlipData;
};

// Current loading state selector for months salary report
export const selectCurrentMonthsSalaryReportLoading = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.loading.staffMonthsSalaryReport 
        : state.salaryreport.loading.labourMonthsSalaryReport;
};

// Current loading state selector for single salary data
export const selectCurrentSingleSalaryDataLoading = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.loading.staffSingleEmpSalaryData 
        : state.salaryreport.loading.labourSingleSalaryData;
};

// Current loading state selector for pay slip data
export const selectCurrentPaySlipDataLoading = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.loading.staffPaySlipData 
        : state.salaryreport.loading.labourPaySlipData;
};

// Current error state selector for months salary report
export const selectCurrentMonthsSalaryReportError = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.errors.staffMonthsSalaryReport 
        : state.salaryreport.errors.labourMonthsSalaryReport;
};

// Current error state selector for single salary data
export const selectCurrentSingleSalaryDataError = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.errors.staffSingleEmpSalaryData 
        : state.salaryreport.errors.labourSingleSalaryData;
};

// Current error state selector for pay slip data
export const selectCurrentPaySlipDataError = (state) => {
    const { employeeType } = state.salaryreport.filters;
    return employeeType === 'Staff' 
        ? state.salaryreport.errors.staffPaySlipData 
        : state.salaryreport.errors.labourPaySlipData;
};

// Export reducer
export default salaryReportSlice.reducer;