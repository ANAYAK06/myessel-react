import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffCMSPayCreationAPI from '../../api/HRAPI/staffCMSPayCreationAPI';

// Async Thunks for Staff CMS Pay Creation APIs
// =============================================

// 1. Fetch CMS Years
export const fetchCMSYears = createAsyncThunk(
    'staffcmspay/fetchCMSYears',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching CMS Years');
            const response = await staffCMSPayCreationAPI.getCMSYears();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch CMS Years');
        }
    }
);

// 2. Fetch CMS Months by Year
export const fetchCMSMonthsByYear = createAsyncThunk(
    'staffcmspay/fetchCMSMonthsByYear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching CMS Months for Year:', params.year);
            const response = await staffCMSPayCreationAPI.getCMSMonthsByYear(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch CMS Months');
        }
    }
);

// 3. Fetch Cost Centers for CMS Payment
export const fetchCCForCMSPayment = createAsyncThunk(
    'staffcmspay/fetchCCForCMSPayment',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Cost Centers for Year:', params.year, 'Month:', params.month);
            const response = await staffCMSPayCreationAPI.getCCForCMSPayment(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Cost Centers');
        }
    }
);

// 4. Fetch Groups for CMS Payment - UPDATED TO ACCEPT ARRAY FORMAT
export const fetchGroupForCMSPay = createAsyncThunk(
    'staffcmspay/fetchGroupForCMSPay',
    async ({ year, month, ccCodes }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Groups with payload:', {
                Year: year,
                EffectiveMonth: month,
                SelectedCC: ccCodes
            });

            // Pass parameters as-is (ccCodes is already an array)
            const response = await staffCMSPayCreationAPI.getGroupForCMSPay({
                year,
                month,
                ccCodes  // This is now an array
            });

            console.log('✅ Groups Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Groups');
        }
    }
);

// 5. Fetch Consolidate Numbers for CMS Payment - UPDATED TO ACCEPT ARRAY FORMAT
export const fetchConsolidateNoForCMSPay = createAsyncThunk(
    'staffcmspay/fetchConsolidateNoForCMSPay',
    async ({ year, month, ccCodes, groups }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Consolidate Numbers with payload:', {
                Year: year,
                EffectiveMonth: month,
                SelectedCC: ccCodes,
                SelectedGroup: groups
            });

            // Pass parameters as-is (both ccCodes and groups are arrays)
            const response = await staffCMSPayCreationAPI.getConsolidateNoForCMSPay({
                year,
                month,
                ccCodes,  // This is now an array
                groups    // This is now an array
            });

            console.log('✅ Consolidate Numbers Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Consolidate Numbers');
        }
    }
);

// 6. Fetch Employees for CMS Data - UPDATED TO ACCEPT ARRAY FORMAT
export const fetchEmpForCMSData = createAsyncThunk(
    'staffcmspay/fetchEmpForCMSData',
    async ({ year, month, ccCodes, consolidateNos, groups }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employees with payload:', {
                Year: year,
                EffectiveMonth: month,
                SelectedCC: ccCodes,
                SelectedConsolidateNo: consolidateNos,
                SelectedGroup: groups
            });

            // Pass parameters as-is (all are arrays)
            const response = await staffCMSPayCreationAPI.getEmpForCMSData({
                year,
                month,
                ccCodes,         // This is now an array
                consolidateNos,  // This is now an array
                groups           // This is now an array
            });

            console.log('✅ Employees Data Response:', response);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Employees Data');
        }
    }
);

// 7. Save CMS Employees Data
export const saveCMSEmployeesData = createAsyncThunk(
    'staffcmspay/saveCMSEmployeesData',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving CMS Employees Data:', params);
            const response = await staffCMSPayCreationAPI.saveCMSEmployeesData(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save CMS Employees Data');
        }
    }
);

