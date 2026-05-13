import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP — Cost Centres, DCA, Sub-DCA
// ─────────────────────────────────────────────────────────────────────────────

export const getAllCostCenters = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAllCostCentersForAccounts`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch cost centres';
    }
};

export const getDCAForHR = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/GetDCAForHRRules`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch DCA list';
    }
};

export const getSubDCAByDCA = async (dcaCode) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetSubDCAbyDCA`, {
            params: { DCACode: dcaCode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch Sub DCA list';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. CC WISE MINIMUM WAGE
// ─────────────────────────────────────────────────────────────────────────────

export const getMinWageConfig = async ({ ccCode, category } = {}) => {
    try {
        const params = {};
        if (ccCode)   params.ccCode   = ccCode;
        if (category) params.category = category;
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetMinWageConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch minimum wage config';
    }
};

// Upsert — send one request per component row
export const saveMinWageConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveMinWageConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save minimum wage config';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. LABOUR DESIGNATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getDesignations = async ({ status } = {}) => {
    try {
        const params = {};
        if (status) params.status = status;
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetDesignations`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch designations';
    }
};

// Upsert — DesignationId > 0 → Update | 0 → Insert
export const saveDesignation = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveDesignation`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save designation';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. WAGE ACCOUNT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getWageAccountConfig = async ({ ccCode } = {}) => {
    try {
        const params = ccCode ? { ccCode } : {};
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetWagesAccountConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch wage account config';
    }
};

export const getWageComponents = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetWageComponents`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch wage components';
    }
};

// Upsert — one request per component row
export const saveWageAccountConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveWagesAccountConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save wage account config';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. HOLIDAY CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getHolidays = async ({ ccCode, year } = {}) => {
    try {
        const params = {};
        if (ccCode) params.ccCode = ccCode;
        if (year)   params.year   = year;
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetHolidays`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch holidays';
    }
};

// HolidayId = 0 → Insert | > 0 → Update
export const saveHoliday = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveHoliday`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save holiday';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. PF CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getPFConfig = async (ccCode) => {
    try {
        const params = ccCode ? { ccCode } : {};
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetPFConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PF config';
    }
};

export const savePFConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SavePFConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save PF config';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. ESI CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getESIConfig = async (ccCode) => {
    try {
        const params = ccCode ? { ccCode } : {};
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetESIConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch ESI config';
    }
};

export const saveESIConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveESIConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save ESI config';
    }
};

// Soft delete
export const deleteHoliday = async (holidayId, actionBy) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/LabourConfig/DeleteHoliday`,
            { params: { holidayId, actionBy } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to delete holiday';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROFESSIONAL TAX (PT) CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getPTConfig = async (ccCode) => {
    try {
        const params = ccCode ? { ccCode } : {};
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetPTConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PT config';
    }
};

export const savePTConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SavePTConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save PT config';
    }
};

export const getPTSlabs = async (configId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetPTSlabs`, {
            params: { configId },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PT slabs';
    }
};

export const savePTSlab = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SavePTSlab`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save PT slab';
    }
};

export const deletePTSlab = async (slabId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/LabourConfig/DeletePTSlab`, {
            params: { slabId },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to delete PT slab';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. LABOUR WELFARE FUND (LWF) CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const getLWFConfig = async (ccCode) => {
    try {
        const params = ccCode ? { ccCode } : {};
        const response = await axios.get(`${API_BASE_URL}/LabourConfig/GetLWFConfig`, { params });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LWF config';
    }
};

export const saveLWFConfig = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/LabourConfig/SaveLWFConfig`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save LWF config';
    }
};
