import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/labourCMSPaymentAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchCCList = createAsyncThunk(
    'labourCMSPayment/fetchCCList',
    async ({ month, year }, { rejectWithValue }) => {
        try {
            const res = await api.getCCList(month, year);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch CC list');
        }
    }
);

export const fetchContractors = createAsyncThunk(
    'labourCMSPayment/fetchContractors',
    async ({ ccCode, month, year }, { rejectWithValue }) => {
        try {
            const res = await api.getContractors(ccCode, month, year);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch contractors');
        }
    }
);

export const fetchPOList = createAsyncThunk(
    'labourCMSPayment/fetchPOList',
    async ({ contractorCode, ccCode }, { rejectWithValue }) => {
        try {
            const res = await api.getPOList(contractorCode, ccCode);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch PO list');
        }
    }
);

export const fetchConsolidateTransNos = createAsyncThunk(
    'labourCMSPayment/fetchConsolidateTransNos',
    async ({ month, year, ccCode }, { rejectWithValue }) => {
        try {
            const res = await api.getConsolidateTransNos(month, year, ccCode);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch consolidate trans nos');
        }
    }
);

export const fetchWorkerGrid = createAsyncThunk(
    'labourCMSPayment/fetchWorkerGrid',
    async ({ conslidateTransNo, labourType, contractorCode }, { rejectWithValue }) => {
        try {
            const res = await api.getWorkerGrid(conslidateTransNo, labourType, contractorCode);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch worker grid');
        }
    }
);

export const saveLabourCMSPayment = createAsyncThunk(
    'labourCMSPayment/save',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.saveLabourCMS(payload);
            return res;
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to save Labour CMS payment');
        }
    }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    ccList: [],
    consolidateTransNos: [],
    contractors: [],
    poList: [],
    workerGrid: [],
    saveResult: null,

    loading: {
        ccList: false,
        consolidateTransNos: false,
        contractors: false,
        poList: false,
        workerGrid: false,
        save: false,
    },
    errors: {
        ccList: null,
        consolidateTransNos: null,
        contractors: null,
        poList: null,
        workerGrid: null,
        save: null,
    },

    selectedMonth: '',
    selectedYear: '',
    selectedCCCode: '',
    selectedConsolidateTransNo: null,
    selectedContractorCode: '',
    selectedPO: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const labourCMSPaymentSlice = createSlice({
    name: 'labourCMSPayment',
    initialState,
    reducers: {
        setSelectedMonth: (state, action) => { state.selectedMonth = action.payload; },
        setSelectedYear: (state, action) => { state.selectedYear = action.payload; },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
            state.consolidateTransNos = [];
            state.selectedConsolidateTransNo = null;
            state.contractors = [];
            state.poList = [];
            state.workerGrid = [];
            state.selectedContractorCode = '';
            state.selectedPO = null;
        },
        setSelectedConsolidateTransNo: (state, action) => {
            state.selectedConsolidateTransNo = action.payload;
            state.workerGrid = [];
        },
        setSelectedContractorCode: (state, action) => {
            state.selectedContractorCode = action.payload;
            state.poList = [];
            state.workerGrid = [];
            state.selectedPO = null;
        },
        setSelectedPO: (state, action) => {
            state.selectedPO = action.payload;
            state.workerGrid = [];
        },
        clearSaveResult: (state) => { state.saveResult = null; },
        resetAll: () => initialState,
        resetFromCC: (state) => {
            state.selectedCCCode = '';
            state.selectedContractorCode = '';
            state.selectedPO = null;
            state.contractors = [];
            state.poList = [];
            state.workerGrid = [];
            state.saveResult = null;
        },
    },
    extraReducers: (builder) => {
        const pending = (key) => (state) => {
            state.loading[key] = true;
            state.errors[key] = null;
        };
        const rejected = (key) => (state, action) => {
            state.loading[key] = false;
            state.errors[key] = action.payload;
        };

        builder
            .addCase(fetchCCList.pending, pending('ccList'))
            .addCase(fetchCCList.fulfilled, (state, action) => {
                state.loading.ccList = false;
                const raw = action.payload?.Data || [];
                const seen = new Set();
                state.ccList = raw.filter(cc => {
                    const code = cc.CC_Code || cc.CCCode || cc.Code;
                    if (seen.has(code)) return false;
                    seen.add(code);
                    return true;
                });
            })
            .addCase(fetchCCList.rejected, rejected('ccList'))

            .addCase(fetchConsolidateTransNos.pending, pending('consolidateTransNos'))
            .addCase(fetchConsolidateTransNos.fulfilled, (state, action) => {
                state.loading.consolidateTransNos = false;
                state.consolidateTransNos = action.payload?.Data || [];
                // auto-select when only one entry exists
                if (state.consolidateTransNos.length === 1) {
                    const t = state.consolidateTransNos[0];
                    state.selectedConsolidateTransNo = t.ConslidateTransNo ?? t.ConsolidateTransNo ?? null;
                }
            })
            .addCase(fetchConsolidateTransNos.rejected, rejected('consolidateTransNos'))

            .addCase(fetchContractors.pending, pending('contractors'))
            .addCase(fetchContractors.fulfilled, (state, action) => {
                state.loading.contractors = false;
                state.contractors = action.payload?.Data || [];
            })
            .addCase(fetchContractors.rejected, rejected('contractors'))

            .addCase(fetchPOList.pending, pending('poList'))
            .addCase(fetchPOList.fulfilled, (state, action) => {
                state.loading.poList = false;
                state.poList = action.payload?.Data || [];
            })
            .addCase(fetchPOList.rejected, rejected('poList'))

            .addCase(fetchWorkerGrid.pending, pending('workerGrid'))
            .addCase(fetchWorkerGrid.fulfilled, (state, action) => {
                state.loading.workerGrid = false;
                state.workerGrid = action.payload?.Data || [];
            })
            .addCase(fetchWorkerGrid.rejected, rejected('workerGrid'))

            .addCase(saveLabourCMSPayment.pending, pending('save'))
            .addCase(saveLabourCMSPayment.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult = action.payload;
            })
            .addCase(saveLabourCMSPayment.rejected, rejected('save'));
    },
});

