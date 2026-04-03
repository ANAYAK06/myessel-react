import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// Fetch general invoice list by CCCode (GET)
export const getGeneralInvoiceList = async (ccCode) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetGeneralInvoice`,
            { params: { CCCode: ccCode } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch general invoice list';
    }
};

// Fetch invoice detail by invoice number (GET)
export const getGeneralInvoiceByNo = async (invNo) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetGeneralInvoicebyNo`,
            { params: { InvNo: invNo } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch invoice details';
    }
};

// Save general invoice bank payment (POST)
export const saveGenInvBankPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveGenInvBankPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save general invoice payment';
    }
};
