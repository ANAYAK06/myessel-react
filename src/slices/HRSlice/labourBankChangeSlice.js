import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/HRAPI/labourBankChangeAPI';

// ── Bank master thunks ────────────────────────────────────────────────────────

export const fetchEmployeeBanks = createAsyncThunk(
    'labourBankChange/fetchEmployeeBanks',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getEmployeeBanks();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch banks list');
        }
    }
);

export const saveNewBank = createAsyncThunk(
    'labourBankChange/saveNewBank',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.saveEmployeeBank(payload);
            // API returns "Submited" | "Exist" | error string
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to save bank');
        }
    }
);

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchActiveLBContractors = createAsyncThunk(
    'labourBankChange/fetchContractors',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getActiveLBContractors();
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch contractors');
        }
    }
);

export const fetchLabourByType = createAsyncThunk(
    'labourBankChange/fetchLabourByType',
    async ({ prefix, labourType, contractor }, { rejectWithValue }) => {
        try {
            const res = await api.getLabourByType({ prefix, labourType, contractor });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to search labour');
        }
    }
);

export const fetchLabourBankDetails = createAsyncThunk(
    'labourBankChange/fetchBankDetails',
    async ({ labourId, labourType, contractor }, { rejectWithValue }) => {
        try {
            const res = await api.getLabourBankDetails({ labourId, labourType, contractor });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch bank details');
        }
    }
);

export const submitLabourBankChange = createAsyncThunk(
    'labourBankChange/submit',
    async (bankData, { rejectWithValue }) => {
        try {
            const res = await api.editLabourBank(bankData);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit bank change');
        }
    }
);

export const fetchVerifyLBBankChange = createAsyncThunk(
    'labourBankChange/fetchInbox',
    async (roleId, { rejectWithValue }) => {
        try {
            const res = await api.getVerifyLBBankChange({ roleId });
            return res?.Data || [];
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inbox');
        }
    }
);

export const fetchLBBankChangeById = createAsyncThunk(
    'labourBankChange/fetchDetail',
    async ({ labourId, id }, { rejectWithValue }) => {
        try {
            const res = await api.getLBBankChangeById({ labourId, id });
            return res?.Data || null;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch bank change details');
        }
    }
);

export const approveLBBankChange = createAsyncThunk(
    'labourBankChange/approve',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.approveLBBankChange(payload);
            return res?.Data ?? res;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to process approval');
        }
    }
);

// ── Initial state ─────────────────────────────────────────────────────────────