// Initial State
// =============
const initialState = {
    // Data from APIs
    cmsYears: [],
    cmsMonths: [],
    costCenters: [],
    groups: [],
    consolidateNumbers: [],
    employeesData: null,
    saveResult: null,

    // Loading states for each API
    loading: {
        cmsYears: false,
        cmsMonths: false,
        costCenters: false,
        groups: false,
        consolidateNumbers: false,
        employeesData: false,
        saveCMSData: false,
    },

    // Error states for each API
    errors: {
        cmsYears: null,
        cmsMonths: null,
        costCenters: null,
        groups: null,
        consolidateNumbers: null,
        employeesData: null,
        saveCMSData: null,
    },

    // UI State - Filter selections (now all arrays for multi-select support)
    selectedYear: null,
    selectedMonth: null,
    selectedLType: null,
    selectedContraCode: null,
    selectedEType: null,
    selectedCCCodes: [],      // Array for multiple cost centers
    selectedGroups: [],       // Array for multiple groups
    selectedConsolidateNos: [], // Array for multiple consolidate numbers

    // Save status
    saveStatus: null,
};

// Staff CMS Pay Creation Slice
// =============================
const staffCMSPayCreationSlice = createSlice({
    name: 'staffcmspay',
    initialState,
    reducers: {
        // Filter selection actions
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
            // Reset dependent selections when year changes
            state.selectedMonth = null;
            state.cmsMonths = [];
            state.costCenters = [];
            state.groups = [];
            state.consolidateNumbers = [];
            state.employeesData = null;
            state.selectedCCCodes = [];
            state.selectedGroups = [];
            state.selectedConsolidateNos = [];
        },

        setSelectedMonth: (state, action) => {
            state.selectedMonth = action.payload;
            // Reset dependent selections when month changes
            state.costCenters = [];
            state.groups = [];
            state.consolidateNumbers = [];
            state.employeesData = null;
            state.selectedCCCodes = [];
            state.selectedGroups = [];
            state.selectedConsolidateNos = [];
        },

        setSelectedLType: (state, action) => {
            state.selectedLType = action.payload;
        },

        setSelectedContraCode: (state, action) => {
            state.selectedContraCode = action.payload;
        },

        setSelectedEType: (state, action) => {
            state.selectedEType = action.payload;
        },

        setSelectedCCCodes: (state, action) => {
            state.selectedCCCodes = action.payload; // Now expects an array
            // Reset dependent selections when CC codes change
            state.groups = [];
            state.consolidateNumbers = [];
            state.employeesData = null;
            state.selectedGroups = [];
            state.selectedConsolidateNos = [];
        },

        setSelectedGroups: (state, action) => {
            state.selectedGroups = action.payload; // Now expects an array
            // Reset dependent selections when groups change
            state.consolidateNumbers = [];
            state.employeesData = null;
            state.selectedConsolidateNos = [];
        },

        setSelectedConsolidateNos: (state, action) => {
            state.selectedConsolidateNos = action.payload; // Now expects an array
            // Reset employees data when consolidate numbers change
            state.employeesData = null;
        },

        // Action to set save status
        setSaveStatus: (state, action) => {
            state.saveStatus = action.payload;
        },

        // Action to clear specific errors
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },

        // Action to reset all CMS Pay data
        resetCMSPayData: (state) => {
            state.cmsYears = [];
            state.cmsMonths = [];
            state.costCenters = [];
            state.groups = [];
            state.consolidateNumbers = [];
            state.employeesData = null;
            state.saveResult = null;
            state.selectedYear = null;
            state.selectedMonth = null;
            state.selectedLType = null;
            state.selectedContraCode = null;
            state.selectedEType = null;
            state.selectedCCCodes = [];
            state.selectedGroups = [];
            state.selectedConsolidateNos = [];
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
            state.errors.saveCMSData = null;
        },

        // Action to reset employees data
        resetEmployeesData: (state) => {
            state.employeesData = null;
            state.errors.employeesData = null;
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch CMS Years - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchCMSYears.pending, (state) => {
                state.loading.cmsYears = true;
                state.errors.cmsYears = null;
            })
            .addCase(fetchCMSYears.fulfilled, (state, action) => {
                state.loading.cmsYears = false;
                console.log('✅ CMS Years fulfilled:', action.payload);
                // 🔧 Extract Data array from API response
                state.cmsYears = action.payload?.Data || [];
            })
            .addCase(fetchCMSYears.rejected, (state, action) => {
                state.loading.cmsYears = false;
                state.errors.cmsYears = action.payload;
                state.cmsYears = [];
            })

        // 2. Fetch CMS Months by Year - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchCMSMonthsByYear.pending, (state) => {
                state.loading.cmsMonths = true;
                state.errors.cmsMonths = null;
            })
            .addCase(fetchCMSMonthsByYear.fulfilled, (state, action) => {
                state.loading.cmsMonths = false;
                console.log('✅ CMS Months fulfilled:', action.payload);
                // 🔧 Extract Data array from API response
                state.cmsMonths = action.payload?.Data || [];
            })
            .addCase(fetchCMSMonthsByYear.rejected, (state, action) => {
                state.loading.cmsMonths = false;
                state.errors.cmsMonths = action.payload;
                state.cmsMonths = [];
            })

        // 3. Fetch Cost Centers - HANDLE API RESPONSE STRUCTURE
        builder
            .addCase(fetchCCForCMSPayment.pending, (state) => {
                state.loading.costCenters = true;
                state.errors.costCenters = null;
            })
            .addCase(fetchCCForCMSPayment.fulfilled, (state, action) => {
                state.loading.costCenters = false;
                console.log('✅ Cost Centers fulfilled:', action.payload);
                // 🔧 Extract Data array from API response
                state.costCenters = action.payload?.Data || [];
            })
            .addCase(fetchCCForCMSPayment.rejected, (state, action) => {
                state.loading.costCenters = false;
                state.errors.costCenters = action.payload;
                state.costCenters = [];
            })

        // 4. Fetch Groups - HANDLE API RESPONSE STRUCTURE (WITH ARRAY INPUT)
        builder
            .addCase(fetchGroupForCMSPay.pending, (state) => {
                state.loading.groups = true;
                state.errors.groups = null;
            })
            .addCase(fetchGroupForCMSPay.fulfilled, (state, action) => {
                state.loading.groups = false;
                console.log('✅ Groups fulfilled:', action.payload);
                // 🔧 Extract Data array from API response
                state.groups = action.payload?.Data || [];
            })
            .addCase(fetchGroupForCMSPay.rejected, (state, action) => {
                state.loading.groups = false;
                state.errors.groups = action.payload;
                state.groups = [];
            })

        // 5. Fetch Consolidate Numbers - HANDLE API RESPONSE STRUCTURE (WITH ARRAY INPUT)
        builder
            .addCase(fetchConsolidateNoForCMSPay.pending, (state) => {
                state.loading.consolidateNumbers = true;
                state.errors.consolidateNumbers = null;
            })
            .addCase(fetchConsolidateNoForCMSPay.fulfilled, (state, action) => {
                state.loading.consolidateNumbers = false;
                console.log('✅ Consolidate Numbers fulfilled:', action.payload);
                // 🔧 Extract Data array from API response
                state.consolidateNumbers = action.payload?.Data || [];
            })
            .addCase(fetchConsolidateNoForCMSPay.rejected, (state, action) => {
                state.loading.consolidateNumbers = false;
                state.errors.consolidateNumbers = action.payload;
                state.consolidateNumbers = [];
            })

        // 6. Fetch Employees Data - HANDLE API RESPONSE STRUCTURE (WITH ARRAY INPUT)
        builder
            .addCase(fetchEmpForCMSData.pending, (state) => {
                state.loading.employeesData = true;
                state.errors.employeesData = null;
            })
            .addCase(fetchEmpForCMSData.fulfilled, (state, action) => {
                state.loading.employeesData = false;
                console.log('✅ Employees Data fulfilled:', action.payload);
                // 🔧 Extract Data from API response
                // API returns MultiResult which might have different structure
                state.employeesData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchEmpForCMSData.rejected, (state, action) => {
                state.loading.employeesData = false;
                state.errors.employeesData = action.payload;
                state.employeesData = null;
            })

        // 7. Save CMS Employees Data
        builder
            .addCase(saveCMSEmployeesData.pending, (state) => {
                state.loading.saveCMSData = true;
                state.errors.saveCMSData = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveCMSEmployeesData.fulfilled, (state, action) => {
                state.loading.saveCMSData = false;
                console.log('✅ Save CMS Data fulfilled - Raw Response:', action.payload);

                // Backend returns a plain string like "Submited$TransactionNumber" or error message
                state.saveResult = action.payload;

                // Check if it's a successful submission
                const responseStr = typeof action.payload === 'string'
                    ? action.payload
                    : (action.payload?.Data || action.payload?.Message || '');

                const successMessage = responseStr.split('$')[0];

                if (successMessage === 'Submited') {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.saveCMSData = responseStr;
                }
            })
            .addCase(saveCMSEmployeesData.rejected, (state, action) => {
                state.loading.saveCMSData = false;
                state.errors.saveCMSData = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });
    },
});

