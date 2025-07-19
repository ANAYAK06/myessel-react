import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STOCK SUMMARY RELATED APIs
// ==============================================

// 1. Get Stock Summary
export const getStockSummary = async () => {
    try {
        console.log('📊 Getting Stock Summary...'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/StockSummary`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Summary Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Summary API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};