import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

export const getNoteClients = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteClient`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch note clients';
    }
};

export const getNoteVendors = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteVendor`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch note vendors';
    }
};

export const getNoteVendorCC = async ({ VendorCode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteVendorCC`, {
            params: { VendorCode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor cost centers';
    }
};

export const getNoteSubClients = async ({ Clientcode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteSubClient`, {
            params: { Clientcode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch sub-clients';
    }
};

export const getNoteClientInvoices = async ({ Clientcode, SubClientcode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteClientInvoices`, {
            params: { Clientcode, SubClientcode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch client invoices';
    }
};

export const getNoteVendorInvoices = async ({ Vendorcode, CCcode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteVendorInvoices`, {
            params: { Vendorcode, CCcode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor invoices';
    }
};

export const getNoteClientInvoiceDetails = async ({ Invid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteClientInvoiceDetails`, {
            params: { Invid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch client invoice details';
    }
};

export const getNoteVendorInvoiceDetails = async ({ Invid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetNoteVendorInvoiceDetails`, {
            params: { Invid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor invoice details';
    }
};

export const getReasons = async ({ NoteType, NoteFor }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetReasons`, {
            params: { NoteType, NoteFor },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch reasons';
    }
};

export const getClientReasonDCA = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/ClientReasonDCA`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch client reason DCA';
    }
};

export const getVendorReasonDCA = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/VendorReasonDCA`);
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor reason DCA';
    }
};

export const getClientReasonSDCA = async ({ ClientReasonDCA }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetClientreasonsdca`, {
            params: { ClientReasonDCA },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch client reason SDCA';
    }
};

export const getVendorReasonSDCA = async ({ VendorReasonDCA }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetVendorreasonsdca`, {
            params: { VendorReasonDCA },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor reason SDCA';
    }
};

export const saveCreditDebitNote = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveCreditDebitNote`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save credit/debit note';
    }
};
