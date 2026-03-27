import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getTradingCostCenters,
    getTradingItemsByCC,
    getTradingItemTempDetails,
    getTradingItemsGrid,
    saveTempTradingItems,
    deleteTradingStockItem,
    getTradingClientsByCC,
    getTradingSubClientsByClient,
    getTradingSubClientPO,
    saveTradingClientInvoice,
} from '../../api/AccountsAPI/clientTradingInvoiceAPI';
import {
    getClientGSTNos,
    getCompanyGSTNos,
    getTCSDCASDCAS,
} from '../../api/AccountsAPI/clientInvoiceAPI';

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchTradingCostCenters = createAsyncThunk(
    'clientTradingInvoice/fetchTradingCostCenters',
    async (ccType, { rejectWithValue }) => {
        try {
            const res = await getTradingCostCenters(ccType);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load cost centers');
        }
    }
);

export const fetchTradingItems = createAsyncThunk(
    'clientTradingInvoice/fetchTradingItems',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getTradingItemsByCC(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load trade items');
        }
    }
);

export const fetchTradingItemTempDetails = createAsyncThunk(
    'clientTradingInvoice/fetchTradingItemTempDetails',
    async ({ itemcode, ccCode }, { rejectWithValue }) => {
        try {
            const res = await getTradingItemTempDetails({ itemcode, ccCode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load temp details');
        }
    }
);

export const fetchTradingItemsGrid = createAsyncThunk(
    'clientTradingInvoice/fetchTradingItemsGrid',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getTradingItemsGrid(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load items grid');
        }
    }
);

export const addTempTradingItems = createAsyncThunk(
    'clientTradingInvoice/addTempTradingItems',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveTempTradingItems(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save temp items');
        }
    }
);

export const removeTradingStockItem = createAsyncThunk(
    'clientTradingInvoice/removeTradingStockItem',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await deleteTradingStockItem(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to delete item');
        }
    }
);

export const fetchTradingClients = createAsyncThunk(
    'clientTradingInvoice/fetchTradingClients',
    async (ccCode, { rejectWithValue }) => {
        try {
            const res = await getTradingClientsByCC(ccCode);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load clients');
        }
    }
);

export const fetchTradingSubClients = createAsyncThunk(
    'clientTradingInvoice/fetchTradingSubClients',
    async ({ ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getTradingSubClientsByClient({ ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load sub-clients');
        }
    }
);

export const fetchTradingSubClientPO = createAsyncThunk(
    'clientTradingInvoice/fetchTradingSubClientPO',
    async ({ subClient, ccCode, clientcode }, { rejectWithValue }) => {
        try {
            const res = await getTradingSubClientPO({ subClient, ccCode, clientcode });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load PO numbers');
        }
    }
);

export const fetchTradingClientGSTNos = createAsyncThunk(
    'clientTradingInvoice/fetchTradingClientGSTNos',
    async ({ taxtype, taxfor }, { rejectWithValue }) => {
        try {
            const res = await getClientGSTNos({ taxtype, taxfor });
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load client GST numbers');
        }
    }
);

export const fetchTradingCompanyGSTNos = createAsyncThunk(
    'clientTradingInvoice/fetchTradingCompanyGSTNos',
    async (taxtype, { rejectWithValue }) => {
        try {
            const res = await getCompanyGSTNos(taxtype);
            return res.data?.Data || [];
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load company GST numbers');
        }
    }
);

export const fetchTradingTCSDCASDCAS = createAsyncThunk(
    'clientTradingInvoice/fetchTradingTCSDCASDCAS',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getTCSDCASDCAS();
            return res.data?.Data?.[0] || null;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to load TCS DCA/SDCA');
        }
    }
);

export const submitTradingInvoice = createAsyncThunk(
    'clientTradingInvoice/submitTradingInvoice',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await saveTradingClientInvoice(payload);
            return res.data?.Data || res.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.Message || err.message || 'Failed to save invoice');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    costCenters:   [],
    tradeItems:    [],
    tempDetails:   [],
    itemsGrid:     [],
    clients:       [],
    subClients:    [],
    poNumbers:     [],
    clientGSTNos:  [],
    companyGSTNos: [],
    tcsDCASDCAS:   null,
    saveResult:    null,
    tempSaveResult: null,

    loading: {
        costCenters: false,
        tradeItems:  false,
        tempDetails: false,
        itemsGrid:   false,
        clients:     false,
        subClients:  false,
        poNumbers:   false,
        gst:         false,
        tcs:         false,
        save:        false,
        tempSave:    false,
        deleteItem:  false,
    },
    errors: {
        costCenters: null,
        tradeItems:  null,
        tempDetails: null,
        itemsGrid:   null,
        clients:     null,
        subClients:  null,
        poNumbers:   null,
        gst:         null,
        tcs:         null,
        save:        null,
        tempSave:    null,
        deleteItem:  null,
    },
};

