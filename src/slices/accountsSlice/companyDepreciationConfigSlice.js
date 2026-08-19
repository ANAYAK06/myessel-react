import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAllFinancialYears,
    getCDConfigView,
    saveCompanyDepreciationConfig,
} from '../../api/AccountsAPI/companyDepreciationConfigAPI';

// The Type query param this page always uses when calling GetCDConfigview / SaveCompanyDepreciationConfig
const CD_TYPE = 'Get';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCDFinancialYears = createAsyncThunk(
    'companyDepreciationConfig/fetchCDFinancialYears',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllFinancialYears();
            const list = res.data?.Data || [];
            return list.map(y => ({
                year:      y.Year,
                yearValue: y.YearValue,
                startYear: y.StartYear,
            }));
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load financial years');
        }
    }
);

export const fetchCDConfigView = createAsyncThunk(
    'companyDepreciationConfig/fetchCDConfigView',
    async ({ fYear, prevYear }, { rejectWithValue }) => {
        try {
            const res = await getCDConfigView({ FYear: fYear, PrevYear: prevYear, Type: CD_TYPE });
            const list = res.data?.Data || [];
            return list.map(row => ({
                id:                     row.Id,
                subDcaCode:             row.Subdcacode,
                description:            row.Description,
                percentage:             row.Percentage,
                previousYearPercentage: row.previousyearpercentage,
                type:                   row.Type,
            }));
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load depreciation config');
        }
    }
);

export const submitCompanyDepreciationConfig = createAsyncThunk(
    'companyDepreciationConfig/submitCompanyDepreciationConfig',
    async ({ fYear, subDcas, percentages, createdBy }, { rejectWithValue }) => {
        try {
            const res = await saveCompanyDepreciationConfig({
                Fyear:       fYear,
                Type:        CD_TYPE,
                SubDCAs:     subDcas.join(','),
                Percentages: percentages.join(','),
                Createdby:   createdBy,
            });
            const data = res.data?.Data;
            const status = typeof data === 'string' ? data : (res.data?.Message || '');
            const ok = ['submited', 'submitted', 'success', 'successfull'].includes(status.toLowerCase());
            if (!ok) {
                return rejectWithValue(status || 'Failed to save the depreciation config');
            }
            return { fYear, subDcas, percentages };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save the depreciation config');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    financialYears: [],
    configList: [],
    saveResult: null,

    loading: {
        years:  false,
        config: false,
        save:   false,
    },
    errors: {
        years:  null,
        config: null,
        save:   null,
    },
};

const companyDepreciationConfigSlice = createSlice({
    name: 'companyDepreciationConfig',
    initialState,
    reducers: {
        clearCDSaveResult: (state) => { state.saveResult = null; state.errors.save = null; },
        resetCompanyDepreciationConfig: () => initialState,
    },
    extraReducers: (builder) => {
        // Financial years
        builder
            .addCase(fetchCDFinancialYears.pending, s => { s.loading.years = true; s.errors.years = null; })
            .addCase(fetchCDFinancialYears.fulfilled, (s, a) => { s.loading.years = false; s.financialYears = a.payload; })
            .addCase(fetchCDFinancialYears.rejected, (s, a) => { s.loading.years = false; s.errors.years = a.payload; });

        // Config view for a financial year
        builder
            .addCase(fetchCDConfigView.pending, s => { s.loading.config = true; s.errors.config = null; })
            .addCase(fetchCDConfigView.fulfilled, (s, a) => { s.loading.config = false; s.configList = a.payload; })
            .addCase(fetchCDConfigView.rejected, (s, a) => { s.loading.config = false; s.errors.config = a.payload; });

        // Save
        builder
            .addCase(submitCompanyDepreciationConfig.pending, s => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitCompanyDepreciationConfig.fulfilled, (s, a) => {
                s.loading.save = false;
                s.saveResult = a.payload;
                const { subDcas, percentages } = a.payload;
                subDcas.forEach((code, idx) => {
                    const row = s.configList.find(r => r.subDcaCode === code);
                    if (row) row.percentage = percentages[idx];
                });
            })
            .addCase(submitCompanyDepreciationConfig.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearCDSaveResult,
    resetCompanyDepreciationConfig,
} = companyDepreciationConfigSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCDFinancialYears = s => s.companyDepreciationConfig.financialYears;
export const selectCDYearsLoading   = s => s.companyDepreciationConfig.loading.years;
export const selectCDYearsError     = s => s.companyDepreciationConfig.errors.years;

export const selectCDConfigList     = s => s.companyDepreciationConfig.configList;
export const selectCDConfigLoading  = s => s.companyDepreciationConfig.loading.config;
export const selectCDConfigError    = s => s.companyDepreciationConfig.errors.config;

export const selectCDSaveLoading    = s => s.companyDepreciationConfig.loading.save;
export const selectCDSaveResult     = s => s.companyDepreciationConfig.saveResult;
export const selectCDSaveError      = s => s.companyDepreciationConfig.errors.save;

export default companyDepreciationConfigSlice.reducer;
