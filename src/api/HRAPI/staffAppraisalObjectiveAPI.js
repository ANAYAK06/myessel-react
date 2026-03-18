import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. GET all employees list for dropdown
export const getAllEmployees = async () => {
    const response = await axios.get(`${API_BASE_URL}/HR/GetAllEmployees`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 2. GET employee details by ref no
export const getEmpDetailsByRefNo = async (empRefNo) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetEmpDetailsbyRefno?EmpRefNo=${encodeURIComponent(empRefNo)}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 3. POST save appraisal objective & goals
// Payload: { EmpRefNo, CCCode, Remarks, Year, Month, RoleId, OldDesignationId, NewDesignationId, Createdby }
export const saveEmpObjectAndGoals = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/HR/SaveEmpObjectAndGoals`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};

// 4. GET inbox list for verification
export const getVerifyObjectsAndGoals = async (roleId) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetVerifyObjectsAndGoals?RoleId=${roleId}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 5. GET appraisal detail by Id and EmpRefNo
export const getAppraisalById = async (id, empRefNo) => {
    const response = await axios.get(
        `${API_BASE_URL}/HR/GetAppraisalbyId?Id=${id}&EmpRefNo=${encodeURIComponent(empRefNo)}`,
        { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
};

// 6. PUT approve/verify/reject appraisal objectives
// Payload: { EmpRefNo, Id, Remarks, Year, Month, CCCode, RoleId, Createdby, Action, Note }
export const approveEmpObjects = async (data) => {
    const response = await axios.put(`${API_BASE_URL}/HR/ApproveEmpObjects`, data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
