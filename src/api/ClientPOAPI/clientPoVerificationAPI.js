import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CLIENT PO VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Client PO by Role ID and User ID
export const getVerificationClientPO = async (roleId, userId) => {
    try {
        console.log('📋 Getting Verification Client PO for Role ID:', roleId, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationClientPO?Roleid=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Client PO Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Client PO API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Client PO by Number for Verification
export const getVerificationClientPObyNo = async (poNumber) => {
    try {
        console.log('🔍 Getting Client PO for Verification - PO Number:', poNumber); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerificationClientPObyNo?PoNumber=${poNumber}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Client PO Verification Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Client PO Verification Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Client PO
export const approveClientPO = async (approvalData) => {
    try {
        console.log('🎯 Approving Client PO...');
        console.log('📊 Payload Summary:', {
            PoNumber: approvalData.PoNumber,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasPoNumber: !!approvalData.PoNumber,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            amountType: typeof approvalData.Amount,
            dateType: typeof approvalData.PODate,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveClientPO`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Client PO Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Client PO Approval API Error');
        
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