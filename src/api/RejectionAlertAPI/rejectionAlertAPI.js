import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getRejectionAlertCount = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/RejectionAlerts/GetRejectionAlertCount`, {
        params: { userId }
    });
    return response.data;
};

export const getRejectionAlerts = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/RejectionAlerts/GetRejectionAlerts`, {
        params: { userId }
    });
    return response.data;
};

export const updateRejectionAlertStatus = async (payload) => {
    // payload: { RejectionAlertId, UserId, Status: 1 (read) | 2 (dismiss) }
    const response = await axios.post(`${API_BASE_URL}/RejectionAlerts/UpdateRejectionAlertStatus`, payload);
    return response.data;
};