const initialState = {
    contractors: [],
    labourSearchResults: [],
    currentBankDetails: null,
    submitResult: null,

    employeeBanks: [],
    saveNewBankResult: null,

    inbox: [],
    changeDetail: null,
    approvalResult: null,

    loading: {
        contractors: false,
        labourSearch: false,
        bankDetails: false,
        submit: false,
        employeeBanks: false,
        saveNewBank: false,
        inbox: false,
        detail: false,
        approval: false,
    },
    errors: {
        contractors: null,
        labourSearch: null,
        bankDetails: null,
        submit: null,
        employeeBanks: null,
        saveNewBank: null,
        inbox: null,
        detail: null,
        approval: null,
    },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const labourBankChangeSlice = createSlice({
    name: 'labourBankChange',
    initialState,
    reducers: {
        clearLabourSearch: (state) => {
            state.labourSearchResults = [];
            state.currentBankDetails = null;
        },
        clearBankDetails: (state) => {
            state.currentBankDetails = null;
        },
        clearSubmitResult: (state) => {
            state.submitResult = null;
            state.errors.submit = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
            state.errors.approval = null;
        },
        clearSaveNewBankResult: (state) => {
            state.saveNewBankResult = null;
            state.errors.saveNewBank = null;
        },
        resetChangeDetail: (state) => {
            state.changeDetail = null;
            state.approvalResult = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {
        // contractors
        builder
            .addCase(fetchActiveLBContractors.pending, (s) => {
                s.loading.contractors = true; s.errors.contractors = null;
            })
            .addCase(fetchActiveLBContractors.fulfilled, (s, a) => {
                s.loading.contractors = false; s.contractors = a.payload;
            })
            .addCase(fetchActiveLBContractors.rejected, (s, a) => {
                s.loading.contractors = false; s.errors.contractors = a.payload;
            });

        // labour search
        builder
            .addCase(fetchLabourByType.pending, (s) => {
                s.loading.labourSearch = true; s.errors.labourSearch = null;
            })
            .addCase(fetchLabourByType.fulfilled, (s, a) => {
                s.loading.labourSearch = false; s.labourSearchResults = a.payload;
            })
            .addCase(fetchLabourByType.rejected, (s, a) => {
                s.loading.labourSearch = false; s.errors.labourSearch = a.payload;
                s.labourSearchResults = [];
            });

        // bank details
        builder
            .addCase(fetchLabourBankDetails.pending, (s) => {
                s.loading.bankDetails = true; s.errors.bankDetails = null;
                s.currentBankDetails = null;
            })
            .addCase(fetchLabourBankDetails.fulfilled, (s, a) => {
                s.loading.bankDetails = false; s.currentBankDetails = a.payload;
            })
            .addCase(fetchLabourBankDetails.rejected, (s, a) => {
                s.loading.bankDetails = false; s.errors.bankDetails = a.payload;
            });

        // submit
        builder
            .addCase(submitLabourBankChange.pending, (s) => {
                s.loading.submit = true; s.errors.submit = null; s.submitResult = null;
            })
            .addCase(submitLabourBankChange.fulfilled, (s, a) => {
                s.loading.submit = false; s.submitResult = a.payload;
            })
            .addCase(submitLabourBankChange.rejected, (s, a) => {
                s.loading.submit = false; s.errors.submit = a.payload;
            });

        // employee banks list
        builder
            .addCase(fetchEmployeeBanks.pending, (s) => {
                s.loading.employeeBanks = true; s.errors.employeeBanks = null;
            })
            .addCase(fetchEmployeeBanks.fulfilled, (s, a) => {
                s.loading.employeeBanks = false; s.employeeBanks = a.payload;
            })
            .addCase(fetchEmployeeBanks.rejected, (s, a) => {
                s.loading.employeeBanks = false; s.errors.employeeBanks = a.payload;
            });

        // save new bank
        builder
            .addCase(saveNewBank.pending, (s) => {
                s.loading.saveNewBank = true; s.errors.saveNewBank = null; s.saveNewBankResult = null;
            })
            .addCase(saveNewBank.fulfilled, (s, a) => {
                s.loading.saveNewBank = false; s.saveNewBankResult = a.payload;
            })
            .addCase(saveNewBank.rejected, (s, a) => {
                s.loading.saveNewBank = false; s.errors.saveNewBank = a.payload;
            });

        // inbox
        builder
            .addCase(fetchVerifyLBBankChange.pending, (s) => {
                s.loading.inbox = true; s.errors.inbox = null;
            })
            .addCase(fetchVerifyLBBankChange.fulfilled, (s, a) => {
                s.loading.inbox = false; s.inbox = a.payload;
            })
            .addCase(fetchVerifyLBBankChange.rejected, (s, a) => {
                s.loading.inbox = false; s.errors.inbox = a.payload; s.inbox = [];
            });

        // detail
        builder
            .addCase(fetchLBBankChangeById.pending, (s) => {
                s.loading.detail = true; s.errors.detail = null; s.changeDetail = null;
            })
            .addCase(fetchLBBankChangeById.fulfilled, (s, a) => {
                s.loading.detail = false; s.changeDetail = a.payload;
            })
            .addCase(fetchLBBankChangeById.rejected, (s, a) => {
                s.loading.detail = false; s.errors.detail = a.payload;
            });

        // approval
        builder
            .addCase(approveLBBankChange.pending, (s) => {
                s.loading.approval = true; s.errors.approval = null;
            })
            .addCase(approveLBBankChange.fulfilled, (s, a) => {
                s.loading.approval = false; s.approvalResult = a.payload;
            })
            .addCase(approveLBBankChange.rejected, (s, a) => {
                s.loading.approval = false; s.errors.approval = a.payload;
            });
    },
});

export const {
    clearLabourSearch,
    clearBankDetails,
    clearSubmitResult,
    clearApprovalResult,
    clearSaveNewBankResult,
    resetChangeDetail,
    resetAll,
} = labourBankChangeSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectContractors      = (s) => s.labourBankChange.contractors;
export const selectLabourResults    = (s) => Array.isArray(s.labourBankChange.labourSearchResults) ? s.labourBankChange.labourSearchResults : [];
export const selectCurrentBank      = (s) => s.labourBankChange.currentBankDetails;
export const selectSubmitResult     = (s) => s.labourBankChange.submitResult;
export const selectEmployeeBanks    = (s) => Array.isArray(s.labourBankChange.employeeBanks) ? s.labourBankChange.employeeBanks : [];
export const selectSaveNewBankResult = (s) => s.labourBankChange.saveNewBankResult;
export const selectInbox            = (s) => Array.isArray(s.labourBankChange.inbox) ? s.labourBankChange.inbox : [];
export const selectChangeDetail     = (s) => s.labourBankChange.changeDetail;
export const selectApprovalResult   = (s) => s.labourBankChange.approvalResult;

export const selectLoading          = (s) => s.labourBankChange.loading;
export const selectErrors           = (s) => s.labourBankChange.errors;

export default labourBankChangeSlice.reducer;
