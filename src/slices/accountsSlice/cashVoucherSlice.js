import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cashVoucherAPI from '../../api/AccountsAPI/cashVoucherAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

export const fetchSelfCCList = createAsyncThunk(
    'cashvoucher/fetchSelfCCList',
    async ({ uid, rid }, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getACCCCCode(uid, rid);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch self CC list');
        }
    }
);

export const fetchOtherCCList = createAsyncThunk(
    'cashvoucher/fetchOtherCCList',
    async ({ id, type }, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCashCCCode(id, type);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch other CC list');
        }
    }
);

export const fetchCCBalance = createAsyncThunk(
    'cashvoucher/fetchCCBalance',
    async (ccCode, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCCCash(ccCode);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch CC balance');
        }
    }
);

export const fetchDCAList = createAsyncThunk(
    'cashvoucher/fetchDCAList',
    async (ccCode, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCashDCACode(ccCode);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch DCA codes');
        }
    }
);

export const fetchSDCAList = createAsyncThunk(
    'cashvoucher/fetchSDCAList',
    async (dcaCode, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCashSDCACode(dcaCode);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch Sub DCA codes');
        }
    }
);

export const fetchGSTNumbers = createAsyncThunk(
    'cashvoucher/fetchGSTNumbers',
    async (_, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCompanyGSTNos('Creditable');
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch GST numbers');
        }
    }
);

export const saveCashVoucher = createAsyncThunk(
    'cashvoucher/saveCashVoucher',
    async (params, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.saveGeneralCashPayment(params);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save cash voucher');
        }
    }
);

export const fetchPendingCashVouchers = createAsyncThunk(
    'cashvoucher/fetchPendingCashVouchers',
    async (roleId, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getPendingCashVouchers(roleId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch pending cash vouchers');
        }
    }
);

export const fetchCashVoucherById = createAsyncThunk(
    'cashvoucher/fetchCashVoucherById',
    async (tranno, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.getCashVoucherById(tranno);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch cash voucher details');
        }
    }
);

