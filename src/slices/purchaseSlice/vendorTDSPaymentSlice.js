import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getTDSCostCenterCodes,
    getTDSCategories,
    getTDSSubDCA,
    getTDSITCodes,
    getTDSDetailedReport,
    checkTDSBudget,
    saveTDSPayment,
} from '../../api/PurchaseAPI/vendorTDSPaymentAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchTDSCostCenters = createAsyncThunk(
    'vendorTDSPayment/fetchCostCenters',
    async (params, { rejectWithValue }) => {
        try { return await getTDSCostCenterCodes(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch cost centers'); }
    }
);

export const fetchTDSCategories = createAsyncThunk(
    'vendorTDSPayment/fetchCategories',
    async (_, { rejectWithValue }) => {
        try { return await getTDSCategories(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch categories'); }
    }
);

export const fetchTDSSubDCA = createAsyncThunk(
    'vendorTDSPayment/fetchSubDCA',
    async (_, { rejectWithValue }) => {
        try { return await getTDSSubDCA(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch SubDCA'); }
    }
);

export const fetchTDSITCodes = createAsyncThunk(
    'vendorTDSPayment/fetchITCodes',
    async (_, { rejectWithValue }) => {
        try { return await getTDSITCodes(); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch IT codes'); }
    }
);

export const fetchTDSReport = createAsyncThunk(
    'vendorTDSPayment/fetchReport',
    async (params, { rejectWithValue }) => {
        try { return await getTDSDetailedReport(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch TDS report'); }
    }
);

export const submitTDSBudgetCheck = createAsyncThunk(
    'vendorTDSPayment/checkBudget',
    async (payload, { rejectWithValue }) => {
        try { return await checkTDSBudget(payload); }
        catch (err) { return rejectWithValue(err.message || 'Budget check failed'); }
    }
);

export const submitTDSPayment = createAsyncThunk(
    'vendorTDSPayment/save',
    async (payload, { rejectWithValue }) => {
        try { return await saveTDSPayment(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save TDS payment'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:         [],
    costCentersLoading:  false,

    categories:          [],
    categoriesLoading:   false,

    subDCAs:             [],
    subDCAsLoading:      false,

    itCodes:             [],
    itCodesLoading:      false,

    // Report data — TDSReportData { TDSData, ITData }
    tdsData:             [],
    itData:              [],
    reportLoading:       false,
    reportError:         null,

    // Budget check
    budgetResult:        null,   // raw string from API
    budgetStatus:        null,   // null | 'ok' | 'fail'
    budgetLoading:       false,

    // Save
    saveResult:          null,
    saveStatus:          null,   // null | 'pending' | 'success' | 'failed'
    saveLoading:         false,
    saveError:           null,
};

const vendorTDSPaymentSlice = createSlice({
    name: 'vendorTDSPayment',
    initialState,
    reducers: {
        clearTDSReport:    (s) => { s.tdsData = []; s.itData = []; s.reportError = null; },
        clearBudgetResult: (s) => { s.budgetResult = null; s.budgetStatus = null; },
        clearSaveResult:   (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetTDSPayment:   () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTDSCostCenters.pending,   (s) => { s.costCentersLoading = true; })
            .addCase(fetchTDSCostCenters.fulfilled, (s, a) => { s.costCentersLoading = false; s.costCenters = a.payload?.Data || []; })
            .addCase(fetchTDSCostCenters.rejected,  (s) => { s.costCentersLoading = false; });

        builder
            .addCase(fetchTDSCategories.pending,   (s) => { s.categoriesLoading = true; })
            .addCase(fetchTDSCategories.fulfilled, (s, a) => { s.categoriesLoading = false; s.categories = a.payload?.Data || []; })
            .addCase(fetchTDSCategories.rejected,  (s) => { s.categoriesLoading = false; });

        builder
            .addCase(fetchTDSSubDCA.pending,   (s) => { s.subDCAsLoading = true; })
            .addCase(fetchTDSSubDCA.fulfilled, (s, a) => { s.subDCAsLoading = false; s.subDCAs = a.payload?.Data || []; })
            .addCase(fetchTDSSubDCA.rejected,  (s) => { s.subDCAsLoading = false; });

        builder
            .addCase(fetchTDSITCodes.pending,   (s) => { s.itCodesLoading = true; })
            .addCase(fetchTDSITCodes.fulfilled, (s, a) => { s.itCodesLoading = false; s.itCodes = a.payload?.Data || []; })
            .addCase(fetchTDSITCodes.rejected,  (s) => { s.itCodesLoading = false; });

        builder
            .addCase(fetchTDSReport.pending,   (s) => { s.reportLoading = true; s.reportError = null; s.tdsData = []; s.itData = []; })
            .addCase(fetchTDSReport.fulfilled, (s, a) => {
                s.reportLoading = false;
                const payload = a.payload?.Data || a.payload || {};
                s.tdsData = payload.TDSData || [];
                s.itData  = payload.ITData  || [];
            })
            .addCase(fetchTDSReport.rejected,  (s, a) => { s.reportLoading = false; s.reportError = a.payload; });

        builder
            .addCase(submitTDSBudgetCheck.pending,   (s) => { s.budgetLoading = true; s.budgetResult = null; s.budgetStatus = null; })
            .addCase(submitTDSBudgetCheck.fulfilled, (s, a) => {
                s.budgetLoading = false;
                const raw = a.payload?.Data ?? a.payload ?? '';
                const msg = typeof raw === 'string' ? raw.trim() : '';
                s.budgetResult = msg;
                const lower = msg.toLowerCase();
                const isOk  = a.payload?.IsSuccessful === true ||
                              !msg || lower === 'ok' || lower === 'success' || lower === 'approved' ||
                              lower.includes('sufficient') || lower.includes('sufficent');
                s.budgetStatus = isOk ? 'ok' : 'fail';
            })
            .addCase(submitTDSBudgetCheck.rejected,  (s) => { s.budgetLoading = false; s.budgetStatus = 'fail'; });

        builder
            .addCase(submitTDSPayment.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitTDSPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.split('$')[0] : '';
                s.saveStatus = (msg === 'Submited' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = (typeof raw === 'string' && raw) || 'Payment save failed';
            })
            .addCase(submitTDSPayment.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearTDSReport, clearBudgetResult, clearSaveResult, resetTDSPayment,
} = vendorTDSPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectTDSCostCenters        = (s) => s.vendorTDSPayment.costCenters;
export const selectTDSCostCentersLoading = (s) => s.vendorTDSPayment.costCentersLoading;
export const selectTDSCategories         = (s) => s.vendorTDSPayment.categories;
export const selectTDSCategoriesLoading  = (s) => s.vendorTDSPayment.categoriesLoading;
export const selectTDSSubDCAs            = (s) => s.vendorTDSPayment.subDCAs;
export const selectTDSSubDCAsLoading     = (s) => s.vendorTDSPayment.subDCAsLoading;
export const selectTDSITCodes            = (s) => s.vendorTDSPayment.itCodes;
export const selectTDSITCodesLoading     = (s) => s.vendorTDSPayment.itCodesLoading;
export const selectTDSData               = (s) => s.vendorTDSPayment.tdsData;
export const selectTDSITData             = (s) => s.vendorTDSPayment.itData;
export const selectTDSReportLoading      = (s) => s.vendorTDSPayment.reportLoading;
export const selectTDSReportError        = (s) => s.vendorTDSPayment.reportError;
export const selectTDSBudgetResult       = (s) => s.vendorTDSPayment.budgetResult;
export const selectTDSBudgetStatus       = (s) => s.vendorTDSPayment.budgetStatus;
export const selectTDSBudgetLoading      = (s) => s.vendorTDSPayment.budgetLoading;
export const selectTDSSaveStatus         = (s) => s.vendorTDSPayment.saveStatus;
export const selectTDSSaveLoading        = (s) => s.vendorTDSPayment.saveLoading;
export const selectTDSSaveError          = (s) => s.vendorTDSPayment.saveError;

export default vendorTDSPaymentSlice.reducer;
