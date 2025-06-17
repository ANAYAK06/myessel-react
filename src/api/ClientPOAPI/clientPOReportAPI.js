import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CLIENT PO & COST CENTER RELATED APIs
// ==============================================

// 1. Get Client PO for Report
export const getClientPOForReport = async (params) => {
    try {
        const { CCCode, PONO } = params;
        console.log('📋 Getting Client PO for Report with params:', { CCCode, PONO }); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode || '',
            PONO: PONO || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetClientPOForReport?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Client PO for Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Client PO for Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Client PO by Cost Center
export const getClientPObyCC = async (CCCode) => {
    try {
        console.log('🏢 Getting Client PO by Cost Center:', CCCode); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetClientPObyCC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Client PO by Cost Center Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Client PO by Cost Center API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get All Cost Centers Client
export const getAllCostCentersClient = async () => {
    try {
        console.log('🏗️ Getting All Cost Centers Client'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllCostCentersclient`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Cost Centers Client Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Cost Centers Client API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};