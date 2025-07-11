import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CONSOLIDATE COMPANY OVERFLOW REPORTS RELATED APIs
// ==============================================

// 1. Get Consolidate Company Overflow Report Grid
export const getConsolidateCompanyOverflowReportGrid = async (params) => {
    try {
        const { StartYear, EndYear, PrevYear } = params;
        console.log('📊 Getting Consolidate Company Overflow Report Grid with params:', params); // DEBUG
        
        // Validate required parameters
        if (!StartYear || !EndYear || !PrevYear) {
            throw new Error('StartYear, EndYear, and PrevYear are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            StartYear: StartYear,
            EndYear: EndYear,
            PrevYear: PrevYear
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/ConsolidateCompanyOverflowReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Consolidate Company Overflow Report Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Consolidate Company Overflow Report Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Consolidate Company Overflow Report Detail
export const getConsolidateCompanyOverflowReportDetail = async (params) => {
    try {
        const { DCACode, Year1, Year2 } = params;
        console.log('📋 Getting Consolidate Company Overflow Report Detail with params:', params); // DEBUG
        
        // Validate required parameters
        if (!DCACode || !Year1 || !Year2) {
            throw new Error('DCACode, Year1, and Year2 are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            DCACode: DCACode,
            Year1: Year1,
            Year2: Year2
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetConsolidateCompanyOverflowReportDetail?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Consolidate Company Overflow Report Detail Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Consolidate Company Overflow Report Detail API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};