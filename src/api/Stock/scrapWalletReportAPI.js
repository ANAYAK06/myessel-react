import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SCRAP WALLET REPORT RELATED APIs
// ==============================================

// 1. Get Scrap Wallet Balance Items Report Data
export const getScrapWalletBalanceItemsReportData = async (params) => {
    try {
        const { CCCode, UID, Roleid } = params;
        console.log('📊 Getting Scrap Wallet Balance Items Report Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !Roleid) {
            throw new Error('UID and Roleid are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode || '',
            UID: UID,
            Roleid: Roleid
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/ScrapWalletBalanceItemsReportData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Scrap Wallet Balance Items Report Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Scrap Wallet Balance Items Report Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get SWR Cost Center Codes
export const getSWRCostCenterCodes = async (params) => {
    try {
        const { UID, RID } = params;
        console.log('🏢 Getting SWR Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetSWRCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SWR Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ SWR Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

