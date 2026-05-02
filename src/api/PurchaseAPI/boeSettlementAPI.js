import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getBOELCNos = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetBOELCNos`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch BOE LC numbers';
    }
};

export const getBOETrans = async ({ BOELCNO }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetBOETrans`, {
            params: { BOELCNO },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch BOE transactions';
    }
};

export const getBOEPaymentData = async ({ BOELCval, TranID }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/BOEPaymentData`, {
            params: { BOELCval, TranID },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch BOE payment data';
    }
};

export const getBOEPaymentInnerData = async ({ LCNO, Tranno }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/BOEPaymentInnerData`, {
            params: { LCNO, Tranno },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch BOE payment inner data';
    }
};

export const getLCDetails = async ({ LCNo, TranID }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetLCDetails`, {
            params: { LCNo, TranID },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LC details';
    }
};

export const saveBOESettlementPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveBOESettelmentPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save BOE settlement payment';
    }
};
