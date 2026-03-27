import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getMRRForUser,
    getVendorDetailsByMRR,
    getCompanyGSTNos,
    getItemsByMRRNo,
    getAnlyzeTaxByMRRNo,
    getSupplierPOTransportDCA,
    getSupplierOtherDeductionDCA,
    checkSupplierInvoiceBudget,
    saveSupplierPOInvoice,
} from '../../api/SupplierPOAPI/supplierPOInvoiceAPI';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchMRRForUser = createAsyncThunk(
    'supplierPOInvoice/fetchMRRForUser',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const res = await getMRRForUser(roleId, userId);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchVendorDetailsByMRR = createAsyncThunk(
    'supplierPOInvoice/fetchVendorDetailsByMRR',
    async (mrrNo, { rejectWithValue }) => {
        try {
            const res = await getVendorDetailsByMRR(mrrNo);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchCompanyGSTNos = createAsyncThunk(
    'supplierPOInvoice/fetchCompanyGSTNos',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos();
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchItemsByMRRNo = createAsyncThunk(
    'supplierPOInvoice/fetchItemsByMRRNo',
    async (params, { rejectWithValue }) => {
        try {
            const res = await getItemsByMRRNo(params);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchAnlyzeTax = createAsyncThunk(
    'supplierPOInvoice/fetchAnlyzeTax',
    async (params, { rejectWithValue }) => {
        try {
            const res = await getAnlyzeTaxByMRRNo(params);
            return res.data?.Data || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchTransportDCAs = createAsyncThunk(
    'supplierPOInvoice/fetchTransportDCAs',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getSupplierPOTransportDCA();
            return res.data?.Data || null; // { lstDCA, lstSubDCA }
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchOtherChargeDCAs = createAsyncThunk(
    'supplierPOInvoice/fetchOtherChargeDCAs',
    async (mrrNo, { rejectWithValue }) => {
        try {
            const res = await getSupplierOtherDeductionDCA(mrrNo, 'Other');
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const fetchDeductionDCAs = createAsyncThunk(
    'supplierPOInvoice/fetchDeductionDCAs',
    async (mrrNo, { rejectWithValue }) => {
        try {
            const res = await getSupplierOtherDeductionDCA(mrrNo, 'Deduction');
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const checkBudget = createAsyncThunk(
    'supplierPOInvoice/checkBudget',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await checkSupplierInvoiceBudget(payload);
            return res.data?.Data ?? res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

export const submitSupplierPOInvoice = createAsyncThunk(
    'supplierPOInvoice/submitSupplierPOInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveSupplierPOInvoice(payload);
            // Return the full response so the caller can check IsSuccessful
            return res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
    mrrList:         [],
    vendorDetails:   null,  // { VendorCode, VendorName, DcaCode, vendorTaxlist, PONo, CCCode, Advance, isAssetPO }
    companyGSTNos:   [],
    itemsData:       null,  // { MRRItemData[], CGSTTotal, SGSTTotal, IGSTTotal, ItemTotal, lstTransportDCA, lstOtherDCA, igstapplicable }
    taxAnalysis:     null,
    transportDCAs:   null,  // { lstDCA, lstSubDCA }
    otherChargeDCAs: [],
    deductionDCAs:   [],
    budgetResult:    null,
    saveResult:      null,
    loading: {
        mrrList:         false,
        vendorDetails:   false,
        companyGST:      false,
        itemsData:       false,
        taxAnalysis:     false,
        transportDCAs:   false,
        otherDCAs:       false,
        deductionDCAs:   false,
        budget:          false,
        save:            false,
    },
    errors: {
        mrrList:         null,
        vendorDetails:   null,
        companyGST:      null,
        itemsData:       null,
        taxAnalysis:     null,
        transportDCAs:   null,
        otherDCAs:       null,
        deductionDCAs:   null,
        budget:          null,
        save:            null,
    },
};

const supplierPOInvoiceSlice = createSlice({
    name: 'supplierPOInvoice',
    initialState,
    reducers: {
        clearVendorDetails:  (s) => { s.vendorDetails = null;   s.errors.vendorDetails = null; },
        clearItemsData:      (s) => { s.itemsData = null;       s.errors.itemsData = null; },
        clearTaxAnalysis:    (s) => { s.taxAnalysis = null;     s.errors.taxAnalysis = null; },
        clearBudgetResult:   (s) => { s.budgetResult = null;    s.errors.budget = null; },
        clearSaveResult:     (s) => { s.saveResult = null;      s.errors.save = null; },
        resetSupplierPOInvoice: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMRRForUser.pending,   s => { s.loading.mrrList = true;  s.errors.mrrList = null; s.mrrList = []; })
            .addCase(fetchMRRForUser.fulfilled, (s, a) => { s.loading.mrrList = false; s.mrrList = a.payload; })
            .addCase(fetchMRRForUser.rejected,  (s, a) => { s.loading.mrrList = false; s.errors.mrrList = a.payload; });

        builder
            .addCase(fetchVendorDetailsByMRR.pending,   s => { s.loading.vendorDetails = true;  s.errors.vendorDetails = null; s.vendorDetails = null; })
            .addCase(fetchVendorDetailsByMRR.fulfilled, (s, a) => { s.loading.vendorDetails = false; s.vendorDetails = a.payload; })
            .addCase(fetchVendorDetailsByMRR.rejected,  (s, a) => { s.loading.vendorDetails = false; s.errors.vendorDetails = a.payload; });

        builder
            .addCase(fetchCompanyGSTNos.pending,   s => { s.loading.companyGST = true;  s.errors.companyGST = null; s.companyGSTNos = []; })
            .addCase(fetchCompanyGSTNos.fulfilled, (s, a) => { s.loading.companyGST = false; s.companyGSTNos = a.payload; })
            .addCase(fetchCompanyGSTNos.rejected,  (s, a) => { s.loading.companyGST = false; s.errors.companyGST = a.payload; });

        builder
            .addCase(fetchItemsByMRRNo.pending,   s => { s.loading.itemsData = true;  s.errors.itemsData = null; s.itemsData = null; })
            .addCase(fetchItemsByMRRNo.fulfilled, (s, a) => { s.loading.itemsData = false; s.itemsData = a.payload; })
            .addCase(fetchItemsByMRRNo.rejected,  (s, a) => { s.loading.itemsData = false; s.errors.itemsData = a.payload; });

        builder
            .addCase(fetchAnlyzeTax.pending,   s => { s.loading.taxAnalysis = true;  s.errors.taxAnalysis = null; s.taxAnalysis = null; })
            .addCase(fetchAnlyzeTax.fulfilled, (s, a) => { s.loading.taxAnalysis = false; s.taxAnalysis = a.payload; })
            .addCase(fetchAnlyzeTax.rejected,  (s, a) => { s.loading.taxAnalysis = false; s.errors.taxAnalysis = a.payload; });

        builder
            .addCase(fetchTransportDCAs.pending,   s => { s.loading.transportDCAs = true;  s.errors.transportDCAs = null; })
            .addCase(fetchTransportDCAs.fulfilled, (s, a) => { s.loading.transportDCAs = false; s.transportDCAs = a.payload; })
            .addCase(fetchTransportDCAs.rejected,  (s, a) => { s.loading.transportDCAs = false; s.errors.transportDCAs = a.payload; });

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
            .addCase(submitSupplierPOInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitSupplierPOInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitSupplierPOInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearVendorDetails,
    clearItemsData,
    clearTaxAnalysis,
    clearBudgetResult,
    clearSaveResult,
    resetSupplierPOInvoice,
} = supplierPOInvoiceSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSupInvMRRList          = s => s.supplierPOInvoice.mrrList;
export const selectSupInvVendorDetails    = s => s.supplierPOInvoice.vendorDetails;
export const selectSupInvCompanyGSTNos    = s => s.supplierPOInvoice.companyGSTNos;
export const selectSupInvItemsData        = s => s.supplierPOInvoice.itemsData;
export const selectSupInvTaxAnalysis      = s => s.supplierPOInvoice.taxAnalysis;
export const selectSupInvTransportDCAs    = s => s.supplierPOInvoice.transportDCAs;
export const selectSupInvOtherDCAs        = s => s.supplierPOInvoice.otherChargeDCAs;
export const selectSupInvDeductionDCAs    = s => s.supplierPOInvoice.deductionDCAs;
export const selectSupInvBudgetResult     = s => s.supplierPOInvoice.budgetResult;
export const selectSupInvSaveResult       = s => s.supplierPOInvoice.saveResult;

export const selectSupInvMRRListLoading       = s => s.supplierPOInvoice.loading.mrrList;
export const selectSupInvVendorDetailsLoading = s => s.supplierPOInvoice.loading.vendorDetails;
export const selectSupInvCompanyGSTLoading    = s => s.supplierPOInvoice.loading.companyGST;
export const selectSupInvItemsDataLoading     = s => s.supplierPOInvoice.loading.itemsData;
export const selectSupInvTaxAnalysisLoading   = s => s.supplierPOInvoice.loading.taxAnalysis;
export const selectSupInvTransportDCAsLoading = s => s.supplierPOInvoice.loading.transportDCAs;
export const selectSupInvOtherDCAsLoading     = s => s.supplierPOInvoice.loading.otherDCAs;
export const selectSupInvDeductionDCAsLoading = s => s.supplierPOInvoice.loading.deductionDCAs;
export const selectSupInvBudgetLoading        = s => s.supplierPOInvoice.loading.budget;
export const selectSupInvSaveLoading          = s => s.supplierPOInvoice.loading.save;
export const selectSupInvSaveError            = s => s.supplierPOInvoice.errors.save;
export const selectSupInvBudgetError          = s => s.supplierPOInvoice.errors.budget;

export default supplierPOInvoiceSlice.reducer;
