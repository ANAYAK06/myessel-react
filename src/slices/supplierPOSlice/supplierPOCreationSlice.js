import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getSupplierIndents,
    checkIfPartIndentExist,
    getSupplierPOGridData,
    getSupplierVendors,
    checkBudgetForSupplierPO,
    saveSupplierPO,
    getAllItemTermHeads,
    getTermRemarksByHead,
} from '../../api/SupplierPOAPI/supplierPOCreationAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchSupplierIndents = createAsyncThunk(
    'supplierPOCreation/fetchSupplierIndents',
    async ({ roleId, userId, ccType }, { rejectWithValue }) => {
        try {
            const res = await getSupplierIndents(roleId, userId, ccType);
            return res.data?.Data || res.data || {};
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const checkPartIndentExist = createAsyncThunk(
    'supplierPOCreation/checkPartIndentExist',
    async (indentNo, { rejectWithValue }) => {
        try {
            const res = await checkIfPartIndentExist(indentNo);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchPOGridData = createAsyncThunk(
    'supplierPOCreation/fetchPOGridData',
    async (indentNo, { rejectWithValue }) => {
        try {
            const res = await getSupplierPOGridData(indentNo);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchSupplierVendors = createAsyncThunk(
    'supplierPOCreation/fetchSupplierVendors',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getSupplierVendors();
            return res.data?.Data || res.data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const checkPOBudget = createAsyncThunk(
    'supplierPOCreation/checkPOBudget',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await checkBudgetForSupplierPO(payload);
            return res.data ?? res;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitSupplierPO = createAsyncThunk(
    'supplierPOCreation/submitSupplierPO',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveSupplierPO(payload);
            return res.data ?? res;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchTermHeads = createAsyncThunk(
    'supplierPOCreation/fetchTermHeads',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getAllItemTermHeads();
            return res.data?.Data || res.data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchTermRemarks = createAsyncThunk(
    'supplierPOCreation/fetchTermRemarks',
    async ({ headName, headId }, { rejectWithValue }) => {
        try {
            const res = await getTermRemarksByHead(headName, headId);
            return res.data?.Data || res.data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    indentList: [],
    partIndentList: [],
    partIndentCheck: null,
    gridData: [],
    vendors: [],
    termHeads: [],
    termRemarks: [],
    budgetResult: null,
    saveResult: null,
    loading: {
        indents: false,
        partIndentCheck: false,
        gridData: false,
        vendors: false,
        termHeads: false,
        termRemarks: false,
        budget: false,
        save: false,
    },
    errors: {
        indents: null,
        partIndentCheck: null,
        gridData: null,
        vendors: null,
        termHeads: null,
        termRemarks: null,
        budget: null,
        save: null,
    },
};

const supplierPOCreationSlice = createSlice({
    name: 'supplierPOCreation',
    initialState,
    reducers: {
        clearPartIndentCheck: (state) => {
            state.partIndentCheck = null;
            state.errors.partIndentCheck = null;
        },
        clearGridData: (state) => {
            state.gridData = [];
            state.errors.gridData = null;
        },
        clearTermRemarks: (state) => {
            state.termRemarks = [];
        },
        clearBudgetResult: (state) => {
            state.budgetResult = null;
            state.errors.budget = null;
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.errors.save = null;
        },
        resetCreation: () => initialState,
    },
    extraReducers: (builder) => {
        // fetchSupplierIndents
        builder
            .addCase(fetchSupplierIndents.pending, (s) => { s.loading.indents = true; s.errors.indents = null; })
            .addCase(fetchSupplierIndents.fulfilled, (s, a) => {
                s.loading.indents = false;
                s.indentList = a.payload.Indentlist || [];
                s.partIndentList = a.payload.PartIndentlist || [];
            })
            .addCase(fetchSupplierIndents.rejected, (s, a) => { s.loading.indents = false; s.errors.indents = a.payload; });

        // checkPartIndentExist
        builder
            .addCase(checkPartIndentExist.pending, (s) => { s.loading.partIndentCheck = true; s.errors.partIndentCheck = null; s.partIndentCheck = null; })
            .addCase(checkPartIndentExist.fulfilled, (s, a) => { s.loading.partIndentCheck = false; s.partIndentCheck = a.payload; })
            .addCase(checkPartIndentExist.rejected, (s, a) => { s.loading.partIndentCheck = false; s.errors.partIndentCheck = a.payload; });

        // fetchPOGridData
        builder
            .addCase(fetchPOGridData.pending, (s) => { s.loading.gridData = true; s.errors.gridData = null; s.gridData = []; })
            .addCase(fetchPOGridData.fulfilled, (s, a) => { s.loading.gridData = false; s.gridData = a.payload; })
            .addCase(fetchPOGridData.rejected, (s, a) => { s.loading.gridData = false; s.errors.gridData = a.payload; });

        // fetchSupplierVendors
        builder
            .addCase(fetchSupplierVendors.pending, (s) => { s.loading.vendors = true; s.errors.vendors = null; })
            .addCase(fetchSupplierVendors.fulfilled, (s, a) => { s.loading.vendors = false; s.vendors = a.payload; })
            .addCase(fetchSupplierVendors.rejected, (s, a) => { s.loading.vendors = false; s.errors.vendors = a.payload; });

        // checkPOBudget
        builder
            .addCase(checkPOBudget.pending, (s) => { s.loading.budget = true; s.errors.budget = null; s.budgetResult = null; })
            .addCase(checkPOBudget.fulfilled, (s, a) => { s.loading.budget = false; s.budgetResult = a.payload; })
            .addCase(checkPOBudget.rejected, (s, a) => { s.loading.budget = false; s.errors.budget = a.payload; });

        // submitSupplierPO
        builder
            .addCase(submitSupplierPO.pending, (s) => { s.loading.save = true; s.errors.save = null; s.saveResult = null; })
            .addCase(submitSupplierPO.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitSupplierPO.rejected, (s, a) => { s.loading.save = false; s.errors.save = a.payload; });

        // fetchTermHeads
        builder
            .addCase(fetchTermHeads.pending, (s) => { s.loading.termHeads = true; s.errors.termHeads = null; })
            .addCase(fetchTermHeads.fulfilled, (s, a) => { s.loading.termHeads = false; s.termHeads = a.payload; })
            .addCase(fetchTermHeads.rejected, (s, a) => { s.loading.termHeads = false; s.errors.termHeads = a.payload; });

        // fetchTermRemarks
        builder
            .addCase(fetchTermRemarks.pending, (s) => { s.loading.termRemarks = true; s.errors.termRemarks = null; })
            .addCase(fetchTermRemarks.fulfilled, (s, a) => { s.loading.termRemarks = false; s.termRemarks = a.payload; })
            .addCase(fetchTermRemarks.rejected, (s, a) => { s.loading.termRemarks = false; s.errors.termRemarks = a.payload; });
    },
});

export const {
    clearPartIndentCheck,
    clearGridData,
    clearTermRemarks,
    clearBudgetResult,
    clearSaveResult,
    resetCreation,
} = supplierPOCreationSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectIndentList        = (s) => s.supplierPOCreation.indentList;
export const selectPartIndentList    = (s) => s.supplierPOCreation.partIndentList;
export const selectPartIndentCheck   = (s) => s.supplierPOCreation.partIndentCheck;
export const selectPOGridData        = (s) => s.supplierPOCreation.gridData;
export const selectVendors           = (s) => s.supplierPOCreation.vendors;
export const selectTermHeads         = (s) => s.supplierPOCreation.termHeads;
export const selectTermRemarks       = (s) => s.supplierPOCreation.termRemarks;
export const selectBudgetResult      = (s) => s.supplierPOCreation.budgetResult;
export const selectSaveResult        = (s) => s.supplierPOCreation.saveResult;
export const selectPOCreationLoading = (s) => s.supplierPOCreation.loading;
export const selectPOCreationErrors  = (s) => s.supplierPOCreation.errors;

export default supplierPOCreationSlice.reducer;
