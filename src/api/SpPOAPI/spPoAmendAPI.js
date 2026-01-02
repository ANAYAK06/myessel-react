// src/services/api/verification/sppoAmendApi.js

import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SPPO AMENDMENT VERIFICATION RELATED APIs
// ==============================================

// 1. Get SPPO Amendment Verification Grid by Role ID and User ID
export const getVerificationSPPOAmend = async (roleId, userId) => {
    try {
        console.log('📋 Getting SPPO Amendment Verification Grid - Role ID:', roleId, 'User ID:', userId);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPOAmend?RoleId=${roleId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Amendment Verification Grid Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Amendment Verification Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get SPPO Amendment Details by Amendment ID, Role ID and User ID
export const getSPPOAmendById = async (roleId, amendId, userId) => {
    try {
        console.log('🔍 Getting SPPO Amendment Details - Role ID:', roleId, 'Amendment ID:', amendId, 'User ID:', userId);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPOAmendbyId?RoleId=${roleId}&AmendId=${amendId}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Amendment Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Amendment Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve SPPO Amendment
export const approveSPPOAmend = async (approvalData) => {
    try {
        console.log('🎯 Approving SPPO Amendment...');
        console.log('📊 Payload being sent:', approvalData);
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveSPPOAmemd`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ SPPO Amendment Approval Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ SPPO Amendment Approval API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get PO Uploaded Documents by PO Number and For Type
export const getPOUploadedDocs = async (poNo, forType) => {
    try {
        console.log('📎 Getting PO Uploaded Documents - PO No:', poNo, 'For:', forType);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/POUploadedDocsView?PONO=${poNo}&For=${forType}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PO Uploaded Documents Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ PO Uploaded Documents API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};