const clientTradingInvoiceSlice = createSlice({
    name: 'clientTradingInvoice',
    initialState,
    reducers: {
        clearTradingSaveResult:    (s) => { s.saveResult = null; s.errors.save = null; },
        clearTradingTempDetails:   (s) => { s.tempDetails = []; },
        clearTradingItemsGrid:     (s) => { s.itemsGrid = []; },
        clearTradingSubClients:    (s) => { s.subClients = []; s.poNumbers = []; },
        resetTradingInvoice:       () => initialState,
    },
    extraReducers: (builder) => {

        builder
            .addCase(fetchTradingCostCenters.pending,   s => { s.loading.costCenters = true;  s.errors.costCenters = null; s.costCenters = []; })
            .addCase(fetchTradingCostCenters.fulfilled, (s, a) => { s.loading.costCenters = false; s.costCenters = a.payload; })
            .addCase(fetchTradingCostCenters.rejected,  (s, a) => { s.loading.costCenters = false; s.errors.costCenters = a.payload; });

        builder
            .addCase(fetchTradingItems.pending,   s => { s.loading.tradeItems = true;  s.errors.tradeItems = null; s.tradeItems = []; })
            .addCase(fetchTradingItems.fulfilled, (s, a) => { s.loading.tradeItems = false; s.tradeItems = a.payload; })
            .addCase(fetchTradingItems.rejected,  (s, a) => { s.loading.tradeItems = false; s.errors.tradeItems = a.payload; });

        builder
            .addCase(fetchTradingItemTempDetails.pending,   s => { s.loading.tempDetails = true;  s.errors.tempDetails = null; s.tempDetails = []; })
            .addCase(fetchTradingItemTempDetails.fulfilled, (s, a) => { s.loading.tempDetails = false; s.tempDetails = a.payload; })
            .addCase(fetchTradingItemTempDetails.rejected,  (s, a) => { s.loading.tempDetails = false; s.errors.tempDetails = a.payload; });

        builder
            .addCase(fetchTradingItemsGrid.pending,   s => { s.loading.itemsGrid = true;  s.errors.itemsGrid = null; s.itemsGrid = []; })
            .addCase(fetchTradingItemsGrid.fulfilled, (s, a) => { s.loading.itemsGrid = false; s.itemsGrid = a.payload; })
            .addCase(fetchTradingItemsGrid.rejected,  (s, a) => { s.loading.itemsGrid = false; s.errors.itemsGrid = a.payload; });

        builder
            .addCase(addTempTradingItems.pending,   s => { s.loading.tempSave = true;  s.errors.tempSave = null; s.tempSaveResult = null; })
            .addCase(addTempTradingItems.fulfilled, (s, a) => { s.loading.tempSave = false; s.tempSaveResult = a.payload; })
            .addCase(addTempTradingItems.rejected,  (s, a) => { s.loading.tempSave = false; s.errors.tempSave = a.payload; });

        builder
            .addCase(removeTradingStockItem.pending,   s => { s.loading.deleteItem = true;  s.errors.deleteItem = null; })
            .addCase(removeTradingStockItem.fulfilled, s => { s.loading.deleteItem = false; })
            .addCase(removeTradingStockItem.rejected,  (s, a) => { s.loading.deleteItem = false; s.errors.deleteItem = a.payload; });

        builder
            .addCase(fetchTradingClients.pending,   s => { s.loading.clients = true;  s.errors.clients = null; s.clients = []; })
            .addCase(fetchTradingClients.fulfilled, (s, a) => { s.loading.clients = false; s.clients = a.payload; })
            .addCase(fetchTradingClients.rejected,  (s, a) => { s.loading.clients = false; s.errors.clients = a.payload; });

        builder
            .addCase(fetchTradingSubClients.pending,   s => { s.loading.subClients = true;  s.errors.subClients = null; s.subClients = []; })
            .addCase(fetchTradingSubClients.fulfilled, (s, a) => { s.loading.subClients = false; s.subClients = a.payload; })
            .addCase(fetchTradingSubClients.rejected,  (s, a) => { s.loading.subClients = false; s.errors.subClients = a.payload; });

        builder
            .addCase(fetchTradingSubClientPO.pending,   s => { s.loading.poNumbers = true;  s.errors.poNumbers = null; s.poNumbers = []; })
            .addCase(fetchTradingSubClientPO.fulfilled, (s, a) => { s.loading.poNumbers = false; s.poNumbers = a.payload; })
            .addCase(fetchTradingSubClientPO.rejected,  (s, a) => { s.loading.poNumbers = false; s.errors.poNumbers = a.payload; });

        builder
            .addCase(fetchTradingClientGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.clientGSTNos = []; })
            .addCase(fetchTradingClientGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.clientGSTNos = a.payload; })
            .addCase(fetchTradingClientGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        builder
            .addCase(fetchTradingCompanyGSTNos.pending,   s => { s.loading.gst = true;  s.errors.gst = null; s.companyGSTNos = []; })
            .addCase(fetchTradingCompanyGSTNos.fulfilled, (s, a) => { s.loading.gst = false; s.companyGSTNos = a.payload; })
            .addCase(fetchTradingCompanyGSTNos.rejected,  (s, a) => { s.loading.gst = false; s.errors.gst = a.payload; });

        builder
            .addCase(fetchTradingTCSDCASDCAS.pending,   s => { s.loading.tcs = true;  s.errors.tcs = null; })
            .addCase(fetchTradingTCSDCASDCAS.fulfilled, (s, a) => { s.loading.tcs = false; s.tcsDCASDCAS = a.payload; })
            .addCase(fetchTradingTCSDCASDCAS.rejected,  (s, a) => { s.loading.tcs = false; s.errors.tcs = a.payload; });

        builder
            .addCase(submitTradingInvoice.pending,   s => { s.loading.save = true;  s.errors.save = null; s.saveResult = null; })
            .addCase(submitTradingInvoice.fulfilled, (s, a) => { s.loading.save = false; s.saveResult = a.payload; })
            .addCase(submitTradingInvoice.rejected,  (s, a) => { s.loading.save = false; s.errors.save = a.payload; });
    },
});

