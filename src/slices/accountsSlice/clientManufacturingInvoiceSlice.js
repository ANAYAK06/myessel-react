import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getManfCostCenters,
    getManufacturingItemsByCC,
    saveManufactureItemcode,
    getTradeItemTempDetails,
    saveTempManNewItemsIssue,
    deleteManStockIssueItems,
    getTradeItemsByCC,
    getManClientsByCostCenter,
    getManSubClientsByClient,
    getManSubClientPO,
    saveManufactureItems,
    saveClientManufactureInvoice,
} from '../../api/AccountsAPI/clientManufacturingInvoiceAPI';
import {
    getClientGSTNos,
    getCompanyGSTNos,
    getTCSDCASDCAS,
} from '../../api/AccountsAPI/clientInvoiceAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchManfCostCenters = createAsyncThunk(
    'clientManfInvoice/fetchManfCostCenters',
    async (ccType, { rejectWithValue }) => {
        try {
            const res = await getManfCostCenters(ccType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load cost centers');
        }
    }
);

export const fetchManufacturingItems = createAsyncThunk(
    'clientManfInvoice/fetchManufacturingItems',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getManufacturingItemsByCC(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load manufacturing items');
        }
    }
);

export const addManufactureItemcode = createAsyncThunk(
    'clientManfInvoice/addManufactureItemcode',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveManufactureItemcode(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save new item');
        }
    }
);

export const fetchTradeItemTempDetails = createAsyncThunk(
    'clientManfInvoice/fetchTradeItemTempDetails',
    async ({ itemcode, ccCode }, { rejectWithValue }) => {
        try {
            const res = await getTradeItemTempDetails({ itemcode, ccCode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load trade item temp details');
        }
    }
);

export const addTempManItemsIssue = createAsyncThunk(
    'clientManfInvoice/addTempManItemsIssue',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveTempManNewItemsIssue(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save temp issue');
        }
    }
);

export const removeTempManItem = createAsyncThunk(
    'clientManfInvoice/removeTempManItem',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await deleteManStockIssueItems(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to delete item');
        }
    }
);

export const fetchTradeItems = createAsyncThunk(
    'clientManfInvoice/fetchTradeItems',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getTradeItemsByCC(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load trade items');
        }
    }
);

export const fetchManClients = createAsyncThunk(
    'clientManfInvoice/fetchManClients',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getManClientsByCostCenter(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load clients');
        }
    }
);

export const fetchManSubClients = createAsyncThunk(
    'clientManfInvoice/fetchManSubClients',
    async ({ ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getManSubClientsByClient({ ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load sub-clients');
        }
    }
);

export const fetchManSubClientPO = createAsyncThunk(
    'clientManfInvoice/fetchManSubClientPO',
    async ({ subClient, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getManSubClientPO({ subClient, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load PO numbers');
        }
    }
);

export const addManufactureItems = createAsyncThunk(
    'clientManfInvoice/addManufactureItems',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveManufactureItems(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to add manufacture item');
        }
    }
);

export const fetchManClientGSTNos = createAsyncThunk(
    'clientManfInvoice/fetchManClientGSTNos',
    async ({ taxtype, taxfor }, { rejectWithValue }) => {
        try {
            const res = await getClientGSTNos({ taxtype, taxfor });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load client GST numbers');
        }
    }
);

export const fetchManCompanyGSTNos = createAsyncThunk(
    'clientManfInvoice/fetchManCompanyGSTNos',
    async (taxtype, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos(taxtype);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load company GST numbers');
        }
    }
);

export const fetchManTCSDCASDCAS = createAsyncThunk(
    'clientManfInvoice/fetchManTCSDCASDCAS',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getTCSDCASDCAS();
            return res.data?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load TCS DCA/SDCA');
        }
    }
);

export const submitManfInvoice = createAsyncThunk(
    'clientManfInvoice/submitManfInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveClientManufactureInvoice(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save invoice');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:          [],
    manfItems:            [],
    tradeItems:           [],
    tradeItemTempDetails: [],
    clients:              [],
    subClients:           [],
    poNumbers:            [],
    clientGSTNos:         [],
    companyGSTNos:        [],
    tcsDCASDCAS:          null,
    saveResult:           null,
    newItemResult:        null,
    tempItemResult:       null,

    loading: {
        costCenters: false,
        manfItems:   false,
        tradeItems:  false,
        tradeTemp:   false,
        clients:     false,
        subClients:  false,
        poNumbers:   false,
        gst:         false,
        tcs:         false,
        save:        false,
        newItem:     false,
        addItem:     false,
        tempItem:    false,
        deleteItem:  false,
    },
    errors: {
        costCenters: null,
        manfItems:   null,
        tradeItems:  null,
        tradeTemp:   null,
        clients:     null,
        subClients:  null,
        poNumbers:   null,
        gst:         null,
        tcs:         null,
        save:        null,
        newItem:     null,
        addItem:     null,
        tempItem:    null,
        deleteItem:  null,
    },
};