export const submitCashVoucherVerification = createAsyncThunk(
    'cashvoucher/submitCashVoucherVerification',
    async (payload, { rejectWithValue }) => {
        try {
            return await cashVoucherAPI.verifyCashVoucher(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to verify cash voucher');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    selfCCList:   [],
    otherCCList:  [],
    ccBalance:    null,      // SelfCCBalance string
    dcaList:      [],
    sdcaList:     [],
    gstNumbers:   [],
    saveResult:   null,
    saveStatus:   null,      // null | 'pending' | 'success' | 'failed'

    // Verification state
    pendingVouchers:       [],
    selectedVoucherDetail: null,
    verifyResult:          null,
    verifyStatus:          null,  // null | 'pending' | 'success' | 'failed'

    loading: {
        selfCCList:      false,
        otherCCList:     false,
        ccBalance:       false,
        dcaList:         false,
        sdcaList:        false,
        gstNumbers:      false,
        save:            false,
        pendingVouchers: false,
        voucherDetail:   false,
        verify:          false,
    },
    errors: {
        selfCCList:      null,
        otherCCList:     null,
        ccBalance:       null,
        dcaList:         null,
        sdcaList:        null,
        gstNumbers:      null,
        save:            null,
        pendingVouchers: null,
        voucherDetail:   null,
        verify:          null,
    },
};

// ==============================================
// SLICE
// ==============================================
const cashVoucherSlice = createSlice({
    name: 'cashvoucher',
    initialState,
    reducers: {
        clearSDCAList: (state) => {
            state.sdcaList         = [];
            state.errors.sdcaList  = null;
        },
        clearDCAAndBelow: (state) => {
            state.dcaList          = [];
            state.sdcaList         = [];
            state.ccBalance        = null;
            state.errors.dcaList   = null;
            state.errors.sdcaList  = null;
            state.errors.ccBalance = null;
        },
        clearSaveResult: (state) => {
            state.saveResult  = null;
            state.saveStatus  = null;
            state.errors.save = null;
        },
        clearVoucherDetail: (state) => {
            state.selectedVoucherDetail = null;
            state.errors.voucherDetail  = null;
        },
        clearVerifyResult: (state) => {
            state.verifyResult          = null;
            state.verifyStatus          = null;
            state.errors.verify         = null;
        },
        resetCashVoucher: (state) => {
            Object.assign(state, initialState);
        },
    },

    extraReducers: (builder) => {

        // ── Self CC List ──────────────────────────────────────────────────────
        builder
            .addCase(fetchSelfCCList.pending, (state) => {
                state.loading.selfCCList = true;
                state.errors.selfCCList  = null;
            })
            .addCase(fetchSelfCCList.fulfilled, (state, action) => {
                state.loading.selfCCList = false;
                state.selfCCList = action.payload?.Data || [];
            })
            .addCase(fetchSelfCCList.rejected, (state, action) => {
                state.loading.selfCCList = false;
                state.errors.selfCCList  = action.payload;
                state.selfCCList         = [];
            });

        // ── Other CC List ─────────────────────────────────────────────────────
        builder
            .addCase(fetchOtherCCList.pending, (state) => {
                state.loading.otherCCList = true;
                state.errors.otherCCList  = null;
            })
            .addCase(fetchOtherCCList.fulfilled, (state, action) => {
                state.loading.otherCCList = false;
                state.otherCCList = action.payload?.Data || [];
            })
            .addCase(fetchOtherCCList.rejected, (state, action) => {
                state.loading.otherCCList = false;
                state.errors.otherCCList  = action.payload;
                state.otherCCList         = [];
            });

        // ── CC Balance ────────────────────────────────────────────────────────
        builder
            .addCase(fetchCCBalance.pending, (state) => {
                state.loading.ccBalance = true;
                state.errors.ccBalance  = null;
                state.ccBalance         = null;
            })
            .addCase(fetchCCBalance.fulfilled, (state, action) => {
                state.loading.ccBalance = false;
                const dataArr = action.payload?.Data;
                state.ccBalance = Array.isArray(dataArr)
                    ? (dataArr[0]?.SelfCCBalance ?? null)
                    : (dataArr?.SelfCCBalance ?? null);
            })
            .addCase(fetchCCBalance.rejected, (state, action) => {
                state.loading.ccBalance = false;
                state.errors.ccBalance  = action.payload;
                state.ccBalance         = null;
            });

        // ── DCA List ──────────────────────────────────────────────────────────
        builder
            .addCase(fetchDCAList.pending, (state) => {
                state.loading.dcaList = true;
                state.errors.dcaList  = null;
                state.dcaList         = [];
                state.sdcaList        = [];
            })
            .addCase(fetchDCAList.fulfilled, (state, action) => {
                state.loading.dcaList = false;
                state.dcaList = action.payload?.Data || [];
            })
            .addCase(fetchDCAList.rejected, (state, action) => {
                state.loading.dcaList = false;
                state.errors.dcaList  = action.payload;
                state.dcaList         = [];
            });

        // ── Sub DCA List ──────────────────────────────────────────────────────
        builder
            .addCase(fetchSDCAList.pending, (state) => {
                state.loading.sdcaList = true;
                state.errors.sdcaList  = null;
                state.sdcaList         = [];
            })
            .addCase(fetchSDCAList.fulfilled, (state, action) => {
                state.loading.sdcaList = false;
                state.sdcaList = action.payload?.Data || [];
            })
            .addCase(fetchSDCAList.rejected, (state, action) => {
                state.loading.sdcaList = false;
                state.errors.sdcaList  = action.payload;
                state.sdcaList         = [];
            });

        // ── GST Numbers ───────────────────────────────────────────────────────
        builder
            .addCase(fetchGSTNumbers.pending, (state) => {
                state.loading.gstNumbers = true;
                state.errors.gstNumbers  = null;
            })
            .addCase(fetchGSTNumbers.fulfilled, (state, action) => {
                state.loading.gstNumbers = false;
                state.gstNumbers = action.payload?.Data || [];
            })
            .addCase(fetchGSTNumbers.rejected, (state, action) => {
                state.loading.gstNumbers = false;
                state.errors.gstNumbers  = action.payload;
                state.gstNumbers         = [];
            });

        // ── Save Cash Voucher ─────────────────────────────────────────────────
        builder
            .addCase(saveCashVoucher.pending, (state) => {
                state.loading.save  = true;
                state.errors.save   = null;
                state.saveStatus    = 'pending';
            })
            .addCase(saveCashVoucher.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult   = action.payload;
                const data = action.payload?.Data || '';
                const ok   = typeof data === 'string' && data.toLowerCase().includes('approved successfully');
                state.saveStatus  = ok ? 'success' : 'failed';
                if (!ok) state.errors.save = (typeof data === 'string' && data) || 'Save failed';
            })
            .addCase(saveCashVoucher.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save  = action.payload;
                state.saveStatus   = 'failed';
            });

        // ── Pending Cash Vouchers (Verification List) ─────────────────────────
        builder
            .addCase(fetchPendingCashVouchers.pending, (state) => {
                state.loading.pendingVouchers = true;
                state.errors.pendingVouchers  = null;
            })
            .addCase(fetchPendingCashVouchers.fulfilled, (state, action) => {
                state.loading.pendingVouchers = false;
                state.pendingVouchers = action.payload?.Data || [];
            })
            .addCase(fetchPendingCashVouchers.rejected, (state, action) => {
                state.loading.pendingVouchers = false;
                state.errors.pendingVouchers  = action.payload;
                state.pendingVouchers         = [];
            });

        // ── Cash Voucher Detail by Id ──────────────────────────────────────────
        builder
            .addCase(fetchCashVoucherById.pending, (state) => {
                state.loading.voucherDetail   = true;
                state.errors.voucherDetail    = null;
                state.selectedVoucherDetail   = null;
            })
            .addCase(fetchCashVoucherById.fulfilled, (state, action) => {
                state.loading.voucherDetail = false;
                const data = action.payload?.Data;
                state.selectedVoucherDetail = Array.isArray(data) ? data[0] : (data || null);
            })
            .addCase(fetchCashVoucherById.rejected, (state, action) => {
                state.loading.voucherDetail = false;
                state.errors.voucherDetail  = action.payload;
                state.selectedVoucherDetail = null;
            });

        // ── Verify Cash Voucher ───────────────────────────────────────────────
        builder
            .addCase(submitCashVoucherVerification.pending, (state) => {
                state.loading.verify = true;
                state.errors.verify  = null;
                state.verifyStatus   = 'pending';
            })
            .addCase(submitCashVoucherVerification.fulfilled, (state, action) => {
                state.loading.verify = false;
                state.verifyResult   = action.payload;
                const raw = action.payload?.Data || action.payload || '';
                const ok  = typeof raw === 'string' && raw.split(',')[0].trim().toLowerCase() === 'submitted';
                state.verifyStatus  = ok ? 'success' : 'failed';
                if (!ok) state.errors.verify = (typeof raw === 'string' && raw) || 'Verification failed';
            })
            .addCase(submitCashVoucherVerification.rejected, (state, action) => {
                state.loading.verify = false;
                state.errors.verify  = action.payload;
                state.verifyStatus   = 'failed';
            });
    },
});

export const {
    clearSDCAList,
    clearDCAAndBelow,
    clearSaveResult,
    clearVoucherDetail,
    clearVerifyResult,
    resetCashVoucher,
} = cashVoucherSlice.actions;

// ==============================================
// SELECTORS
// ==============================================
export const selectSelfCCList         = (s) => s.cashvoucher.selfCCList;
export const selectOtherCCList        = (s) => s.cashvoucher.otherCCList;
export const selectCCBalance          = (s) => s.cashvoucher.ccBalance;
export const selectDCAList            = (s) => s.cashvoucher.dcaList;
export const selectSDCAList           = (s) => s.cashvoucher.sdcaList;
export const selectGSTNumbers         = (s) => s.cashvoucher.gstNumbers;
export const selectSaveResult         = (s) => s.cashvoucher.saveResult;
export const selectSaveStatus         = (s) => s.cashvoucher.saveStatus;

export const selectSelfCCLoading      = (s) => s.cashvoucher.loading.selfCCList;
export const selectOtherCCLoading     = (s) => s.cashvoucher.loading.otherCCList;
export const selectCCBalanceLoading   = (s) => s.cashvoucher.loading.ccBalance;
export const selectDCALoading         = (s) => s.cashvoucher.loading.dcaList;
export const selectSDCALoading        = (s) => s.cashvoucher.loading.sdcaList;
export const selectGSTLoading         = (s) => s.cashvoucher.loading.gstNumbers;
export const selectSaveLoading        = (s) => s.cashvoucher.loading.save;

export const selectSelfCCError        = (s) => s.cashvoucher.errors.selfCCList;
export const selectOtherCCError       = (s) => s.cashvoucher.errors.otherCCList;
export const selectDCAError           = (s) => s.cashvoucher.errors.dcaList;
export const selectSaveError          = (s) => s.cashvoucher.errors.save;

// Verification selectors
export const selectPendingVouchers        = (s) => s.cashvoucher.pendingVouchers;
export const selectSelectedVoucherDetail  = (s) => s.cashvoucher.selectedVoucherDetail;
export const selectVerifyResult           = (s) => s.cashvoucher.verifyResult;
export const selectVerifyStatus           = (s) => s.cashvoucher.verifyStatus;

export const selectPendingVouchersLoading = (s) => s.cashvoucher.loading.pendingVouchers;
export const selectVoucherDetailLoading   = (s) => s.cashvoucher.loading.voucherDetail;
export const selectVerifyLoading          = (s) => s.cashvoucher.loading.verify;

export const selectPendingVouchersError   = (s) => s.cashvoucher.errors.pendingVouchers;
export const selectVoucherDetailError     = (s) => s.cashvoucher.errors.voucherDetail;
export const selectVerifyError            = (s) => s.cashvoucher.errors.verify;

export default cashVoucherSlice.reducer;