// Export actions
export const {
    setSelectedYear,
    setSelectedMonth,
    setSelectedLType,
    setSelectedContraCode,
    setSelectedEType,
    setSelectedCCCodes,
    setSelectedGroups,
    setSelectedConsolidateNos,
    setSaveStatus,
    clearError,
    resetCMSPayData,
    clearSaveResult,
    resetEmployeesData,
} = staffCMSPayCreationSlice.actions;

// Selectors
// =========

// Data selectors
export const selectCMSYears = (state) => state.staffcmspay.cmsYears;
export const selectCMSMonths = (state) => state.staffcmspay.cmsMonths;
export const selectCostCenters = (state) => state.staffcmspay.costCenters;
export const selectGroups = (state) => state.staffcmspay.groups;
export const selectConsolidateNumbers = (state) => state.staffcmspay.consolidateNumbers;
export const selectEmployeesData = (state) => state.staffcmspay.employeesData;
export const selectSaveResult = (state) => state.staffcmspay.saveResult;

// 🔧 Helper selectors to get arrays safely - PREVENTS FILTER ERRORS
export const selectCMSYearsArray = (state) => {
    const years = state.staffcmspay.cmsYears;
    return Array.isArray(years) ? years : [];
};

export const selectCMSMonthsArray = (state) => {
    const months = state.staffcmspay.cmsMonths;
    return Array.isArray(months) ? months : [];
};

