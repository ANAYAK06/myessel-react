import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get all unsecured loans list
export const getAllUnsecuredLoans = async ({ Roleid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAllUnsecuredLoan`, {
            params: { Roleid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch unsecured loans';
    }
};

// 2. Check user access for loan operations
export const checkAccessForLoan = async ({ Roleid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/CheckAccessForLoan`, {
            params: { Roleid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to check loan access';
    }
};

// 3. Save new unsecured loan
export const saveNewUnsLoan = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveNewUnsLoan`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save new unsecured loan';
    }
};

// 4. Save unsecured loan topup
export const saveUnsLoanTopUp = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveUnsLoanTopUp`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save loan topup';
    }
};

// 5. Save unsecured loan repayment
export const saveUnsLoanRepay = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveUnsLoanRepay`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save loan repayment';
    }
};

// 6. Update unsecured loan interest rate
export const updateUnsLoanInterest = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/UpdateUnsLoanInterest`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to update loan interest rate';
    }
};
