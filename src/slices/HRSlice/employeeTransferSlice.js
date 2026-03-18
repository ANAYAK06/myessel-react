import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as employeeTransferAPI from '../../api/HRAPI/staffTransferAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

// 1. Get Employee Extender (search by prefix - for employee autocomplete)
export const fetchEmployeeExtender = createAsyncThunk(
    'employeeTransfer/fetchEmployeeExtender',
    async (prefix, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Extender:', prefix);
            const response = await employeeTransferAPI.getEmployeeExtender(prefix);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee extender');
        }
    }
);

// 2. Get Employee CC Code (fetch current cost center for selected employee)
export const fetchEmployeeCCCode = createAsyncThunk(
    'employeeTransfer/fetchEmployeeCCCode',
    async (empId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee CC Code:', empId);
            const response = await employeeTransferAPI.getEmployeeCCCode(empId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee CC code');
        }
    }
);

// 3. Get All Employee Cost Centers (dropdown for transfer-to CC)
export const fetchAllEmpCC = createAsyncThunk(
    'employeeTransfer/fetchAllEmpCC',
    async (cc, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching All Employee Cost Centers:', cc);
            const response = await employeeTransferAPI.getAllEmpCC(cc);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch all employee cost centers');
        }
    }
);

// 4. Save Employee Transfer Details
export const saveEmployeeTransferDetails = createAsyncThunk(
    'employeeTransfer/saveEmployeeTransferDetails',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Employee Transfer Details:', params);
            const response = await employeeTransferAPI.saveEmployeeTransferDetails(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save employee transfer details');
        }
    }
);

// 5. Fetch Verify Employee Transfer Grid (inbox list by role)
export const fetchVerifyEmployeeTransferGrid = createAsyncThunk(
    'employeeTransfer/fetchVerifyEmployeeTransferGrid',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Employee Transfer Grid:', roleId);
            const response = await employeeTransferAPI.getVerifyEmployeeTransferGrid(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verify employee transfer grid');
        }
    }
);

// 6. Fetch Verify Employee Transfer View (detail view for approval)
export const fetchVerifyEmployeeTransferView = createAsyncThunk(
    'employeeTransfer/fetchVerifyEmployeeTransferView',
    async (lvId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Employee Transfer View:', lvId);
            const response = await employeeTransferAPI.getVerifyEmployeeTransferView(lvId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verify employee transfer view');
        }
    }
);

// 7. Approve / Reject Employee Transfer
export const approveEmployeeTransfer = createAsyncThunk(
    'employeeTransfer/approveEmployeeTransfer',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving/Rejecting Employee Transfer:', params);
            const response = await employeeTransferAPI.approveEmployeeTransfer(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve/reject employee transfer');
        }
    }
);

// 8. Fetch Employee Extender Report (report search by prefix)
export const fetchEmployeeExtenderReport = createAsyncThunk(
    'employeeTransfer/fetchEmployeeExtenderReport',
    async (prefix, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Employee Extender Report:', prefix);
            const response = await employeeTransferAPI.getEmployeeExtenderReport(prefix);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee extender report');
        }
    }
);

// 9. Fetch Verify Employee Transfer Report View (report detail view)
export const fetchVerifyEmployeeTransferReportView = createAsyncThunk(
    'employeeTransfer/fetchVerifyEmployeeTransferReportView',
    async (lvId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Verify Employee Transfer Report View:', lvId);
            const response = await employeeTransferAPI.getVerifyEmployeeTransferReportView(lvId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch verify employee transfer report view');
        }
    }
);

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Form / Entry ───────────────────────────
    employeeExtenderList: [],       // autocomplete suggestions
    employeeCCCode: null,           // current CC of selected employee
    allEmpCCList: [],               // dropdown options for To CC

    // ── Save Operation ─────────────────────────
    saveResult: null,
    saveStatus: null,               // null | 'pending' | 'success' | 'failed'

    // ── Inbox / Verification List ──────────────
    transferGridList: [],

    // ── Selected Transfer Detail ───────────────
    selectedLvId: null,
    transferViewData: null,

    // ── Approve Operation ──────────────────────
    approveResult: null,
    approveStatus: null,            // null | 'pending' | 'success' | 'failed'

    // ── Report ─────────────────────────────────
    employeeExtenderReportList: [], // report autocomplete suggestions
    transferReportViewData: null,   // report detail view

    // ── Loading States ─────────────────────────
    loading: {
        employeeExtenderList: false,
        employeeCCCode: false,
        allEmpCCList: false,
        save: false,
        transferGridList: false,
        transferViewData: false,
        approve: false,
        employeeExtenderReportList: false,
        transferReportViewData: false,
    },

    // ── Error States ───────────────────────────
    errors: {
        employeeExtenderList: null,
        employeeCCCode: null,
        allEmpCCList: null,
        save: null,
        transferGridList: null,
        transferViewData: null,
        approve: null,
        employeeExtenderReportList: null,
        transferReportViewData: null,
    },
};

