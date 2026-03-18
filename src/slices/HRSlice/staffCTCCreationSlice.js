import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffCTCCreationAPI from '../../api/HRAPI/staffCTCCreationAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Fetch employees eligible for new CTC creation
export const fetchNewEmpForCTC = createAsyncThunk(
    'staffCTCCreation/fetchNewEmpForCTC',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching New Employees For CTC');
            const response = await staffCTCCreationAPI.getNewEmpForCTC();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employees for CTC');
        }
    }
);

// 2. Fetch CTC heads data for selected employee
export const fetchCTCHeadsData = createAsyncThunk(
    'staffCTCCreation/fetchCTCHeadsData',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching CTC Heads Data:', empRefNo);
            const response = await staffCTCCreationAPI.getCTCHeadsData(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch CTC heads data');
        }
    }
);

// 3. Save new employee CTC
export const saveNewEmployeeCTC = createAsyncThunk(
    'staffCTCCreation/saveNewEmployeeCTC',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving New Employee CTC:', params);
            const response = await staffCTCCreationAPI.saveNewEmployeeCTC(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save new employee CTC');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Employee List ───────────────────────────────────────────────────────────
    empList: [],

    // ── CTC Heads Data ──────────────────────────────────────────────────────────
    ctcData: null,           // full Data object from GetCTCHeadsData
    localHeads: [],          // editable copy of HeadsList — user modifies amounts here

    // ── Save Operation ──────────────────────────────────────────────────────────
    saveResult: null,
    saveStatus: null,        // null | 'pending' | 'success' | 'failed'

    // ── Loading States ──────────────────────────────────────────────────────────
    loading: {
        empList:  false,
        ctcData:  false,
        save:     false,
    },

    // ── Error States ────────────────────────────────────────────────────────────
    errors: {
        empList:  null,
        ctcData:  null,
        save:     null,
    },
};

// ==============================================
// HELPERS
// ==============================================

// Recalculate all total rows based on current editable amounts
const recalculateTotals = (heads) => {
    const updated = heads.map((h) => ({ ...h }));

    const sum = (type) =>
        updated
            .filter((h) => h.HeadType === type)
            .reduce((acc, h) => acc + (parseFloat(h.HeadAmount) || 0), 0);

    const earningsTotal    = sum('Earning');
    const deductionTotal   = sum('Deduction');
    const benefitTotal     = sum('Benefit');
    const otherBenefitTotal = sum('OtherBenefit');
    const netSalary        = earningsTotal - deductionTotal;
    const ctcTotal         = earningsTotal + benefitTotal + otherBenefitTotal;

    return updated.map((h) => {
        switch (h.HeadType) {
            case 'GROSSSALARY':       return { ...h, HeadAmount: earningsTotal };
            case 'DEDUCTIONTOTAL':    return { ...h, HeadAmount: deductionTotal };
            case 'NETSALARY':         return { ...h, HeadAmount: netSalary };
            case 'BENEFITTOTAL':      return { ...h, HeadAmount: benefitTotal };
            case 'OTHERBENEFITTOTAL': return { ...h, HeadAmount: otherBenefitTotal };
            case 'CTCTOTAL':          return { ...h, HeadAmount: ctcTotal };
            default:                  return h;
        }
    });
};

// SaveNewEmployeeCTC succeeds when Data === "Submited" or IsSuccessful === true
const resolveSaveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Save failed');
    const isSuccess = payload?.IsSuccessful === true ||
        (typeof responseStr === 'string' && responseStr.toLowerCase().includes('submit'));
    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const staffCTCCreationSlice = createSlice({
    name: 'staffCTCCreation',
    initialState,
    reducers: {
        // Update a single head's amount and recalculate totals
        updateHeadAmount: (state, action) => {
            const { rowno, amount } = action.payload;
            const idx = state.localHeads.findIndex((h) => h.Rowno === rowno);
            if (idx !== -1) {
                state.localHeads[idx] = {
                    ...state.localHeads[idx],
                    HeadAmount: parseFloat(amount) || 0,
                };
                state.localHeads = recalculateTotals(state.localHeads);
            }
        },

        clearCTCData: (state) => {
            state.ctcData         = null;
            state.localHeads      = [];
            state.errors.ctcData  = null;
        },

        clearSaveResult: (state) => {
            state.saveResult    = null;
            state.saveStatus    = null;
            state.errors.save   = null;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {

        // ── 1. Fetch New Employees For CTC ───────────────────────────────────────
        builder
            .addCase(fetchNewEmpForCTC.pending, (state) => {
                state.loading.empList = true;
                state.errors.empList  = null;
            })
            .addCase(fetchNewEmpForCTC.fulfilled, (state, action) => {
                state.loading.empList = false;
                console.log('✅ New Emp For CTC fulfilled:', action.payload);
                state.empList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchNewEmpForCTC.rejected, (state, action) => {
                state.loading.empList = false;
                state.errors.empList  = action.payload;
                state.empList         = [];
            });

        // ── 2. Fetch CTC Heads Data ──────────────────────────────────────────────
        builder
            .addCase(fetchCTCHeadsData.pending, (state) => {
                state.loading.ctcData = true;
                state.errors.ctcData  = null;
                state.ctcData         = null;
                state.localHeads      = [];
            })
            .addCase(fetchCTCHeadsData.fulfilled, (state, action) => {
                state.loading.ctcData = false;
                console.log('✅ CTC Heads Data fulfilled:', action.payload);
                const data = action.payload?.Data || action.payload || null;
                state.ctcData = data;
                // Seed localHeads from HeadsList with default amounts
                if (data?.HeadsList?.length) {
                    state.localHeads = recalculateTotals(
                        data.HeadsList.map((h) => ({ ...h }))
                    );
                }
            })
            .addCase(fetchCTCHeadsData.rejected, (state, action) => {
                state.loading.ctcData = false;
                state.errors.ctcData  = action.payload;
                state.ctcData         = null;
                state.localHeads      = [];
            });

        // ── 3. Save New Employee CTC ─────────────────────────────────────────────
        builder
            .addCase(saveNewEmployeeCTC.pending, (state) => {
                state.loading.save = true;
                state.errors.save  = null;
                state.saveStatus   = 'pending';
            })
            .addCase(saveNewEmployeeCTC.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save New Employee CTC fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus  = 'failed';
                    state.errors.save = responseStr || 'Save CTC failed';
                }
            })
            .addCase(saveNewEmployeeCTC.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
                state.saveResult   = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    updateHeadAmount,
    clearCTCData,
    clearSaveResult,
    clearError,
    resetAll,
} = staffCTCCreationSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Employee List ─────────────────────────────────────────────────────────────
export const selectEmpList        = (state) => state.staffCTCCreation.empList;
export const selectEmpListArray   = (state) => {
    const data = state.staffCTCCreation.empList;
    return Array.isArray(data) ? data : [];
};
export const selectEmpListLoading = (state) => state.staffCTCCreation.loading.empList;
export const selectEmpListError   = (state) => state.staffCTCCreation.errors.empList;

// ── CTC Heads Data ────────────────────────────────────────────────────────────
export const selectCTCData        = (state) => state.staffCTCCreation.ctcData;
export const selectLocalHeads     = (state) => state.staffCTCCreation.localHeads;
export const selectCTCDataLoading = (state) => state.staffCTCCreation.loading.ctcData;
export const selectCTCDataError   = (state) => state.staffCTCCreation.errors.ctcData;

// Derived selectors for head groups
export const selectEarningHeads = (state) =>
    state.staffCTCCreation.localHeads.filter((h) => h.HeadType === 'Earning');
export const selectDeductionHeads = (state) =>
    state.staffCTCCreation.localHeads.filter((h) => h.HeadType === 'Deduction');
export const selectBenefitHeads = (state) =>
    state.staffCTCCreation.localHeads.filter((h) => h.HeadType === 'Benefit');
export const selectOtherBenefitHeads = (state) =>
    state.staffCTCCreation.localHeads.filter((h) => h.HeadType === 'OtherBenefit');

// Total rows for display
export const selectGrossRow           = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'GROSSSALARY');
export const selectDeductionTotalRow  = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'DEDUCTIONTOTAL');
export const selectNetSalaryRow       = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'NETSALARY');
export const selectBenefitTotalRow    = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'BENEFITTOTAL');
export const selectOtherBenefitTotalRow = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'OTHERBENEFITTOTAL');
export const selectCTCTotalRow        = (state) => state.staffCTCCreation.localHeads.find((h) => h.HeadType === 'CTCTOTAL');

// ── Save Operation ────────────────────────────────────────────────────────────
export const selectSaveResult  = (state) => state.staffCTCCreation.saveResult;
export const selectSaveStatus  = (state) => state.staffCTCCreation.saveStatus;
export const selectSaveLoading = (state) => state.staffCTCCreation.loading.save;
export const selectSaveError   = (state) => state.staffCTCCreation.errors.save;

// ── Combined ──────────────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.staffCTCCreation.loading).some(Boolean);

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffCTCCreationSlice.reducer;
