import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffPayRevisionAPI from '../../api/HRAPI/staffPayRevisionAPI';

// ==============================================
// ASYNC THUNKS — VERIFICATION (existing)
// ==============================================

export const fetchVerifyPayRevision = createAsyncThunk(
    'staffpayrevision/fetchVerifyPayRevision',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await staffPayRevisionAPI.getVerifyPayRevision({ roleId });
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Verify Staff Pay Revision Inbox');
        }
    }
);

export const fetchPayRevisionbyRefno = createAsyncThunk(
    'staffpayrevision/fetchPayRevisionbyRefno',
    async (transactionRefno, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Staff Pay Revision Details for TransactionRefno:', transactionRefno);
            const response = await staffPayRevisionAPI.getPayRevisionbyRefno({ transactionRefno });
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch Staff Pay Revision Details');
        }
    }
);

export const approvePayRevision = createAsyncThunk(
    'staffpayrevision/approvePayRevision',
    async (approvalData, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Approving Staff Pay Revision with data:', approvalData);
            const response = await staffPayRevisionAPI.approvePayRevision(approvalData);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to approve Staff Pay Revision');
        }
    }
);

// ==============================================
// ASYNC THUNKS — CREATION (new)
// ==============================================

// 1. Fetch employees eligible for pay revision
export const fetchAppraisalEmp = createAsyncThunk(
    'staffpayrevision/fetchAppraisalEmp',
    async (_, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Appraisal Employees');
            const response = await staffPayRevisionAPI.getAppraisalEmp();
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch appraisal employees');
        }
    }
);

// 2. Fetch employee appraisal data (gives Month, Year, EffectiveDate, GroupId, lstGroups)
export const fetchEmpDataForAppraisal = createAsyncThunk(
    'staffpayrevision/fetchEmpDataForAppraisal',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Emp Data For Appraisal:', empRefNo);
            const response = await staffPayRevisionAPI.getEmpDataForAppraisal(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch employee appraisal data');
        }
    }
);

// 2b. Fetch current CTC data for revision (gives TransactionRefNo, Month, Year, GroupId)
export const fetchCTCDataForRevision = createAsyncThunk(
    'staffpayrevision/fetchCTCDataForRevision',
    async (empRefNo, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching CTC Data For Revision:', empRefNo);
            const response = await staffPayRevisionAPI.getCTCDataForRevision(empRefNo);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch CTC data for revision');
        }
    }
);

// 3. Check CTC access for the current role
export const fetchCTCAccess = createAsyncThunk(
    'staffpayrevision/fetchCTCAccess',
    async (roleId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Checking CTC Access for RoleId:', roleId);
            const response = await staffPayRevisionAPI.checkCTCAccess(roleId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to check CTC access');
        }
    }
);

// 4. Fetch group salary type (daily wage or not)
export const fetchGroupSalaryType = createAsyncThunk(
    'staffpayrevision/fetchGroupSalaryType',
    async (groupId, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Group Salary Type for GroupId:', groupId);
            const response = await staffPayRevisionAPI.getGroupSalaryType(groupId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch group salary type');
        }
    }
);

// 5. Fetch pay revision CTC heads data (editable head list)
export const fetchPayRevisionCTCHeadsData = createAsyncThunk(
    'staffpayrevision/fetchPayRevisionCTCHeadsData',
    async ({ empRefNo, groupId }, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Fetching Pay Revision CTC Heads Data:', { empRefNo, groupId });
            const response = await staffPayRevisionAPI.getPayRevisionCTCHeadsData(empRefNo, groupId);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to fetch pay revision CTC heads data');
        }
    }
);

// 6. Save employee pay revision
export const saveEmpPayRevision = createAsyncThunk(
    'staffpayrevision/saveEmpPayRevision',
    async (params, { rejectWithValue }) => {
        try {
            console.log('🔄 Thunk: Saving Employee Pay Revision:', params);
            const response = await staffPayRevisionAPI.saveEmpPayRevision(params);
            return response;
        } catch (error) {
            console.error('❌ Thunk Error:', error);
            return rejectWithValue(error.message || 'Failed to save employee pay revision');
        }
    }
);

