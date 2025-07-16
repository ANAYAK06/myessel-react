import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CLOSING STOCK REPORT RELATED APIs
// ==============================================

// 1. Get Stock Close Update CC
export const getStockCloseUpdateCC = async (params) => {
    try {
        const { UserId, Roleid } = params;
        console.log('🏢 Getting Stock Close Update CC with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UserId || !Roleid) {
            throw new Error('UserId and Roleid are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UserId: UserId,
            Roleid: Roleid
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockCloseUpdateCC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Close Update CC Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Close Update CC API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get CC Financial Years
export const getCCFinancialYears = async (params) => {
    try {
        const { CCCode } = params;
        console.log('📅 Getting CC Financial Years with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode) {
            throw new Error('CCCode is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCCFinancialYears?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CC Financial Years Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CC Financial Years API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Stock Close Report Data (POST Method)
export const getStockCloseReportData = async (params) => {
    try {
        const { CCCode, Year } = params;
        console.log('📊 Getting Stock Close Report Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode || !Year) {
            throw new Error('CCCode and Year are required parameters');
        }
        
        // Validate Year format (should be like 2024-25)
        const yearPattern = /^\d{4}-\d{2}$/;
        if (!yearPattern.test(Year)) {
            throw new Error('Year must be in format YYYY-YY (e.g., 2024-25)');
        }
        
        const payload = {
            CCCode: CCCode,
            Year: Year
        };
        
        const response = await axios.post(
            `${API_BASE_URL}/Reports/GetStockCloseReportData`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Close Report Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Close Report Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};