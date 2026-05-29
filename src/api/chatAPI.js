import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

export const initializeSession = async (userId, roleId) => {
    const response = await axios.post(`${API_BASE_URL}/Chat/InitializeSession`, {
        userId,
        roleId,
    });
    return response.data;
};

export const queryChat = async (userId, roleId, message, sessionId, chatMode, pendingModule) => {
    const response = await axios.post(`${API_BASE_URL}/Chat/Query`, {
        userId,
        roleId,
        message,
        sessionId,
        chatMode:      chatMode      || 'Report',
        pendingModule: pendingModule || '',
    });
    return response.data;
};
