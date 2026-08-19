import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getConfigCCDetails,
    saveCCDayLimitDetails,
} from '../../api/AccountsAPI/ccDayLimitConfigAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCCDayLimitList = createAsyncThunk(
    'ccDayLimitConfig/fetchCCDayLimitList',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getConfigCCDetails();
            const list = res.data?.Data || [];
            return list.map(row => ({
                code:  row.code,
                name:  row.name,
                value: row.value,
            }));
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load CC day limit list');
        }
    }
);

export const submitCCDayLimit = createAsyncThunk(
    'ccDayLimitConfig/submitCCDayLimit',
    async ({ code, value }, { rejectWithValue }) => {
        try {
            const res = await saveCCDayLimitDetails({ code, value });
            const data = res.data?.Data;
            const status = typeof data === 'string' ? data : (res.data?.Message || '');
            if (status && status.toLowerCase() !== 'successfull' && status.toLowerCase() !== 'success') {
                return rejectWithValue(status);
            }
            return { code, value };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save the day limit');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    dayLimitList: [],
    saveResult: null,

    loading: {
        list: false,
        save: false,
    },
    errors: {
        list: null,
        save: null,
    },
};

const ccDayLimitConfigSlice = createSlice({
    name: 'ccDayLimitConfig',
    initialState,
    reducers: {
        clearCCDayLimitSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        resetCCDayLimitConfig: () => initialState,
    },
    extraReducers: (builder) => {
        // List
        builder
            .addCase(fetchCCDayLimitList.pending, s => { s.loading.list = true; s.errors.list = null; })
            .addCase(fetchCCDayLimitList.fulfilled, (s, a) => { s.loading.list = false; s.dayLimitList = a.payload; })
            .addCase(fetchCCDayLimitList.rejected, (s, a) => { s.loading.list = false; s.errors.list = a.payload; });

        // Save
        builder
            .addCase(submitCCDayLimit.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitCCDayLimit.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult = a.payload;
                const row = s.dayLimitList.find(r => r.code === a.payload.code);
                if (row) row.value = a.payload.value;
            })
            .addCase(submitCCDayLimit.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearCCDayLimitSaveResult,
    resetCCDayLimitConfig,
} = ccDayLimitConfigSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCCDayLimitList    = s => s.ccDayLimitConfig.dayLimitList;
export const selectCCDayLimitLoading = s => s.ccDayLimitConfig.loading.list;
export const selectCCDayLimitError   = s => s.ccDayLimitConfig.errors.list;
export const selectCCDLSaveLoading   = s => s.ccDayLimitConfig.loading.save;
export const selectCCDLSaveError     = s => s.ccDayLimitConfig.errors.save;
export const selectCCDLSaveResult    = s => s.ccDayLimitConfig.saveResult;

export default ccDayLimitConfigSlice.reducer;
