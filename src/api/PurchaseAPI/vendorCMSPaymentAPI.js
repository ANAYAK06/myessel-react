import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get CMS Vendors list (multi-select options)
export const getCMSVendors = async ({ CMSVendorType, RoleId, Userid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetCMSVendors`, {
            params: { CMSVendorType, RoleId, Userid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch CMS vendors';
    }
};

// 2. Get vendor summary data with balance (AllVendors = "169,210" comma-joined VendorCodes)
export const getVendorCMSPaymentData = async ({ Ventype, AllVendors, Userid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/VendorCMSPaymentData`, {
            params: { Ventype, AllVendors, Userid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor CMS payment data';
    }
};

// 3. Get inner invoice data for a specific vendor
export const getVendorCMSPaymentInnerData = async ({ Vendorcode, Userid }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/VendorCMSPaymentInnerData`, {
            params: { Vendorcode, Userid },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendor CMS inner data';
    }
};

// 4. Add invoice to temp staging table (call on each invoice select)
//    BasicBalance is the paying amount stored in the temp table so the SP can
//    compute NewBalance = BasicBalance - PayingAmount correctly (avoids NULL).
export const addCMSTempInvoice = async ({ invoiceId, userId, payingAmount }) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/AddCMSTempInvoices`,
            { Id: invoiceId, UserID: String(userId), BasicBalance: String(payingAmount || 0) },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to add temp invoice';
    }
};

// 5. Remove invoice from temp staging table (call on each invoice deselect)
export const removeCMSTempInvoice = async ({ invoiceId }) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/RemoveCMSTempInvoices`,
            { Id: invoiceId },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to remove temp invoice';
    }
};

// 6. Save Vendor CMS Payment (SP reads invoice list from the temp staging table)
export const saveVendorCMSPayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveVendorCMSPayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save vendor CMS payment';
    }
};
