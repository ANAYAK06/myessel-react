import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// GET api/Accounts/Getledgers?LedType={LedType}
export const getLedgers = async ({ LedType }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/Getledgers`, {
            params: { LedType },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch ledgers';
    }
};

// GET api/Accounts/GetLedgerVenCl?LedType=...&ventypeval=...&paytypeval=...&trantypeval=...
export const getLedgerVenCl = async ({ LedType, ventypeval, paytypeval, trantypeval }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetLedgerVenCl`, {
            params: { LedType, ventypeval, paytypeval, trantypeval },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch invoice list';
    }
};

// POST api/Accounts/Savejournal
export const saveJournal = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/Savejournal`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save journal voucher';
    }
};
