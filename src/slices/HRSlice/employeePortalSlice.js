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

    payslipList: [],
    payslipDetail: null,
    pfEsiHistory: null,
    attendanceData: null,
    leaveBalances: [],
    documents: [],
    loanAdvanceStatus: null,

    loading: {
        leaveTypes: false,
        leaveApplicationContext: false,
        reportingPerson: false,
        leaveRequestSave: false,
        payslipList: false,
        payslipDetail: false,
        pfEsiHistory: false,
        attendanceData: false,
        leaveBalances: false,
        documents: false,
        loanAdvanceStatus: false,
    },
    errors: {
        leaveTypes: null,
        leaveApplicationContext: null,
        reportingPerson: null,
        leaveRequestSave: null,
        payslipList: null,
        payslipDetail: null,
        pfEsiHistory: null,
        attendanceData: null,
        leaveBalances: null,
        documents: null,
        loanAdvanceStatus: null,
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
        clearPayslipDetail(state) {
            state.payslipDetail = null;
            state.errors.payslipDetail = null;
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
    },
});

export const {
    clearLeaveRequestSaveResult,
    clearPayslipDetail,
    resetAll,
} = employeePortalSlice.actions;

export default employeePortalSlice.reducer;
