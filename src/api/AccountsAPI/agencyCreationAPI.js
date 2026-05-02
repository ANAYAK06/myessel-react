import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get all nature of groups
export const getNatureOfGroups = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetNatureofGroups`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch nature groups';
    }
};

// 2. Get master groups by nature group ID
export const getMasterGroupsByNature = async (natureGroupId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetMasterGroupbsbyNature?NatureGroupId=${encodeURIComponent(natureGroupId)}`
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch master groups';
    }
};

// 3. Get sub-groups by group ID
export const getSubGroupsByGroup = async (groupId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllSubGroupsbyGroupid?GroupId=${encodeURIComponent(groupId)}`
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch sub-groups';
    }
};

// 4. Save agency
export const saveAgency = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveAgency`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save agency';
    }
};
