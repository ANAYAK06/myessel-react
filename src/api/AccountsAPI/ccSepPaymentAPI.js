import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Check budget for a CC SEP payment entry (GET)
export const checkBudgetForCCSEPPayment = async ({ CC, Paytype, Amount, Year, Month, Paydate }) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/CheckBudgetForCCSEPPaymentk`,
            { params: { CC, Paytype, Amount, Year, Month, Paydate: Paydate || '' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Budget check failed';
    }
};

// Save CC SEP Payment (POST)
export const saveCCSEPPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveCCSEPPaymets`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save SEP payment';
    }
};
