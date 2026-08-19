import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getClientPOLockPercentList,
    getClientPOPercentageByCode,
    saveCCClientPOPercentDetails,
    getCostCentersByTypeByRole,
} from '../../api/AccountsAPI/clientPOBudgetLimitConfigAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchClientPOLockPercentList = createAsyncThunk(
    'clientPOBudgetLimitConfig/fetchClientPOLockPercentList',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getClientPOLockPercentList();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load Client PO lock percent list');
        }
    }
);

export const fetchClientPOPercentageByCode = createAsyncThunk(
    'clientPOBudgetLimitConfig/fetchClientPOPercentageByCode',
    async (code, { rejectWithValue }) => {
        try {
            const res = await getClientPOPercentageByCode(code);
            const row = res.data?.Data?.[0] || null;
            return row;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load Client PO percentage');
        }
    }
);

export const submitCCClientPOPercent = createAsyncThunk(
    'clientPOBudgetLimitConfig/submitCCClientPOPercent',
    async ({ code, value, Createdby, name }, { rejectWithValue }) => {
        try {
            const res = await saveCCClientPOPercentDetails({ code, value, Createdby });
            const data = res.data?.Data;
            const status = typeof data === 'string' ? data : (res.data?.Message || '');
            if (status && status.toLowerCase() !== 'successfull' && status.toLowerCase() !== 'success') {
                return rejectWithValue(status);
            }
            return { code, value, name };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save Client PO percent');
        }
    }
);

/** 4. GET cost centres by type/role — used to find CCs (Performing, Active) that have no
 *  configured Client PO limit yet, so they can be added from the UI. */
export const fetchAllPerformingActiveCC = createAsyncThunk(
    'clientPOBudgetLimitConfig/fetchAllPerformingActiveCC',
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

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    lockPercentList: [],
    allCCList: [],
    saveResult: null,

    loading: {
        list: false,
        save: false,
        allCC: false,
    },
    errors: {
        list: null,
        save: null,
        allCC: null,
    },
};

const clientPOBudgetLimitConfigSlice = createSlice({
    name: 'clientPOBudgetLimitConfig',
    initialState,
    reducers: {
        clearSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        resetClientPOBudgetLimitConfig: () => initialState,
    },
    extraReducers: (builder) => {
        // List
        builder
            .addCase(fetchClientPOLockPercentList.pending, s => { s.loading.list = true; s.errors.list = null; })
            .addCase(fetchClientPOLockPercentList.fulfilled, (s, a) => { s.loading.list = false; s.lockPercentList = a.payload; })
            .addCase(fetchClientPOLockPercentList.rejected, (s, a) => { s.loading.list = false; s.errors.list = a.payload; });

        // Save
        builder
            .addCase(submitCCClientPOPercent.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitCCClientPOPercent.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult = a.payload;
                const row = s.lockPercentList.find(r => r.code === a.payload.code);
                if (row) {
                    row.value = a.payload.value;
                } else {
                    s.lockPercentList.push({
                        code: a.payload.code,
                        name: a.payload.name || a.payload.code,
                        value: a.payload.value,
                    });
                }
            })
            .addCase(submitCCClientPOPercent.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });

        // All performing/active cost centres (for cross-verification against lockPercentList)
        builder
            .addCase(fetchAllPerformingActiveCC.pending, s => { s.loading.allCC = true; s.errors.allCC = null; })
            .addCase(fetchAllPerformingActiveCC.fulfilled, (s, a) => { s.loading.allCC = false; s.allCCList = a.payload; })
            .addCase(fetchAllPerformingActiveCC.rejected, (s, a) => { s.loading.allCC = false; s.errors.allCC = a.payload; });
    },
});

export const {
    clearSaveResult,
    resetClientPOBudgetLimitConfig,
} = clientPOBudgetLimitConfigSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectLockPercentList = s => s.clientPOBudgetLimitConfig.lockPercentList;
export const selectListLoading     = s => s.clientPOBudgetLimitConfig.loading.list;
export const selectListError       = s => s.clientPOBudgetLimitConfig.errors.list;
export const selectSaveLoading     = s => s.clientPOBudgetLimitConfig.loading.save;
export const selectSaveError       = s => s.clientPOBudgetLimitConfig.errors.save;
export const selectSaveResult      = s => s.clientPOBudgetLimitConfig.saveResult;
export const selectAllCCList       = s => s.clientPOBudgetLimitConfig.allCCList;
export const selectAllCCLoading    = s => s.clientPOBudgetLimitConfig.loading.allCC;
export const selectAllCCError      = s => s.clientPOBudgetLimitConfig.errors.allCC;

export default clientPOBudgetLimitConfigSlice.reducer;
