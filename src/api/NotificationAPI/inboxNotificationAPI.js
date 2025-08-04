import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// USER INBOX NOTIFICATIONS API
// ==============================================

// Get User Inbox Notifications
export const getUserInboxNotifications = async (params) => {
    try {
        const { userId, roleId } = params;
        console.log('📬 Getting User Inbox Notifications for:', { userId, roleId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetUserInboxNotifications?userId=${userId}&roleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ User Inbox Notifications Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ User Inbox Notifications API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};