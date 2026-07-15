import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get current bank details for an employee
export const getEmpBankDetails = async ({ empRefNo }) => {
    try {
        const params = new URLSearchParams({ EmpRefNo: empRefNo });
        const response = await axios.get(`${API_BASE_URL}/HR/GetEmpBankDetails?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Get master list of available employee banks
export const getEmployeeBanks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetEmployeeBanks`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Submit a bank change request for an employee
export const editEmpBank = async (bankData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/HR/EditEmpBank`, bankData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Get verification inbox for employee bank change requests
export const getVerifyEmpBankChange = async ({ roleId }) => {
    try {
        const params = new URLSearchParams({ RoleID: roleId.toString() });
        const response = await axios.get(`${API_BASE_URL}/HR/GetVerifyEmpBankChange?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get bank change detail by EmpRefNo + Id
export const getEmpBankChangeById = async ({ empRefNo, id }) => {
    try {
        const params = new URLSearchParams({ EmpRefNo: empRefNo, Id: id });
        const response = await axios.get(`${API_BASE_URL}/HR/GetEmpBankChangebyId?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Approve / reject / verify an employee bank change request
export const approveEmpBankChange = async (payload) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/HR/ApproveEmpBankChange`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
