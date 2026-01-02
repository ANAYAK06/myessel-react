import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SPPO CLOSE VERIFICATION RELATED APIs
// ==============================================

// 1. Get SPPO Close Verification Grid by Role ID, User ID and Type
export const getVerificationSPPOClose = async (roleId, userId, type) => {
    try {
        console.log('📋 Getting SPPO Close Verification Grid - Role ID:', roleId, 'User ID:', userId, 'Type:', type);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetVerificationSPPOClose?Roleid=${roleId}&Userid=${userId}&Type=${type}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Close Verification Grid Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Close Verification Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get SPPO Details by SPPO Number, CC Code and Vendor Code
export const getSPPObyNo = async (sppoNo, ccCode, vendorCode) => {
    try {
        console.log('🔍 Getting SPPO Details - SPPO No:', sppoNo, 'CC Code:', ccCode, 'Vendor Code:', vendorCode);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetSPPObyNo?Sppono=${sppoNo}&CCCode=${ccCode}&VendorCode=${vendorCode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SPPO Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ SPPO Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Approve Close SPPO
export const approveCloseSPPO = async (approvalData) => {
    try {
        console.log('🎯 Approving Close SPPO...');
        console.log('📊 Payload being sent:', approvalData);
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveCloseSPPO`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Close SPPO Approval Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Close SPPO Approval API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};