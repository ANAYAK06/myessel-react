import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get active LB contractors
export const getActiveLBContractors = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetActiveLBContractor`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 2. Search labour by prefix + type + contractor
export const getLabourByType = async ({ prefix, labourType, contractor }) => {
    try {
        const params = new URLSearchParams({ Prefix: prefix, LabourType: labourType, Contractor: contractor || 'NA' });
        const response = await axios.get(`${API_BASE_URL}/HR/GetLabourByType?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 3. Get current bank details for a labour
export const getLabourBankDetails = async ({ labourId, labourType, contractor }) => {
    try {
        const params = new URLSearchParams({ LabourId: labourId, LabourType: labourType, Contractor: contractor || 'NA' });
        const response = await axios.get(`${API_BASE_URL}/HR/GetLabourBankDetails?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 4. Submit bank change request
export const editLabourBank = async (bankData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/HR/EditLabourBank`, bankData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 5. Get verification inbox
export const getVerifyLBBankChange = async ({ roleId }) => {
    try {
        const params = new URLSearchParams({ RoleID: roleId.toString() });
        const response = await axios.get(`${API_BASE_URL}/HR/GetVerifyLBBankChange?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 6. Get bank change detail by LabourId + Id
export const getLBBankChangeById = async ({ labourId, id }) => {
    try {
        const params = new URLSearchParams({ LabourId: labourId, Id: id });
        const response = await axios.get(`${API_BASE_URL}/HR/GetLBBankChangebyId?${params}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 7. Approve / reject bank change
export const approveLBBankChange = async (payload) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/HR/ApproveLBBankChange`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};

// 8. Get master list of available employee banks
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

// 9. Save (insert) a new bank into the master bank list
// payload: { Action, BankName, Bankid, CreatedBy }
export const saveEmployeeBank = async (payload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/HR/SaveEmployeeBank`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error;
    }
};
