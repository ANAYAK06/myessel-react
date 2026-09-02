import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as employeePortalAPI from '../../api/HRAPI/employeePortalAPI';
import { getSingleEmpForLeaveRequest } from '../../api/HRAPI/employeeLeaveAPI';
import { getEmpPaySlipData } from '../../api/HRReportAPI/salaryandwagesAPI';
import { getAttendanceData } from '../../api/HRReportAPI/staffAttendanceReportAPI';
import { getEmployeeDocuments } from '../../api/HRAPI/StaffRegistrationVerificationAPI';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchLeaveTypesForPortal = createAsyncThunk(
    'employeePortal/fetchLeaveTypesForPortal',
    async (username, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getLeaveTypesForPortal(username);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch leave types');
        }
    }
);

// Reuses the same endpoint the existing (non-portal) leave request screen uses —
// returns Balanceleaves / PreviousLRDate (return date from last leave) among other fields.
export const fetchLeaveApplicationContext = createAsyncThunk(
    'employeePortal/fetchLeaveApplicationContext',
    async (empRefno, { rejectWithValue }) => {
        try {
            return await getSingleEmpForLeaveRequest({ empRefno });
        } catch (err) {
            return rejectWithValue(err?.Message || err?.message || 'Failed to fetch leave balance');
        }
    }
);

// Shared across every Portal request type: who a request from this employee routes to
// (their configured reporting person, falling back to the org-wide default).
export const fetchMyReportingPerson = createAsyncThunk(
    'employeePortal/fetchMyReportingPerson',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyReportingPerson(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch reporting person');
        }
    }
);

export const submitPortalLeaveRequest = createAsyncThunk(
    'employeePortal/submitPortalLeaveRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.submitPortalLeaveRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit leave request');
        }
    }
);

// GET the list of approved payslip periods for this employee
export const fetchMyPayslipList = createAsyncThunk(
    'employeePortal/fetchMyPayslipList',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyPayslipList(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch payslip list');
        }
    }
);

// Reuses the existing (non-portal) HR salary report endpoint to fetch one full payslip,
// once the employee has picked a period from fetchMyPayslipList.
export const fetchMyPayslipDetail = createAsyncThunk(
    'employeePortal/fetchMyPayslipDetail',
    async ({ empRefNo, transactionRefno, ccCode, conslidateTransNo }, { rejectWithValue }) => {
        try {
            return await getEmpPaySlipData({
                EmpRefno: empRefNo,
                TransactionRefno: transactionRefno,
                CurrentCC: ccCode,
                ConslidateTransNo: conslidateTransNo,
            });
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch payslip');
        }
    }
);

// GET this employee's day-by-day attendance for a month, reusing the existing single-employee
// report endpoint (spGetAttendanceDatabyEmployeeid via ReportType='ID') that the admin
// Staff Attendance Report already uses — returns one row keyed by dynamic 'Day#Date' columns.
export const fetchMyAttendance = createAsyncThunk(
    'employeePortal/fetchMyAttendance',
    async ({ empRefNo, month, year }, { rejectWithValue }) => {
        try {
            return await getAttendanceData({ typeValue: empRefNo, month, year, reportType: 'ID' });
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch attendance');
        }
    }
);

// GET this employee's PF/ESI numbers + contribution history
export const fetchMyPFESIHistory = createAsyncThunk(
    'employeePortal/fetchMyPFESIHistory',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyPFESIHistory(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch PF/ESI details');
        }
    }
);

// GET this employee's LTA/Salary-Advance loan status (summary + repayment history + skipped months)
export const fetchMyLoanAdvanceStatus = createAsyncThunk(
    'employeePortal/fetchMyLoanAdvanceStatus',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyLoanAdvanceStatus(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch loan/advance status');
        }
    }
);

// GET this employee's plain loan/advance list — one row per approved Running/Closed loan
// (AdvanceType, LTAValue, LTABalance, EMI, NoOfInstallments, NoOfBalanceInstallments, EMIStartDate, LoanStatus)
export const fetchMyLoanDetails = createAsyncThunk(
    'employeePortal/fetchMyLoanDetails',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyLoanDetails(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch loan details');
        }
    }
);

// ─── Reporting-person pre-verification queue ───────────────────────────────────

// GET portal requests awaiting this reporting person's Accept / Reject
export const fetchPortalPendingApprovals = createAsyncThunk(
    'employeePortal/fetchPortalPendingApprovals',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getPortalPendingApprovals(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch pending approvals');
        }
    }
);

