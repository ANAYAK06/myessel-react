import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get SPPO Payment Types (Vendor Invoice / Vendor Advance)
export const getSPPOPaymentTypes = async ({ VendorType }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetSPPOPaymentTypes`, {
            params: { VendorType },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch payment types';
    }
};

// 2. Get Vendors for SPPO Payment
export const getSPPOPaymentVendors = async ({ VendorType, PaymentType }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetSPPOPaymentVendor`, {
            params: { VendorType, PaymentType },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendors';
    }
};

// 3. Get Invoices / POs for Payment
export const getPOForPayment = async ({ VendorCode, VendorType, PaymentType, LCno }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetPOForPayment`, {
            params: { VendorCode, VendorType, PaymentType, LCno: LCno || '' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PO/invoice list';
    }
};

// 4. Get LC Codes for a Vendor
export const getVenLCCodes = async ({ VendorCode }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetVenLCCodes`, {
            params: { VendorCode },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch LC codes';
    }
};

// 5. Check Supplier Transaction Type (per PO)
export const checkSupplierTransactionType = async ({ PONo }) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/ChecksupplierTransactiontype`,
            { PONo },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to check transaction type';
    }
};

// 6. Check Vendor Invoice Payment Dates
export const checkVendorInvPayDates = async ({ MaxInvoiceDate, TransactionDate }) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/CheckVendorInvPayDates`,
            { MaxInvoiceDate, TransactionDate },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to validate payment dates';
    }
};

// 7. Get Invoice Data for selected POs (Invoice / Retention / Hold payment types)
// poNos should be a comma-joined string with trailing comma e.g. "CC-001/1,CC-001/2,"
export const getInvoiceDataForPayment = async ({ VendorCode, PONo, PayType }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetInvoiceDataForPayment`, {
            params: { VendorCode, PONo, PayType },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch invoice data';
    }
};

// 8. Save SPPO Invoice Payment (Bank)
export const saveNewSPPOInvoicePayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOInvoicePayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save payment';
    }
};

// 9. Save SPPO Advance Payment (Bank)
export const saveNewSPPOAdvancePayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOAdvancePayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save advance payment';
    }
};

// 10. Save SPPO Retention Payment (Bank)
export const saveNewSPPORetentionPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPORetentionPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save retention payment';
    }
};

// 11. Save SPPO Hold Payment (Bank)
export const saveNewSPPOHoldPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOHoldPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save hold payment';
    }
};
