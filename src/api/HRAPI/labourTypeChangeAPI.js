import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

const handle = (err) => {
    if (err.response?.data) throw err.response.data;
    throw err;
};

export const getLabourTypeChangeMinDate = async (labourId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourTypeChange/GetMinDate`, {
            params: { labourId },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const requestLabourTypeChange = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/LabourTypeChange/Request`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const getLabourTypeChangeInbox = async (roleId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourTypeChange/GetInbox`, {
            params: { roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const getLabourTypeChangeById = async (requestId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourTypeChange/GetById`, {
            params: { requestId },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const verifyLabourTypeChange = async (payload) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/LabourTypeChange/Verify`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const getLabourTypeChangeRequests = async ({ labourId, requestedBy } = {}) => {
    try {
        const params = {};
        if (labourId) params.labourId = labourId;
        if (requestedBy) params.requestedBy = requestedBy;
        const res = await axios.get(`${API_BASE_URL}/LabourTypeChange/GetRequests`, {
            params,
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};

export const getLabourWorkHistory = async (labourId) => {
    try {
        const res = await axios.get(`${API_BASE_URL}/LabourTypeChange/GetWorkHistory`, {
            params: { labourId },
            headers: { 'Content-Type': 'application/json' },
        });
        return res.data;
    } catch (err) { handle(err); }
};