// ==============================================
// HELPERS
// ==============================================

const TOTAL_HEAD_TYPES = ['GROSSSALARY', 'DEDUCTIONTOTAL', 'NETSALARY', 'BENEFITTOTAL', 'OTHERBENEFITTOTAL', 'CTCTOTAL'];

// Recalculate total rows from editable head amounts
const recalculateTotals = (heads) => {
    const updated = heads.map((h) => ({ ...h }));

    const sum = (type) =>
        updated
            .filter((h) => h.HeadType === type)
            .reduce((acc, h) => acc + (parseFloat(h.HeadAmount) || 0), 0);

    const earningsTotal     = sum('Earning');
    const deductionTotal    = sum('Deduction');
    const benefitTotal      = sum('Benefit');
    const otherBenefitTotal = sum('OtherBenefit');
    const netSalary         = earningsTotal - deductionTotal;
    const ctcTotal          = earningsTotal + benefitTotal + otherBenefitTotal;

    return updated.map((h) => {
        switch (h.HeadType) {
            case 'GROSSSALARY':       return { ...h, HeadAmount: earningsTotal };
            case 'DEDUCTIONTOTAL':    return { ...h, HeadAmount: deductionTotal };
            case 'NETSALARY':         return { ...h, HeadAmount: netSalary };
            case 'BENEFITTOTAL':      return { ...h, HeadAmount: benefitTotal };
            case 'OTHERBENEFITTOTAL': return { ...h, HeadAmount: otherBenefitTotal };
            case 'CTCTOTAL':          return { ...h, HeadAmount: ctcTotal };
            default:                  return h;
        }
    });
};

const resolveSaveStatus = (payload) => {
    const dataVal = payload?.Data;
    const responseStr = typeof dataVal === 'string'
        ? dataVal
        : (payload?.Message || 'Save failed');
    const isSuccess = payload?.IsSuccessful === true ||
        (typeof responseStr === 'string' && responseStr.toLowerCase().includes('submit'));
    return { isSuccess, responseStr };
};

// ==============================================
// INITIAL STATE
// ==============================================
const initialState = {
    // ── Verification state (existing) ──────────────────────────────────────────
    verifyPayRevisionInbox:    [],
    payRevisionDetails:        null,
    approvalResult:            null,
    selectedRoleId:            null,
    selectedTransactionRefno:  null,
    approvalStatus:            null,

    // ── Creation state (new) ───────────────────────────────────────────────────
    empList:            [],          // from GetAppraisalEmp
    appraisalData:      null,        // from GetEmpDataForAppraisal → Data.AppraisalData
    appraisalGroups:    [],          // from GetEmpDataForAppraisal → Data.lstGroups
    ctcForRevision:     null,        // from GetCTCDataForRevision (existing CTC snapshot)
    ctcAccess:          null,        // from CheckCTCAccess
    groupSalaryType:    null,        // from GetGroupSalaryType ('Yes'/'No')
    revisionHeadsData:  null,        // raw response from GetPayRevisionCTCHeadsData
    localRevisionHeads: [],          // editable copy of HeadsList
    saveRevisionResult: null,
    saveRevisionStatus: null,        // null | 'pending' | 'success' | 'failed'

    // ── Loading states ─────────────────────────────────────────────────────────
    loading: {
        verifyPayRevision:    false,
        payRevisionDetails:   false,
        approvePayRevision:   false,
        empList:              false,
        appraisalData:        false,
        ctcForRevision:       false,
        ctcAccess:            false,
        groupSalaryType:      false,
        revisionHeads:        false,
        saveRevision:         false,
    },

    // ── Error states ───────────────────────────────────────────────────────────
    errors: {
        verifyPayRevision:    null,
        payRevisionDetails:   null,
        approvePayRevision:   null,
        empList:              null,
        appraisalData:        null,
        ctcForRevision:       null,
        ctcAccess:            null,
        groupSalaryType:      null,
        revisionHeads:        null,
        saveRevision:         null,
    },
};

