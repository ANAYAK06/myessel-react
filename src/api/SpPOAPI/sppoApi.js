import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SPPO VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verification SPPO by Role ID and User ID
export const getVerificationSPPO = async (roleId, userId) => {
    try {
        console.log('📋 Getting Verification SPPO for Role ID:', roleId, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPO?RoleId=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verification SPPO Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verification SPPO API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get SPPO by Number for Verification
export const getSPPObyNoForVerify = async (sppono, ccCode, vendorCode, amendId) => {
    try {
        console.log('🔍 Getting SPPO for Verification - SPPO No:', sppono, 'CC Code:', ccCode, 'Vendor Code:', vendorCode, 'Amend ID:', amendId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNoForVerify?Sppono=${sppono}&CCCode=${ccCode}&VendorCode=${vendorCode}&AmendId=${amendId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Verification Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Verification Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve SPPO
export const approveSPPO = async (approvalData) => {
    try {
        console.log('🎯 Approving SPPO...');
        console.log('📊 Payload Summary:', {
            SppoPONo: approvalData.SppoPONo,
            Action: approvalData.Action,
            RoleId: approvalData.RoleId,
            Userid: approvalData.Userid,
            VendorCode: approvalData.VendorCode,
            CCCode: approvalData.CCCode,
            AmendId: approvalData.AmendId,
            Createdby: approvalData.Createdby,
            totalParameters: Object.keys(approvalData).length
        });
        
        // Log a sample of the data being sent
        console.log('🔍 Sample Data Check:', {
            hasSppoPONo: !!approvalData.SppoPONo,
            hasCCCode: !!approvalData.CCCode,
            hasVendorCode: !!approvalData.VendorCode,
            hasAmendId: !!approvalData.AmendId,
            hasAction: !!approvalData.Action,
            hasUserid: !!approvalData.Userid,
            hasRoleId: !!approvalData.RoleId,
            amountType: typeof approvalData.Amount,
            dateType: typeof approvalData.SPPODate,
            approvalStatusType: typeof approvalData.ApprovalStatus
        });
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSPPO`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000 // 30 second timeout for complex operations
            }
        );
        
        console.log('✅ SPPO Approval Response:', {
            status: response.status,
            data: response.data
        });
        
        return response.data;
        
    } catch (error) {
        console.group('❌ SPPO Approval API Error');
        
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