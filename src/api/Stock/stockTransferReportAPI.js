import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// PURCHASE TRANSFER RELATED APIs
// ==============================================

// 1. Get Transfer Cost Center Codes
export const getTransferCostCenterCodes = async (params) => {
    try {
        const { UID, RID, StoreStatus } = params;
        console.log('🏢 Getting Transfer Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID,
            StoreStatus: StoreStatus || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetTransferCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Transfer Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Transfer Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. View Transfer Grid
export const viewTransferGrid = async (params) => {
    try {
        const { CCode, Fdate, TDate } = params;
        console.log('📋 Getting Transfer Grid Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCode || !Fdate || !TDate) {
            throw new Error('CCode, Fdate, and TDate are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCode: CCode,
            Fdate: Fdate,
            TDate: TDate
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewTransferGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Transfer Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Transfer Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. View Transfer Items Details
export const viewTransferItemsDetails = async (params) => {
    try {
        const { Refno } = params;
        console.log('📦 Getting Transfer Items Details with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Refno) {
            throw new Error('Refno is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            Refno: Refno
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewTransferItemsDetails?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Transfer Items Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Transfer Items Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};