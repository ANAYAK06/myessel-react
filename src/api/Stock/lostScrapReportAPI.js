import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LOST AND SCRAP REPORT RELATED APIs
// ==============================================

// 1. Get View Lost & Damaged Cost Center Codes
export const getViewldCostCenterCodes = async (params) => {
    try {
        const { UID, RID, StoreStatus } = params;
        console.log('🏢 Getting View Lost & Damaged Cost Center Codes with params:', params); // DEBUG
        
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
            `${API_BASE_URL}/Purchase/GetviewldCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ View Lost & Damaged Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ View Lost & Damaged Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. View Lost and Damaged Grid
export const viewLostandDamagedGrid = async (params) => {
    try {
        const { CCode, Fdate, TDate } = params;
        console.log('📋 Getting Lost and Damaged Grid Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCode) {
            throw new Error('CCode is a required parameter');
        }
        
        // Build query params - always include Fdate and TDate (even if empty)
        const queryParams = new URLSearchParams({
            CCode: CCode,
            Fdate: Fdate && Fdate.trim() !== '' ? Fdate : '',
            TDate: TDate && TDate.trim() !== '' ? TDate : ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewLostandDamagedGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Lost and Damaged Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Lost and Damaged Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. View Lost and Damaged Items Details
export const viewLostandDamagedItemsDetails = async (params) => {
    try {
        const { Refno, CCCode } = params;
        console.log('📦 Getting Lost and Damaged Items Details with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Refno || !CCCode) {
            throw new Error('Refno and CCCode are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            Refno: Refno,
            CCCode: CCCode
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewLostandDamagedItemsDetails?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Lost and Damaged Items Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Lost and Damaged Items Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};