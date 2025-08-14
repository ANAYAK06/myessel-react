import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// PURCHASE REMARKS AND PO DETAILS RELATED APIs
// ==============================================

// 1. Get Remarks by Transaction Number and MO ID
export const getRemarks = async (trno, moid) => {
    try {
        console.log('💬 Getting Remarks for Transaction No:', trno, 'MO ID:', moid); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/Remarks?Trno=${trno}&MOID=${moid}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Remarks Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Remarks API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Previous PO Details by Item Code
export const getPreviousPODetails = async (itemcode) => {
    try {
        console.log('📋 Getting Previous PO Details for Item Code:', itemcode); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetPreviousePODetails?Itemcode=${itemcode}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Previous PO Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Previous PO Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};