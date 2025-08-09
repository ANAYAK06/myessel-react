import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SUPPLIER INVOICE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Supplier Invoices by Role ID and User ID
export const getVerificationSupplierInvoice = async (roleId, userId) => {
    try {
        console.log('📋 Getting Verification Supplier Invoices for Role ID:', roleId, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSupplierInvoice?Roleid=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Supplier Invoices Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Supplier Invoices API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Supplier Invoice by Invoice Number
export const getSupplierInvoiceByNo = async (invoiceNo) => {
    try {
        console.log('🔍 Getting Supplier Invoice for Invoice No:', invoiceNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSupplierInvoiceByNo?InvoiceNo=${invoiceNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Supplier Invoice Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Supplier Invoice Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Supplier Invoice
export const approveSupplierInvoice = async (approvalData) => {
    try {
        console.log('🎯 Approving Supplier Invoice...');
        console.log('📊 Payload Summary:', {
            InvoiceNo: approvalData.InvoiceNo,
            Action: approvalData.Action,
            Roleid: approvalData.Roleid,
            Userid: approvalData.Userid,
            SupplierCode: approvalData.SupplierCode,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasInvoiceNo: !!approvalData.InvoiceNo,
            hasSupplierCode: !!approvalData.SupplierCode,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            amountType: typeof approvalData.Amount,
            invoiceDateType: typeof approvalData.InvoiceDate,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSupplierInvoice`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Supplier Invoice Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Supplier Invoice Approval API Error');
        
        if (error.response) {
            // Server responded with error status
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            console.error('Response Data:', error.response.data);
            
            // Log specific error details for 400 errors
            if (error.response.status === 400) {
                console.error('🔍 400 Bad Request Details:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    dataSize: error.config?.data ? error.config.data.length : 0,
                    contentType: error.config?.headers['Content-Type']
                });
            }
            
        } else if (error.request) {
            // Request was made but no response received
            console.error('No Response Received:', error.request);
        } else {
            // Something else happened
            console.error('Request Setup Error:', error.message);
        }
        
        console.error('Full Error Config:', error.config);
        console.groupEnd();
        
        // Return more specific error information
        if (error.response?.data) {
            throw error.response.data;
        } else if (error.response?.status === 400) {
            throw new Error('Bad Request: Invalid data format or missing required fields');
        } else if (error.response?.status === 500) {
            throw new Error('Server Error: Please contact administrator');
        }
        
        throw error;
    }
};