// ==============================================
// SLICE
// ==============================================
const staffPayRevisionSlice = createSlice({
    name: 'staffpayrevision',
    initialState,
    reducers: {
        // ── Verification reducers (existing) ───────────────────────────────────
        setSelectedRoleId: (state, action) => {
            state.selectedRoleId = action.payload;
        },
        setSelectedTransactionRefno: (state, action) => {
            state.selectedTransactionRefno = action.payload;
        },
        setApprovalStatus: (state, action) => {
            state.approvalStatus = action.payload;
        },
        resetPayRevisionDetails: (state) => {
            state.payRevisionDetails = null;
            state.approvalResult     = null;
        },
        clearApprovalResult: (state) => {
            state.approvalResult = null;
        },
        resetStaffPayRevisionData: (state) => {
            state.verifyPayRevisionInbox   = [];
            state.payRevisionDetails       = null;
            state.approvalResult           = null;
            state.selectedRoleId           = null;
            state.selectedTransactionRefno = null;
            state.approvalStatus           = null;
        },

        // ── Creation reducers (new) ────────────────────────────────────────────

        // Update a single head's amount (always stored as monthly) and recalculate totals
        updateRevisionHeadAmount: (state, action) => {
            const { rowno, amount } = action.payload;
            const idx = state.localRevisionHeads.findIndex((h) => h.Rowno === rowno);
            if (idx !== -1) {
                state.localRevisionHeads[idx] = {
                    ...state.localRevisionHeads[idx],
                    HeadAmount: parseFloat(amount) || 0,
                };
                state.localRevisionHeads = recalculateTotals(state.localRevisionHeads);
            }
        },

        // Update a single head's amount type (Monthly/Yearly) — does not change HeadAmount
        updateRevisionHeadAmountType: (state, action) => {
            const { rowno, amountType } = action.payload;
            const idx = state.localRevisionHeads.findIndex((h) => h.Rowno === rowno);
            if (idx !== -1) {
                state.localRevisionHeads[idx] = {
                    ...state.localRevisionHeads[idx],
                    CTCAmounttype: amountType,
                };
            }
        },

        clearRevisionData: (state) => {
            state.appraisalData       = null;
            state.appraisalGroups     = [];
            state.ctcForRevision      = null;
            state.revisionHeadsData   = null;
            state.localRevisionHeads  = [];
            state.groupSalaryType     = null;
            state.errors.appraisalData   = null;
            state.errors.ctcForRevision  = null;
            state.errors.revisionHeads   = null;
            state.errors.groupSalaryType = null;
        },

        // Clears only the heads/group-salary-type — keeps ctcForRevision intact
        // Use this when the user changes the group dropdown so the section stays visible
        clearRevisionHeadsOnly: (state) => {
            state.revisionHeadsData   = null;
            state.localRevisionHeads  = [];
            state.groupSalaryType     = null;
            state.errors.revisionHeads   = null;
            state.errors.groupSalaryType = null;
        },

        clearSaveRevisionResult: (state) => {
            state.saveRevisionResult = null;
            state.saveRevisionStatus = null;
            state.errors.saveRevision = null;
        },

        clearError: (state, action) => {
            const { errorType } = action.payload;
            if (state.errors[errorType] !== undefined) {
                state.errors[errorType] = null;
            }
        },

        resetCreationFlow: (state) => {
            state.empList            = [];
            state.appraisalData      = null;
            state.appraisalGroups    = [];
            state.ctcForRevision     = null;
            state.ctcAccess          = null;
            state.groupSalaryType    = null;
            state.revisionHeadsData  = null;
            state.localRevisionHeads = [];
            state.saveRevisionResult = null;
            state.saveRevisionStatus = null;
            Object.keys(state.errors).forEach((k) => { state.errors[k] = null; });
        },
    },

    extraReducers: (builder) => {

        // ── Verification: Fetch Inbox ─────────────────────────────────────────
        builder
            .addCase(fetchVerifyPayRevision.pending, (state) => {
                state.loading.verifyPayRevision = true;
                state.errors.verifyPayRevision  = null;
            })
            .addCase(fetchVerifyPayRevision.fulfilled, (state, action) => {
                state.loading.verifyPayRevision    = false;
                state.verifyPayRevisionInbox = action.payload?.Data || [];
            })
            .addCase(fetchVerifyPayRevision.rejected, (state, action) => {
                state.loading.verifyPayRevision = false;
                state.errors.verifyPayRevision  = action.payload;
                state.verifyPayRevisionInbox    = [];
            });

        // ── Verification: Fetch Details ───────────────────────────────────────
        builder
            .addCase(fetchPayRevisionbyRefno.pending, (state) => {
                state.loading.payRevisionDetails = true;
                state.errors.payRevisionDetails  = null;
            })
            .addCase(fetchPayRevisionbyRefno.fulfilled, (state, action) => {
                state.loading.payRevisionDetails = false;
                state.payRevisionDetails = action.payload?.Data || null;
            })
            .addCase(fetchPayRevisionbyRefno.rejected, (state, action) => {
                state.loading.payRevisionDetails = false;
                state.errors.payRevisionDetails  = action.payload;
                state.payRevisionDetails         = null;
            });

        // ── Verification: Approve ─────────────────────────────────────────────
        builder
            .addCase(approvePayRevision.pending, (state) => {
                state.loading.approvePayRevision = true;
                state.errors.approvePayRevision  = null;
            })
            .addCase(approvePayRevision.fulfilled, (state, action) => {
                state.loading.approvePayRevision = false;
                state.approvalResult = action.payload;
                state.approvalStatus = 'approved';
            })
            .addCase(approvePayRevision.rejected, (state, action) => {
                state.loading.approvePayRevision = false;
                state.errors.approvePayRevision  = action.payload;
            });

        // ── Creation: Fetch Appraisal Employees ───────────────────────────────
        builder
            .addCase(fetchAppraisalEmp.pending, (state) => {
                state.loading.empList = true;
                state.errors.empList  = null;
            })
            .addCase(fetchAppraisalEmp.fulfilled, (state, action) => {
                state.loading.empList = false;
                state.empList = action.payload?.Data || action.payload || [];
            })
            .addCase(fetchAppraisalEmp.rejected, (state, action) => {
                state.loading.empList = false;
                state.errors.empList  = action.payload;
                state.empList         = [];
            });

        // ── Creation: Fetch Emp Data For Appraisal ────────────────────────────
        builder
            .addCase(fetchEmpDataForAppraisal.pending, (state) => {
                state.loading.appraisalData  = true;
                state.errors.appraisalData   = null;
                state.appraisalData          = null;
                state.appraisalGroups        = [];
                state.revisionHeadsData      = null;
                state.localRevisionHeads     = [];
                state.groupSalaryType        = null;
            })
            .addCase(fetchEmpDataForAppraisal.fulfilled, (state, action) => {
                state.loading.appraisalData = false;
                state.appraisalData   = action.payload?.Data?.AppraisalData || null;
                state.appraisalGroups = action.payload?.Data?.lstGroups     || [];
            })
            .addCase(fetchEmpDataForAppraisal.rejected, (state, action) => {
                state.loading.appraisalData = false;
                state.errors.appraisalData  = action.payload;
                state.appraisalData         = null;
                state.appraisalGroups       = [];
            });

        // ── Creation: Fetch CTC Data For Revision ─────────────────────────────
        builder
            .addCase(fetchCTCDataForRevision.pending, (state) => {
                state.loading.ctcForRevision = true;
                state.errors.ctcForRevision  = null;
                state.ctcForRevision         = null;
                state.revisionHeadsData      = null;
                state.localRevisionHeads     = [];
                state.groupSalaryType        = null;
            })
            .addCase(fetchCTCDataForRevision.fulfilled, (state, action) => {
                state.loading.ctcForRevision = false;
                state.ctcForRevision = action.payload?.Data || null;
            })
            .addCase(fetchCTCDataForRevision.rejected, (state, action) => {
                state.loading.ctcForRevision = false;
                state.errors.ctcForRevision  = action.payload;
                state.ctcForRevision         = null;
            });

        // ── Creation: Fetch CTC Access ────────────────────────────────────────
        builder
            .addCase(fetchCTCAccess.pending, (state) => {
                state.loading.ctcAccess = true;
                state.errors.ctcAccess  = null;
            })
            .addCase(fetchCTCAccess.fulfilled, (state, action) => {
                state.loading.ctcAccess = false;
                state.ctcAccess = action.payload?.Data || null;
            })
            .addCase(fetchCTCAccess.rejected, (state, action) => {
                state.loading.ctcAccess = false;
                state.errors.ctcAccess  = action.payload;
                state.ctcAccess         = null;
            });

        // ── Creation: Fetch Group Salary Type ─────────────────────────────────
        builder
            .addCase(fetchGroupSalaryType.pending, (state) => {
                state.loading.groupSalaryType = true;
                state.errors.groupSalaryType  = null;
            })
            .addCase(fetchGroupSalaryType.fulfilled, (state, action) => {
                state.loading.groupSalaryType = false;
                state.groupSalaryType = action.payload?.Data ?? action.payload ?? null;
            })
            .addCase(fetchGroupSalaryType.rejected, (state, action) => {
                state.loading.groupSalaryType = false;
                state.errors.groupSalaryType  = action.payload;
                state.groupSalaryType         = null;
            });

        // ── Creation: Fetch Pay Revision CTC Heads Data ───────────────────────
        builder
            .addCase(fetchPayRevisionCTCHeadsData.pending, (state) => {
                state.loading.revisionHeads = true;
                state.errors.revisionHeads  = null;
                state.revisionHeadsData     = null;
                state.localRevisionHeads    = [];
            })
            .addCase(fetchPayRevisionCTCHeadsData.fulfilled, (state, action) => {
                state.loading.revisionHeads = false;
                const data = action.payload?.Data || null;
                state.revisionHeadsData = data;
                if (data?.HeadsList?.length) {
                    state.localRevisionHeads = recalculateTotals(
                        data.HeadsList.map((h) => ({ ...h }))
                    );
                }
            })
            .addCase(fetchPayRevisionCTCHeadsData.rejected, (state, action) => {
                state.loading.revisionHeads = false;
                state.errors.revisionHeads  = action.payload;
                state.revisionHeadsData     = null;
                state.localRevisionHeads    = [];
            });

        // ── Creation: Save Pay Revision ───────────────────────────────────────
        builder
            .addCase(saveEmpPayRevision.pending, (state) => {
                state.loading.saveRevision  = true;
                state.errors.saveRevision   = null;
                state.saveRevisionStatus    = 'pending';
            })
            .addCase(saveEmpPayRevision.fulfilled, (state, action) => {
                state.loading.saveRevision = false;
                state.saveRevisionResult   = action.payload;
                const { isSuccess, responseStr } = resolveSaveStatus(action.payload);
                if (isSuccess) {
                    state.saveRevisionStatus = 'success';
                } else {
                    state.saveRevisionStatus  = 'failed';
                    state.errors.saveRevision = responseStr || 'Save pay revision failed';
                }
            })
            .addCase(saveEmpPayRevision.rejected, (state, action) => {
                state.loading.saveRevision  = false;
                state.errors.saveRevision   = action.payload;
                state.saveRevisionStatus    = 'failed';
                state.saveRevisionResult    = null;
            });
    },
});

