import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get all loans (Type = 'Debit')
export const getAllLoans = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAllloans?Type=Debit`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch loans';
    }
};

// 2. Get loan details / agency code by loan number
export const getLoanDetails = async (loanNo) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAgencycode?Type=${encodeURIComponent(loanNo)}`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch loan details';
    }
};

// 3. Save term loan payment
export const saveTermLoanPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/Savetermloanpaymentdetails`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save term loan payment';
    }
};
