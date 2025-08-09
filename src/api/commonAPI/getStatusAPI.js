import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ACCOUNTS STATUS LIST RELATED APIs
// ==============================================

// 1. Get Status List for Account Operations
export const getStatusList = async (params) => {
    try {
        const { MOID, ROID, ChkAmt } = params;
        console.log('📋 Getting Status List with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            MOID: MOID || '',
            ROID: ROID || '',
            ChkAmt: ChkAmt || '0'
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetStatuslist?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Status List Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Status List API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};