// ==============================================
// EXPORT ACTIONS
// ==============================================
export const {
    // Verification
    setSelectedRoleId,
    setSelectedTransactionRefno,
    setApprovalStatus,
    resetPayRevisionDetails,
    clearApprovalResult,
    resetStaffPayRevisionData,
    // Creation
    updateRevisionHeadAmount,
    updateRevisionHeadAmountType,
    clearRevisionData,
    clearRevisionHeadsOnly,
    clearSaveRevisionResult,
    clearError,
    resetCreationFlow,
} = staffPayRevisionSlice.actions;

// ==============================================
// SELECTORS — VERIFICATION (existing)
// ==============================================
export const selectVerifyPayRevisionInbox      = (state) => state.staffpayrevision.verifyPayRevisionInbox;
export const selectPayRevisionDetails          = (state) => state.staffpayrevision.payRevisionDetails;
export const selectApprovalResult              = (state) => state.staffpayrevision.approvalResult;
export const selectSelectedRoleId             = (state) => state.staffpayrevision.selectedRoleId;
export const selectSelectedTransactionRefno   = (state) => state.staffpayrevision.selectedTransactionRefno;
export const selectApprovalStatus             = (state) => state.staffpayrevision.approvalStatus;

export const selectVerifyPayRevisionInboxArray = (state) => {
    const inbox = state.staffpayrevision.verifyPayRevisionInbox;
    return Array.isArray(inbox) ? inbox : [];
};

