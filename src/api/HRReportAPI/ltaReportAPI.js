import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getLTAReport = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/LTARequestRorReport`, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LTA report';
    }
};

export const getLTADetailByTransNo = async (transNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/HR/LTADetailsbyTransNo`, {
            params: { TransNo: transNo },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LTA detail';
    }
};
