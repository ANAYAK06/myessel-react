import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get LC/BG codes filtered by type and status
export const getLCBGCodes = async ({ LCBGType, LCBGStatus }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetLCBGCodes`, {
            params: { LCBGType, LCBGStatus },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LC/BG codes';
    }
};

// 2. Get vendor/client details for a selected LC/BG number
export const getLCBGVendorClient = async ({ LCBGNo, LCBGNoId }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetLCBGVendorClient`, {
            params: { LCBGNo, LCBGNoId },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LC/BG vendor/client details';
    }
};

// 3. Save LC/BG Amendment or Close data
export const saveLCBGAmendData = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveLCBGAmendData`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save LC/BG amend data';
    }
};
