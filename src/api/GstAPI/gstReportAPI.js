import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================

// 1. Get Stock Purchase Consolidate Tax Numbers
export const getStockPurchaseConsolidateTaxNos = async () => {
    try {
        console.log('🔍 Getting Stock Purchase Consolidate Tax Numbers'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockPurchaseConsolidateTaxNos`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Purchase Consolidate Tax Numbers Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Purchase Consolidate Tax Numbers API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Stock Purchase Consolidate Report Grid
export const getStockPurchaseConsolidateReportGrid = async (params) => {
    try {
        const { taxno, fromDate, toDate } = params;
        console.log('🔍 Getting Stock Purchase Consolidate Report Grid with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Taxno: taxno || '',
            FromDate: fromDate || '',
            ToDate: toDate || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockPurchaseConsolidateReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Purchase Consolidate Report Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Purchase Consolidate Report Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Stock Purchase Report Grid
export const getStockPurchaseReportGrid = async (params) => {
    try {
        const { taxno, fromDate, toDate } = params;
        console.log('🔍 Getting Stock Purchase Report Grid with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Taxno: taxno || '',
            FromDate: fromDate || '',
            ToDate: toDate || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockPurchaseReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Purchase Report Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Purchase Report Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};