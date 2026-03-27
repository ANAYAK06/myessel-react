import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Save Bank Withdrawal (POST)
export const saveBankWithdrawal = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveWithdrawl`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save bank withdrawal';
    }
};
