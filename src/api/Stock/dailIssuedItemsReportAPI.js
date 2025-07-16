import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DAILY ISSUED ITEMS RELATED APIs
// ==============================================

// 1. Get View Cost Center Codes
export const getViewCostCenterCodes = async (params) => {
    try {
        const { UID, RID, StoreStatus } = params;
        console.log('🏢 Getting View Cost Center Codes with params:', params); // DEBUG
        
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
            `${API_BASE_URL}/Purchase/GetviewCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ View Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ View Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. View Issue Grid
export const viewIssueGrid = async (params) => {
    try {
        const { CCode, Fdate, TDate } = params;
        console.log('📋 Getting Issue Grid Data with params:', params); // DEBUG
        
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
            `${API_BASE_URL}/Purchase/ViewIssueGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Issue Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Issue Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};
// 3. View Issue Items Details
export const viewIssueItemsDetails = async (params) => {
    try {
        const { Issueno } = params;
        console.log('📦 Getting Issue Items Details with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Issueno) {
            throw new Error('Issueno is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            Issueno: Issueno
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIssueItemsDetails?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Issue Items Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Issue Items Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};