// ==============================================
// HELPERS
// ==============================================

// SP returns "Successfull" on save and "Submitted" on approve
const resolveSaveStatus = (payload) => {
    // Backend ALWAYS returns ResponseCode 200 — never use it alone as success signal.
    // IsSuccessful is the authoritative flag; Data contains either the success token
    // ("Successfull") or a plain-English error message.
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || '');

    // Rule: IsSuccessful=true  → success
    //       IsSuccessful=false → always failure, regardless of ResponseCode
    //       Fallback (no IsSuccessful field): check Data string for "Successfull"
    let isSuccess = false;
    if (payload?.IsSuccessful === true) {
        isSuccess = true;
    } else if (payload?.IsSuccessful === false) {
        isSuccess = false;
    } else {
        // IsSuccessful absent — check the SP success token
        isSuccess = typeof responseStr === 'string' &&
            responseStr.toLowerCase() === 'successfull';
    }

    return { isSuccess, responseStr };
};

const resolveApproveStatus = (payload) => {
    // Same rule: IsSuccessful is authoritative. SP returns "Submitted" on success.
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || '');

    let isSuccess = false;
    if (payload?.IsSuccessful === true) {
        isSuccess = true;
    } else if (payload?.IsSuccessful === false) {
        isSuccess = false;
    } else {
        isSuccess = typeof responseStr === 'string' &&
            responseStr.toLowerCase() === 'submitted';
    }

    return { isSuccess, responseStr };
};

