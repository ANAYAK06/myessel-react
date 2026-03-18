import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as salaryDeductionArearAPI from '../../api/HRAPI/SalaryDeductionandArearVerification';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Fetch Verify Salary Deductions List
export const fetchVerifySalaryDeductions = createAsyncThunk(
    'salarydeductionarearverification/fetchVerifySalaryDeductions',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Salary Deductions List:', params);
            const response = await salaryDeductionArearAPI.getVerifySalaryDeductions(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verify Salary Deductions List');
        }
    }
);

// 2. Fetch Month Deduction For Verify
export const fetchMonthDeductionForVerify = createAsyncThunk(
    'salarydeductionarearverification/fetchMonthDeductionForVerify',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Month Deduction For Verify:', params);
            const response = await salaryDeductionArearAPI.getMonthDeductionForVerify(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Month Deduction For Verify');
        }
    }
);

// 3. Approve Single Salary Deduction
export const approveSingleSalaryDeduction = createAsyncThunk(
    'salarydeductionarearverification/approveSingleSalaryDeduction',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approve Single Salary Deduction:', params);
            const response = await salaryDeductionArearAPI.approveSingleSalaryDeduction(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Salary Deduction action');
        }
    }
);

// 4. Fetch Verify Salary Arear List
export const fetchVerifySalaryArear = createAsyncThunk(
    'salarydeductionarearverification/fetchVerifySalaryArear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Salary Arear List:', params);
            const response = await salaryDeductionArearAPI.getVerifySalaryArear(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Verify Salary Arear List');
        }
    }
);

// 5. Fetch Arear CC Amount
export const fetchArearCCAmount = createAsyncThunk(
    'salarydeductionarearverification/fetchArearCCAmount',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Arear CC Amount:', params);
            const response = await salaryDeductionArearAPI.getArearCCAmount(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Arear CC Amount');
        }
    }
);

