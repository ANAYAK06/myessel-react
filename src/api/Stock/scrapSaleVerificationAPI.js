import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SCRAP SALE VERIFICATION RELATED APIs
// ==============================================

// 1. Get Scrap Sale Grid for Verification by Role ID, Created Date and User ID
export const getVerifyScrapSaleGrid = async (roleId, created, userId) => {
    try {
        console.log('📋 Getting Scrap Sale Grid for Verification - Role ID:', roleId, 'Created:', created, 'User ID:', userId);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/VerifyScrapSaleGrid?Roleid=${roleId}&Created=${created}&Userid=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Scrap Sale Grid Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Scrap Sale Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Scrap Sale Details by Request Number and RID
export const getScrapSaleDetails = async (requestNo, rid) => {
    try {
        console.log('🔍 Getting Scrap Sale Details - Request No:', requestNo, 'RID:', rid);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetScrapSaleDetails?Requestno=${requestNo}&Rid=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Scrap Sale Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Scrap Sale Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Scrap Sale Data Details by Request Number and RID
export const getScrapSaleDataDetails = async (requestNo, rid) => {
    try {
        console.log('📊 Getting Scrap Sale Data Details - Request No:', requestNo, 'RID:', rid);
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetScrapSaleDataDetails?Requestno=${requestNo}&Rid=${rid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Scrap Sale Data Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Scrap Sale Data Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Approve Scrap Sale
export const approveScrapSale = async (approvalData) => {
    try {
        console.log('🎯 Approving Scrap Sale...');
        console.log('📊 Payload being sent:', approvalData);
        
        const response = await axios.put(
            `${API_BASE_URL}/Purchase/ApproveScrapSale`,
            approvalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Scrap Sale Approval Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Scrap Sale Approval API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};