import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as labourExitAPI from '../../api/HRAPI/labourExitAPI';

// ==============================================
// ASYNC THUNKS
// ==============================================

export const fetchLabourForExit = createAsyncThunk(
    'labourExit/fetchLabourForExit',
    async ({ prefix, labourType, contractor }, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getLabourForExit(prefix, labourType, contractor);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labours');
        }
    }
);

export const fetchLBContractors = createAsyncThunk(
    'labourExit/fetchLBContractors',
    async (_, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getLBContractors();
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch contractors');
        }
    }
);

export const fetchLabourDataForExit = createAsyncThunk(
    'labourExit/fetchLabourDataForExit',
    async (labourId, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getLabourDataForExit(labourId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labour data');
        }
    }
);

export const fetchLBRelieveDate = createAsyncThunk(
    'labourExit/fetchLBRelieveDate',
    async ({ resignDate, labourId, groupId }, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getLBRelieveDate(resignDate, labourId, groupId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch relieving date');
        }
    }
);

export const saveLabourExit = createAsyncThunk(
    'labourExit/saveLabourExit',
    async (params, { rejectWithValue }) => {
        try {
            return await labourExitAPI.saveLabourExit(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save labour exit');
        }
    }
);

export const fetchVerifyLBExit = createAsyncThunk(
    'labourExit/fetchVerifyLBExit',
    async (roleId, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getVerifyLBExit(roleId);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labour exit inbox');
        }
    }
);

export const fetchLBExitById = createAsyncThunk(
    'labourExit/fetchLBExitById',
    async (params, { rejectWithValue }) => {
        try {
            return await labourExitAPI.getLBExitById(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch labour exit detail');
        }
    }
);

export const approveLBExit = createAsyncThunk(
    'labourExit/approveLBExit',
    async (params, { rejectWithValue }) => {
        try {
            return await labourExitAPI.approveLBExit(params);
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve labour exit');
        }
    }
);

// ==============================================
// HELPERS
// ==============================================
const resolveSaveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string' ? dataVal : (payload?.Message || 'Save failed');
    const isSuccess = typeof responseStr === 'string' && responseStr.toLowerCase() === 'submited';
    return { isSuccess, responseStr };
};

const resolveApproveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string' ? dataVal : (payload?.Message || 'Approve failed');
    const isSuccess = typeof responseStr === 'string' && responseStr.toLowerCase() === 'submited';
    return { isSuccess, responseStr };
};

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // Entry form
    labourSearchList:   [],
    contractors:        [],
    labourData:         null,
    relieveDate:        null,

    // Save
    saveResult:         null,
    saveStatus:         null,   // null | 'pending' | 'success' | 'failed'

    // Inbox / Verification
    exitGridList:       [],
    selectedId:         null,
    exitViewData:       null,

    // Approve
    approveResult:      null,
    approveStatus:      null,

    loading: {
        labourSearchList: false,
        contractors:      false,
        labourData:       false,
        relieveDate:      false,
        save:             false,
        exitGridList:     false,
        exitViewData:     false,
        approve:          false,
    },
    errors: {
        labourSearchList: null,
        contractors:      null,
        labourData:       null,
        relieveDate:      null,
        save:             null,
        exitGridList:     null,
        exitViewData:     null,
        approve:          null,
    },
};

