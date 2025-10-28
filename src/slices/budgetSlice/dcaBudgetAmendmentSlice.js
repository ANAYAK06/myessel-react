import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dcaBudgetAmendmentAPI from '../../api/BudgetAPI/dcaBudgetAmendmentAPI';

// Async Thunks
export const fetchBudgetAssignedCC = createAsyncThunk(
    'dcaBudgetAmendment/fetchBudgetAssignedCC',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getBudgetAssignedCC();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Budget Assigned CC');
        }
    }
);

export const fetchDCABudgetDetails = createAsyncThunk(
    'dcaBudgetAmendment/fetchDCABudgetDetails',
    async ({ ccCode, subtype, year, ccTypeId }, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getDCABudgetDetails(ccCode, subtype, year, ccTypeId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA Budget Details');
        }
    }
);

export const fetchBudgetAssignedCCById = createAsyncThunk(
    'dcaBudgetAmendment/fetchBudgetAssignedCCById',
    async ({ ccCode, year }, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getBudgetAssignedCCById(ccCode, year);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Budget Assigned CC by ID');
        }
    }
);

export const saveSingleDCABudgetAmend = createAsyncThunk(
    'dcaBudgetAmendment/saveSingleDCABudgetAmend',
    async (budgetData, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.saveSingleDCAAmendBudget(budgetData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save Single DCA Budget Amendment');
        }
    }
);

export const saveMultipleDCAAmend = createAsyncThunk(
    'dcaBudgetAmendment/saveMultipleDCAAmend',
    async (amendData, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.multipleDCAAmend(amendData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to save Multiple DCA Amendments');
        }
    }
);

export const fetchVerificationDCAAmends = createAsyncThunk(
    'dcaBudgetAmendment/fetchVerificationDCAAmends',
    async ({ roleId, userId }, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getVerificationDCAAmends(roleId, userId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verification DCA Amends');
        }
    }
);

// ✅ NEW API THUNK - Fetch Verify DCA Budget Amend by ID
export const fetchVerifyDCABudgetAmendById = createAsyncThunk(
    'dcaBudgetAmendment/fetchVerifyDCABudgetAmendById',
    async ({ ccCode, fyear, ctype, status }, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getVerifyDCABudgetAmendById(ccCode, fyear, ctype, status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify DCA Budget Amend by ID');
        }
    }
);

export const fetchDCABudgetAmendGrid = createAsyncThunk(
    'dcaBudgetAmendment/fetchDCABudgetAmendGrid',
    async ({ ccCode, fyear, status }, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.getDCABudgetAmendGrid(ccCode, fyear, status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch DCA Budget Amend Grid');
        }
    }
);

export const updateApprovalDCABudgetAmendment = createAsyncThunk(
    'dcaBudgetAmendment/updateApprovalDCABudgetAmendment',
    async (updateData, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.updateApprovalDCABudgetAmend(updateData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update Approval DCA Budget Amendment');
        }
    }
);

