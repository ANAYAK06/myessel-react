import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getClientReceiptInvType,
    getPaymentTypes,
    getCostCenterBySubType,
    getClientInvPOByCC, getClientInvNoByCCPO, getClientInvDetailsById, getClientInvTaxDetails,
    getCCForClientInvDeduction, getDCAForClientInvDeduction, getSubDCAForClientInvDeductionByCode,
    saveClientInvoiceRecievable,
    getRetentPayInvClients, getRetentPayInvSubClients, getRetentPayInvCCByClients, getRetentPayInvPO, getRetentPayInvDetails,
    saveClientRetentionPayment,
    getHoldPayInvClients, getHoldPayInvSubClients, getHoldPayInvCCByClients, getHoldPayInvPO, getHoldPayInvDetails,
    saveClientHoldPayment,
    getAdvPayPOClients, getAdvPayPOSubClients, getAdvPayPOCC, getAdvPayPO,
    saveClientAdvancePayment,
} from '../../api/AccountsAPI/clientReceiptAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchClientReceiptInvTypes = createAsyncThunk('clientReceipt/fetchInvTypes',
    async (_, { rejectWithValue }) => { try { return await getClientReceiptInvType(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchClientReceiptPaymentTypes = createAsyncThunk('clientReceipt/fetchPaymentTypes',
    async (_, { rejectWithValue }) => { try { return await getPaymentTypes(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// Invoice Service
export const fetchInvServiceCCCodes = createAsyncThunk('clientReceipt/fetchInvServiceCCCodes',
    async (params, { rejectWithValue }) => { try { return await getCostCenterBySubType(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchInvServicePOs = createAsyncThunk('clientReceipt/fetchInvServicePOs',
    async (params, { rejectWithValue }) => { try { return await getClientInvPOByCC(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchInvServiceInvoiceNos = createAsyncThunk('clientReceipt/fetchInvServiceInvoiceNos',
    async (params, { rejectWithValue }) => { try { return await getClientInvNoByCCPO(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchClientInvDetails = createAsyncThunk('clientReceipt/fetchClientInvDetails',
    async (params, { rejectWithValue }) => { try { return await getClientInvDetailsById(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchClientInvTax = createAsyncThunk('clientReceipt/fetchClientInvTax',
    async (params, { rejectWithValue }) => { try { return await getClientInvTaxDetails(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitInvoiceServiceReceipt = createAsyncThunk('clientReceipt/saveInvoiceService',
    async (payload, { rejectWithValue }) => { try { return await saveClientInvoiceRecievable(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// Deduction (shared)
export const fetchDeductionCCOptions = createAsyncThunk('clientReceipt/fetchDeductionCCOptions',
    async (params, { rejectWithValue }) => { try { return await getCCForClientInvDeduction(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchDedDCAOptions = createAsyncThunk('clientReceipt/fetchDedDCAOptions',
    async ({ rowId, CcCode }, { rejectWithValue }) => { try { const data = await getDCAForClientInvDeduction({ CcCode }); return { rowId, data }; } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchDedSubDCAOptions = createAsyncThunk('clientReceipt/fetchDedSubDCAOptions',
    async ({ rowId, DCACode }, { rejectWithValue }) => { try { const data = await getSubDCAForClientInvDeductionByCode({ DCACode }); return { rowId, data }; } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// Retention
export const fetchRetClients = createAsyncThunk('clientReceipt/fetchRetClients',
    async (_, { rejectWithValue }) => { try { return await getRetentPayInvClients(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetSubClients = createAsyncThunk('clientReceipt/fetchRetSubClients',
    async (params, { rejectWithValue }) => { try { return await getRetentPayInvSubClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetCC = createAsyncThunk('clientReceipt/fetchRetCC',
    async (params, { rejectWithValue }) => { try { return await getRetentPayInvCCByClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetPOs = createAsyncThunk('clientReceipt/fetchRetPOs',
    async (params, { rejectWithValue }) => { try { return await getRetentPayInvPO(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetDetails = createAsyncThunk('clientReceipt/fetchRetDetails',
    async (params, { rejectWithValue }) => { try { return await getRetentPayInvDetails(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitRetentionPayment = createAsyncThunk('clientReceipt/saveRetention',
    async (payload, { rejectWithValue }) => { try { return await saveClientRetentionPayment(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// Hold
export const fetchHoldClients = createAsyncThunk('clientReceipt/fetchHoldClients',
    async (_, { rejectWithValue }) => { try { return await getHoldPayInvClients(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldSubClients = createAsyncThunk('clientReceipt/fetchHoldSubClients',
    async (params, { rejectWithValue }) => { try { return await getHoldPayInvSubClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldCC = createAsyncThunk('clientReceipt/fetchHoldCC',
    async (params, { rejectWithValue }) => { try { return await getHoldPayInvCCByClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldPOs = createAsyncThunk('clientReceipt/fetchHoldPOs',
    async (params, { rejectWithValue }) => { try { return await getHoldPayInvPO(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldDetails = createAsyncThunk('clientReceipt/fetchHoldDetails',
    async (params, { rejectWithValue }) => { try { return await getHoldPayInvDetails(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitHoldPayment = createAsyncThunk('clientReceipt/saveHold',
    async (payload, { rejectWithValue }) => { try { return await saveClientHoldPayment(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// Advance
export const fetchAdvClients = createAsyncThunk('clientReceipt/fetchAdvClients',
    async (_, { rejectWithValue }) => { try { return await getAdvPayPOClients(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchAdvSubClients = createAsyncThunk('clientReceipt/fetchAdvSubClients',
    async (params, { rejectWithValue }) => { try { return await getAdvPayPOSubClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchAdvCC = createAsyncThunk('clientReceipt/fetchAdvCC',
    async (params, { rejectWithValue }) => { try { return await getAdvPayPOCC(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchAdvPOs = createAsyncThunk('clientReceipt/fetchAdvPOs',
    async (params, { rejectWithValue }) => { try { return await getAdvPayPO(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitAdvancePayment = createAsyncThunk('clientReceipt/saveAdvance',
    async (payload, { rejectWithValue }) => { try { return await saveClientAdvancePayment(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    invTypes:        [],
    invTypesLoading: false,
    paymentTypes:        [],
    paymentTypesLoading: false,

    // Shared cascading slots reused across all 4 branches
    ccCodes:        [],
    ccCodesLoading: false,
    clients:        [],
    clientsLoading: false,
    subClients:        [],
    subClientsLoading: false,
    poList:        [],
    poListLoading: false,

    // Invoice Service specific
    invoiceNos:            [],
    invoiceNosLoading:     false,
    invoiceDetail:         null,
    invoiceDetailLoading:  false,
    invoiceTax:            [],
    invoiceTaxLoading:     false,

    // Retention / Hold PO detail (auto-fill)
    poDetail:        [],
    poDetailLoading: false,

    // Deduction
    dedCCOptions:        [],
    dedCCOptionsLoading: false,
    dedDcaByRow:      {},
    dedDcaLoading:    {},
    dedSubDcaByRow:   {},
    dedSubDcaLoading: {},

    // Save
    saveStatus:  null,   // null | 'pending' | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
    saveResult:  null,
};

const clientReceiptSlice = createSlice({
    name: 'clientReceipt',
    initialState,
    reducers: {
        clearCCCodes:      (s) => { s.ccCodes = []; },
        clearClients:      (s) => { s.clients = []; },
        clearSubClients:   (s) => { s.subClients = []; },
        clearPOList:       (s) => { s.poList = []; },
        clearInvoiceNos:   (s) => { s.invoiceNos = []; },
        clearInvoiceDetail:(s) => { s.invoiceDetail = null; },
        clearInvoiceTax:   (s) => { s.invoiceTax = []; },
        clearPODetail:     (s) => { s.poDetail = []; },
        clearDedCCOptions: (s) => { s.dedCCOptions = []; },
        clearDedRow: (s, { payload: rowId }) => {
            delete s.dedDcaByRow[rowId];
            delete s.dedDcaLoading[rowId];
            delete s.dedSubDcaByRow[rowId];
            delete s.dedSubDcaLoading[rowId];
        },
        clearSaveResult: (s) => { s.saveStatus = null; s.saveError = null; s.saveResult = null; },
        resetClientReceipt: () => initialState,
    },
    extraReducers: (builder) => {
        // Invoice sub-type
        builder
            .addCase(fetchClientReceiptInvTypes.pending,   (s) => { s.invTypesLoading = true; })
            .addCase(fetchClientReceiptInvTypes.fulfilled, (s, a) => { s.invTypesLoading = false; s.invTypes = a.payload?.Data || []; })
            .addCase(fetchClientReceiptInvTypes.rejected,  (s) => { s.invTypesLoading = false; });

        // Payment types (used to resolve BankTransactions.TypeOfTransactionId per flow)
        builder
            .addCase(fetchClientReceiptPaymentTypes.pending,   (s) => { s.paymentTypesLoading = true; })
            .addCase(fetchClientReceiptPaymentTypes.fulfilled, (s, a) => { s.paymentTypesLoading = false; s.paymentTypes = a.payload?.Data || []; })
            .addCase(fetchClientReceiptPaymentTypes.rejected,  (s) => { s.paymentTypesLoading = false; });

        // CC codes (shared slot — Invoice Service + Retention + Hold + Advance)
        [fetchInvServiceCCCodes, fetchRetCC, fetchHoldCC, fetchAdvCC].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.ccCodesLoading = true; s.ccCodes = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.ccCodesLoading = false; s.ccCodes = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.ccCodesLoading = false; });
        });

        // Clients (shared slot — Retention + Hold + Advance)
        [fetchRetClients, fetchHoldClients, fetchAdvClients].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.clientsLoading = true; s.clients = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.clientsLoading = false; s.clients = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.clientsLoading = false; });
        });

        // Sub-clients (shared slot)
        [fetchRetSubClients, fetchHoldSubClients, fetchAdvSubClients].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.subClientsLoading = true; s.subClients = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.subClientsLoading = false; s.subClients = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.subClientsLoading = false; });
        });

        // PO list (shared slot — Invoice Service + Retention + Hold + Advance)
        [fetchInvServicePOs, fetchRetPOs, fetchHoldPOs, fetchAdvPOs].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.poListLoading = true; s.poList = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.poListLoading = false; s.poList = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.poListLoading = false; });
        });

        // Invoice numbers (Invoice Service)
        builder
            .addCase(fetchInvServiceInvoiceNos.pending,   (s) => { s.invoiceNosLoading = true; s.invoiceNos = []; })
            .addCase(fetchInvServiceInvoiceNos.fulfilled, (s, a) => { s.invoiceNosLoading = false; s.invoiceNos = a.payload?.Data || []; })
            .addCase(fetchInvServiceInvoiceNos.rejected,  (s) => { s.invoiceNosLoading = false; });

        // Invoice detail auto-fill (Invoice Service)
        builder
            .addCase(fetchClientInvDetails.pending,   (s) => { s.invoiceDetailLoading = true; s.invoiceDetail = null; })
            .addCase(fetchClientInvDetails.fulfilled, (s, a) => { s.invoiceDetailLoading = false; s.invoiceDetail = a.payload?.Data?.[0] || null; })
            .addCase(fetchClientInvDetails.rejected,  (s) => { s.invoiceDetailLoading = false; });

        // Invoice tax breakup (Invoice Service)
        builder
            .addCase(fetchClientInvTax.pending,   (s) => { s.invoiceTaxLoading = true; s.invoiceTax = []; })
            .addCase(fetchClientInvTax.fulfilled, (s, a) => { s.invoiceTaxLoading = false; s.invoiceTax = a.payload?.Data || []; })
            .addCase(fetchClientInvTax.rejected,  (s) => { s.invoiceTaxLoading = false; });

        // PO detail auto-fill (Retention + Hold)
        [fetchRetDetails, fetchHoldDetails].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.poDetailLoading = true; s.poDetail = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.poDetailLoading = false; s.poDetail = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.poDetailLoading = false; });
        });

        // Deduction — "other CC" options (shared, single list)
        builder
            .addCase(fetchDeductionCCOptions.pending,   (s) => { s.dedCCOptionsLoading = true; s.dedCCOptions = []; })
            .addCase(fetchDeductionCCOptions.fulfilled, (s, a) => { s.dedCCOptionsLoading = false; s.dedCCOptions = a.payload?.Data || []; })
            .addCase(fetchDeductionCCOptions.rejected,  (s) => { s.dedCCOptionsLoading = false; });

        // Deduction — per-row DCA options
        builder
            .addCase(fetchDedDCAOptions.pending,   (s, { meta }) => { s.dedDcaLoading[meta.arg.rowId] = true; })
            .addCase(fetchDedDCAOptions.fulfilled, (s, { payload }) => { s.dedDcaLoading[payload.rowId] = false; s.dedDcaByRow[payload.rowId] = payload.data?.Data || []; })
            .addCase(fetchDedDCAOptions.rejected,  (s, { meta }) => { s.dedDcaLoading[meta.arg.rowId] = false; });

        // Deduction — per-row SubDCA options
        builder
            .addCase(fetchDedSubDCAOptions.pending,   (s, { meta }) => { s.dedSubDcaLoading[meta.arg.rowId] = true; })
            .addCase(fetchDedSubDCAOptions.fulfilled, (s, { payload }) => { s.dedSubDcaLoading[payload.rowId] = false; s.dedSubDcaByRow[payload.rowId] = payload.data?.Data || []; })
            .addCase(fetchDedSubDCAOptions.rejected,  (s, { meta }) => { s.dedSubDcaLoading[meta.arg.rowId] = false; });

        // Save (Invoice Service + Retention + Hold + Advance)
        [submitInvoiceServiceReceipt, submitRetentionPayment, submitHoldPayment, submitAdvancePayment].forEach((thunk) => {
            builder
                .addCase(thunk.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
                .addCase(thunk.fulfilled, (s, a) => {
                    s.saveLoading = false;
                    s.saveResult  = a.payload;
                    const raw = a.payload?.Data ?? a.payload ?? '';
                    const msg = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
                    const ok  = a.payload?.IsSuccessful === true || /submit|success/i.test(msg);
                    s.saveStatus = ok ? 'success' : 'failed';
                    if (s.saveStatus === 'failed') s.saveError = msg || 'Save failed';
                })
                .addCase(thunk.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
        });
    },
});

export const {
    clearCCCodes, clearClients, clearSubClients, clearPOList,
    clearInvoiceNos, clearInvoiceDetail, clearInvoiceTax, clearPODetail,
    clearDedCCOptions, clearDedRow, clearSaveResult, resetClientReceipt,
} = clientReceiptSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectCRInvTypes            = (s) => s.clientReceipt.invTypes;
export const selectCRInvTypesLoading     = (s) => s.clientReceipt.invTypesLoading;
export const selectCRPaymentTypes        = (s) => s.clientReceipt.paymentTypes;
export const selectCRPaymentTypesLoading = (s) => s.clientReceipt.paymentTypesLoading;
export const selectCRCCCodes             = (s) => s.clientReceipt.ccCodes;
export const selectCRCCCodesLoading      = (s) => s.clientReceipt.ccCodesLoading;
export const selectCRClients             = (s) => s.clientReceipt.clients;
export const selectCRClientsLoading      = (s) => s.clientReceipt.clientsLoading;
export const selectCRSubClients          = (s) => s.clientReceipt.subClients;
export const selectCRSubClientsLoading   = (s) => s.clientReceipt.subClientsLoading;
export const selectCRPOList              = (s) => s.clientReceipt.poList;
export const selectCRPOListLoading       = (s) => s.clientReceipt.poListLoading;
export const selectCRInvoiceNos          = (s) => s.clientReceipt.invoiceNos;
export const selectCRInvoiceNosLoading   = (s) => s.clientReceipt.invoiceNosLoading;
export const selectCRInvoiceDetail       = (s) => s.clientReceipt.invoiceDetail;
export const selectCRInvoiceDetailLoading= (s) => s.clientReceipt.invoiceDetailLoading;
export const selectCRInvoiceTax          = (s) => s.clientReceipt.invoiceTax;
export const selectCRInvoiceTaxLoading   = (s) => s.clientReceipt.invoiceTaxLoading;
export const selectCRPODetail            = (s) => s.clientReceipt.poDetail;
export const selectCRPODetailLoading     = (s) => s.clientReceipt.poDetailLoading;
export const selectCRDedCCOptions        = (s) => s.clientReceipt.dedCCOptions;
export const selectCRDedCCOptionsLoading = (s) => s.clientReceipt.dedCCOptionsLoading;
export const selectCRDedDcaByRow    = (rowId) => (s) => s.clientReceipt.dedDcaByRow[rowId] || [];
export const selectCRDedDcaLoading  = (rowId) => (s) => !!s.clientReceipt.dedDcaLoading[rowId];
export const selectCRDedSubDcaByRow   = (rowId) => (s) => s.clientReceipt.dedSubDcaByRow[rowId] || [];
export const selectCRDedSubDcaLoading = (rowId) => (s) => !!s.clientReceipt.dedSubDcaLoading[rowId];
export const selectCRSaveStatus          = (s) => s.clientReceipt.saveStatus;
export const selectCRSaveLoading         = (s) => s.clientReceipt.saveLoading;
export const selectCRSaveError           = (s) => s.clientReceipt.saveError;

export default clientReceiptSlice.reducer;