export const selectCostCentersArray = (state) => {
    const centers = state.staffcmspay.costCenters;
    return Array.isArray(centers) ? centers : [];
};

export const selectGroupsArray = (state) => {
    const groups = state.staffcmspay.groups;
    return Array.isArray(groups) ? groups : [];
};

export const selectConsolidateNumbersArray = (state) => {
    const numbers = state.staffcmspay.consolidateNumbers;
    return Array.isArray(numbers) ? numbers : [];
};

// Loading selectors
export const selectLoading = (state) => state.staffcmspay.loading;
export const selectCMSYearsLoading = (state) => state.staffcmspay.loading.cmsYears;
export const selectCMSMonthsLoading = (state) => state.staffcmspay.loading.cmsMonths;
export const selectCostCentersLoading = (state) => state.staffcmspay.loading.costCenters;
export const selectGroupsLoading = (state) => state.staffcmspay.loading.groups;
export const selectConsolidateNumbersLoading = (state) => state.staffcmspay.loading.consolidateNumbers;
export const selectEmployeesDataLoading = (state) => state.staffcmspay.loading.employeesData;
export const selectSaveCMSDataLoading = (state) => state.staffcmspay.loading.saveCMSData;

// Error selectors
export const selectErrors = (state) => state.staffcmspay.errors;
export const selectCMSYearsError = (state) => state.staffcmspay.errors.cmsYears;
export const selectCMSMonthsError = (state) => state.staffcmspay.errors.cmsMonths;
export const selectCostCentersError = (state) => state.staffcmspay.errors.costCenters;
export const selectGroupsError = (state) => state.staffcmspay.errors.groups;
export const selectConsolidateNumbersError = (state) => state.staffcmspay.errors.consolidateNumbers;
export const selectEmployeesDataError = (state) => state.staffcmspay.errors.employeesData;
export const selectSaveCMSDataError = (state) => state.staffcmspay.errors.saveCMSData;