// ==============================================
// SLICE
// ==============================================
const labourExitSlice = createSlice({
    name: 'labourExit',
    initialState,
    reducers: {
        setSelectedId: (state, action) => {
            state.selectedId = action.payload;
            state.exitViewData = null;
            state.errors.exitViewData = null;
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },
        clearLabourSearchList: (state) => {
            state.labourSearchList = [];
            state.errors.labourSearchList = null;
        },
        clearLabourData: (state) => {
            state.labourData = null;
            state.relieveDate = null;
            state.errors.labourData = null;
            state.errors.relieveDate = null;
        },
        clearSaveResult: (state) => {
            state.saveResult = null;
            state.saveStatus = null;
            state.errors.save = null;
        },
        clearApproveResult: (state) => {
            state.approveResult = null;
            state.approveStatus = null;
            state.errors.approve = null;
        },
        clearExitDetail: (state) => {
            state.selectedId = null;
            state.exitViewData = null;
            state.errors.exitViewData = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },
        resetAll: () => initialState,
    },

    extraReducers: (builder) => {
        // 1. Labour search
        builder
            .addCase(fetchLabourForExit.pending, (state) => {
                state.loading.labourSearchList = true;
                state.errors.labourSearchList = null;
            })
            .addCase(fetchLabourForExit.fulfilled, (state, action) => {
                state.loading.labourSearchList = false;
                state.labourSearchList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchLabourForExit.rejected, (state, action) => {
                state.loading.labourSearchList = false;
                state.errors.labourSearchList = action.payload;
                state.labourSearchList = [];
            });

        // 2. Contractors
        builder
            .addCase(fetchLBContractors.pending, (state) => {
                state.loading.contractors = true;
                state.errors.contractors = null;
            })
            .addCase(fetchLBContractors.fulfilled, (state, action) => {
                state.loading.contractors = false;
                state.contractors = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchLBContractors.rejected, (state, action) => {
                state.loading.contractors = false;
                state.errors.contractors = action.payload;
                state.contractors = [];
            });

        // 3. Labour data
        builder
            .addCase(fetchLabourDataForExit.pending, (state) => {
                state.loading.labourData = true;
                state.errors.labourData = null;
                state.labourData = null;
            })
            .addCase(fetchLabourDataForExit.fulfilled, (state, action) => {
                state.loading.labourData = false;
                const raw = action.payload?.Data || action.payload;
                state.labourData = Array.isArray(raw) ? (raw[0] || null) : raw;
            })
            .addCase(fetchLabourDataForExit.rejected, (state, action) => {
                state.loading.labourData = false;
                state.errors.labourData = action.payload;
                state.labourData = null;
            });

        // 4. Relieve date
        builder
            .addCase(fetchLBRelieveDate.pending, (state) => {
                state.loading.relieveDate = true;
                state.errors.relieveDate = null;
            })
            .addCase(fetchLBRelieveDate.fulfilled, (state, action) => {
                state.loading.relieveDate = false;
                const raw = action.payload?.Data || action.payload;
                state.relieveDate = Array.isArray(raw) ? (raw[0] || null) : raw;
            })
            .addCase(fetchLBRelieveDate.rejected, (state, action) => {
                state.loading.relieveDate = false;
                state.errors.relieveDate = action.payload;
                state.relieveDate = null;
            });

        // 5. Save
        builder
            .addCase(saveLabourExit.pending, (state) => {
                state.loading.save = true;
                state.errors.save = null;
                state.saveStatus = 'pending';
            })
            .addCase(saveLabourExit.fulfilled, (state, action) => {
                state.loading.save = false;
                state.saveResult = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                state.saveStatus = isSuccess ? 'success' : 'failed';
                if (!isSuccess) state.errors.save = responseStr || 'Save failed';
            })
            .addCase(saveLabourExit.rejected, (state, action) => {
                state.loading.save = false;
                state.errors.save = action.payload;
                state.saveStatus = 'failed';
                state.saveResult = null;
            });

        // 6. Inbox list
        builder
            .addCase(fetchVerifyLBExit.pending, (state) => {
                state.loading.exitGridList = true;
                state.errors.exitGridList = null;
            })
            .addCase(fetchVerifyLBExit.fulfilled, (state, action) => {
                state.loading.exitGridList = false;
                state.exitGridList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchVerifyLBExit.rejected, (state, action) => {
                state.loading.exitGridList = false;
                state.errors.exitGridList = action.payload;
                state.exitGridList = [];
            });

        // 7. Exit detail
        builder
            .addCase(fetchLBExitById.pending, (state) => {
                state.loading.exitViewData = true;
                state.errors.exitViewData = null;
                state.exitViewData = null;
            })
            .addCase(fetchLBExitById.fulfilled, (state, action) => {
                state.loading.exitViewData = false;
                state.exitViewData = action.payload?.Data || action.payload || null;
            })
            .addCase(fetchLBExitById.rejected, (state, action) => {
                state.loading.exitViewData = false;
                state.errors.exitViewData = action.payload;
                state.exitViewData = null;
            });

        // 8. Approve
        builder
            .addCase(approveLBExit.pending, (state) => {
                state.loading.approve = true;
                state.errors.approve = null;
                state.approveStatus = 'pending';
            })
            .addCase(approveLBExit.fulfilled, (state, action) => {
                state.loading.approve = false;
                state.approveResult = action.payload;
                const { isSuccess, responseStr } = resolveApproveStatus(action.payload);
                state.approveStatus = isSuccess ? 'success' : 'failed';
                if (!isSuccess) state.errors.approve = responseStr || 'Approve failed';
            })
            .addCase(approveLBExit.rejected, (state, action) => {
                state.loading.approve = false;
                state.errors.approve = action.payload;
                state.approveStatus = 'failed';
                state.approveResult = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    setSelectedId,
    clearLabourSearchList,
    clearLabourData,
    clearSaveResult,
    clearApproveResult,
    clearExitDetail,
    clearError,
    resetAll,
} = labourExitSlice.actions;

// ==============================================
// SELECTORS
// ==============================================
export const selectLabourSearchList      = (state) => state.labourExit.labourSearchList;
export const selectContractors           = (state) => state.labourExit.contractors;
export const selectLabourData            = (state) => state.labourExit.labourData;
export const selectRelieveDate           = (state) => state.labourExit.relieveDate;
export const selectSaveResult            = (state) => state.labourExit.saveResult;
export const selectSaveStatus            = (state) => state.labourExit.saveStatus;
export const selectSaveError             = (state) => state.labourExit.errors.save;
export const selectSaveLoading           = (state) => state.labourExit.loading.save;
export const selectExitGridList          = (state) => state.labourExit.exitGridList;
export const selectExitGridListArray     = (state) => {
    const data = state.labourExit.exitGridList;
    return Array.isArray(data) ? data : [];
};
export const selectSelectedId            = (state) => state.labourExit.selectedId;
export const selectExitViewData          = (state) => state.labourExit.exitViewData;
export const selectApproveResult         = (state) => state.labourExit.approveResult;
export const selectApproveStatus         = (state) => state.labourExit.approveStatus;
export const selectLoading               = (state) => state.labourExit.loading;
export const selectErrors                = (state) => state.labourExit.errors;
export const selectExitGridListLoading   = (state) => state.labourExit.loading.exitGridList;
export const selectExitViewDataLoading   = (state) => state.labourExit.loading.exitViewData;
export const selectApproveLoading        = (state) => state.labourExit.loading.approve;
export const selectExitGridListError     = (state) => state.labourExit.errors.exitGridList;
export const selectExitViewDataError     = (state) => state.labourExit.errors.exitViewData;
export const selectLabourDataLoading     = (state) => state.labourExit.loading.labourData;
export const selectRelieveDateLoading    = (state) => state.labourExit.loading.relieveDate;
export const selectLabourSearchLoading   = (state) => state.labourExit.loading.labourSearchList;

export const selectIsAnyLoading = (state) =>
    Object.values(state.labourExit.loading).some(Boolean);

export const selectExitSummary = (state) => {
    const list = Array.isArray(state.labourExit.exitGridList)
        ? state.labourExit.exitGridList : [];
    return {
        total:         list.length,
        pending:       list.filter((e) => e.Status === 'Pending' || e.Status === 'New').length,
        approved:      list.filter((e) => e.Status === 'Approved').length,
        rejected:      list.filter((e) => e.Status === 'Rejected').length,
        approveStatus: state.labourExit.approveStatus,
        isApproving:   state.labourExit.loading.approve,
        saveStatus:    state.labourExit.saveStatus,
        isSaving:      state.labourExit.loading.save,
    };
};

// ==============================================
// EXPORT REDUCER
// ==============================================
export default labourExitSlice.reducer;
