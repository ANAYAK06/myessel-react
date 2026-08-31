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
