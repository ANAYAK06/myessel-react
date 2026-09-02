import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. GET leave types available to this employee (gender-filtered, existing HR endpoint)
export const getLeaveTypesForPortal = async (username) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetLeaveTypes`, {
        params: { UID: username },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 2. POST submit a leave request from the Employee Portal into the pre-verification staging table
// Payload: { EmpRefNo, LeaveTypeId, FromDate, ToDate, NoOfDays, ContactNumber, Reason, CreatedBy }
export const submitPortalLeaveRequest = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SubmitPortalLeaveRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 3. GET the reporting person a Portal request from this employee will route to
// (their configured EmployeeReportingConnection, falling back to the org-wide default)
export const getMyReportingPerson = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyReportingPerson`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 4. GET the list of approved payslip periods for this employee (Month/Year/Net + the
// TransactionRefno/CCCode/ConslidateTransNo needed to fetch the full slip via the existing
// getEmpPaySlipData endpoint)
export const getMyPayslipList = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyPayslipList`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 5. GET this employee's PF/ESI statutory numbers + approved PF/ESI contribution history
export const getMyPFESIHistory = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyPFESIHistory`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 6. GET this employee's leave balance broken down by leave type (current year)
export const getMyLeaveBalances = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyLeaveBalances`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 7. GET this employee's LTA/Salary-Advance loan status: summary, repayment history, skipped months
export const getMyLoanAdvanceStatus = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyLoanAdvanceStatus`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 8. GET this employee's plain loan/advance list: one row per approved Running/Closed loan
// (AdvanceType, LTAValue, LTABalance, EMI, NoOfInstallments, NoOfBalanceInstallments, EMIStartDate, LoanStatus)
export const getMyLoanDetails = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyLoanDetails`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// ─── Reporting-person pre-verification queue ───────────────────────────────────

// 9. GET the portal requests awaiting this reporting person's Accept / Reject
// (leave only for now; each row carries RequestType so the bell/list stay generic)
export const getPortalPendingApprovals = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetPortalPendingApprovals`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 10. POST the reporting person's decision on a portal leave request
// Payload: { Id, Action: 'Approve' | 'Reject', ActionBy (reporting person EmpRefNo), RejectRemarks }
export const actionPortalLeaveRequest = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/ActionPortalLeaveRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 11. GET whether this employee is a reporting person for anyone (drives the
// reporting-person menu section + the pending-approvals bell)
export const getIsPortalReportingPerson = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetIsPortalReportingPerson`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 12. GET the requests this employee has raised from the portal + their pre-verification status
export const getMyPortalRequests = async (empRefNo) => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetMyPortalRequests`, {
        params: { EmpRefNo: empRefNo },
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 13. POST submit an Advance Request from the portal into the pre-verification staging table
// Payload: { EmpRefNo, AdvanceType: 'LTA' | 'SA', LTAAmount, EmiAmount, EMIStartDate, Purpose, RequestDate, CreatedBy }
export const submitPortalAdvanceRequest = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SubmitPortalAdvanceRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 14. POST the reporting person's decision on a portal advance request
// Payload: { Id, RequestType: 'Advance', Action: 'Approve' | 'Reject', ActionBy, RejectRemarks }
export const actionPortalAdvanceRequest = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/ActionPortalAdvanceRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