// POST the reporting person's Accept / Reject decision on a portal leave request
export const actionPortalLeaveRequest = createAsyncThunk(
    'employeePortal/actionPortalLeaveRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.actionPortalLeaveRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit decision');
        }
    }
);

// POST submit an Advance Request from the portal (into the pre-verification staging table)
export const submitPortalAdvanceRequest = createAsyncThunk(
    'employeePortal/submitPortalAdvanceRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.submitPortalAdvanceRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit advance request');
        }
    }
);

// Routes an Accept/Reject to the right endpoint based on the request kind (leave / advance).
export const actionPortalRequest = createAsyncThunk(
    'employeePortal/actionPortalRequest',
    async (data, { rejectWithValue }) => {
        try {
            return (data.RequestType === 'Advance')
                ? await employeePortalAPI.actionPortalAdvanceRequest(data)
                : await employeePortalAPI.actionPortalLeaveRequest(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to submit decision');
        }
    }
);

// GET whether this employee is a reporting person for anyone
export const fetchIsPortalReportingPerson = createAsyncThunk(
    'employeePortal/fetchIsPortalReportingPerson',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getIsPortalReportingPerson(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to resolve reporting-person status');
        }
    }
);

// GET the requests this employee has raised from the portal + their status
export const fetchMyPortalRequests = createAsyncThunk(
    'employeePortal/fetchMyPortalRequests',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyPortalRequests(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch your requests');
        }
    }
);

// GET this employee's uploaded documents (photo, ID proofs, etc.) — reuses the same endpoint
// the HR Staff Registration verifier uses to show the attachment photo (GetEmployeeDocuments,
// filtered by the caller for DocName === 'Photo').
export const fetchMyDocuments = createAsyncThunk(
    'employeePortal/fetchMyDocuments',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await getEmployeeDocuments(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch employee documents');
        }
    }
);

// GET this employee's leave balance broken down by leave type
export const fetchMyLeaveBalances = createAsyncThunk(
    'employeePortal/fetchMyLeaveBalances',
    async (empRefNo, { rejectWithValue }) => {
        try {
            return await employeePortalAPI.getMyLeaveBalances(empRefNo);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch leave balances');
        }
    }
);

// ─── Helper ───────────────────────────────────────────────────────────────────
const isSubmitSuccess = (dataVal) => {
    if (typeof dataVal !== 'string' || !dataVal) return false;
    return dataVal.toLowerCase().includes('submit');
};

