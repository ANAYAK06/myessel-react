import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getBadDebtPaymentTypes, getClientBadDebtInvTypes,
    getInvServiceCCCodes, getRetentionCCCodes, getHoldCCCodes,
    getClientByCC, getClientByCCHold,
    getRetentionSubClients, getHoldSubClients,
    getRetentionPOs, getHoldPOs,
    getRetentionInvoices, getHoldInvoices,
    saveInvoiceServiceBD, saveRetentionBD, saveHoldBD,
} from '../../api/AccountsAPI/clientBadDebtAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchBDPaymentTypes = createAsyncThunk('clientBadDebt/fetchPaymentTypes',
    async (_, { rejectWithValue }) => { try { return await getBadDebtPaymentTypes(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchBDInvTypes = createAsyncThunk('clientBadDebt/fetchInvTypes',
    async (_, { rejectWithValue }) => { try { return await getClientBadDebtInvTypes(); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchInvServiceCCCodes = createAsyncThunk('clientBadDebt/fetchInvServiceCCCodes',
    async (params, { rejectWithValue }) => { try { return await getInvServiceCCCodes(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetentionCCCodes = createAsyncThunk('clientBadDebt/fetchRetentionCCCodes',
    async (params, { rejectWithValue }) => { try { return await getRetentionCCCodes(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldCCCodes = createAsyncThunk('clientBadDebt/fetchHoldCCCodes',
    async (params, { rejectWithValue }) => { try { return await getHoldCCCodes(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchClientByCC = createAsyncThunk('clientBadDebt/fetchClientByCC',
    async (params, { rejectWithValue }) => { try { return await getClientByCC(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchClientByCCHold = createAsyncThunk('clientBadDebt/fetchClientByCCHold',
    async (params, { rejectWithValue }) => { try { return await getClientByCCHold(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetentionSubClients = createAsyncThunk('clientBadDebt/fetchRetentionSubClients',
    async (params, { rejectWithValue }) => { try { return await getRetentionSubClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldSubClients = createAsyncThunk('clientBadDebt/fetchHoldSubClients',
    async (params, { rejectWithValue }) => { try { return await getHoldSubClients(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetentionPOs = createAsyncThunk('clientBadDebt/fetchRetentionPOs',
    async (params, { rejectWithValue }) => { try { return await getRetentionPOs(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldPOs = createAsyncThunk('clientBadDebt/fetchHoldPOs',
    async (params, { rejectWithValue }) => { try { return await getHoldPOs(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchRetentionInvoices = createAsyncThunk('clientBadDebt/fetchRetentionInvoices',
    async (params, { rejectWithValue }) => { try { return await getRetentionInvoices(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const fetchHoldInvoices = createAsyncThunk('clientBadDebt/fetchHoldInvoices',
    async (params, { rejectWithValue }) => { try { return await getHoldInvoices(params); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitInvoiceServiceBD = createAsyncThunk('clientBadDebt/saveInvService',
    async (payload, { rejectWithValue }) => { try { return await saveInvoiceServiceBD(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitRetentionBD = createAsyncThunk('clientBadDebt/saveRetention',
    async (payload, { rejectWithValue }) => { try { return await saveRetentionBD(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

export const submitHoldBD = createAsyncThunk('clientBadDebt/saveHold',
    async (payload, { rejectWithValue }) => { try { return await saveHoldBD(payload); } catch (e) { return rejectWithValue(e.message || 'Failed'); } });

// ── Helpers ────────────────────────────────────────────────────────────────────

const loadingCase = (key) => (s) => { s[key] = true; };
const listCase    = (key, loadKey, dataKey) => (s, a) => { s[loadKey] = false; s[key] = a.payload?.Data || []; };
const rejectCase  = (loadKey) => (s) => { s[loadKey] = false; };

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    paymentTypes:        [],
    paymentTypesLoading: false,

    invTypes:        [],
    invTypesLoading: false,

    ccCodes:        [],
    ccCodesLoading: false,

    clients:        [],
    clientsLoading: false,

    subClients:        [],
    subClientsLoading: false,

    poList:        [],
    poListLoading: false,

    invoices:        [],
    invoicesLoading: false,

    saveStatus:  null,   // null | 'pending' | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
    saveResult:  null,
};

const clientBadDebtSlice = createSlice({
    name: 'clientBadDebt',
    initialState,
    reducers: {
        clearCCCodes:    (s) => { s.ccCodes = []; },
        clearClients:    (s) => { s.clients = []; },
        clearSubClients: (s) => { s.subClients = []; },
        clearPOList:     (s) => { s.poList = []; },
        clearInvoices:   (s) => { s.invoices = []; },
        clearSaveResult: (s) => { s.saveStatus = null; s.saveError = null; s.saveResult = null; },
        resetBadDebt:    () => initialState,
    },
    extraReducers: (builder) => {
        // Payment Types
        builder
            .addCase(fetchBDPaymentTypes.pending,   loadingCase('paymentTypesLoading'))
            .addCase(fetchBDPaymentTypes.fulfilled,  listCase('paymentTypes', 'paymentTypesLoading'))
            .addCase(fetchBDPaymentTypes.rejected,   rejectCase('paymentTypesLoading'));

        // Invoice Types
        builder
            .addCase(fetchBDInvTypes.pending,   loadingCase('invTypesLoading'))
            .addCase(fetchBDInvTypes.fulfilled,  listCase('invTypes', 'invTypesLoading'))
            .addCase(fetchBDInvTypes.rejected,   rejectCase('invTypesLoading'));

        // CC Codes (shared slot — used by InvService, Retention, Hold)
        // InvService endpoint may return a direct array or different wrapper key
        builder
            .addCase(fetchInvServiceCCCodes.pending,   (s) => { s.ccCodesLoading = true; s.ccCodes = []; })
            .addCase(fetchInvServiceCCCodes.fulfilled, (s, a) => {
                s.ccCodesLoading = false;
                const raw = a.payload;
                s.ccCodes = Array.isArray(raw) ? raw
                    : (raw?.Data || raw?.data || raw?.CCodes || raw?.Result || []);
            })
            .addCase(fetchInvServiceCCCodes.rejected,  (s) => { s.ccCodesLoading = false; });

        [fetchRetentionCCCodes, fetchHoldCCCodes].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.ccCodesLoading = true; s.ccCodes = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.ccCodesLoading = false; s.ccCodes = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.ccCodesLoading = false; });
        });

        // Clients
        [fetchClientByCC, fetchClientByCCHold].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.clientsLoading = true; s.clients = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.clientsLoading = false; s.clients = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.clientsLoading = false; });
        });

        // Sub-clients
        [fetchRetentionSubClients, fetchHoldSubClients].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.subClientsLoading = true; s.subClients = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.subClientsLoading = false; s.subClients = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.subClientsLoading = false; });
        });

        // POs
        [fetchRetentionPOs, fetchHoldPOs].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.poListLoading = true; s.poList = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.poListLoading = false; s.poList = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.poListLoading = false; });
        });

        // Invoices
        [fetchRetentionInvoices, fetchHoldInvoices].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.invoicesLoading = true; s.invoices = []; })
                .addCase(thunk.fulfilled, (s, a) => { s.invoicesLoading = false; s.invoices = a.payload?.Data || []; })
                .addCase(thunk.rejected,  (s) => { s.invoicesLoading = false; });
        });

        // Save — all three save thunks use the same result handling
        const saveSuccessKeys = {
            'clientBadDebt/saveInvService': ['Submited'],
            'clientBadDebt/saveRetention':  ['Retention Submited'],
            'clientBadDebt/saveHold':       ['Hold Submited'],
        };

        [submitInvoiceServiceBD, submitRetentionBD, submitHoldBD].forEach(thunk => {
            builder
                .addCase(thunk.pending,   (s) => { s.saveLoading = true; s.saveError = null; s.saveStatus = 'pending'; })
                .addCase(thunk.fulfilled, (s, a) => {
                    s.saveLoading = false;
                    s.saveResult  = a.payload;
                    const raw = a.payload?.Data || a.payload || '';
                    const msg = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
                    const successKeys = saveSuccessKeys[thunk.typePrefix] || ['Submited'];
                    s.saveStatus = (successKeys.some(k => msg === k) || a.payload?.IsSuccessful === true)
                        ? 'success' : 'failed';
                    if (s.saveStatus === 'failed') s.saveError = msg || 'Save failed';
                })
                .addCase(thunk.rejected,  (s, a) => { s.saveLoading = false; s.saveError = a.payload; s.saveStatus = 'failed'; });
        });
    },
});

export const {
    clearCCCodes, clearClients, clearSubClients, clearPOList,
    clearInvoices, clearSaveResult, resetBadDebt,
} = clientBadDebtSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectBDPaymentTypes        = (s) => s.clientBadDebt.paymentTypes;
export const selectBDPaymentTypesLoading = (s) => s.clientBadDebt.paymentTypesLoading;
export const selectBDInvTypes            = (s) => s.clientBadDebt.invTypes;
export const selectBDInvTypesLoading     = (s) => s.clientBadDebt.invTypesLoading;
export const selectBDCCCodes             = (s) => s.clientBadDebt.ccCodes;
export const selectBDCCCodesLoading      = (s) => s.clientBadDebt.ccCodesLoading;
export const selectBDClients             = (s) => s.clientBadDebt.clients;
export const selectBDClientsLoading      = (s) => s.clientBadDebt.clientsLoading;
export const selectBDSubClients          = (s) => s.clientBadDebt.subClients;
export const selectBDSubClientsLoading   = (s) => s.clientBadDebt.subClientsLoading;
export const selectBDPOList              = (s) => s.clientBadDebt.poList;
export const selectBDPOListLoading       = (s) => s.clientBadDebt.poListLoading;
export const selectBDInvoices            = (s) => s.clientBadDebt.invoices;
export const selectBDInvoicesLoading     = (s) => s.clientBadDebt.invoicesLoading;
export const selectBDSaveStatus          = (s) => s.clientBadDebt.saveStatus;
export const selectBDSaveLoading         = (s) => s.clientBadDebt.saveLoading;
export const selectBDSaveError           = (s) => s.clientBadDebt.saveError;

export default clientBadDebtSlice.reducer;
