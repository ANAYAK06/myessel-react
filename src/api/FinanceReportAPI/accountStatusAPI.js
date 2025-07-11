import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ACCOUNT STATUS REPORTS RELATED APIs
// ==============================================

// 1. Get Consolidate IT Report Grid
export const getConsolidateITReportGrid = async (params) => {
    try {
        const { StartYear, EndYear, PrevYear } = params;
        console.log('📊 Getting Consolidate IT Report Grid with params:', params); // DEBUG
        
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
            `${API_BASE_URL}/Reports/ConsolidateITReportGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Consolidate IT Report Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Consolidate IT Report Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Consolidate IT Report Detail
export const getConsolidateITReportDetail = async (params) => {
    try {
        const { ITCode, Year1, Year2 } = params;
        console.log('📋 Getting Consolidate IT Report Detail with params:', params); // DEBUG
        
        // Validate required parameters
        if (!ITCode || !Year1 || !Year2) {
            throw new Error('ITCode, Year1, and Year2 are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            ITCode: ITCode,
            Year1: Year1,
            Year2: Year2
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/ConsolidateITReportDetail?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Consolidate IT Report Detail Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Consolidate IT Report Detail API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};