export const approveDCABudgetAmendment = createAsyncThunk(
    'dcaBudgetAmendment/approveDCABudgetAmendment',
    async (approvalData, { rejectWithValue }) => {
        try {
            const response = await dcaBudgetAmendmentAPI.approveDCABudgetAmend(approvalData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to approve DCA Budget Amendment');
        }
    }
);

const initialState = {
    budgetAssignedCC: [],
    dcaBudgetDetails: null,
    budgetAssignedCCById: null,
    verificationDCAAmends: [],
    verifyDCABudgetAmendById: null, // ✅ NEW STATE for the new API
    dcaBudgetAmendGrid: [],
    singleSaveResult: null,
    multipleSaveResult: null,
    updateResult: null,
    approvalResult: null,
    loading: {
        budgetAssignedCC: false,
        dcaBudgetDetails: false,
        budgetAssignedCCById: false,
        saveSingleDCAAmend: false,
        saveMultipleDCAAmend: false,
        verificationDCAAmends: false,
        verifyDCABudgetAmendById: false, // ✅ NEW LOADING STATE
        dcaBudgetAmendGrid: false,
        updateApprovalDCAAmend: false,
        approveDCAAmend: false,
    },
    errors: {
        budgetAssignedCC: null,
        dcaBudgetDetails: null,
        budgetAssignedCCById: null,
        saveSingleDCAAmend: null,
        saveMultipleDCAAmend: null,
        verificationDCAAmends: null,
        verifyDCABudgetAmendById: null, // ✅ NEW ERROR STATE
        dcaBudgetAmendGrid: null,
        updateApprovalDCAAmend: null,
        approveDCAAmend: null,
    },
    selectedRoleId: null,
    selectedUserId: null,
    selectedCCCode: null,
    selectedYear: null,
    selectedFYear: null,
    selectedSubtype: null,
    selectedCCTypeId: null,
    selectedStatus: null,
    selectedAmendId: null,
    selectedCtype: null, // ✅ NEW SELECTOR for Ctype
    approvalStatus: null,
};

const dcaBudgetAmendmentSlice = createSlice({
    name: 'dcaBudgetAmendment',
    initialState,
    reducers: {
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedUserId: (state, action) => {
            state.selectedUserId = action.payload;
        },
        setSelectedCCCode: (state, action) => {
            state.selectedCCCode = action.payload;
        },
        setSelectedYear: (state, action) => {
            state.selectedYear = action.payload;
        },
        setSelectedFYear: (state, action) => {
            state.selectedFYear = action.payload;
        },
        setSelectedSubtype: (state, action) => {
            state.selectedSubtype = action.payload;
        },
        setSelectedCCTypeId: (state, action) => {
            state.selectedCCTypeId = action.payload;
        },
        setSelectedStatus: (state, action) => {
            state.selectedStatus = action.payload;
        },
        setSelectedAmendId: (state, action) => {
            state.selectedAmendId = action.payload;
        },
        // ✅ NEW SETTER for Ctype
        setSelectedCtype: (state, action) => {
            state.selectedCtype = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetDCABudgetData: (state) => {
            state.dcaBudgetDetails = null;
            state.budgetAssignedCCById = null;
            state.verifyDCABudgetAmendById = null; // ✅ RESET NEW STATE
            state.singleSaveResult = null;
            state.multipleSaveResult = null;
            state.updateResult = null;
            state.approvalResult = null;
        },
        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType]) {
                state.errors[errorType] = null;
            }
        },
        resetDCABudgetAmendmentState: (state) => {
            state.budgetAssignedCC = [];
            state.dcaBudgetDetails = null;
            state.budgetAssignedCCById = null;
            state.verificationDCAAmends = [];
            state.verifyDCABudgetAmendById = null; // ✅ RESET NEW STATE
            state.dcaBudgetAmendGrid = [];
            state.singleSaveResult = null;
            state.multipleSaveResult = null;
            state.updateResult = null;
            state.approvalResult = null;
            state.selectedRoleId = null;
            state.selectedUserId = null;
            state.selectedCCCode = null;
            state.selectedYear = null;
            state.selectedFYear = null;
            state.selectedSubtype = null;
            state.selectedCCTypeId = null;
            state.selectedStatus = null;
            state.selectedAmendId = null;
            state.selectedCtype = null; // ✅ RESET NEW SELECTOR
            state.approvalStatus = null;
        },
        clearSingleSaveResult: (state) => {
            state.singleSaveResult = null;
        },
        clearMultipleSaveResult: (state) => {
            state.multipleSaveResult = null;
        },
        clearUpdateResult: (state) => {
            state.updateResult = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },
        resetVerificationData: (state) => {
            state.verificationDCAAmends = [];
        },
        resetAmendGridData: (state) => {
            state.dcaBudgetAmendGrid = [];
        },
        // ✅ NEW RESET ACTION for the new API data
        resetVerifyDCABudgetAmendById: (state) => {
            state.verifyDCABudgetAmendById = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Budget Assigned CC
            .addCase(fetchBudgetAssignedCC.pending, (state) => {
                state.loading.budgetAssignedCC = true;
                state.errors.budgetAssignedCC = null;
            })
            .addCase(fetchBudgetAssignedCC.fulfilled, (state, action) => {
                state.loading.budgetAssignedCC = false;
                state.budgetAssignedCC = action.payload?.Data || [];
            })
            .addCase(fetchBudgetAssignedCC.rejected, (state, action) => {
                state.loading.budgetAssignedCC = false;
                state.errors.budgetAssignedCC = action.payload;
                state.budgetAssignedCC = [];
            })

            // Fetch DCA Budget Details
            .addCase(fetchDCABudgetDetails.pending, (state) => {
                state.loading.dcaBudgetDetails = true;
                state.errors.dcaBudgetDetails = null;
            })
            .addCase(fetchDCABudgetDetails.fulfilled, (state, action) => {
                state.loading.dcaBudgetDetails = false;
                const apiResponse = action.payload;
                
                if (apiResponse?.Data) {
                    // Deep clone to prevent state mutation
                    const extractedData = {
                        ...apiResponse.Data,
                        BudgetItems: apiResponse.Data.BudgetItems 
                            ? [...apiResponse.Data.BudgetItems.map(item => ({...item}))]
                            : [],
                        Details: apiResponse.Data.Details 
                            ? [...apiResponse.Data.Details.map(detail => ({...detail}))]
                            : []
                    };
                    state.dcaBudgetDetails = extractedData;
                } else {
                    state.dcaBudgetDetails = null;
                }
            })
            .addCase(fetchDCABudgetDetails.rejected, (state, action) => {
                state.loading.dcaBudgetDetails = false;
                state.errors.dcaBudgetDetails = action.payload;
                state.dcaBudgetDetails = null;
            })

            // Fetch Budget Assigned CC By ID
            .addCase(fetchBudgetAssignedCCById.pending, (state) => {
                state.loading.budgetAssignedCCById = true;
                state.errors.budgetAssignedCCById = null;
            })
            .addCase(fetchBudgetAssignedCCById.fulfilled, (state, action) => {
                state.loading.budgetAssignedCCById = false;
                state.budgetAssignedCCById = action.payload?.Data || null;
            })
            .addCase(fetchBudgetAssignedCCById.rejected, (state, action) => {
                state.loading.budgetAssignedCCById = false;
                state.errors.budgetAssignedCCById = action.payload;
                state.budgetAssignedCCById = null;
            })

            // Save Single DCA Budget Amend
            .addCase(saveSingleDCABudgetAmend.pending, (state) => {
                state.loading.saveSingleDCAAmend = true;
                state.errors.saveSingleDCAAmend = null;
            })
            .addCase(saveSingleDCABudgetAmend.fulfilled, (state, action) => {
                state.loading.saveSingleDCAAmend = false;
                state.singleSaveResult = action.payload;
            })
            .addCase(saveSingleDCABudgetAmend.rejected, (state, action) => {
                state.loading.saveSingleDCAAmend = false;
                state.errors.saveSingleDCAAmend = action.payload;
            })

            // Save Multiple DCA Amend
            .addCase(saveMultipleDCAAmend.pending, (state) => {
                state.loading.saveMultipleDCAAmend = true;
                state.errors.saveMultipleDCAAmend = null;
            })
            .addCase(saveMultipleDCAAmend.fulfilled, (state, action) => {
                state.loading.saveMultipleDCAAmend = false;
                state.multipleSaveResult = action.payload;
            })
            .addCase(saveMultipleDCAAmend.rejected, (state, action) => {
                state.loading.saveMultipleDCAAmend = false;
                state.errors.saveMultipleDCAAmend = action.payload;
            })

            // Fetch Verification DCA Amends
            .addCase(fetchVerificationDCAAmends.pending, (state) => {
                state.loading.verificationDCAAmends = true;
                state.errors.verificationDCAAmends = null;
            })
            .addCase(fetchVerificationDCAAmends.fulfilled, (state, action) => {
                state.loading.verificationDCAAmends = false;
                state.verificationDCAAmends = action.payload?.Data || [];
            })
            .addCase(fetchVerificationDCAAmends.rejected, (state, action) => {
                state.loading.verificationDCAAmends = false;
                state.errors.verificationDCAAmends = action.payload;
                state.verificationDCAAmends = [];
            })

            // ✅ NEW API - Fetch Verify DCA Budget Amend by ID
            .addCase(fetchVerifyDCABudgetAmendById.pending, (state) => {
                state.loading.verifyDCABudgetAmendById = true;
                state.errors.verifyDCABudgetAmendById = null;
            })
            .addCase(fetchVerifyDCABudgetAmendById.fulfilled, (state, action) => {
                state.loading.verifyDCABudgetAmendById = false;
                state.verifyDCABudgetAmendById = action.payload?.Data || null;
            })
            .addCase(fetchVerifyDCABudgetAmendById.rejected, (state, action) => {
                state.loading.verifyDCABudgetAmendById = false;
                state.errors.verifyDCABudgetAmendById = action.payload;
                state.verifyDCABudgetAmendById = null;
            })

            // Fetch DCA Budget Amend Grid
            .addCase(fetchDCABudgetAmendGrid.pending, (state) => {
                state.loading.dcaBudgetAmendGrid = true;
                state.errors.dcaBudgetAmendGrid = null;
            })
            .addCase(fetchDCABudgetAmendGrid.fulfilled, (state, action) => {
                state.loading.dcaBudgetAmendGrid = false;
                state.dcaBudgetAmendGrid = action.payload?.Data || [];
            })
            .addCase(fetchDCABudgetAmendGrid.rejected, (state, action) => {
                state.loading.dcaBudgetAmendGrid = false;
                state.errors.dcaBudgetAmendGrid = action.payload;
                state.dcaBudgetAmendGrid = [];
            })

            // Update Approval DCA Budget Amendment
            .addCase(updateApprovalDCABudgetAmendment.pending, (state) => {
                state.loading.updateApprovalDCAAmend = true;
                state.errors.updateApprovalDCAAmend = null;
            })
            .addCase(updateApprovalDCABudgetAmendment.fulfilled, (state, action) => {
                state.loading.updateApprovalDCAAmend = false;
                state.updateResult = action.payload;
            })
            .addCase(updateApprovalDCABudgetAmendment.rejected, (state, action) => {
                state.loading.updateApprovalDCAAmend = false;
                state.errors.updateApprovalDCAAmend = action.payload;
            })

            // Approve DCA Budget Amendment
            .addCase(approveDCABudgetAmendment.pending, (state) => {
                state.loading.approveDCAAmend = true;
                state.errors.approveDCAAmend = null;
            })
            .addCase(approveDCABudgetAmendment.fulfilled, (state, action) => {
                state.loading.approveDCAAmend = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approveDCABudgetAmendment.rejected, (state, action) => {
                state.loading.approveDCAAmend = false;
                state.errors.approveDCAAmend = action.payload;
            });
    },
});

export const { 
    setSelectedRoleId,
    setSelectedUserId,
    setSelectedCCCode,
    setSelectedYear,
    setSelectedFYear,
    setSelectedSubtype,
    setSelectedCCTypeId,
    setSelectedStatus,
    setSelectedAmendId,
    setSelectedCtype, // ✅ NEW EXPORT
    setApprovalStatus,
    resetDCABudgetData,
    clearError,
    resetDCABudgetAmendmentState,
    clearSingleSaveResult,
    clearMultipleSaveResult,
    clearUpdateResult,
    clearApprovalResult,
    resetVerificationData,
    resetAmendGridData,
    resetVerifyDCABudgetAmendById // ✅ NEW EXPORT
} = dcaBudgetAmendmentSlice.actions;

// Selectors
export const selectBudgetAssignedCC = (state) => state.dcaBudgetAmendment.budgetAssignedCC;
export const selectDCABudgetDetails = (state) => state.dcaBudgetAmendment.dcaBudgetDetails;
export const selectBudgetAssignedCCById = (state) => state.dcaBudgetAmendment.budgetAssignedCCById;
export const selectVerificationDCAAmends = (state) => state.dcaBudgetAmendment.verificationDCAAmends;
export const selectVerifyDCABudgetAmendById = (state) => state.dcaBudgetAmendment.verifyDCABudgetAmendById; // ✅ NEW SELECTOR
export const selectDCABudgetAmendGrid = (state) => state.dcaBudgetAmendment.dcaBudgetAmendGrid;
export const selectSingleSaveResult = (state) => state.dcaBudgetAmendment.singleSaveResult;
export const selectMultipleSaveResult = (state) => state.dcaBudgetAmendment.multipleSaveResult;
export const selectUpdateResult = (state) => state.dcaBudgetAmendment.updateResult;
export const selectApprovalResult = (state) => state.dcaBudgetAmendment.approvalResult;

export const selectBudgetAssignedCCArray = (state) => {
    const data = state.dcaBudgetAmendment.budgetAssignedCC;
    return Array.isArray(data) ? data : [];
};

export const selectVerificationDCAAmendsArray = (state) => {
    const data = state.dcaBudgetAmendment.verificationDCAAmends;
    return Array.isArray(data) ? data : [];
};

export const selectDCABudgetAmendGridArray = (state) => {
    const data = state.dcaBudgetAmendment.dcaBudgetAmendGrid;
    return Array.isArray(data) ? data : [];
};

export const selectLoading = (state) => state.dcaBudgetAmendment.loading;
export const selectBudgetAssignedCCLoading = (state) => state.dcaBudgetAmendment.loading.budgetAssignedCC;
export const selectDCABudgetDetailsLoading = (state) => state.dcaBudgetAmendment.loading.dcaBudgetDetails;
export const selectBudgetAssignedCCByIdLoading = (state) => state.dcaBudgetAmendment.loading.budgetAssignedCCById;
export const selectSaveSingleDCAAmendLoading = (state) => state.dcaBudgetAmendment.loading.saveSingleDCAAmend;
export const selectSaveMultipleDCAAmendLoading = (state) => state.dcaBudgetAmendment.loading.saveMultipleDCAAmend;
export const selectVerificationDCAAmendsLoading = (state) => state.dcaBudgetAmendment.loading.verificationDCAAmends;
export const selectVerifyDCABudgetAmendByIdLoading = (state) => state.dcaBudgetAmendment.loading.verifyDCABudgetAmendById; // ✅ NEW LOADING SELECTOR
export const selectDCABudgetAmendGridLoading = (state) => state.dcaBudgetAmendment.loading.dcaBudgetAmendGrid;
export const selectUpdateApprovalDCAAmendLoading = (state) => state.dcaBudgetAmendment.loading.updateApprovalDCAAmend;
export const selectApproveDCAAmendLoading = (state) => state.dcaBudgetAmendment.loading.approveDCAAmend;

export const selectErrors = (state) => state.dcaBudgetAmendment.errors;
export const selectBudgetAssignedCCError = (state) => state.dcaBudgetAmendment.errors.budgetAssignedCC;
export const selectDCABudgetDetailsError = (state) => state.dcaBudgetAmendment.errors.dcaBudgetDetails;
export const selectBudgetAssignedCCByIdError = (state) => state.dcaBudgetAmendment.errors.budgetAssignedCCById;
export const selectSaveSingleDCAAmendError = (state) => state.dcaBudgetAmendment.errors.saveSingleDCAAmend;
export const selectSaveMultipleDCAAmendError = (state) => state.dcaBudgetAmendment.errors.saveMultipleDCAAmend;
export const selectVerificationDCAAmendsError = (state) => state.dcaBudgetAmendment.errors.verificationDCAAmends;
export const selectVerifyDCABudgetAmendByIdError = (state) => state.dcaBudgetAmendment.errors.verifyDCABudgetAmendById; // ✅ NEW ERROR SELECTOR
export const selectDCABudgetAmendGridError = (state) => state.dcaBudgetAmendment.errors.dcaBudgetAmendGrid;
export const selectUpdateApprovalDCAAmendError = (state) => state.dcaBudgetAmendment.errors.updateApprovalDCAAmend;
export const selectApproveDCAAmendError = (state) => state.dcaBudgetAmendment.errors.approveDCAAmend;

export const selectSelectedRoleId = (state) => state.dcaBudgetAmendment.selectedRoleId;
export const selectSelectedUserId = (state) => state.dcaBudgetAmendment.selectedUserId;
export const selectSelectedCCCode = (state) => state.dcaBudgetAmendment.selectedCCCode;
export const selectSelectedYear = (state) => state.dcaBudgetAmendment.selectedYear;
export const selectSelectedFYear = (state) => state.dcaBudgetAmendment.selectedFYear;
export const selectSelectedSubtype = (state) => state.dcaBudgetAmendment.selectedSubtype;
export const selectSelectedCCTypeId = (state) => state.dcaBudgetAmendment.selectedCCTypeId;
export const selectSelectedStatus = (state) => state.dcaBudgetAmendment.selectedStatus;
export const selectSelectedAmendId = (state) => state.dcaBudgetAmendment.selectedAmendId;
export const selectSelectedCtype = (state) => state.dcaBudgetAmendment.selectedCtype; // ✅ NEW SELECTOR EXPORT
export const selectApprovalStatus = (state) => state.dcaBudgetAmendment.approvalStatus;

export const selectIsAnyLoading = (state) => Object.values(state.dcaBudgetAmendment.loading).some(loading => loading);
export const selectHasAnyError = (state) => Object.values(state.dcaBudgetAmendment.errors).some(error => error !== null);

export const selectDCABudgetAmendmentSummary = (state) => {
    const verificationArray = Array.isArray(state.dcaBudgetAmendment.verificationDCAAmends) ? state.dcaBudgetAmendment.verificationDCAAmends : [];
    const amendGridArray = Array.isArray(state.dcaBudgetAmendment.dcaBudgetAmendGrid) ? state.dcaBudgetAmendment.dcaBudgetAmendGrid : [];
    
    return {
        totalVerifications: verificationArray.length,
        totalAmendments: amendGridArray.length,
        dcaBudgetDetails: state.dcaBudgetAmendment.dcaBudgetDetails,
        verifyDCABudgetAmendById: state.dcaBudgetAmendment.verifyDCABudgetAmendById, // ✅ NEW FIELD
        approvalStatus: state.dcaBudgetAmendment.approvalStatus,
        isProcessing: state.dcaBudgetAmendment.loading.approveDCAAmend || 
                     state.dcaBudgetAmendment.loading.saveSingleDCAAmend || 
                     state.dcaBudgetAmendment.loading.saveMultipleDCAAmend ||
                     state.dcaBudgetAmendment.loading.updateApprovalDCAAmend ||
                     state.dcaBudgetAmendment.loading.verifyDCABudgetAmendById, // ✅ ADDED TO PROCESSING CHECK
        hasVerifications: verificationArray.length > 0,
        hasAmendments: amendGridArray.length > 0,
        budgetAssigned: state.dcaBudgetAmendment.budgetAssignedCC
    };
};

export const selectDCABudgetAmendmentDetails = (state) => {
    const verificationArray = Array.isArray(state.dcaBudgetAmendment.verificationDCAAmends) ? state.dcaBudgetAmendment.verificationDCAAmends : [];
    const amendGridArray = Array.isArray(state.dcaBudgetAmendment.dcaBudgetAmendGrid) ? state.dcaBudgetAmendment.dcaBudgetAmendGrid : [];
    
    return {
        verifications: verificationArray,
        amendments: amendGridArray,
        totalVerifications: verificationArray.length,
        totalAmendments: amendGridArray.length,
        budgetDetails: state.dcaBudgetAmendment.dcaBudgetDetails,
        verifyDCABudgetAmendById: state.dcaBudgetAmendment.verifyDCABudgetAmendById, // ✅ NEW FIELD
        isLoading: state.dcaBudgetAmendment.loading.dcaBudgetDetails || 
                  state.dcaBudgetAmendment.loading.verificationDCAAmends ||
                  state.dcaBudgetAmendment.loading.verifyDCABudgetAmendById, // ✅ ADDED TO LOADING CHECK
        error: state.dcaBudgetAmendment.errors.dcaBudgetDetails || 
              state.dcaBudgetAmendment.errors.verificationDCAAmends ||
              state.dcaBudgetAmendment.errors.verifyDCABudgetAmendById, // ✅ ADDED TO ERROR CHECK
        hasVerifications: verificationArray.length > 0,
        hasAmendments: amendGridArray.length > 0,
        isEmpty: verificationArray.length === 0 && amendGridArray.length === 0 && 
                !state.dcaBudgetAmendment.loading.verificationDCAAmends && 
                !state.dcaBudgetAmendment.loading.dcaBudgetAmendGrid,
        budgetAssignedData: state.dcaBudgetAmendment.budgetAssignedCCById
    };
};

export const selectDCASaveStatus = (state) => {
    return {
        singleSaveResult: state.dcaBudgetAmendment.singleSaveResult,
        multipleSaveResult: state.dcaBudgetAmendment.multipleSaveResult,
        isSaving: state.dcaBudgetAmendment.loading.saveSingleDCAAmend || 
                 state.dcaBudgetAmendment.loading.saveMultipleDCAAmend,
        saveError: state.dcaBudgetAmendment.errors.saveSingleDCAAmend || 
                  state.dcaBudgetAmendment.errors.saveMultipleDCAAmend,
        hasSaved: !!state.dcaBudgetAmendment.singleSaveResult || 
                 !!state.dcaBudgetAmendment.multipleSaveResult
    };
};

export const selectDCAApprovalStatus = (state) => {
    return {
        approvalResult: state.dcaBudgetAmendment.approvalResult,
        updateResult: state.dcaBudgetAmendment.updateResult,
        isProcessing: state.dcaBudgetAmendment.loading.approveDCAAmend || 
                     state.dcaBudgetAmendment.loading.updateApprovalDCAAmend,
        approvalError: state.dcaBudgetAmendment.errors.approveDCAAmend,
        updateError: state.dcaBudgetAmendment.errors.updateApprovalDCAAmend,
        approvalStatus: state.dcaBudgetAmendment.approvalStatus,
        hasApproved: !!state.dcaBudgetAmendment.approvalResult,
        hasUpdated: !!state.dcaBudgetAmendment.updateResult
    };
};

export default dcaBudgetAmendmentSlice.reducer;