import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// SUPPLIER PO STATUS RELATED APIs
// ==============================================

// 1. Get View Purchase Status Grid
export const getViewPurchaseStatusGrid = async (params) => {
    try {
        const { CCode, Fromdate, Todate, UID, RID } = params;
        console.log('📋 Getting View Purchase Status Grid with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCode: CCode || '',
            Fromdate: Fromdate || '',
            Todate: Todate || '',
            UID: UID,
            RID: RID
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewPurchaseStatusGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ View Purchase Status Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ View Purchase Status Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Purchase Cost Center Codes
export const getPurchaseCostCenterCodes = async (params) => {
    try {
        const { UID, RID } = params;
        console.log('🏢 Getting Purchase Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPurchaseCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Purchase Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Purchase Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};