export const {
    setSelectedMonth,
    setSelectedYear,
    setSelectedCCCode,
    setSelectedConsolidateTransNo,
    setSelectedContractorCode,
    setSelectedPO,
    clearSaveResult,
    resetAll,
    resetFromCC,
} = labourCMSPaymentSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCCList = (state) => state.labourCMSPayment.ccList;
export const selectConsolidateTransNos = (state) => state.labourCMSPayment.consolidateTransNos;
export const selectContractors = (state) => state.labourCMSPayment.contractors;
export const selectPOList = (state) => state.labourCMSPayment.poList;
export const selectWorkerGrid = (state) => state.labourCMSPayment.workerGrid;
export const selectSaveResult = (state) => state.labourCMSPayment.saveResult;

export const selectCCListLoading = (state) => state.labourCMSPayment.loading.ccList;
export const selectConsolidateTransNosLoading = (state) => state.labourCMSPayment.loading.consolidateTransNos;
export const selectContractorsLoading = (state) => state.labourCMSPayment.loading.contractors;
export const selectPOListLoading = (state) => state.labourCMSPayment.loading.poList;
export const selectWorkerGridLoading = (state) => state.labourCMSPayment.loading.workerGrid;
export const selectSaveLoading = (state) => state.labourCMSPayment.loading.save;

export const selectCCListError = (state) => state.labourCMSPayment.errors.ccList;
export const selectConsolidateTransNosError = (state) => state.labourCMSPayment.errors.consolidateTransNos;
export const selectContractorsError = (state) => state.labourCMSPayment.errors.contractors;
export const selectPOListError = (state) => state.labourCMSPayment.errors.poList;
export const selectWorkerGridError = (state) => state.labourCMSPayment.errors.workerGrid;

export const selectSelectedMonth = (state) => state.labourCMSPayment.selectedMonth;
export const selectSelectedYear = (state) => state.labourCMSPayment.selectedYear;
export const selectSelectedCCCode = (state) => state.labourCMSPayment.selectedCCCode;
export const selectSelectedConsolidateTransNo = (state) => state.labourCMSPayment.selectedConsolidateTransNo;
export const selectSelectedContractorCode = (state) => state.labourCMSPayment.selectedContractorCode;
export const selectSelectedPO = (state) => state.labourCMSPayment.selectedPO;

export default labourCMSPaymentSlice.reducer;
