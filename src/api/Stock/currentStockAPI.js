import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// VIEW CURRENT STOCK RELATED APIs
// ==============================================

// 1. Get View Stock Grid
export const getViewStockGrid = async (params) => {
    try {
        const { CCode, Cattype } = params;
        console.log('📦 Getting View Stock Grid with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCode: CCode || '',
            Cattype: Cattype || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewStockGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ View Stock Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ View Stock Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get View Stock Grid New
export const getViewStockGridNew = async (params) => {
    try {
        const { CCode, Cattype } = params;
        console.log('📋 Getting View Stock Grid New with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCode: CCode || '',
            Cattype: Cattype || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewStockGridNew?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ View Stock Grid New Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ View Stock Grid New API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Item Categories
export const getItemCategories = async (params = {}) => {
    try {
        console.log('🏷️ Getting Item Categories with params:', params); // DEBUG
        
        // Optional parameters can be added if needed
        const queryParams = new URLSearchParams();
        
        // Add any optional parameters if they exist
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        
        const url = queryParams.toString() 
            ? `${API_BASE_URL}/Purchase/Getitemcategories?${queryParams}`
            : `${API_BASE_URL}/Purchase/Getitemcategories`;
        
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Item Categories Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Item Categories API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get Stock Cost Center Codes
export const getStockCostCenterCodes = async (params) => {
    try {
        const { UID, RID } = params;
        console.log('🏢 Getting Stock Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID) {
            throw new Error('UID and RID are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetStockCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};