import axios from 'axios';
import { API_BASE_URL } from '../../config/apiConfig';

// 1. Get Payment Types for a Vendor Type
export const getSppoPaymentTypes = async (vendorType) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetSPPOPaymentTypes`, {
            params: { VendorType: vendorType },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch payment types';
    }
};

// 2. Get Vendors by CC, VendorType, PaymentType
export const getSppoVendorsByCC = async (vendorType, ccCode, paymentType) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetSPPOPaymentVendorbyCC`, {
            params: { VendorType: vendorType, CCCode: ccCode, PaymentType: paymentType },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch vendors';
    }
};

// 3. Get PO Numbers for Cash Payment
export const getPOsForCashPayment = async (vendorCode, vendorType, ccCode, paymentType) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetPOForCashPayment`, {
            params: { VendorCode: vendorCode, VendorType: vendorType, CCCode: ccCode, Paymenttype: paymentType },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch PO numbers';
    }
};

// 4. Get Invoice Data for Payment — poNos should have trailing comma e.g. "1737250301,"
export const getInvoiceDataForPayment = async (vendorCode, poNos, payType) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/Purchase/GetInvoiceDataForPayment`, {
            params: { VendorCode: vendorCode, PONo: poNos, PayType: payType },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to fetch invoice data';
    }
};

// 5. Save Vendor Invoice Payment (POST)
export const saveVendorInvoicePayment = async (payload) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/Purchase/SaveNewSPPOInvoicePayment`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        if (error.response?.data) throw error.response.data;
        throw error.message || 'Failed to save invoice payment';
    }
};

// 6. Save Vendor Advance Payment (POST)
export const saveVendorAdvancePayment = async (payload) => {
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

// 7. Save Vendor Retention Payment (POST)
export const saveVendorRetentionPayment = async (payload) => {
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

// 8. Save Vendor Hold Payment (POST)
export const saveVendorHoldPayment = async (payload) => {
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
