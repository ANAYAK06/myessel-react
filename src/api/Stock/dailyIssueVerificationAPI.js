import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DAILY ISSUE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Daily Issue Grid for Verification by Role ID, Created Date and User ID
export const getVerifyDailyIssueGrid = async (roleId, created, userId) => {
    try {
        console.log('📋 Getting Daily Issue Grid for Verification - Role ID:', roleId, 'Created:', created, 'User ID:', userId); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyDailyIssueGrid?Roleid=${roleId}&Created=${created}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Daily Issue Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Daily Issue Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Daily Issue Details by Transaction Number and Cost Center Code
export const getDailyIssueDetails = async (tranNo, ccCode) => {
    try {
        console.log('🔍 Getting Daily Issue Details - Tran No:', tranNo, 'CC Code:', ccCode); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetDailyIssueDetails?TranNo=${tranNo}&CCCode=${ccCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Daily Issue Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Daily Issue Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Daily Issue Remarks by Reference Number
export const getDailyIssueRemarks = async (refNo) => {
    try {
        console.log('💬 Getting Daily Issue Remarks - Ref No:', refNo); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetDailyIssueRemarks?Refno=${refNo}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Daily Issue Remarks Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Daily Issue Remarks API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};


// 4. Approve Daily Issue
export const approveDailyIssue = async (approvalData) => {
    try {
        console.log('🎯 Approving Daily Issue...');
        console.log('📊 Payload being sent:', approvalData);
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveDailyIssue`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Daily Issue Approval Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Daily Issue Approval API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};