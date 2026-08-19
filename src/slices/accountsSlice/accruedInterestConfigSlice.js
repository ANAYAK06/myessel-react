import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCCAccrueDetails,
    getCostCentersByTypeByRole,
    saveCCAccurateValues,
} from '../../api/AccountsAPI/accruedInterestConfigAPI';

// This page only ever configures the "Accrued" interest report type
const REPORT_TYPE = 'Accrued';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchAccruedInterestConfigList = createAsyncThunk(
    'accruedInterestConfig/fetchAccruedInterestConfigList',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCCAccrueDetails({ Type: REPORT_TYPE });
            const list = res.data?.Data || [];
            return list.map(row => ({
                id:           row.Id,
                code:         row.CostCenter,
                name:         row.CCName,
                interestRate: row.InterestRate,
                amount:       row.Amount,
            }));
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load accrued interest config');
        }
    }
);

/** All performing/active cost centres, used to find CCs with no accrued-interest rate configured yet */
export const fetchAllPerformingActiveCCForAccrued = createAsyncThunk(
    'accruedInterestConfig/fetchAllPerformingActiveCCForAccrued',
    async ({ uid, rid }, { rejectWithValue }) => {
        try {
            const res = await getCostCentersByTypeByRole({
                CCType: 'Performing',
                SubType: '',
                UID: uid,
                RID: rid,
                CCstatus: 'Active',
            });
            const list = res.data?.Data || [];
            return list.map(cc => ({ code: cc.CC_Code, name: cc.CC_Name }));
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load cost centres');
        }
    }
);

export const submitAccruedInterestConfig = createAsyncThunk(
    'accruedInterestConfig/submitAccruedInterestConfig',
    async ({ id, code, name, interestRate, amount, createdBy, roleId }, { rejectWithValue }) => {
        try {
            const res = await saveCCAccurateValues({
                Id:           id || 0,
                ReportType:   REPORT_TYPE,
                CostCenter:   code,
                InterestRate: interestRate,
                // The stored proc's @Amount param is bound to the C# model's `Value` field, not `Amount`
                Value:        amount || 0,
                wefdate:      null,
                Createdby:    createdBy,
                Action:       id ? 'Update' : 'Insert',
                RoleId:       roleId || 0,
            });
            const data = res.data?.Data;
            const status = typeof data === 'string' ? data : (res.data?.Message || '');
            const ok = ['submited', 'submitted', 'success', 'successfull'].includes(status.toLowerCase());
            if (!ok) {
                return rejectWithValue(status || 'Failed to save the accrued interest rate');
            }
            return { id, code, name, interestRate, amount: amount || 0 };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save the accrued interest rate');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    configList: [],
    allCCList: [],
    saveResult: null,

    loading: {
        list:  false,
        allCC: false,
        save:  false,
    },
    errors: {
        list:  null,
        allCC: null,
        save:  null,
    },
};

const accruedInterestConfigSlice = createSlice({
    name: 'accruedInterestConfig',
    initialState,
    reducers: {
        clearAccruedInterestSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        resetAccruedInterestConfig: () => initialState,
    },
    extraReducers: (builder) => {
        // Config list
        builder
            .addCase(fetchAccruedInterestConfigList.pending, s => { s.loading.list = true; s.errors.list = null; })
            .addCase(fetchAccruedInterestConfigList.fulfilled, (s, a) => { s.loading.list = false; s.configList = a.payload; })
            .addCase(fetchAccruedInterestConfigList.rejected, (s, a) => { s.loading.list = false; s.errors.list = a.payload; });

        // All performing/active cost centres (for cross-verification against configList)
        builder
            .addCase(fetchAllPerformingActiveCCForAccrued.pending, s => { s.loading.allCC = true; s.errors.allCC = null; })
            .addCase(fetchAllPerformingActiveCCForAccrued.fulfilled, (s, a) => { s.loading.allCC = false; s.allCCList = a.payload; })
            .addCase(fetchAllPerformingActiveCCForAccrued.rejected, (s, a) => { s.loading.allCC = false; s.errors.allCC = a.payload; });

        // Save
        builder
            .addCase(submitAccruedInterestConfig.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitAccruedInterestConfig.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult = a.payload;
                const row = s.configList.find(r => r.code === a.payload.code);
                if (row) {
                    row.interestRate = a.payload.interestRate;
                    row.amount = a.payload.amount;
                } else {
                    s.configList.push({
                        id:           a.payload.id || 0,
                        code:         a.payload.code,
                        name:         a.payload.name || a.payload.code,
                        interestRate: a.payload.interestRate,
                        amount:       a.payload.amount,
                    });
                }
            })
            .addCase(submitAccruedInterestConfig.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearAccruedInterestSaveResult,
    resetAccruedInterestConfig,
} = accruedInterestConfigSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectAccruedConfigList    = s => s.accruedInterestConfig.configList;
export const selectAccruedListLoading   = s => s.accruedInterestConfig.loading.list;
export const selectAccruedListError     = s => s.accruedInterestConfig.errors.list;

export const selectAccruedAllCCList     = s => s.accruedInterestConfig.allCCList;
export const selectAccruedAllCCLoading  = s => s.accruedInterestConfig.loading.allCC;

export const selectAccruedSaveLoading   = s => s.accruedInterestConfig.loading.save;
export const selectAccruedSaveResult    = s => s.accruedInterestConfig.saveResult;
export const selectAccruedSaveError     = s => s.accruedInterestConfig.errors.save;

export default accruedInterestConfigSlice.reducer;
