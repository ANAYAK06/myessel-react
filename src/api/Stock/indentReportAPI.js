import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// VIEW INDENTS REPORT RELATED APIs
// ==============================================

// 1. Get Cost Center Codes
export const getCostCenterCodes = async (params) => {
    try {
        const { UID, RID } = params;
        console.log('🏢 Getting Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. View Indent Grid
export const viewIndentGrid = async (params) => {
    try {
        const { CCode, Fdate, TDate } = params;
        console.log('📋 Getting Indent Grid Data with params:', params); // DEBUG
        
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
            `${API_BASE_URL}/Purchase/ViewIndentGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Indent Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Indent Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. View Indent Items Details
export const viewIndentItemsDetails = async (params) => {
    try {
        const { Indno } = params;
        console.log('📦 Getting Indent Items Details with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Indno) {
            throw new Error('Indno is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            Indno: Indno
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIndentItemsDetails?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Indent Items Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Indent Items Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. View Indent Items Transfer Details
export const viewIndentItemsTransferDetails = async (params) => {
    try {
        const { Indno } = params;
        console.log('🔄 Getting Indent Items Transfer Details with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Indno) {
            throw new Error('Indno is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            Indno: Indno
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIndentItemstransferDetails?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Indent Items Transfer Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Indent Items Transfer Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 5. View Indent Remarks
export const viewIndentRemarks = async (params) => {
    try {
        const { Indno } = params;
        console.log('💬 Getting Indent Remarks with params:', params); // DEBUG
        
        // Validate required parameters
        if (!Indno) {
            throw new Error('Indno is a required parameter');
        }
        
        const queryParams = new URLSearchParams({
            Indno: Indno
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewIndentRemarks?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Indent Remarks Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Indent Remarks API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};