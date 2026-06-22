import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/PurchaseAPI/indentCreationAPI';

// ── Shared mapper ─────────────────────────────────────────────────────────────

const mapLineItem = (item, meta = {}) => ({
    tempId: item.IndentListId || (Date.now() + Math.random()),
    IndentListId: item.IndentListId || null,
    ItemCode: (item.ItemCode || meta.ItemCode || '').trim(),
    ItemName: item.ItemName || meta.ItemName || '',
    Specification: item.Specification || '',
    DcaCode: item.DcaCode || item.Dca || '',
    SubDcaCode: item.SubDcaCode || item.SubDca || '',
    CategoryCode: item.CategoryCode || meta.CategoryCode || '',
    CategoryName: item.CategoryName || meta.CategoryName || '',
    CapitalMaterialType: item.CapitalMasterType || meta.CapitalMaterialType || '',
    CCCode: item.Costcenter || meta.Costcenter || '',
    BasicPrice: parseFloat(item.BasicPrice || 0),
    Units: item.Units || '',
    Qty: parseFloat(item.Quantity || item.Qty || 0),
    Amount: parseFloat(item.Amount || 0),
});

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCCType = createAsyncThunk(
    'indentCreation/fetchCCType',
    async (CCType, { rejectWithValue }) => {
        try {
            const res = await api.getCostCenterType(CCType);
            const data = res?.Data;
            return Array.isArray(data) ? data[0] : data;
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch CC type'); }
    }
);

export const fetchCapitalMasterTypes = createAsyncThunk(
    'indentCreation/fetchCapitalMasterTypes',
    async (Type, { rejectWithValue }) => {
        try {
            const res = await api.getCapitalMasterTypes(Type);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch capital types'); }
    }
);

export const fetchStagedItems = createAsyncThunk(
    'indentCreation/fetchStagedItems',
    async ({ CCode, CapitalItemcode, Materialtype }, { rejectWithValue }) => {
        try {
            const res = await api.getItemCodesByCC(CCode, CapitalItemcode, Materialtype);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to load staged items'); }
    }
);

export const fetchIndentCategories = createAsyncThunk(
    'indentCreation/fetchCategories',
    async (CType, { rejectWithValue }) => {
        try {
            const res = await api.getIndentCategories(CType);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to fetch categories'); }
    }
);

export const searchItems = createAsyncThunk(
    'indentCreation/searchItems',
    async ({ Pfx, Typ, Cat }, { rejectWithValue }) => {
        try {
            const res = await api.getAutoComplete(Pfx, Typ, Cat);
            return res?.Data || [];
        } catch (err) { return rejectWithValue(err.message || 'Failed to search items'); }
    }
);

// payload: { ItemCode, Costcenter, CapitalMaterialType, CapitalMaterials, ItemName, CategoryCode, CategoryName }
export const addIndentItem = createAsyncThunk(
    'indentCreation/addItem',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.saveIndentItems({
                ItemCode: payload.ItemCode,
                Costcenter: payload.Costcenter,
                CapitalMaterialType: payload.CapitalMaterialType,
                CapitalMaterials: payload.CapitalMaterials,
            });
            const raw = res?.Data ?? res;
            const rawStr = typeof raw === 'string' ? raw : '';

            if (rawStr.split(',')[0]?.trim().toLowerCase() === 'submited') {
                // Refresh the full list from the server after successful insert
                const listRes = await api.getItemCodesByCC(
                    payload.Costcenter,
                    payload.CapitalMaterials,
                    payload.CapitalMaterialType,
                );
                return { raw, itemMeta: payload, stagedList: listRes?.Data || null };
            }

            return { raw, itemMeta: payload, stagedList: null };
        } catch (err) { return rejectWithValue(err.message || 'Failed to add item'); }
    }
);

export const removeIndentItem = createAsyncThunk(
    'indentCreation/removeItem',
    async ({ IndentListId, tempId }, { rejectWithValue }) => {
        try {
            if (IndentListId) {
                await api.deleteIndentItem({ IndentListId });
            }
            return tempId;
        } catch (err) { return rejectWithValue(err.message || 'Failed to delete item'); }
    }
);

export const submitIndent = createAsyncThunk(
    'indentCreation/submit',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.saveIndent(payload);
            return res?.Data ?? res;
        } catch (err) { return rejectWithValue(err.message || 'Failed to submit indent'); }
    }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
    ccType: null,
    capitalMasterTypes: [],
    categories: [],
    searchResults: [],
    stagedItems: [],
    submitResult: null,
    submitIndentNo: null,
    loading: {
        ccType: false,
        capitalTypes: false,
        categories: false,
        search: false,
        stagedItems: false,
        addItem: false,
        removeItem: false,
        submit: false,
    },
    errors: {
        ccType: null,
        capitalTypes: null,
        categories: null,
        search: null,
        stagedItems: null,
        addItem: null,
        removeItem: null,
        submit: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const indentCreationSlice = createSlice({
    name: 'indentCreation',
    initialState,
    reducers: {
        updateItemQty: (state, action) => {
            const { tempId, qty } = action.payload;
            const item = state.stagedItems.find(i => i.tempId === tempId);
            if (item) {
                item.Qty = parseFloat(qty) || 0;
                if (item.BasicPrice > 0) {
                    item.Amount = parseFloat((item.BasicPrice * item.Qty).toFixed(2));
                }
            }
        },
        updateItemAmount: (state, action) => {
            const { tempId, amount } = action.payload;
            const item = state.stagedItems.find(i => i.tempId === tempId);
            if (item) item.Amount = parseFloat(amount) || 0;
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        clearAddItemError: (state) => {
            state.errors.addItem = null;
        },
        clearSubmitResult: (state) => {
            state.submitResult = null;
            state.submitIndentNo = null;
            state.errors.submit = null;
        },
        resetIndentCreation: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // fetchCCType
            .addCase(fetchCCType.pending, (s) => {
                s.loading.ccType = true; s.errors.ccType = null;
                s.ccType = null; s.capitalMasterTypes = []; s.categories = [];
            })
            .addCase(fetchCCType.fulfilled, (s, a) => { s.loading.ccType = false; s.ccType = a.payload; })
            .addCase(fetchCCType.rejected, (s, a) => { s.loading.ccType = false; s.errors.ccType = a.payload; })

            // fetchCapitalMasterTypes
            .addCase(fetchCapitalMasterTypes.pending, (s) => {
                s.loading.capitalTypes = true; s.errors.capitalTypes = null; s.capitalMasterTypes = []; s.categories = [];
            })
            .addCase(fetchCapitalMasterTypes.fulfilled, (s, a) => { s.loading.capitalTypes = false; s.capitalMasterTypes = a.payload; })
            .addCase(fetchCapitalMasterTypes.rejected, (s, a) => { s.loading.capitalTypes = false; s.errors.capitalTypes = a.payload; })

            // fetchIndentCategories
            .addCase(fetchIndentCategories.pending, (s) => {
                s.loading.categories = true; s.errors.categories = null; s.categories = [];
            })
            .addCase(fetchIndentCategories.fulfilled, (s, a) => { s.loading.categories = false; s.categories = a.payload; })
            .addCase(fetchIndentCategories.rejected, (s, a) => { s.loading.categories = false; s.errors.categories = a.payload; })

            // searchItems
            .addCase(searchItems.pending, (s) => { s.loading.search = true; s.errors.search = null; s.searchResults = []; })
            .addCase(searchItems.fulfilled, (s, a) => { s.loading.search = false; s.searchResults = a.payload; })
            .addCase(searchItems.rejected, (s, a) => { s.loading.search = false; s.errors.search = a.payload; })

            // fetchStagedItems
            .addCase(fetchStagedItems.pending, (s) => { s.loading.stagedItems = true; s.errors.stagedItems = null; })
            .addCase(fetchStagedItems.fulfilled, (s, a) => {
                s.loading.stagedItems = false;
                s.stagedItems = a.payload.map(item => mapLineItem(item));
            })
            .addCase(fetchStagedItems.rejected, (s, a) => { s.loading.stagedItems = false; s.errors.stagedItems = a.payload; })

            // addIndentItem
            .addCase(addIndentItem.pending, (s) => { s.loading.addItem = true; s.errors.addItem = null; })
            .addCase(addIndentItem.fulfilled, (s, a) => {
                s.loading.addItem = false;
                const { raw, itemMeta, stagedList } = a.payload;

                if (Array.isArray(stagedList) && stagedList.length > 0) {
                    // Authoritative list from GetItemCodesbyCC — preserves user's existing Qty/Amount
                    const existing = new Map(s.stagedItems.map(i => [i.IndentListId, i]));
                    s.stagedItems = stagedList.map(item => {
                        const mapped = mapLineItem(item, itemMeta);
                        const prev = existing.get(mapped.IndentListId);
                        return prev
                            ? { ...mapped, Qty: prev.Qty, Amount: prev.Amount }
                            : mapped;
                    });
                } else {
                    const rawStr = typeof raw === 'string' ? raw : '';
                    if (rawStr.split(',')[0]?.trim().toLowerCase() !== 'submited') {
                        s.errors.addItem = rawStr || 'Failed to add item';
                    }
                    // If stagedList is empty/null but insert succeeded, leave list unchanged
                    // (fetchStagedItems will be dispatched separately if needed)
                }
            })
            .addCase(addIndentItem.rejected, (s, a) => { s.loading.addItem = false; s.errors.addItem = a.payload; })

            // removeIndentItem
            .addCase(removeIndentItem.pending, (s) => { s.loading.removeItem = true; s.errors.removeItem = null; })
            .addCase(removeIndentItem.fulfilled, (s, a) => {
                s.loading.removeItem = false;
                s.stagedItems = s.stagedItems.filter(i => i.tempId !== a.payload);
            })
            .addCase(removeIndentItem.rejected, (s, a) => { s.loading.removeItem = false; s.errors.removeItem = a.payload; })

            // submitIndent
            .addCase(submitIndent.pending, (s) => {
                s.loading.submit = true; s.errors.submit = null;
                s.submitResult = null; s.submitIndentNo = null;
            })
            .addCase(submitIndent.fulfilled, (s, a) => {
                s.loading.submit = false;
                const raw = typeof a.payload === 'string' ? a.payload : '';
                const parts = raw.split(',');
                if (parts[0]?.trim().toLowerCase() === 'submited') {
                    s.submitResult = 'Submited';
                    s.submitIndentNo = parts[1]?.trim() || null;
                    s.stagedItems = [];
                } else {
                    s.errors.submit = raw || 'Submission failed';
                }
            })
            .addCase(submitIndent.rejected, (s, a) => { s.loading.submit = false; s.errors.submit = a.payload; });
    },
});

export const {
    updateItemQty,
    updateItemAmount,
    clearSearchResults,
    clearAddItemError,
    clearSubmitResult,
    resetIndentCreation,
} = indentCreationSlice.actions;


// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCCType               = (s) => s.indentCreation.ccType;
export const selectCapitalMasterTypes   = (s) => s.indentCreation.capitalMasterTypes;
export const selectIndentCategories     = (s) => s.indentCreation.categories;
export const selectSearchResults        = (s) => s.indentCreation.searchResults;
export const selectStagedItems          = (s) => s.indentCreation.stagedItems;
export const selectSubmitResult         = (s) => s.indentCreation.submitResult;
export const selectSubmitIndentNo       = (s) => s.indentCreation.submitIndentNo;
export const selectIndentCreationLoading = (s) => s.indentCreation.loading;
export const selectIndentCreationErrors  = (s) => s.indentCreation.errors;

export default indentCreationSlice.reducer;