export const {
    clearTradingSaveResult,
    clearTradingTempDetails,
    clearTradingItemsGrid,
    clearTradingSubClients,
    resetTradingInvoice,
} = clientTradingInvoiceSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectTradingCostCenters    = s => s.clientTradingInvoice.costCenters;
export const selectTradingItems          = s => s.clientTradingInvoice.tradeItems;
export const selectTradingTempDetails    = s => s.clientTradingInvoice.tempDetails;
export const selectTradingItemsGrid      = s => s.clientTradingInvoice.itemsGrid;
export const selectTradingClients        = s => s.clientTradingInvoice.clients;
export const selectTradingSubClients     = s => s.clientTradingInvoice.subClients;
export const selectTradingPONumbers      = s => s.clientTradingInvoice.poNumbers;
export const selectTradingClientGSTNos   = s => s.clientTradingInvoice.clientGSTNos;
export const selectTradingCompanyGSTNos  = s => s.clientTradingInvoice.companyGSTNos;
export const selectTradingTCSDCASDCAS    = s => s.clientTradingInvoice.tcsDCASDCAS;
export const selectTradingSaveResult     = s => s.clientTradingInvoice.saveResult;
export const selectTradingTempSaveResult = s => s.clientTradingInvoice.tempSaveResult;

export const selectTradingCCLoading        = s => s.clientTradingInvoice.loading.costCenters;
export const selectTradingItemsLoading     = s => s.clientTradingInvoice.loading.tradeItems;
export const selectTradingTempLoading      = s => s.clientTradingInvoice.loading.tempDetails;
export const selectTradingGridLoading      = s => s.clientTradingInvoice.loading.itemsGrid;
export const selectTradingClientsLoading   = s => s.clientTradingInvoice.loading.clients;
export const selectTradingSubCliLoading    = s => s.clientTradingInvoice.loading.subClients;
export const selectTradingPOLoading        = s => s.clientTradingInvoice.loading.poNumbers;
export const selectTradingGSTLoading       = s => s.clientTradingInvoice.loading.gst;
export const selectTradingSaveLoading      = s => s.clientTradingInvoice.loading.save;
export const selectTradingTempSaveLoading  = s => s.clientTradingInvoice.loading.tempSave;
export const selectTradingDeleteLoading    = s => s.clientTradingInvoice.loading.deleteItem;

export const selectTradingSaveError        = s => s.clientTradingInvoice.errors.save;
export const selectTradingTempSaveError    = s => s.clientTradingInvoice.errors.tempSave;

export default clientTradingInvoiceSlice.reducer;
