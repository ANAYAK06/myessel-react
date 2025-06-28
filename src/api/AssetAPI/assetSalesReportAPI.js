import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ASSET SALES REPORT RELATED APIs
// ==============================================

// 1. Get Asset Sale Main Grid
export const getAssetSaleMainGrid = async (params) => {
    try {
        const { Fdate, TDate } = params;
        console.log('📋 Getting Asset Sale Main Grid with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Fdate: Fdate || '',
            TDate: TDate || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewAssetSaleMainGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Asset Sale Main Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Asset Sale Main Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Asset Sale Inner Details Grid View
export const getAssetSaleInnerDetails = async (params) => {
    try {
        const { Reqno } = params;
        console.log('🔍 Getting Asset Sale Inner Details with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Reqno: Reqno || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewAssetSaleInnerDetailsGridView?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Asset Sale Inner Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Asset Sale Inner Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};