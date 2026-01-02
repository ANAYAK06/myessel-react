import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LOST/DAMAGED ITEMS VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification Lost/Damaged Items by Role ID and User ID
export const getVerificationLDItems = async (roleId, userId) => {
    try {
        console.log('📋 Getting Verification Lost/Damaged Items for Role ID:', roleId, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationLDItems?Roleid=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification Lost/Damaged Items Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification Lost/Damaged Items API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Lost/Damaged Items by Reference Number for Verification
export const getVerificationLDItemsbyRefno = async (refNo) => {
    try {
        console.log('🔍 Getting Lost/Damaged Items for Verification - Ref No:', refNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationLDItemsbyRefno?Refno=${refNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Lost/Damaged Items Verification Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Lost/Damaged Items Verification Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Lost/Damaged Items
export const approveLostDamagedItems = async (approvalData) => {
    try {
        console.log('🎯 Approving Lost/Damaged Items...');
        console.log('📊 Payload Summary:', {
            Refno: approvalData.Refno,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasRefno: !!approvalData.Refno,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            amountType: typeof approvalData.Amount,
            dateType: typeof approvalData.Date,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveLostDamagedItems`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ Lost/Damaged Items Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ Lost/Damaged Items Approval API Error');
        
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