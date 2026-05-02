import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getCCList = async (month, year) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetCCList`, {
            params: { month, year },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch CC list';
    }
};

export const getContractors = async (ccCode, month, year) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetContractors`, {
            params: { ccCode, month, year },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch contractors';
    }
};

export const getPOList = async (contractorCode, ccCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetPOList`, {
            params: { contractorCode, ccCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PO list';
    }
};

export const getConsolidateTransNos = async (month, year, ccCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetConsolidateTransNos`, {
            params: { month, year, ccCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch consolidate trans nos';
    }
};

export const getWorkerGrid = async (conslidateTransNo, labourType, contractorCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetWorkerGrid`, {
            params: { conslidateTransNo, labourType, contractorCode },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch worker grid';
    }
};

export const saveLabourCMS = async (payload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/LabourCMS/Save`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save Labour CMS payment';
    }
};

export const getInbox = async (roleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetInbox`, {
            params: { roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch Labour CMS inbox';
    }
};

export const getDetail = async (cmsTransactionNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetDetail`, {
            params: { cmsTransactionNo },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch Labour CMS detail';
    }
};

export const approveLabourCMS = async (payload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/LabourCMS/Approve`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve Labour CMS payment';
    }
};

export const getExcel = async (cmsTransactionNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourCMS/GetExcel`, {
            params: { cmsTransactionNo },
            responseType: 'blob',
            headers: { 'Content-Type': 'application/json' },
        });
        return response;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to download Excel';
    }
};
