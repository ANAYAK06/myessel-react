import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// GENERAL INVOICE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification General Invoice by Role ID
export const getVerificationGeneralInvoice = async (roleId) => {
    try {
        console.log('📋 Getting Verification General Invoice for Role ID:', roleId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationGeneralInvoice?Roleid=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification General Invoice Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification General Invoice API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get General Invoice by Invoice Number
export const getGeneralInvoiceByNo = async (invNo) => {
    try {
        console.log('🔍 Getting General Invoice by Invoice No:', invNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetGeneralInvoicebyNo?InvNo=${invNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ General Invoice by No Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ General Invoice by No API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve General Invoice
export const approveGeneralInvoice = async (approvalData) => {
    try {
        console.log('🎯 Approving General Invoice...');
        console.log('📊 Payload Summary:', {
            InvNo: approvalData.InvNo,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasInvNo: !!approvalData.InvNo,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            hasCreatedby: !!approvalData.Createdby,
            approvalStatusType: typeof approvalData.ApprovalStatus,
            dateType: typeof approvalData.ApprovalDate
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveGeneralInvoice`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ General Invoice Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ General Invoice Approval API Error');
        
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