import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ITEM CODE REPORT RELATED APIs
// ==============================================

// 1. Get Item Category Details All
export const getItemCategoryDetailsAll = async () => {
    try {
        console.log('📦 Getting Item Category Details All'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetItemCategoryDetailsAll`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Item Category Details All Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Item Category Details All API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Major Group Code
export const getMajorGroupCode = async (params) => {
    try {
        const { val, txt } = params;
        console.log('🏷️ Getting Major Group Code with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            Val: val || '',
            Txt: txt || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetMajougroupcode?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Major Group Code Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Major Group Code API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. View Item Codes Grid Detail
export const viewItemCodesGridDetail = async (params) => {
    try {
        const { icc, mgc } = params;
        console.log('📊 Getting Item Codes Grid Detail with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            ICC: icc || '',
            MGC: mgc || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewItemCodesGridDetail?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Item Codes Grid Detail Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Item Codes Grid Detail API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};