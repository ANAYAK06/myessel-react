import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLedgers, getLedgerVenCl, saveJournal } from '../../api/AccountsAPI/journalVoucherAPI';

// ── Thunks ─────────────────────────────────────────────────────────────────────

export const fetchJVLedgers = createAsyncThunk(
    'journalVoucher/fetchLedgers',
    async ({ LedType }, { rejectWithValue }) => {
        try {
            const data = await getLedgers({ LedType });
            return { LedType, data };
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch ledgers');
        }
    }
);

export const fetchJVInvoices = createAsyncThunk(
    'journalVoucher/fetchInvoices',
    async ({ rowKey, LedType, ventypeval, paytypeval, trantypeval }, { rejectWithValue }) => {
        try {
            const data = await getLedgerVenCl({ LedType, ventypeval, paytypeval, trantypeval });
            return { rowKey, data };
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch invoices');
        }
    }
);

export const submitJournalVoucher = createAsyncThunk(
    'journalVoucher/submit',
    async (payload, { rejectWithValue }) => {
        try {
            return await saveJournal(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save journal voucher');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────────────

const initialState = {
    // Ledger lists keyed by LedType (e.g., { Client: [...], Vendor: [...] })
    ledgersByType:        {},
    ledgersLoading:       {},   // { Client: true/false }

    // Invoice lists keyed by rowKey
    invoicesByRow:        {},
    invoicesLoading:      {},   // { rowKey: true/false }

    // Save
    saveStatus:  null,   // null | 'pending' | 'success' | 'failed'
    saveLoading: false,
    saveError:   null,
};

const journalVoucherSlice = createSlice({
    name: 'journalVoucher',
    initialState,
    reducers: {
        clearInvoicesForRow: (s, { payload: rowKey }) => {
            delete s.invoicesByRow[rowKey];
            delete s.invoicesLoading[rowKey];
        },
        clearSaveResult: (s) => {
            s.saveStatus = null;
            s.saveError  = null;
        },
        resetJournalVoucher: () => initialState,
    },
    extraReducers: (builder) => {
        // Ledgers
        builder
            .addCase(fetchJVLedgers.pending, (s, { meta }) => {
                s.ledgersLoading[meta.arg.LedType] = true;
            })
            .addCase(fetchJVLedgers.fulfilled, (s, { payload }) => {
                s.ledgersLoading[payload.LedType] = false;
                s.ledgersByType[payload.LedType]  = payload.data?.Data || [];
            })
            .addCase(fetchJVLedgers.rejected, (s, { meta }) => {
                s.ledgersLoading[meta.arg.LedType] = false;
            });

        // Invoices per row
        builder
            .addCase(fetchJVInvoices.pending, (s, { meta }) => {
                s.invoicesLoading[meta.arg.rowKey] = true;
                s.invoicesByRow[meta.arg.rowKey]   = [];
            })
            .addCase(fetchJVInvoices.fulfilled, (s, { payload }) => {
                s.invoicesLoading[payload.rowKey] = false;
                s.invoicesByRow[payload.rowKey]   = payload.data?.Data || [];
            })
            .addCase(fetchJVInvoices.rejected, (s, { meta }) => {
                s.invoicesLoading[meta.arg.rowKey] = false;
            });

        // Submit
        builder
            .addCase(submitJournalVoucher.pending, (s) => {
                s.saveLoading = true;
                s.saveStatus  = 'pending';
                s.saveError   = null;
            })
            .addCase(submitJournalVoucher.fulfilled, (s, { payload }) => {
                s.saveLoading = false;
                const raw = typeof payload === 'string' ? payload : (payload?.Data || '');
                s.saveStatus = raw === 'Successfull' ? 'success' : 'failed';
                if (s.saveStatus === 'failed') s.saveError = raw || 'Journal voucher save failed';
            })
            .addCase(submitJournalVoucher.rejected, (s, { payload }) => {
                s.saveLoading = false;
                s.saveStatus  = 'failed';
                s.saveError   = payload;
            });
    },
});

export const {
    clearInvoicesForRow,
    clearSaveResult,
    resetJournalVoucher,
} = journalVoucherSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectJVLedgersByType   = (type) => (s) => s.journalVoucher.ledgersByType[type] || [];
export const selectJVLedgersLoading  = (type) => (s) => !!s.journalVoucher.ledgersLoading[type];
export const selectJVInvoicesByRow   = (key)  => (s) => s.journalVoucher.invoicesByRow[key] || [];
export const selectJVInvoicesLoading = (key)  => (s) => !!s.journalVoucher.invoicesLoading[key];
export const selectJVSaveStatus      = (s) => s.journalVoucher.saveStatus;
export const selectJVSaveLoading     = (s) => s.journalVoucher.saveLoading;
export const selectJVSaveError       = (s) => s.journalVoucher.saveError;

export default journalVoucherSlice.reducer;