// 6. Approve Salary Arear
export const approveSalaryArear = createAsyncThunk(
    'salarydeductionarearverification/approveSalaryArear',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approve Salary Arear:', params);
            const response = await salaryDeductionArearAPI.approveSalaryArear(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to process Salary Arear action');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // Salary Deduction Data
    salaryDeductionList: [],
    monthDeductionDetails: null,
    deductionActionResult: null,

    // Salary Arear Data
    salaryArearList: [],
    arearCCAmount: null,
    arearActionResult: null,

    // Loading states
    loading: {
        deductionList: false,
        monthDeductionDetails: false,
        deductionAction: false,
        arearList: false,
        arearCCAmount: false,
        arearAction: false,
    },

    // Error states
    errors: {
        deductionList: null,
        monthDeductionDetails: null,
        deductionAction: null,
        arearList: null,
        arearCCAmount: null,
        arearAction: null,
    },

    // UI State
    selectedDeductionItem: null,
    selectedArearItem: null,
    deductionActionStatus: null,    // 'pending' | 'success' | 'failed'
    arearActionStatus: null,        // 'pending' | 'success' | 'failed'
    lastAction: null,               // 'Verify' | 'Approve' | 'Reject'
    activeTab: 'deduction',         // 'deduction' | 'arear'
};

// ==============================================
// HELPER: Parse action response success/failure
// ==============================================
const parseActionSuccess = (payload) => {
    const responseStr = typeof payload === 'string'
        ? payload
        : (payload?.Data || payload?.Message || '');

    return (
        (typeof responseStr === 'string' && (
            responseStr.toLowerCase().includes('success') ||
            responseStr.toLowerCase().includes('submitted') ||
            responseStr.toLowerCase().includes('submited')
        )) ||
        payload?.IsSuccessful === true ||
        payload?.ResponseCode === 200
    );
};

// ==============================================
// SLICE
// ==============================================
const salaryDeductionArearVerificationSlice = createSlice({
    name: 'salarydeductionarearverification',
    initialState,
    reducers: {
        setSelectedDeductionItem: (state, action) => {
            state.selectedDeductionItem = action.payload;
            state.monthDeductionDetails = null;
            state.errors.monthDeductionDetails = null;
        },

        setSelectedArearItem: (state, action) => {
            state.selectedArearItem = action.payload;
            state.arearCCAmount = null;
            state.errors.arearCCAmount = null;
        },

        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },

        setDeductionActionStatus: (state, action) => {
            state.deductionActionStatus = action.payload;
        },

        setArearActionStatus: (state, action) => {
            state.arearActionStatus = action.payload;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        clearDeductionActionResult: (state) => {
            state.deductionActionResult = null;
            state.deductionActionStatus = null;
            state.lastAction = null;
            state.errors.deductionAction = null;
        },

        clearArearActionResult: (state) => {
            state.arearActionResult = null;
            state.arearActionStatus = null;
            state.lastAction = null;
            state.errors.arearAction = null;
        },

        resetDeductionData: (state) => {
            state.salaryDeductionList = [];
            state.monthDeductionDetails = null;
            state.deductionActionResult = null;
            state.selectedDeductionItem = null;
            state.deductionActionStatus = null;
            state.errors.deductionList = null;
            state.errors.monthDeductionDetails = null;
            state.errors.deductionAction = null;
            state.loading.deductionList = false;
            state.loading.monthDeductionDetails = false;
            state.loading.deductionAction = false;
        },

        resetArearData: (state) => {
            state.salaryArearList = [];
            state.arearCCAmount = null;
            state.arearActionResult = null;
            state.selectedArearItem = null;
            state.arearActionStatus = null;
            state.errors.arearList = null;
            state.errors.arearCCAmount = null;
            state.errors.arearAction = null;
            state.loading.arearList = false;
            state.loading.arearCCAmount = false;
            state.loading.arearAction = false;
        },

        resetAllData: (state) => {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {

        // 1. Fetch Verify Salary Deductions List
        builder
            .addCase(fetchVerifySalaryDeductions.pending, (state) => {
                state.loading.deductionList = true;
                state.errors.deductionList = null;
            })
            .addCase(fetchVerifySalaryDeductions.fulfilled, (state, action) => {
                state.loading.deductionList = false;
                console.log('✅ Verify Salary Deductions List fulfilled:', action.payload);
                state.salaryDeductionList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifySalaryDeductions.rejected, (state, action) => {
                state.loading.deductionList = false;
                state.errors.deductionList = action.payload;
                state.salaryDeductionList = [];
            });

        // 2. Fetch Month Deduction For Verify
        builder
            .addCase(fetchMonthDeductionForVerify.pending, (state) => {
                state.loading.monthDeductionDetails = true;
                state.errors.monthDeductionDetails = null;
            })
            .addCase(fetchMonthDeductionForVerify.fulfilled, (state, action) => {
                state.loading.monthDeductionDetails = false;
                console.log('✅ Month Deduction For Verify fulfilled:', action.payload);
                state.monthDeductionDetails = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchMonthDeductionForVerify.rejected, (state, action) => {
                state.loading.monthDeductionDetails = false;
                state.errors.monthDeductionDetails = action.payload;
                state.monthDeductionDetails = null;
            });

        // 3. Approve Single Salary Deduction
        builder
            .addCase(approveSingleSalaryDeduction.pending, (state) => {
                state.loading.deductionAction = true;
                state.errors.deductionAction = null;
                state.deductionActionStatus = 'pending';
            })
            .addCase(approveSingleSalaryDeduction.fulfilled, (state, action) => {
                state.loading.deductionAction = false;
                console.log('✅ Approve Single Salary Deduction fulfilled:', action.payload);

                state.deductionActionResult = action.payload;
                const isSuccess = parseActionSuccess(action.payload);
                state.deductionActionStatus = isSuccess ? 'success' : 'failed';

                if (!isSuccess) {
                    const responseStr = typeof action.payload === 'string'
                        ? action.payload
                        : (action.payload?.Data || action.payload?.Message || '');
                    state.errors.deductionAction = responseStr || 'Action failed';
                }
            })
            .addCase(approveSingleSalaryDeduction.rejected, (state, action) => {
                state.loading.deductionAction = false;
                state.errors.deductionAction = action.payload;
                state.deductionActionStatus = 'failed';
                state.deductionActionResult = null;
            });

        // 4. Fetch Verify Salary Arear List
        builder
            .addCase(fetchVerifySalaryArear.pending, (state) => {
                state.loading.arearList = true;
                state.errors.arearList = null;
            })
            .addCase(fetchVerifySalaryArear.fulfilled, (state, action) => {
                state.loading.arearList = false;
                console.log('✅ Verify Salary Arear List fulfilled:', action.payload);
                state.salaryArearList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifySalaryArear.rejected, (state, action) => {
                state.loading.arearList = false;
                state.errors.arearList = action.payload;
                state.salaryArearList = [];
            });

        // 5. Fetch Arear CC Amount
        builder
            .addCase(fetchArearCCAmount.pending, (state) => {
                state.loading.arearCCAmount = true;
                state.errors.arearCCAmount = null;
            })
            .addCase(fetchArearCCAmount.fulfilled, (state, action) => {
                state.loading.arearCCAmount = false;
                console.log('✅ Arear CC Amount fulfilled:', action.payload);
                state.arearCCAmount = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchArearCCAmount.rejected, (state, action) => {
                state.loading.arearCCAmount = false;
                state.errors.arearCCAmount = action.payload;
                state.arearCCAmount = null;
            });

        // 6. Approve Salary Arear
        builder
            .addCase(approveSalaryArear.pending, (state) => {
                state.loading.arearAction = true;
                state.errors.arearAction = null;
                state.arearActionStatus = 'pending';
            })
            .addCase(approveSalaryArear.fulfilled, (state, action) => {
                state.loading.arearAction = false;
                console.log('✅ Approve Salary Arear fulfilled:', action.payload);

                state.arearActionResult = action.payload;
                const isSuccess = parseActionSuccess(action.payload);
                state.arearActionStatus = isSuccess ? 'success' : 'failed';

                if (!isSuccess) {
                    const responseStr = typeof action.payload === 'string'
                        ? action.payload
                        : (action.payload?.Data || action.payload?.Message || '');
                    state.errors.arearAction = responseStr || 'Action failed';
                }
            })
            .addCase(approveSalaryArear.rejected, (state, action) => {
                state.loading.arearAction = false;
                state.errors.arearAction = action.payload;
                state.arearActionStatus = 'failed';
                state.arearActionResult = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedDeductionItem,
    setSelectedArearItem,
    setActiveTab,
    setDeductionActionStatus,
    setArearActionStatus,
    clearError,
    clearDeductionActionResult,
    clearArearActionResult,
    resetDeductionData,
    resetArearData,
    resetAllData,
} = salaryDeductionArearVerificationSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// --- Salary Deduction Data Selectors ---
export const selectSalaryDeductionList = (state) => state.salarydeductionarearverification.salaryDeductionList;
export const selectMonthDeductionDetails = (state) => state.salarydeductionarearverification.monthDeductionDetails;
export const selectDeductionActionResult = (state) => state.salarydeductionarearverification.deductionActionResult;

// Safe array selectors
export const selectSalaryDeductionListArray = (state) => {
    const list = state.salarydeductionarearverification.salaryDeductionList;
    return Array.isArray(list) ? list : [];
};

export const selectMonthDeductionDetailsArray = (state) => {
    const details = state.salarydeductionarearverification.monthDeductionDetails;
    return Array.isArray(details) ? details : [];
};

// --- Salary Arear Data Selectors ---
export const selectSalaryArearList = (state) => state.salarydeductionarearverification.salaryArearList;
export const selectArearCCAmount = (state) => state.salarydeductionarearverification.arearCCAmount;
export const selectArearActionResult = (state) => state.salarydeductionarearverification.arearActionResult;

// Safe array selectors
export const selectSalaryArearListArray = (state) => {
    const list = state.salarydeductionarearverification.salaryArearList;
    return Array.isArray(list) ? list : [];
};

export const selectArearCCAmountArray = (state) => {
    const data = state.salarydeductionarearverification.arearCCAmount;
    return Array.isArray(data) ? data : [];
};

// --- Loading Selectors ---
export const selectLoading = (state) => state.salarydeductionarearverification.loading;
export const selectDeductionListLoading = (state) => state.salarydeductionarearverification.loading.deductionList;
export const selectMonthDeductionDetailsLoading = (state) => state.salarydeductionarearverification.loading.monthDeductionDetails;
export const selectDeductionActionLoading = (state) => state.salarydeductionarearverification.loading.deductionAction;
export const selectArearListLoading = (state) => state.salarydeductionarearverification.loading.arearList;
export const selectArearCCAmountLoading = (state) => state.salarydeductionarearverification.loading.arearCCAmount;
export const selectArearActionLoading = (state) => state.salarydeductionarearverification.loading.arearAction;

// --- Error Selectors ---
export const selectErrors = (state) => state.salarydeductionarearverification.errors;
export const selectDeductionListError = (state) => state.salarydeductionarearverification.errors.deductionList;
export const selectMonthDeductionDetailsError = (state) => state.salarydeductionarearverification.errors.monthDeductionDetails;
export const selectDeductionActionError = (state) => state.salarydeductionarearverification.errors.deductionAction;
export const selectArearListError = (state) => state.salarydeductionarearverification.errors.arearList;
export const selectArearCCAmountError = (state) => state.salarydeductionarearverification.errors.arearCCAmount;
export const selectArearActionError = (state) => state.salarydeductionarearverification.errors.arearAction;

// --- UI State Selectors ---
export const selectSelectedDeductionItem = (state) => state.salarydeductionarearverification.selectedDeductionItem;
export const selectSelectedArearItem = (state) => state.salarydeductionarearverification.selectedArearItem;
export const selectActiveTab = (state) => state.salarydeductionarearverification.activeTab;
export const selectDeductionActionStatus = (state) => state.salarydeductionarearverification.deductionActionStatus;
export const selectArearActionStatus = (state) => state.salarydeductionarearverification.arearActionStatus;
export const selectLastAction = (state) => state.salarydeductionarearverification.lastAction;

// --- Combined Selectors ---
export const selectIsAnyLoading = (state) =>
    Object.values(state.salarydeductionarearverification.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.salarydeductionarearverification.errors).some(error => error !== null);

export const selectIsDeductionActionLoading = (state) =>
    state.salarydeductionarearverification.loading.deductionAction;

export const selectIsArearActionLoading = (state) =>
    state.salarydeductionarearverification.loading.arearAction;

// --- Summary Selectors ---
export const selectDeductionSummary = (state) => {
    const list = state.salarydeductionarearverification.salaryDeductionList;
    const listArray = Array.isArray(list) ? list : [];

    return {
        totalPending: listArray.length,
        hasDetails: state.salarydeductionarearverification.monthDeductionDetails !== null,
        hasSelectedItem: state.salarydeductionarearverification.selectedDeductionItem !== null,
        actionStatus: state.salarydeductionarearverification.deductionActionStatus,
        isProcessing: state.salarydeductionarearverification.loading.deductionAction,
    };
};

export const selectArearSummary = (state) => {
    const list = state.salarydeductionarearverification.salaryArearList;
    const listArray = Array.isArray(list) ? list : [];

    return {
        totalPending: listArray.length,
        hasCCAmount: state.salarydeductionarearverification.arearCCAmount !== null,
        hasSelectedItem: state.salarydeductionarearverification.selectedArearItem !== null,
        actionStatus: state.salarydeductionarearverification.arearActionStatus,
        isProcessing: state.salarydeductionarearverification.loading.arearAction,
    };
};

export const selectVerificationSummary = (state) => {
    const deductionList = state.salarydeductionarearverification.salaryDeductionList;
    const arearList = state.salarydeductionarearverification.salaryArearList;

    return {
        totalDeductionPending: Array.isArray(deductionList) ? deductionList.length : 0,
        totalArearPending: Array.isArray(arearList) ? arearList.length : 0,
        activeTab: state.salarydeductionarearverification.activeTab,
        isAnyProcessing:
            state.salarydeductionarearverification.loading.deductionAction ||
            state.salarydeductionarearverification.loading.arearAction,
    };
};

// Export reducer
export default salaryDeductionArearVerificationSlice.reducer;