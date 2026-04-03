import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getCMSVendors,
    getVendorCMSPaymentData,
    getVendorCMSPaymentInnerData,
    saveVendorCMSPayment,
} from '../../api/PurchaseAPI/vendorCMSPaymentAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchCMSVendors = createAsyncThunk(
    'vendorCMSPayment/fetchCMSVendors',
    async (params, { rejectWithValue }) => {
        try { return await getCMSVendors(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch CMS vendors'); }
    }
);

export const fetchVendorCMSPaymentData = createAsyncThunk(
    'vendorCMSPayment/fetchVendorData',
    async (params, { rejectWithValue }) => {
        try { return await getVendorCMSPaymentData(params); }
        catch (err) { return rejectWithValue(err.message || 'Failed to fetch vendor CMS data'); }
    }
);

// Inner data fetch — stores result keyed by vendorCode
export const fetchVendorCMSInnerData = createAsyncThunk(
    'vendorCMSPayment/fetchInnerData',
    async ({ Vendorcode, Userid }, { rejectWithValue }) => {
        try {
            const data = await getVendorCMSPaymentInnerData({ Vendorcode, Userid });
            return { vendorCode: Vendorcode, data };
        } catch (err) {
            return rejectWithValue({ vendorCode: Vendorcode, error: err.message || 'Failed to fetch inner data' });
        }
    }
);

export const submitVendorCMSPayment = createAsyncThunk(
    'vendorCMSPayment/submit',
    async (payload, { rejectWithValue }) => {
        try { return await saveVendorCMSPayment(payload); }
        catch (err) { return rejectWithValue(err.message || 'Failed to save payment'); }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    // Vendor dropdown options
    cmsVendors:         [],
    cmsVendorsLoading:  false,
    cmsVendorsError:    null,

    // Vendor summary rows (with BasicBalance)
    vendorData:         [],
    vendorDataLoading:  false,
    vendorDataError:    null,

    // Inner invoice data keyed by vendorCode
    innerDataByVendor:      {},   // { [vendorCode]: invoiceRow[] }
    innerLoadingByVendor:   {},   // { [vendorCode]: bool }

    // Save
    saveResult:  null,
    saveStatus:  null,   // null | 'pending' | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const vendorCMSPaymentSlice = createSlice({
    name: 'vendorCMSPayment',
    initialState,
    reducers: {
        clearCMSVendors:    (s) => { s.cmsVendors = []; s.cmsVendorsError = null; },
        clearVendorData:    (s) => { s.vendorData = []; s.vendorDataError = null; },
        clearInnerData:     (s) => { s.innerDataByVendor = {}; s.innerLoadingByVendor = {}; },
        clearSaveResult:    (s) => { s.saveResult = null; s.saveStatus = null; s.saveError = null; },
        resetVendorCMSPayment: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCMSVendors.pending,   (s) => { s.cmsVendorsLoading = true;  s.cmsVendorsError = null; s.cmsVendors = []; })
            .addCase(fetchCMSVendors.fulfilled, (s, a) => { s.cmsVendorsLoading = false; s.cmsVendors = a.payload?.Data || []; })
            .addCase(fetchCMSVendors.rejected,  (s, a) => { s.cmsVendorsLoading = false; s.cmsVendorsError = a.payload; });

        builder
            .addCase(fetchVendorCMSPaymentData.pending,   (s) => { s.vendorDataLoading = true;  s.vendorDataError = null; s.vendorData = []; })
            .addCase(fetchVendorCMSPaymentData.fulfilled, (s, a) => { s.vendorDataLoading = false; s.vendorData = a.payload?.Data || []; })
            .addCase(fetchVendorCMSPaymentData.rejected,  (s, a) => { s.vendorDataLoading = false; s.vendorDataError = a.payload; });

        builder
            .addCase(fetchVendorCMSInnerData.pending, (s, a) => {
                s.innerLoadingByVendor[a.meta.arg.Vendorcode] = true;
            })
            .addCase(fetchVendorCMSInnerData.fulfilled, (s, a) => {
                const { vendorCode, data } = a.payload;
                s.innerLoadingByVendor[vendorCode] = false;
                s.innerDataByVendor[vendorCode]    = data?.Data || [];
            })
            .addCase(fetchVendorCMSInnerData.rejected, (s, a) => {
                const vendorCode = a.meta.arg.Vendorcode;
                s.innerLoadingByVendor[vendorCode] = false;
            });

        builder
            .addCase(submitVendorCMSPayment.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
            .addCase(submitVendorCMSPayment.fulfilled, (s, a) => {
                s.saveLoading = false;
                s.saveResult  = a.payload;
                const raw = a.payload?.Data || a.payload || '';
                const msg = typeof raw === 'string' ? raw.split('$')[0] : '';
                s.saveStatus = (msg === 'Submited' || a.payload?.IsSuccessful === true) ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = (typeof raw === 'string' && raw) || 'Payment save failed';
            })
            .addCase(submitVendorCMSPayment.rejected, (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
    },
});

export const {
    clearCMSVendors, clearVendorData, clearInnerData, clearSaveResult, resetVendorCMSPayment,
} = vendorCMSPaymentSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectCMSVendors           = (s) => s.vendorCMSPayment.cmsVendors;
export const selectCMSVendorsLoading    = (s) => s.vendorCMSPayment.cmsVendorsLoading;
export const selectVendorData           = (s) => s.vendorCMSPayment.vendorData;
export const selectVendorDataLoading    = (s) => s.vendorCMSPayment.vendorDataLoading;
export const selectVendorDataError      = (s) => s.vendorCMSPayment.vendorDataError;
export const selectInnerDataByVendor    = (s) => s.vendorCMSPayment.innerDataByVendor;
export const selectInnerLoadingByVendor = (s) => s.vendorCMSPayment.innerLoadingByVendor;
export const selectCMSSaveStatus        = (s) => s.vendorCMSPayment.saveStatus;
export const selectCMSSaveLoading       = (s) => s.vendorCMSPayment.saveLoading;
export const selectCMSSaveError         = (s) => s.vendorCMSPayment.saveError;

export default vendorCMSPaymentSlice.reducer;
