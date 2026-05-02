import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getTDSCostCenterCodes = async ({ UID, RID }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetTDSCostCenterCodes`, {
            params: { UID, RID },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch TDS cost center codes';
    }
};

export const getTDSCategories = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetTDScategories`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch TDS categories';
    }
};

export const getTDSSubDCA = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/BindTDSSubdca`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch TDS SubDCA';
    }
};

export const getTDSITCodes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/BindTDSITCode`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch TDS IT codes';
    }
};

export const getTDSDetailedReport = async ({ CCVal, Catid, FromDate, ToDate, Type, ItSdca }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/TDSDetailedReport`, {
            params: { CCVal, Catid, FromDate, ToDate, Type, ItSdca },
        });
        console.log('[TDSDetailedReport] raw response.data:', response.data);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch TDS detailed report';
    }
};

export const checkTDSBudget = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckTDSbudget`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to check TDS budget';
    }
};

export const saveTDSPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveTDSPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save TDS payment';
    }
};