// UI State selectors - Filter selections
export const selectSelectedYear = (state) => state.staffcmspay.selectedYear;
export const selectSelectedMonth = (state) => state.staffcmspay.selectedMonth;
export const selectSelectedLType = (state) => state.staffcmspay.selectedLType;
export const selectSelectedContraCode = (state) => state.staffcmspay.selectedContraCode;
export const selectSelectedEType = (state) => state.staffcmspay.selectedEType;
export const selectSelectedCCCodes = (state) => state.staffcmspay.selectedCCCodes;
export const selectSelectedGroups = (state) => state.staffcmspay.selectedGroups;
export const selectSelectedConsolidateNos = (state) => state.staffcmspay.selectedConsolidateNos;
export const selectSaveStatus = (state) => state.staffcmspay.saveStatus;

// Combined selectors
export const selectIsAnyLoading = (state) => Object.values(state.staffcmspay.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.staffcmspay.errors).some(error => error !== null);

// 🔧 Summary selector for CMS Pay Creation workflow
export const selectCMSPaySummary = (state) => {
    const yearsArray = Array.isArray(state.staffcmspay.cmsYears) ? state.staffcmspay.cmsYears : [];
    const monthsArray = Array.isArray(state.staffcmspay.cmsMonths) ? state.staffcmspay.cmsMonths : [];
    const centersArray = Array.isArray(state.staffcmspay.costCenters) ? state.staffcmspay.costCenters : [];
    const groupsArray = Array.isArray(state.staffcmspay.groups) ? state.staffcmspay.groups : [];
    const consolidateArray = Array.isArray(state.staffcmspay.consolidateNumbers) ? state.staffcmspay.consolidateNumbers : [];

    return {
        totalYears: yearsArray.length,
        totalMonths: monthsArray.length,
        totalCostCenters: centersArray.length,
        totalGroups: groupsArray.length,
        totalConsolidateNumbers: consolidateArray.length,
        hasEmployeesData: state.staffcmspay.employeesData !== null,
        saveStatus: state.staffcmspay.saveStatus,
        isProcessing: state.staffcmspay.loading.saveCMSData,
        hasYears: yearsArray.length > 0,
        hasMonths: monthsArray.length > 0,
        hasCostCenters: centersArray.length > 0,
        hasGroups: groupsArray.length > 0,
        hasConsolidateNumbers: consolidateArray.length > 0,
    };
};

// Filter selections summary
export const selectFilterSelections = (state) => {
    return {
        year: state.staffcmspay.selectedYear,
        month: state.staffcmspay.selectedMonth,
        lType: state.staffcmspay.selectedLType,
        contraCode: state.staffcmspay.selectedContraCode,
        eType: state.staffcmspay.selectedEType,
        ccCodes: state.staffcmspay.selectedCCCodes,
        groups: state.staffcmspay.selectedGroups,
        consolidateNos: state.staffcmspay.selectedConsolidateNos,
        hasYearSelected: state.staffcmspay.selectedYear !== null,
        hasMonthSelected: state.staffcmspay.selectedMonth !== null,
        hasCCCodesSelected: state.staffcmspay.selectedCCCodes.length > 0,
        hasGroupsSelected: state.staffcmspay.selectedGroups.length > 0,
        hasConsolidateNosSelected: state.staffcmspay.selectedConsolidateNos.length > 0,
    };
};

// Export reducer
export default staffCMSPayCreationSlice.reducer;