const asArray = (payload) =>
    Array.isArray(payload?.Data) ? payload.Data : Array.isArray(payload) ? payload : [];

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
    leaveTypes: [],
    leaveApplicationContext: null,
    reportingPerson: null,

    leaveRequestSaveResult: null,
    leaveRequestSaveStatus: null, // null | 'pending' | 'success' | 'failed'

    advanceRequestSaveResult: null,
    advanceRequestSaveStatus: null, // null | 'pending' | 'success' | 'failed'

    payslipList: [],
    payslipDetail: null,
    pfEsiHistory: null,
    attendanceData: null,
    leaveBalances: [],
    documents: [],
    loanAdvanceStatus: null,
    loanDetails: [],

    // Reporting-person pre-verification queue
    portalPendingApprovals: [],
    portalApprovalActionResult: null,
    portalApprovalActionStatus: null, // null | 'pending' | 'success' | 'failed'
    isPortalReportingPerson: false,
    myPortalRequests: [],

    loading: {
        leaveTypes: false,
        leaveApplicationContext: false,
        reportingPerson: false,
        leaveRequestSave: false,
        advanceRequestSave: false,
        payslipList: false,
        payslipDetail: false,
        pfEsiHistory: false,
        attendanceData: false,
        leaveBalances: false,
        documents: false,
        loanAdvanceStatus: false,
        loanDetails: false,
        portalPendingApprovals: false,
        portalApprovalAction: false,
        isPortalReportingPerson: false,
        myPortalRequests: false,
    },
    errors: {
        leaveTypes: null,
        leaveApplicationContext: null,
        reportingPerson: null,
        leaveRequestSave: null,
        advanceRequestSave: null,
        payslipList: null,
        payslipDetail: null,
        pfEsiHistory: null,
        attendanceData: null,
        leaveBalances: null,
        documents: null,
        loanAdvanceStatus: null,
        loanDetails: null,
        portalPendingApprovals: null,
        portalApprovalAction: null,
        isPortalReportingPerson: null,
        myPortalRequests: null,
    },
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const employeePortalSlice = createSlice({
    name: 'employeePortal',
    initialState,
    reducers: {
        clearLeaveRequestSaveResult(state) {
            state.leaveRequestSaveResult = null;
            state.leaveRequestSaveStatus = null;
            state.errors.leaveRequestSave = null;
        },
        clearAdvanceRequestSaveResult(state) {
            state.advanceRequestSaveResult = null;
            state.advanceRequestSaveStatus = null;
            state.errors.advanceRequestSave = null;
        },
        clearPayslipDetail(state) {
            state.payslipDetail = null;
            state.errors.payslipDetail = null;
        },
        clearPortalApprovalActionResult(state) {
            state.portalApprovalActionResult = null;
            state.portalApprovalActionStatus = null;
            state.errors.portalApprovalAction = null;
        },
        resetAll: () => initialState,
    },
    extraReducers: (builder) => {

        // 1. fetchLeaveTypesForPortal
        builder
            .addCase(fetchLeaveTypesForPortal.pending, (state) => {
                state.loading.leaveTypes = true;
                state.errors.leaveTypes = null;
            })
            .addCase(fetchLeaveTypesForPortal.fulfilled, (state, action) => {
                state.loading.leaveTypes = false;
                state.leaveTypes = asArray(action.payload);
            })
            .addCase(fetchLeaveTypesForPortal.rejected, (state, action) => {
                state.loading.leaveTypes = false;
                state.errors.leaveTypes = action.payload;
                state.leaveTypes = [];
            });

        // 2. fetchLeaveApplicationContext
        builder
            .addCase(fetchLeaveApplicationContext.pending, (state) => {
                state.loading.leaveApplicationContext = true;
                state.errors.leaveApplicationContext = null;
            })
            .addCase(fetchLeaveApplicationContext.fulfilled, (state, action) => {
                state.loading.leaveApplicationContext = false;
                state.leaveApplicationContext = action.payload?.Data || null;
            })
            .addCase(fetchLeaveApplicationContext.rejected, (state, action) => {
                state.loading.leaveApplicationContext = false;
                state.errors.leaveApplicationContext = action.payload;
                state.leaveApplicationContext = null;
            });

        // 3. fetchMyReportingPerson
        builder
            .addCase(fetchMyReportingPerson.pending, (state) => {
                state.loading.reportingPerson = true;
                state.errors.reportingPerson = null;
            })
            .addCase(fetchMyReportingPerson.fulfilled, (state, action) => {
                state.loading.reportingPerson = false;
                state.reportingPerson = action.payload?.Data || null;
            })
            .addCase(fetchMyReportingPerson.rejected, (state, action) => {
                state.loading.reportingPerson = false;
                state.errors.reportingPerson = action.payload;
                state.reportingPerson = null;
            });

        // 4. submitPortalLeaveRequest
        builder
            .addCase(submitPortalLeaveRequest.pending, (state) => {
                state.loading.leaveRequestSave = true;
                state.leaveRequestSaveStatus = 'pending';
                state.errors.leaveRequestSave = null;
                state.leaveRequestSaveResult = null;
            })
            .addCase(submitPortalLeaveRequest.fulfilled, (state, action) => {
                state.loading.leaveRequestSave = false;
                const resultText = action.payload?.Data;
                state.leaveRequestSaveResult = resultText;
                state.leaveRequestSaveStatus = isSubmitSuccess(resultText) ? 'success' : 'failed';
                if (!isSubmitSuccess(resultText)) {
                    state.errors.leaveRequestSave = (resultText || '').replace('Error$', '') || 'Failed to submit leave request';
                }
            })
            .addCase(submitPortalLeaveRequest.rejected, (state, action) => {
                state.loading.leaveRequestSave = false;
                state.leaveRequestSaveStatus = 'failed';
                state.errors.leaveRequestSave = action.payload;
            });

        // 4b. submitPortalAdvanceRequest
        builder
            .addCase(submitPortalAdvanceRequest.pending, (state) => {
                state.loading.advanceRequestSave = true;
                state.advanceRequestSaveStatus = 'pending';
                state.errors.advanceRequestSave = null;
                state.advanceRequestSaveResult = null;
            })
            .addCase(submitPortalAdvanceRequest.fulfilled, (state, action) => {
                state.loading.advanceRequestSave = false;
                const resultText = action.payload?.Data;
                state.advanceRequestSaveResult = resultText;
                state.advanceRequestSaveStatus = isSubmitSuccess(resultText) ? 'success' : 'failed';
                if (!isSubmitSuccess(resultText)) {
                    state.errors.advanceRequestSave = (resultText || '').replace('Error$', '') || 'Failed to submit advance request';
                }
            })
            .addCase(submitPortalAdvanceRequest.rejected, (state, action) => {
                state.loading.advanceRequestSave = false;
                state.advanceRequestSaveStatus = 'failed';
                state.errors.advanceRequestSave = action.payload;
            });

        // 5. fetchMyPayslipList
        builder
            .addCase(fetchMyPayslipList.pending, (state) => {
                state.loading.payslipList = true;
                state.errors.payslipList = null;
            })
            .addCase(fetchMyPayslipList.fulfilled, (state, action) => {
                state.loading.payslipList = false;
                state.payslipList = asArray(action.payload);
            })
            .addCase(fetchMyPayslipList.rejected, (state, action) => {
                state.loading.payslipList = false;
                state.errors.payslipList = action.payload;
                state.payslipList = [];
            });

        // 6. fetchMyPayslipDetail
        builder
            .addCase(fetchMyPayslipDetail.pending, (state) => {
                state.loading.payslipDetail = true;
                state.errors.payslipDetail = null;
            })
            .addCase(fetchMyPayslipDetail.fulfilled, (state, action) => {
                state.loading.payslipDetail = false;
                state.payslipDetail = action.payload;
            })
            .addCase(fetchMyPayslipDetail.rejected, (state, action) => {
                state.loading.payslipDetail = false;
                state.errors.payslipDetail = action.payload;
                state.payslipDetail = null;
            });

        // 7. fetchMyPFESIHistory
        builder
            .addCase(fetchMyPFESIHistory.pending, (state) => {
                state.loading.pfEsiHistory = true;
                state.errors.pfEsiHistory = null;
            })
            .addCase(fetchMyPFESIHistory.fulfilled, (state, action) => {
                state.loading.pfEsiHistory = false;
                state.pfEsiHistory = action.payload?.Data || null;
            })
            .addCase(fetchMyPFESIHistory.rejected, (state, action) => {
                state.loading.pfEsiHistory = false;
                state.errors.pfEsiHistory = action.payload;
                state.pfEsiHistory = null;
            });

        // 8. fetchMyAttendance
        builder
            .addCase(fetchMyAttendance.pending, (state) => {
                state.loading.attendanceData = true;
                state.errors.attendanceData = null;
            })
            .addCase(fetchMyAttendance.fulfilled, (state, action) => {
                state.loading.attendanceData = false;
                state.attendanceData = action.payload;
            })
            .addCase(fetchMyAttendance.rejected, (state, action) => {
                state.loading.attendanceData = false;
                state.errors.attendanceData = action.payload;
                state.attendanceData = null;
            });

        // 9. fetchMyLeaveBalances
        builder
            .addCase(fetchMyLeaveBalances.pending, (state) => {
                state.loading.leaveBalances = true;
                state.errors.leaveBalances = null;
            })
            .addCase(fetchMyLeaveBalances.fulfilled, (state, action) => {
                state.loading.leaveBalances = false;
                state.leaveBalances = asArray(action.payload);
            })
            .addCase(fetchMyLeaveBalances.rejected, (state, action) => {
                state.loading.leaveBalances = false;
                state.errors.leaveBalances = action.payload;
                state.leaveBalances = [];
            });

        // 10. fetchMyDocuments
        builder
            .addCase(fetchMyDocuments.pending, (state) => {
                state.loading.documents = true;
                state.errors.documents = null;
            })
            .addCase(fetchMyDocuments.fulfilled, (state, action) => {
                state.loading.documents = false;
                state.documents = asArray(action.payload);
            })
            .addCase(fetchMyDocuments.rejected, (state, action) => {
                state.loading.documents = false;
                state.errors.documents = action.payload;
                state.documents = [];
            });

        // 11. fetchMyLoanAdvanceStatus
        builder
            .addCase(fetchMyLoanAdvanceStatus.pending, (state) => {
                state.loading.loanAdvanceStatus = true;
                state.errors.loanAdvanceStatus = null;
            })
            .addCase(fetchMyLoanAdvanceStatus.fulfilled, (state, action) => {
                state.loading.loanAdvanceStatus = false;
                state.loanAdvanceStatus = action.payload?.Data || null;
            })
            .addCase(fetchMyLoanAdvanceStatus.rejected, (state, action) => {
                state.loading.loanAdvanceStatus = false;
                state.errors.loanAdvanceStatus = action.payload;
                state.loanAdvanceStatus = null;
            });

        // 12. fetchMyLoanDetails
        builder
            .addCase(fetchMyLoanDetails.pending, (state) => {
                state.loading.loanDetails = true;
                state.errors.loanDetails = null;
            })
            .addCase(fetchMyLoanDetails.fulfilled, (state, action) => {
                state.loading.loanDetails = false;
                state.loanDetails = asArray(action.payload);
            })
            .addCase(fetchMyLoanDetails.rejected, (state, action) => {
                state.loading.loanDetails = false;
                state.errors.loanDetails = action.payload;
                state.loanDetails = [];
            });

        // 13. fetchPortalPendingApprovals
        builder
            .addCase(fetchPortalPendingApprovals.pending, (state) => {
                state.loading.portalPendingApprovals = true;
                state.errors.portalPendingApprovals = null;
            })
            .addCase(fetchPortalPendingApprovals.fulfilled, (state, action) => {
                state.loading.portalPendingApprovals = false;
                state.portalPendingApprovals = asArray(action.payload);
            })
            .addCase(fetchPortalPendingApprovals.rejected, (state, action) => {
                state.loading.portalPendingApprovals = false;
                state.errors.portalPendingApprovals = action.payload;
                state.portalPendingApprovals = [];
            });

        // 14. actionPortalLeaveRequest
        builder
            .addCase(actionPortalLeaveRequest.pending, (state) => {
                state.loading.portalApprovalAction = true;
                state.portalApprovalActionStatus = 'pending';
                state.errors.portalApprovalAction = null;
                state.portalApprovalActionResult = null;
            })
            .addCase(actionPortalLeaveRequest.fulfilled, (state, action) => {
                state.loading.portalApprovalAction = false;
                const resultText = action.payload?.Data;
                const ok = typeof resultText === 'string' &&
                    (resultText.startsWith('Approved') || resultText.startsWith('Rejected'));
                state.portalApprovalActionResult = resultText;
                state.portalApprovalActionStatus = ok ? 'success' : 'failed';
                if (!ok) {
                    state.errors.portalApprovalAction =
                        (resultText || '').replace('Error$', '') || 'Failed to submit decision';
                }
            })
            .addCase(actionPortalLeaveRequest.rejected, (state, action) => {
                state.loading.portalApprovalAction = false;
                state.portalApprovalActionStatus = 'failed';
                state.errors.portalApprovalAction = action.payload;
            });

        // 14b. actionPortalRequest (leave or advance, routed by RequestType)
        builder
            .addCase(actionPortalRequest.pending, (state) => {
                state.loading.portalApprovalAction = true;
                state.portalApprovalActionStatus = 'pending';
                state.errors.portalApprovalAction = null;
                state.portalApprovalActionResult = null;
            })
            .addCase(actionPortalRequest.fulfilled, (state, action) => {
                state.loading.portalApprovalAction = false;
                const resultText = action.payload?.Data;
                const ok = typeof resultText === 'string' &&
                    (resultText.startsWith('Approved') || resultText.startsWith('Rejected'));
                state.portalApprovalActionResult = resultText;
                state.portalApprovalActionStatus = ok ? 'success' : 'failed';
                if (!ok) {
                    state.errors.portalApprovalAction =
                        (resultText || '').replace('Error$', '') || 'Failed to submit decision';
                }
            })
            .addCase(actionPortalRequest.rejected, (state, action) => {
                state.loading.portalApprovalAction = false;
                state.portalApprovalActionStatus = 'failed';
                state.errors.portalApprovalAction = action.payload;
            });

        // 15. fetchIsPortalReportingPerson
        builder
            .addCase(fetchIsPortalReportingPerson.pending, (state) => {
                state.loading.isPortalReportingPerson = true;
                state.errors.isPortalReportingPerson = null;
            })
            .addCase(fetchIsPortalReportingPerson.fulfilled, (state, action) => {
                state.loading.isPortalReportingPerson = false;
                state.isPortalReportingPerson = action.payload?.Data === true;
            })
            .addCase(fetchIsPortalReportingPerson.rejected, (state, action) => {
                state.loading.isPortalReportingPerson = false;
                state.errors.isPortalReportingPerson = action.payload;
                state.isPortalReportingPerson = false;
            });

        // 16. fetchMyPortalRequests
        builder
            .addCase(fetchMyPortalRequests.pending, (state) => {
                state.loading.myPortalRequests = true;
                state.errors.myPortalRequests = null;
            })
            .addCase(fetchMyPortalRequests.fulfilled, (state, action) => {
                state.loading.myPortalRequests = false;
                state.myPortalRequests = asArray(action.payload);
            })
            .addCase(fetchMyPortalRequests.rejected, (state, action) => {
                state.loading.myPortalRequests = false;
                state.errors.myPortalRequests = action.payload;
                state.myPortalRequests = [];
            });
    },
});

export const {
    clearLeaveRequestSaveResult,
    clearAdvanceRequestSaveResult,
    clearPayslipDetail,
    clearPortalApprovalActionResult,
    resetAll,
} = employeePortalSlice.actions;

export default employeePortalSlice.reducer;