const clientManufacturingInvoiceSlice = createSlice({
    name: 'clientManfInvoice',
    initialState,
    reducers: {
        clearManfSaveResult:      (s) => { s.saveResult = null; s.errors.save = null; },
        clearManfNewItemResult:   (s) => { s.newItemResult = null; s.errors.newItem = null; },
        clearManfTempDetails:     (s) => { s.tradeItemTempDetails = []; },
        clearManfClients:         (s) => { s.clients = []; s.subClients = []; s.poNumbers = []; },
        clearManfSubClients:      (s) => { s.subClients = []; s.poNumbers = []; },
        clearManfPONumbers:       (s) => { s.poNumbers = []; },
        clearManfGSTData:         (s) => { s.clientGSTNos = []; s.companyGSTNos = []; },
        clearManfItems:           (s) => { s.manfItems = []; s.tradeItems = []; },
        resetManfInvoice:         () => initialState,
    },
    extraReducers: (builder) => {

        // Cost centers
        builder
            .addCase(fetchManfCostCenters.pending,   s => { s.loading.costCenters = true;  s.errors.costCenters = null; s.costCenters = []; })
            .addCase(fetchManfCostCenters.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchManfCostCenters.rejected,  (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        // Manufactured items catalog
        builder
            .addCase(fetchManufacturingItems.pending,   s => { s.loading.manfItems = true;  s.errors.manfItems = null; s.manfItems = []; })
            .addCase(fetchManufacturingItems.fulfilled, (s, a) => { s.loading.manfItems = false; s.manfItems = a.payload; })
            .addCase(fetchManufacturingItems.rejected,  (s, a) => { s.loading.manfItems = false; s.errors.manfItems = a.payload; });

        // New item code save
        builder
            .addCase(addManufactureItemcode.pending,   s => { s.loading.newItem = true;  s.errors.newItem = null; s.newItemResult = null; })
            .addCase(addManufactureItemcode.fulfilled, (s, a) => { s.loading.newItem = false; s.newItemResult = a.payload; })
            .addCase(addManufactureItemcode.rejected,  (s, a) => { s.loading.newItem = false; s.errors.newItem = a.payload; });

        // Trade item temp details
        builder
            .addCase(fetchTradeItemTempDetails.pending,   s => { s.loading.tradeTemp = true;  s.errors.tradeTemp = null; s.tradeItemTempDetails = []; })
            .addCase(fetchTradeItemTempDetails.fulfilled, (s, a) => { s.loading.tradeTemp = false; s.tradeItemTempDetails = a.payload; })
            .addCase(fetchTradeItemTempDetails.rejected,  (s, a) => { s.loading.tradeTemp = false; s.errors.tradeTemp = a.payload; });

        // Temp issue save
        builder
            .addCase(addTempManItemsIssue.pending,   s => { s.loading.tempItem = true;  s.errors.tempItem = null; s.tempItemResult = null; })
            .addCase(addTempManItemsIssue.fulfilled, (s, a) => { s.loading.tempItem = false; s.tempItemResult = a.payload; })
            .addCase(addTempManItemsIssue.rejected,  (s, a) => { s.loading.tempItem = false; s.errors.tempItem = a.payload; });

        // Delete temp item
        builder
            .addCase(removeTempManItem.pending,   s => { s.loading.deleteItem = true;  s.errors.deleteItem = null; })
            .addCase(removeTempManItem.fulfilled, s => { s.loading.deleteItem = false; })
            .addCase(removeTempManItem.rejected,  (s, a) => { s.loading.deleteItem = false; s.errors.deleteItem = a.payload; });

        // Trade items catalog
        builder
            .addCase(fetchTradeItems.pending,   s => { s.loading.tradeItems = true;  s.errors.tradeItems = null; s.tradeItems = []; })
            .addCase(fetchTradeItems.fulfilled, (s, a) => { s.loading.tradeItems = false; s.tradeItems = a.payload; })
            .addCase(fetchTradeItems.rejected,  (s, a) => { s.loading.tradeItems = false; s.errors.tradeItems = a.payload; });

        // Clients
        builder
            .addCase(fetchManClients.pending,   s => { s.loading.clients = true;  s.errors.clients = null; s.clients = []; })
            .addCase(fetchManClients.fulfilled, (s, a) => { s.loading.clients = false; s.clients = a.payload; })
            .addCase(fetchManClients.rejected,  (s, a) => { s.loading.clients = false; s.errors.clients = a.payload; });

        // Sub-clients
        builder
            .addCase(fetchManSubClients.pending,   s => { s.loading.subClients = true;  s.errors.subClients = null; s.subClients = []; })
            .addCase(fetchManSubClients.fulfilled, (s, a) => { s.loading.subClients = false; s.subClients = a.payload; })
            .addCase(fetchManSubClients.rejected,  (s, a) => { s.loading.subClients = false; s.errors.subClients = a.payload; });

        // PO numbers
        builder
            .addCase(fetchManSubClientPO.pending,   s => { s.loading.poNumbers = true;  s.errors.poNumbers = null; s.poNumbers = []; })
            .addCase(fetchManSubClientPO.fulfilled, (s, a) => { s.loading.poNumbers = false; s.poNumbers = a.payload; })
            .addCase(fetchManSubClientPO.rejected,  (s, a) => { s.loading.poNumbers = false; s.errors.poNumbers = a.payload; });

        // Add manufacture items
        builder
            .addCase(addManufactureItems.pending,   s => { s.loading.addItem = true;  s.errors.addItem = null; })
            .addCase(addManufactureItems.fulfilled, s => { s.loading.addItem = false; })
            .addCase(addManufactureItems.rejected,  (s, a) => { s.loading.addItem = false; s.errors.addItem = a.payload; });

        // Client GST
        builder
            .addCase(fetchManClientGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.clientGSTNos = []; })
            .addCase(fetchManClientGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.clientGSTNos = a.payload; })
            .addCase(fetchManClientGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        // Company GST
        builder
            .addCase(fetchManCompanyGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.companyGSTNos = []; })
            .addCase(fetchManCompanyGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.companyGSTNos = a.payload; })
            .addCase(fetchManCompanyGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        // TCS DCA/SDCA
        builder
            .addCase(fetchManTCSDCASDCAS.pending,   s => { s.loading.tcs = true;  s.errors.tcs = null; })
            .addCase(fetchManTCSDCASDCAS.fulfilled, (s, a) => { s.loading.tcs = false; s.tcsDCASDCAS = a.payload; })
            .addCase(fetchManTCSDCASDCAS.rejected,  (s, a) => { s.loading.tcs = false; s.errors.tcs = a.payload; });

        // Submit invoice
        builder
            .addCase(submitManfInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitManfInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitManfInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearManfSaveResult,
    clearManfNewItemResult,
    clearManfTempDetails,
    clearManfClients,
    clearManfSubClients,
    clearManfPONumbers,
    clearManfGSTData,
    clearManfItems,
    resetManfInvoice,
} = clientManufacturingInvoiceSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectManfCostCenters         = s => s.clientManfInvoice.costCenters;
export const selectManfItems               = s => s.clientManfInvoice.manfItems;
export const selectTradeItems              = s => s.clientManfInvoice.tradeItems;
export const selectTradeItemTempDetails    = s => s.clientManfInvoice.tradeItemTempDetails;
export const selectManfClients             = s => s.clientManfInvoice.clients;
export const selectManfSubClients          = s => s.clientManfInvoice.subClients;
export const selectManfPONumbers           = s => s.clientManfInvoice.poNumbers;
export const selectManfClientGSTNos        = s => s.clientManfInvoice.clientGSTNos;
export const selectManfCompanyGSTNos       = s => s.clientManfInvoice.companyGSTNos;
export const selectManfTCSDCASDCAS         = s => s.clientManfInvoice.tcsDCASDCAS;
export const selectManfSaveResult          = s => s.clientManfInvoice.saveResult;
export const selectManfNewItemResult       = s => s.clientManfInvoice.newItemResult;
export const selectManfTempItemResult      = s => s.clientManfInvoice.tempItemResult;

export const selectManfCostCentersLoading  = s => s.clientManfInvoice.loading.costCenters;
export const selectManfItemsLoading        = s => s.clientManfInvoice.loading.manfItems;
export const selectTradeItemsLoading       = s => s.clientManfInvoice.loading.tradeItems;
export const selectTradeTempLoading        = s => s.clientManfInvoice.loading.tradeTemp;
export const selectManfClientsLoading      = s => s.clientManfInvoice.loading.clients;
export const selectManfSubClientsLoading   = s => s.clientManfInvoice.loading.subClients;
export const selectManfPONumbersLoading    = s => s.clientManfInvoice.loading.poNumbers;
export const selectManfGSTLoading          = s => s.clientManfInvoice.loading.gst;
export const selectManfSaveLoading         = s => s.clientManfInvoice.loading.save;
export const selectManfNewItemLoading      = s => s.clientManfInvoice.loading.newItem;
export const selectManfAddItemLoading      = s => s.clientManfInvoice.loading.addItem;
export const selectManfTempItemLoading     = s => s.clientManfInvoice.loading.tempItem;
export const selectManfDeleteItemLoading   = s => s.clientManfInvoice.loading.deleteItem;

export const selectManfSaveError           = s => s.clientManfInvoice.errors.save;
export const selectManfNewItemError        = s => s.clientManfInvoice.errors.newItem;
export const selectManfTempItemError       = s => s.clientManfInvoice.errors.tempItem;

export default clientManufacturingInvoiceSlice.reducer;
