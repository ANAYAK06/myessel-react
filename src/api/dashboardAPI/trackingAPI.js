import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getTrackingValues = async (roleId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetTrackingValues`, {
            params: { Roleid: roleId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get tracking values';
    }
};

export const getTrackingNos = async ({ roleId, moid, ccCodes = '', userId }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetTrackingNos`, {
            params: { Roleid: roleId, Moid: moid, CCCodes: ccCodes, Userid: userId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get tracking nos';
    }
};

export const getTrackingData = async ({ roleId, moid, ccCodes = '', groupId = 0 }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetTrackingData`, {
            params: { Roleid: roleId, Moid: moid, CCCodes: ccCodes, GroupId: groupId },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to get tracking data';
    }
};
