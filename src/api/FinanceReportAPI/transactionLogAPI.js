import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// TRANSACTION LOG REPORT APIs
// ==============================================

// 1. Get Transaction Log Grid Report
export const getTransactionLogGrid = async (params) => {
    try {
        const { fromDate, toDate, tranType } = params;
        console.log('🔍 Getting Transaction Log Grid for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append('FromDate', fromDate);
        if (toDate) queryParams.append('ToDate', toDate);
        if (tranType) queryParams.append('TranType', tranType);
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/ViewTransactionLogGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Transaction Log Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Transaction Log Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};