export const selectVerifyPayRevisionLoading   = (state) => state.staffpayrevision.loading.verifyPayRevision;
export const selectPayRevisionDetailsLoading  = (state) => state.staffpayrevision.loading.payRevisionDetails;
export const selectApprovePayRevisionLoading  = (state) => state.staffpayrevision.loading.approvePayRevision;
export const selectVerifyPayRevisionError     = (state) => state.staffpayrevision.errors.verifyPayRevision;
export const selectPayRevisionDetailsError    = (state) => state.staffpayrevision.errors.payRevisionDetails;
export const selectApprovePayRevisionError    = (state) => state.staffpayrevision.errors.approvePayRevision;

export const selectLoading   = (state) => state.staffpayrevision.loading;
export const selectErrors    = (state) => state.staffpayrevision.errors;
export const selectIsAnyLoading = (state) => Object.values(state.staffpayrevision.loading).some(Boolean);
export const selectHasAnyError  = (state) => Object.values(state.staffpayrevision.errors).some((e) => e !== null);

export const selectStaffPayRevisionSummary = (state) => {
    const inboxArray = Array.isArray(state.staffpayrevision.verifyPayRevisionInbox)
        ? state.staffpayrevision.verifyPayRevisionInbox
        : [];
    return {
        totalInbox:    inboxArray.length,
        selectedRevision: state.staffpayrevision.payRevisionDetails,
        approvalStatus:   state.staffpayrevision.approvalStatus,
        isProcessing:     state.staffpayrevision.loading.approvePayRevision,
        hasInboxItems:    inboxArray.length > 0,
        isEmpty:          inboxArray.length === 0 && !state.staffpayrevision.loading.verifyPayRevision,
    };
};

