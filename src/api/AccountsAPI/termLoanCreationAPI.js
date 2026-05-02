import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get all agency codes
export const getAllAgencyCodes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAllAgencyCodes`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch agency codes';
    }
};

// 2. Save term loan details
export const saveTLDetails = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveTLDetails`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save term loan details';
    }
};
