import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ACCRUED INTEREST REPORT APIs
// ==============================================

// 1. Get Accrued Interest Report (Detail View)
export const getAccruedInterestReport = async (params) => {
    try {
        const { ccCode, fromDate, toDate } = params;
        console.log('🔍 Getting Accrued Interest Report for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (ccCode) queryParams.append('CCCode', ccCode);
        if (fromDate) queryParams.append('FromDate', fromDate);
        if (toDate) queryParams.append('ToDate', toDate);
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetAccruedInterestReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Accrued Interest Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Accrued Interest Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Accrued Interest Report Summary (Drill-down Modal)
export const getAccruedInterestReportSummary = async (params) => {
    try {
        const { ccCode, date, type } = params;
        console.log('🔍 Getting Accrued Interest Report Summary for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (ccCode) queryParams.append('CCCode', ccCode);
        if (date) queryParams.append('Date', date);
        if (type) queryParams.append('Type', type);
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetAccruedInterestReportSummary?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Accrued Interest Report Summary Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Accrued Interest Report Summary API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Liquidity Status Report (Summary View - Role 100 only)
export const getLiquidityStatusReport = async (params) => {
    try {
        const { ccStatus, fromDate, toDate } = params;
        console.log('🔍 Getting Liquidity Status Report for:', params); // DEBUG
        
        const queryParams = new URLSearchParams();
        if (ccStatus) queryParams.append('CCStatus', ccStatus);
        if (fromDate) queryParams.append('Fromdate', fromDate);
        if (toDate) queryParams.append('Todate', toDate);
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetLiquidityStatusReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Liquidity Status Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Liquidity Status Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};