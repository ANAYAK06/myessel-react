import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getServiceVendors,
    getPOForSPPOInvoice,
    getPODetailsForSPPOInvoice,
    getVendorGSTNos,
    getCompanyGSTNos,
    getInvoiceGSTConfig,
    getOtherDeductionDCA,
    checkSPPOInvoiceBudget,
    saveNewSPPOInvoice,
} from '../../api/SpPOAPI/sppoInvoiceAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchServiceVendors = createAsyncThunk(
    'sppoInvoice/fetchServiceVendors',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getServiceVendors();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchPOsForVendor = createAsyncThunk(
    'sppoInvoice/fetchPOsForVendor',
    async (vendorCode, { rejectWithValue }) => {
        try {
            const res = await getPOForSPPOInvoice(vendorCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchPODetails = createAsyncThunk(
    'sppoInvoice/fetchPODetails',
    async (poNo, { rejectWithValue }) => {
        try {
            const res = await getPODetailsForSPPOInvoice(poNo);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchVendorGSTNos = createAsyncThunk(
    'sppoInvoice/fetchVendorGSTNos',
    async (vendorCode, { rejectWithValue }) => {
        try {
            const res = await getVendorGSTNos(vendorCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCompanyGSTNos = createAsyncThunk(
    'sppoInvoice/fetchCompanyGSTNos',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchGSTConfig = createAsyncThunk(
    'sppoInvoice/fetchGSTConfig',
    async (params, { rejectWithValue }) => {
        try {
            const res = await getInvoiceGSTConfig(params);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchOtherChargeDCAs = createAsyncThunk(
    'sppoInvoice/fetchOtherChargeDCAs',
    async ({ ccCode, invDate }, { rejectWithValue }) => {
        try {
            const res = await getOtherDeductionDCA({ ccCode, taxType: 'Other', invDate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchDeductionDCAs = createAsyncThunk(
    'sppoInvoice/fetchDeductionDCAs',
    async ({ ccCode, invDate }, { rejectWithValue }) => {
        try {
            const res = await getOtherDeductionDCA({ ccCode, taxType: 'Deduction', invDate });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const checkBudget = createAsyncThunk(
    'sppoInvoice/checkBudget',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await checkSPPOInvoiceBudget(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitSPPOInvoice = createAsyncThunk(
    'sppoInvoice/submitSPPOInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveNewSPPOInvoice(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    serviceVendors:  [],
    poList:          [],
    poDetails:       null,
    vendorGSTNos:    [],
    companyGSTNos:   [],
    gstConfig:       null,
    otherChargeDCAs: [],
    deductionDCAs:   [],
    budgetResult:    null,
    saveResult:      null,
    loading: {
        serviceVendors: false,
        poList:        false,
        poDetails:     false,
        vendorGST:     false,
        companyGST:    false,
        gstConfig:     false,
        otherDCAs:     false,
        deductionDCAs: false,
        budget:        false,
        save:          false,
    },
    errors: {
        serviceVendors: null,
        poList:        null,
        poDetails:     null,
        vendorGST:     null,
        companyGST:    null,
        gstConfig:     null,
        otherDCAs:     null,
        deductionDCAs: null,
        budget:        null,
        save:          null,
    },
};

const sppoInvoiceSlice = createSlice({
    name: 'sppoInvoice',
    initialState,
    reducers: {
        clearPOList:       (s) => { s.poList = []; s.errors.poList = null; },
        clearPODetails:    (s) => { s.poDetails = null; s.errors.poDetails = null; },
        clearGSTConfig:    (s) => { s.gstConfig = null; s.errors.gstConfig = null; },
        clearBudgetResult: (s) => { s.budgetResult = null; s.errors.budget = null; },
        clearSaveResult:   (s) => { s.saveResult = null; s.errors.save = null; },
        resetSppoInvoice:  () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServiceVendors.pending,   s => { s.loading.serviceVendors = true;  s.errors.serviceVendors = null; })
            .addCase(fetchServiceVendors.fulfilled, (s, a) => { s.loading.serviceVendors = false; s.serviceVendors = a.payload; })
            .addCase(fetchServiceVendors.rejected,  (s, a) => { s.loading.serviceVendors = false; s.errors.serviceVendors = a.payload; });

        builder
            .addCase(fetchPOsForVendor.pending,   s => { s.loading.poList = true;  s.errors.poList = null; s.poList = []; })
            .addCase(fetchPOsForVendor.fulfilled, (s, a) => { s.loading.poList = false; s.poList = a.payload; })
            .addCase(fetchPOsForVendor.rejected,  (s, a) => { s.loading.poList = false; s.errors.poList = a.payload; });

        builder
            .addCase(fetchPODetails.pending,   s => { s.loading.poDetails = true;  s.errors.poDetails = null; s.poDetails = null; })
            .addCase(fetchPODetails.fulfilled, (s, a) => { s.loading.poDetails = false; s.poDetails = a.payload; })
            .addCase(fetchPODetails.rejected,  (s, a) => { s.loading.poDetails = false; s.errors.poDetails = a.payload; });

        builder
            .addCase(fetchVendorGSTNos.pending,   s => { s.loading.vendorGST = true;  s.errors.vendorGST = null; s.vendorGSTNos = []; })
            .addCase(fetchVendorGSTNos.fulfilled, (s, a) => { s.loading.vendorGST = false; s.vendorGSTNos = a.payload; })
            .addCase(fetchVendorGSTNos.rejected,  (s, a) => { s.loading.vendorGST = false; s.errors.vendorGST = a.payload; });

        builder
            .addCase(fetchCompanyGSTNos.pending,   s => { s.loading.companyGST = true;  s.errors.companyGST = null; s.companyGSTNos = []; })
            .addCase(fetchCompanyGSTNos.fulfilled, (s, a) => { s.loading.companyGST = false; s.companyGSTNos = a.payload; })
            .addCase(fetchCompanyGSTNos.rejected,  (s, a) => { s.loading.companyGST = false; s.errors.companyGST = a.payload; });

        builder
            .addCase(fetchGSTConfig.pending,   s => { s.loading.gstConfig = true;  s.errors.gstConfig = null; s.gstConfig = null; })
            .addCase(fetchGSTConfig.fulfilled, (s, a) => { s.loading.gstConfig = false; s.gstConfig = a.payload; })
            .addCase(fetchGSTConfig.rejected,  (s, a) => { s.loading.gstConfig = false; s.errors.gstConfig = a.payload; });

        builder
            .addCase(fetchOtherChargeDCAs.pending,   s => { s.loading.otherDCAs = true;  s.errors.otherDCAs = null; s.otherChargeDCAs = []; })
            .addCase(fetchOtherChargeDCAs.fulfilled, (s, a) => { s.loading.otherDCAs = false; s.otherChargeDCAs = a.payload; })
            .addCase(fetchOtherChargeDCAs.rejected,  (s, a) => { s.loading.otherDCAs = false; s.errors.otherDCAs = a.payload; });

        builder
            .addCase(fetchDeductionDCAs.pending,   s => { s.loading.deductionDCAs = true;  s.errors.deductionDCAs = null; s.deductionDCAs = []; })
            .addCase(fetchDeductionDCAs.fulfilled, (s, a) => { s.loading.deductionDCAs = false; s.deductionDCAs = a.payload; })
            .addCase(fetchDeductionDCAs.rejected,  (s, a) => { s.loading.deductionDCAs = false; s.errors.deductionDCAs = a.payload; });

        builder
            .addCase(checkBudget.pending,   s => { s.loading.budget = true;  s.errors.budget = null; s.budgetResult = null; })
            .addCase(checkBudget.fulfilled, (s, a) => { s.loading.budget = false; s.budgetResult = a.payload; })
            .addCase(checkBudget.rejected,  (s, a) => { s.loading.budget = false; s.errors.budget = a.payload; });

        builder
            .addCase(submitSPPOInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitSPPOInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitSPPOInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearPOList,
    clearPODetails,
    clearGSTConfig,
    clearBudgetResult,
    clearSaveResult,
    resetSppoInvoice,
} = sppoInvoiceSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSPPOInvServiceVendors       = s => s.sppoInvoice.serviceVendors;
export const selectSPPOInvServiceVendorsLoading = s => s.sppoInvoice.loading.serviceVendors;
export const selectSPPOInvPOList         = s => s.sppoInvoice.poList;
export const selectSPPOInvPODetails      = s => s.sppoInvoice.poDetails;
export const selectSPPOInvVendorGSTNos   = s => s.sppoInvoice.vendorGSTNos;
export const selectSPPOInvCompanyGSTNos  = s => s.sppoInvoice.companyGSTNos;
export const selectSPPOInvGSTConfig      = s => s.sppoInvoice.gstConfig;
export const selectSPPOInvOtherDCAs      = s => s.sppoInvoice.otherChargeDCAs;
export const selectSPPOInvDeductionDCAs  = s => s.sppoInvoice.deductionDCAs;
export const selectSPPOInvBudgetResult   = s => s.sppoInvoice.budgetResult;
export const selectSPPOInvSaveResult     = s => s.sppoInvoice.saveResult;

export const selectSPPOInvPOListLoading       = s => s.sppoInvoice.loading.poList;
export const selectSPPOInvPODetailsLoading    = s => s.sppoInvoice.loading.poDetails;
export const selectSPPOInvVendorGSTLoading    = s => s.sppoInvoice.loading.vendorGST;
export const selectSPPOInvCompanyGSTLoading   = s => s.sppoInvoice.loading.companyGST;
export const selectSPPOInvGSTConfigLoading    = s => s.sppoInvoice.loading.gstConfig;
export const selectSPPOInvOtherDCAsLoading    = s => s.sppoInvoice.loading.otherDCAs;
export const selectSPPOInvDeductionDCAsLoading = s => s.sppoInvoice.loading.deductionDCAs;
export const selectSPPOInvBudgetLoading       = s => s.sppoInvoice.loading.budget;
export const selectSPPOInvSaveLoading         = s => s.sppoInvoice.loading.save;
export const selectSPPOInvSaveError           = s => s.sppoInvoice.errors.save;
export const selectSPPOInvBudgetError         = s => s.sppoInvoice.errors.budget;

export default sppoInvoiceSlice.reducer;