// ==============================================
// SLICE
// ==============================================
const employeeTransferSlice = createSlice({
    name: 'employeeTransfer',
    initialState,
    reducers: {
        // ── UI selection ───────────────────────────────────────────────────────
        setSelectedLvId: (state, action) => {
            state.selectedLvId = action.payload;
            // Clear previous detail data when switching selection
            state.transferViewData = null;
            state.errors.transferViewData = null;
            // Reset approve state on new selection
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        // ── Clear employee extender on input reset ─────────────────────────────
        clearEmployeeExtenderList: (state) => {
            state.employeeExtenderList = [];
            state.errors.employeeExtenderList = null;
        },

        // ── Clear CC code when employee selection is reset ─────────────────────
        clearEmployeeCCCode: (state) => {
            state.employeeCCCode = null;
            state.errors.employeeCCCode = null;
        },

        // ── Clear save result ──────────────────────────────────────────────────
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },

        // ── Clear approve result ───────────────────────────────────────────────
        clearApproveResult: (state) => {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },

        // ── Clear transfer detail ──────────────────────────────────────────────
        clearTransferDetail: (state) => {
            state.selectedLvId = null;
            state.transferViewData = null;
            state.errors.transferViewData = null;
        },

        // ── Clear report data ──────────────────────────────────────────────────
        clearReportData: (state) => {
            state.employeeExtenderReportList = [];
            state.transferReportViewData = null;
            state.errors.employeeExtenderReportList = null;
            state.errors.transferReportViewData = null;
        },

        // ── Clear individual error ─────────────────────────────────────────────
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetAll: () => initialState,
    },

    extraReducers: (builder) => {
        // ── 1. Fetch Employee Extender ────────────────────────────────────────
        builder
            .addCase(fetchEmployeeExtender.pending, (state) => {
                state.loading.employeeExtenderList = true;
                state.errors.employeeExtenderList = null;
            })
            .addCase(fetchEmployeeExtender.fulfilled, (state, action) => {
                state.loading.employeeExtenderList = false;
                console.log('✅ Employee Extender fulfilled:', action.payload);
                state.employeeExtenderList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmployeeExtender.rejected, (state, action) => {
                state.loading.employeeExtenderList = false;
                state.errors.employeeExtenderList = action.payload;
                state.employeeExtenderList = [];
            });

        // ── 2. Fetch Employee CC Code ─────────────────────────────────────────
        builder
            .addCase(fetchEmployeeCCCode.pending, (state) => {
                state.loading.employeeCCCode = true;
                state.errors.employeeCCCode = null;
                state.employeeCCCode = null;
            })
            .addCase(fetchEmployeeCCCode.fulfilled, (state, action) => {
                state.loading.employeeCCCode = false;
                console.log('✅ Employee CC Code fulfilled:', action.payload);
                // API returns Data[0] = { FromCC: 'CC-12 , Raipur Office', ... }
                const raw = action.payload?.Data || action.payload;
                state.employeeCCCode = Array.isArray(raw) ? (raw[0] || null) : raw;
            })
            .addCase(fetchEmployeeCCCode.rejected, (state, action) => {
                state.loading.employeeCCCode = false;
                state.errors.employeeCCCode = action.payload;
                state.employeeCCCode = null;
            });

        // ── 3. Fetch All Employee Cost Centers ────────────────────────────────
        builder
            .addCase(fetchAllEmpCC.pending, (state) => {
                state.loading.allEmpCCList = true;
                state.errors.allEmpCCList = null;
            })
            .addCase(fetchAllEmpCC.fulfilled, (state, action) => {
                state.loading.allEmpCCList = false;
                console.log('✅ All Employee CC fulfilled:', action.payload);
                state.allEmpCCList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAllEmpCC.rejected, (state, action) => {
                state.loading.allEmpCCList = false;
                state.errors.allEmpCCList = action.payload;
                state.allEmpCCList = [];
            });

        // ── 4. Save Employee Transfer Details ─────────────────────────────────
        builder
            .addCase(saveEmployeeTransferDetails.pending, (state) => {
                state.loading.save = true;
                state.errors.save = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveEmployeeTransferDetails.fulfilled, (state, action) => {
                state.loading.save = false;
                console.log('✅ Save Employee Transfer fulfilled - Raw Response:', action.payload);
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                if (isSuccess) {
                    state.saveStatus = 'success';
                } else {
                    state.saveStatus = 'failed';
                    state.errors.save = responseStr || 'Save employee transfer failed';
                }
            })
            .addCase(saveEmployeeTransferDetails.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });

        // ── 5. Fetch Verify Employee Transfer Grid ────────────────────────────
        builder
            .addCase(fetchVerifyEmployeeTransferGrid.pending, (state) => {
                state.loading.transferGridList = true;
                state.errors.transferGridList = null;
            })
            .addCase(fetchVerifyEmployeeTransferGrid.fulfilled, (state, action) => {
                state.loading.transferGridList = false;
                console.log('✅ Verify Employee Transfer Grid fulfilled:', action.payload);
                state.transferGridList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifyEmployeeTransferGrid.rejected, (state, action) => {
                state.loading.transferGridList = false;
                state.errors.transferGridList = action.payload;
                state.transferGridList = [];
            });

        // ── 6. Fetch Verify Employee Transfer View ────────────────────────────
        builder
            .addCase(fetchVerifyEmployeeTransferView.pending, (state) => {
                state.loading.transferViewData = true;
                state.errors.transferViewData = null;
                state.transferViewData = null;
            })
            .addCase(fetchVerifyEmployeeTransferView.fulfilled, (state, action) => {
                state.loading.transferViewData = false;
                console.log('✅ Verify Employee Transfer View fulfilled:', action.payload);
                state.transferViewData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchVerifyEmployeeTransferView.rejected, (state, action) => {
                state.loading.transferViewData = false;
                state.errors.transferViewData = action.payload;
                state.transferViewData = null;
            });

        // ── 7. Approve / Reject Employee Transfer ─────────────────────────────
        builder
            .addCase(approveEmployeeTransfer.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
                state.approveStatus = 'pending';
            })
            .addCase(approveEmployeeTransfer.fulfilled, (state, action) => {
                state.loading.approve = false;
                console.log('✅ Approve Employee Transfer fulfilled - Raw Response:', action.payload);
                state.approveResult = action.payload;
                const { isSuccess, responseStr } = resolveApproveStatus(action.payload);
                if (isSuccess) {
                    state.approveStatus = 'success';
                } else {
                    state.approveStatus = 'failed';
                    state.errors.approve = responseStr || 'Approve/Reject employee transfer failed';
                }
            })
            .addCase(approveEmployeeTransfer.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve = action.payload;
                state.approveStatus = 'failed';
                state.approveResult = null;
            });

        // ── 8. Fetch Employee Extender Report ─────────────────────────────────
        builder
            .addCase(fetchEmployeeExtenderReport.pending, (state) => {
                state.loading.employeeExtenderReportList = true;
                state.errors.employeeExtenderReportList = null;
            })
            .addCase(fetchEmployeeExtenderReport.fulfilled, (state, action) => {
                state.loading.employeeExtenderReportList = false;
                console.log('✅ Employee Extender Report fulfilled:', action.payload);
                state.employeeExtenderReportList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchEmployeeExtenderReport.rejected, (state, action) => {
                state.loading.employeeExtenderReportList = false;
                state.errors.employeeExtenderReportList = action.payload;
                state.employeeExtenderReportList = [];
            });

        // ── 9. Fetch Verify Employee Transfer Report View ─────────────────────
        builder
            .addCase(fetchVerifyEmployeeTransferReportView.pending, (state) => {
                state.loading.transferReportViewData = true;
                state.errors.transferReportViewData = null;
                state.transferReportViewData = null;
            })
            .addCase(fetchVerifyEmployeeTransferReportView.fulfilled, (state, action) => {
                state.loading.transferReportViewData = false;
                console.log('✅ Verify Employee Transfer Report View fulfilled:', action.payload);
                state.transferReportViewData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchVerifyEmployeeTransferReportView.rejected, (state, action) => {
                state.loading.transferReportViewData = false;
                state.errors.transferReportViewData = action.payload;
                state.transferReportViewData = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedLvId,
    clearEmployeeExtenderList,
    clearEmployeeCCCode,
    clearSaveResult,
    clearApproveResult,
    clearTransferDetail,
    clearReportData,
    clearError,
    resetAll,
} = employeeTransferSlice.actions;

// ==============================================
// SELECTORS
// ==============================================

// ── Form / Entry Selectors ────────────────────────────────────────────────────
export const selectEmployeeExtenderList = (state) => state.employeeTransfer.employeeExtenderList;
export const selectEmployeeExtenderListArray = (state) => {
    const data = state.employeeTransfer.employeeExtenderList;
    return Array.isArray(data) ? data : [];
};

export const selectEmployeeCCCode = (state) => state.employeeTransfer.employeeCCCode;

export const selectAllEmpCCList = (state) => state.employeeTransfer.allEmpCCList;
export const selectAllEmpCCListArray = (state) => {
    const data = state.employeeTransfer.allEmpCCList;
    return Array.isArray(data) ? data : [];
};

// ── Save Operation Selectors ──────────────────────────────────────────────────
export const selectSaveResult = (state) => state.employeeTransfer.saveResult;
export const selectSaveStatus = (state) => state.employeeTransfer.saveStatus;

// ── Inbox / Verification Selectors ───────────────────────────────────────────
export const selectTransferGridList = (state) => state.employeeTransfer.transferGridList;
export const selectTransferGridListArray = (state) => {
    const data = state.employeeTransfer.transferGridList;
    return Array.isArray(data) ? data : [];
};

// ── Detail Selectors ──────────────────────────────────────────────────────────
export const selectSelectedLvId       = (state) => state.employeeTransfer.selectedLvId;
export const selectTransferViewData   = (state) => state.employeeTransfer.transferViewData;

// ── Approve Operation Selectors ───────────────────────────────────────────────
export const selectApproveResult = (state) => state.employeeTransfer.approveResult;
export const selectApproveStatus = (state) => state.employeeTransfer.approveStatus;

// ── Report Selectors ──────────────────────────────────────────────────────────
export const selectEmployeeExtenderReportList = (state) => state.employeeTransfer.employeeExtenderReportList;
export const selectEmployeeExtenderReportListArray = (state) => {
    const data = state.employeeTransfer.employeeExtenderReportList;
    return Array.isArray(data) ? data : [];
};
export const selectTransferReportViewData = (state) => state.employeeTransfer.transferReportViewData;

// ── Loading Selectors ─────────────────────────────────────────────────────────
export const selectLoading                          = (state) => state.employeeTransfer.loading;
export const selectEmployeeExtenderListLoading      = (state) => state.employeeTransfer.loading.employeeExtenderList;
export const selectEmployeeCCCodeLoading            = (state) => state.employeeTransfer.loading.employeeCCCode;
export const selectAllEmpCCListLoading              = (state) => state.employeeTransfer.loading.allEmpCCList;
export const selectSaveLoading                      = (state) => state.employeeTransfer.loading.save;
export const selectTransferGridListLoading          = (state) => state.employeeTransfer.loading.transferGridList;
export const selectTransferViewDataLoading          = (state) => state.employeeTransfer.loading.transferViewData;
export const selectApproveLoading                   = (state) => state.employeeTransfer.loading.approve;
export const selectEmployeeExtenderReportLoading    = (state) => state.employeeTransfer.loading.employeeExtenderReportList;
export const selectTransferReportViewDataLoading    = (state) => state.employeeTransfer.loading.transferReportViewData;

// ── Error Selectors ───────────────────────────────────────────────────────────
export const selectErrors                           = (state) => state.employeeTransfer.errors;
export const selectEmployeeExtenderListError        = (state) => state.employeeTransfer.errors.employeeExtenderList;
export const selectEmployeeCCCodeError              = (state) => state.employeeTransfer.errors.employeeCCCode;
export const selectAllEmpCCListError                = (state) => state.employeeTransfer.errors.allEmpCCList;
export const selectSaveError                        = (state) => state.employeeTransfer.errors.save;
export const selectTransferGridListError            = (state) => state.employeeTransfer.errors.transferGridList;
export const selectTransferViewDataError            = (state) => state.employeeTransfer.errors.transferViewData;
export const selectApproveError                     = (state) => state.employeeTransfer.errors.approve;
export const selectEmployeeExtenderReportError      = (state) => state.employeeTransfer.errors.employeeExtenderReportList;
export const selectTransferReportViewDataError      = (state) => state.employeeTransfer.errors.transferReportViewData;

// ── Combined Selectors ────────────────────────────────────────────────────────
export const selectIsAnyLoading = (state) =>
    Object.values(state.employeeTransfer.loading).some(Boolean);

export const selectHasAnyError = (state) =>
    Object.values(state.employeeTransfer.errors).some((e) => e !== null);

export const selectIsDetailLoading = (state) =>
    state.employeeTransfer.loading.transferViewData;

export const selectIsFormLoading = (state) =>
    state.employeeTransfer.loading.employeeExtenderList ||
    state.employeeTransfer.loading.employeeCCCode ||
    state.employeeTransfer.loading.allEmpCCList;

// Inbox summary — drives StatsCards / header badges
export const selectTransferSummary = (state) => {
    const list = Array.isArray(state.employeeTransfer.transferGridList)
        ? state.employeeTransfer.transferGridList
        : [];

    return {
        total:          list.length,
        pending:        list.filter((e) => e.Status === 'Pending' || e.Status === 'New').length,
        approved:       list.filter((e) => e.Status === 'Approved').length,
        rejected:       list.filter((e) => e.Status === 'Rejected').length,
        selectedLvId:   state.employeeTransfer.selectedLvId,
        hasSelection:   state.employeeTransfer.selectedLvId !== null,
        approveStatus:  state.employeeTransfer.approveStatus,
        isApproving:    state.employeeTransfer.loading.approve,
        saveStatus:     state.employeeTransfer.saveStatus,
        isSaving:       state.employeeTransfer.loading.save,
    };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default employeeTransferSlice.reducer;