export const selectPayRevisionDetailsSummary = (state) => ({
    details:    state.staffpayrevision.payRevisionDetails,
    isLoading:  state.staffpayrevision.loading.payRevisionDetails,
    error:      state.staffpayrevision.errors.payRevisionDetails,
    hasDetails: state.staffpayrevision.payRevisionDetails !== null,
    isEmpty:    state.staffpayrevision.payRevisionDetails === null
        && !state.staffpayrevision.loading.payRevisionDetails,
});

// ==============================================
// SELECTORS — CREATION (new)
// ==============================================

// Employee list
export const selectRevisionEmpList        = (state) => state.staffpayrevision.empList;
export const selectRevisionEmpListArray   = (state) => {
    const d = state.staffpayrevision.empList;
    return Array.isArray(d) ? d : [];
};
export const selectRevisionEmpListLoading = (state) => state.staffpayrevision.loading.empList;
export const selectRevisionEmpListError   = (state) => state.staffpayrevision.errors.empList;

// Appraisal data (Month, Year, EffectiveDate, GroupId, GroupName)
export const selectAppraisalData         = (state) => state.staffpayrevision.appraisalData;
export const selectAppraisalGroups       = (state) => state.staffpayrevision.appraisalGroups;
export const selectAppraisalDataLoading  = (state) => state.staffpayrevision.loading.appraisalData;
export const selectAppraisalDataError    = (state) => state.staffpayrevision.errors.appraisalData;

