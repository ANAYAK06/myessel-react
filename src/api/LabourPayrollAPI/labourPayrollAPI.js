import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const uploadStaging = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/LabourPayroll/UploadStaging`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to upload staging data';
    }
};

export const getStagingPreview = async ({ ccCode, month, year }) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourPayroll/GetStagingPreview`, {
            params: { ccCode, month, year },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to fetch staging preview';
    }
};

export const generatePayroll = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/LabourPayroll/Generate`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to generate payroll';
    }
};

export const getPayrollSummary = async ({ ccCode, month, year, payrollId } = {}) => {
    try {
        const params = {};
        if (payrollId) { params.payrollId = payrollId; }
        else { params.ccCode = ccCode; params.month = month; params.year = year; }
        const res = await axios.get(`${API_BASE_URL}/LabourPayroll/GetSummary`, { params });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to fetch payroll summary';
    }
};

export const getPayrollInbox = async (roleId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourPayroll/GetInbox`, {
            params: { roleId },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to fetch payroll inbox';
    }
};

export const getPayrollDetailForVerification = async (payrollId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourPayroll/GetDetailForVerification`, {
            params: { payrollId },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to fetch payroll detail';
    }
};

export const approveLabourPayroll = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/LabourPayroll/Approve`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) {
        if (err.response?.data) throw err.response.data;
        throw err.message || 'Failed to approve payroll';
    }
};
