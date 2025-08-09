import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// VENDOR PAYMENT VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Vendor Payments by Role ID
export const getVerificationVendorPayments = async (roleId) => {
    try {
        console.log('💰 Getting Verification Vendor Payments for Role ID:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendorPayments?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Vendor Payments Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Vendor Payments API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Verification Vendor Payment by Reference Number
export const getVerificationVendorPayByRefno = async (params) => {
    try {
        const { refno, transtype, vendorcode } = params;
        console.log('🔍 Getting Verification Vendor Payment for:', { refno, transtype, vendorcode }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationVendorPaybyRefno?Refno=${refno}&Transtype=${transtype}&Vendorcode=${vendorcode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Vendor Payment Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Vendor Payment Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Vendor Payment
export const approveVendorPayment = async (approvalData) => {
    try {
        console.log('🎯 Approving Vendor Payment...');
        console.log('📊 Payload Summary:', {
            RefNo: approvalData.RefNo,
            Action: approvalData.Action,
            Roleid: approvalData.Roleid,
            VendorCode: approvalData.VendorCode,
            TransType: approvalData.TransType,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasRefNo: !!approvalData.RefNo,
            hasVendorCode: !!approvalData.VendorCode,
            hasTransType: !!approvalData.TransType,
            hasAction: !!approvalData.Action,
            amountType: typeof approvalData.Amount,
            paymentDateType: typeof approvalData.PaymentDate,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveVendorPayment`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Vendor Payment Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Vendor Payment Approval API Error');
        
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