// Existing CTC for revision (TransactionRefNo, Month, Year, GroupId, etc.)
export const selectCTCForRevision        = (state) => state.staffpayrevision.ctcForRevision;
export const selectCTCForRevisionLoading = (state) => state.staffpayrevision.loading.ctcForRevision;
export const selectCTCForRevisionError   = (state) => state.staffpayrevision.errors.ctcForRevision;

// CTC access
export const selectCTCAccess        = (state) => state.staffpayrevision.ctcAccess;
export const selectCTCAccessLoading = (state) => state.staffpayrevision.loading.ctcAccess;
export const selectCTCAccessError   = (state) => state.staffpayrevision.errors.ctcAccess;

// Group salary type
export const selectGroupSalaryType        = (state) => state.staffpayrevision.groupSalaryType;
export const selectGroupSalaryTypeLoading = (state) => state.staffpayrevision.loading.groupSalaryType;

// Revision heads (editable)
export const selectRevisionHeadsData    = (state) => state.staffpayrevision.revisionHeadsData;
export const selectLocalRevisionHeads   = (state) => state.staffpayrevision.localRevisionHeads;
export const selectRevisionHeadsLoading = (state) => state.staffpayrevision.loading.revisionHeads;
export const selectRevisionHeadsError   = (state) => state.staffpayrevision.errors.revisionHeads;

// Derived head groups
export const selectRevisionEarningHeads = (state) =>
    state.staffpayrevision.localRevisionHeads.filter((h) => h.HeadType === 'Earning');
export const selectRevisionDeductionHeads = (state) =>
    state.staffpayrevision.localRevisionHeads.filter((h) => h.HeadType === 'Deduction');
export const selectRevisionBenefitHeads = (state) =>
    state.staffpayrevision.localRevisionHeads.filter((h) => h.HeadType === 'Benefit');
export const selectRevisionOtherBenefitHeads = (state) =>
    state.staffpayrevision.localRevisionHeads.filter((h) => h.HeadType === 'OtherBenefit');

// Total rows
export const selectRevisionGrossRow      = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'GROSSSALARY');
export const selectRevisionDeductionTotalRow = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'DEDUCTIONTOTAL');
export const selectRevisionNetSalaryRow  = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'NETSALARY');
export const selectRevisionBenefitTotalRow = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'BENEFITTOTAL');
export const selectRevisionOtherBenefitTotalRow = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'OTHERBENEFITTOTAL');
export const selectRevisionCTCTotalRow   = (state) => state.staffpayrevision.localRevisionHeads.find((h) => h.HeadType === 'CTCTOTAL');

// Save
export const selectSaveRevisionStatus  = (state) => state.staffpayrevision.saveRevisionStatus;
export const selectSaveRevisionLoading = (state) => state.staffpayrevision.loading.saveRevision;
export const selectSaveRevisionError   = (state) => state.staffpayrevision.errors.saveRevision;
export const selectSaveRevisionResult  = (state) => state.staffpayrevision.saveRevisionResult;

// ==============================================
// EXPORT REDUCER
// ==============================================
export default staffPayRevisionSlice.reducer;
