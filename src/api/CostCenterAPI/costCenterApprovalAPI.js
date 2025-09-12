import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// COST CENTER APPROVAL RELATED APIs
// ==============================================

// 1. Get Approval Cost Center Details by Role ID and User ID
export const getApprovalCostCenterDetails = async (roleId, uid) => {
    try {
        console.log('📋 Getting Approval Cost Center Details for Role ID:', roleId, 'UID:', uid); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCostCenterDetails?Roleid=${roleId}&UID=${uid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approval Cost Center Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approval Cost Center Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Approval Cost Center by CC Code and User ID
export const getApprovalCCbyCC = async (ccCode, userId) => {
    try {
        console.log('🔍 Getting Approval CC by CC Code:', ccCode, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovalCCbyCC?CCCode=${ccCode}&userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approval CC by CC Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approval CC by CC API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Cost Center
export const approveCostCenter = async (approvalData) => {
    try {
        console.log('🎯 Approving Cost Center...');
        console.log('📊 Payload Summary:', {
            CCCode: approvalData.CCCode,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasCCCode: !!approvalData.CCCode,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            hasCreatedby: !!approvalData.Createdby,
            approvalStatusType: typeof approvalData.ApprovalStatus,
            dateType: typeof approvalData.ApprovalDate
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveCostCenter`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Cost Center Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Cost Center Approval API Error');
        
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