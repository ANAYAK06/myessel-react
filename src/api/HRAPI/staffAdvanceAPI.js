import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. GET employee list for advance dropdown
export const getSalaryEmpForAdvance = async () => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetSalaryEmpForAdvance`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 2. GET employee working cost center
export const getEmpWorkingCC = async (empRefno) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetEmpWorkingCC?EmpRefno=${encodeURIComponent(empRefno)}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 3. POST save advance request
// Payload: { EmpRefno, AdvanceType, LTAAmount, NoOfInstallments, EMIAmount,
//            EMIStartDate, Purpose, RequestedDate, CCCode, RoleID, Createdby }
export const saveHRAdvanceRequest = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SaveHRAdvanceRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 4. GET advance requests inbox for verification
export const getHRAdvanceRequestDataForVerify = async (roleId) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetHRAdvanceRequestDataForVerify?Roleid=${roleId}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 5. GET single advance request detail
export const getHRAdvanceRequestData = async (transNo, empRefno) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetHRAdvanceRequestData?TransNo=${encodeURIComponent(transNo)}&Emprefno=${encodeURIComponent(empRefno)}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 6. PUT approve / reject advance request
// Payload: { EmpRefno, TransactionRefNo, Action, RoleID, Createdby, ApprovalNote }
export const approveHRAdvanceRequest = async (data) => {
    const response = await axios.put(`${API_BASE_URL}/HR/ApproveHRAdvanceRequest`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 7. POST save salary advance payment (disbursement)
// Payload: { EmpRefno, TransactionRefNo, BankId, Modeofpay, TransactionAmount,
//            PayTransNo, TransactionDate, RoleID, PaymentRemarks, Createdby }
export const saveSalaryAdvancePayment = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SaveSalaryAdvancePayment`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
