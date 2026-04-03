import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getAllWallets = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetAllWallets`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch wallets';
    }
};

export const getToLoadWallets = async (FromWalletId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetToLoadWallets`, {
            params: { FromWalletId },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch destination wallets';
    }
};

export const saveLoadWallet = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/SaveLoadWallets`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save load wallet';
    }
};

export const getVerificationLoadWallet = async (Roleid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetVerificationLoadWallet`, {
            params: { Roleid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch verification list';
    }
};

export const getVerificationLoadWalletByNo = async ({ Refno, TransferType }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Accounts/GetVerificationLoadwalletbyNo`, {
            params: { Refno, TransferType },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch wallet detail';
    }
};

export const approveLoadWallet = async (payload) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveLoadWallet`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to approve load wallet';
    }
};
