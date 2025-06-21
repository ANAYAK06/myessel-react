import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ASSET DEPRECIATION RELATED APIs
// ==============================================

// 1. Get All Asset Depreciation Cost Centers
export const getAllAssetDepCostCenters = async (params) => {
    try {
        const { UID, RID, StoreStatus } = params;
        console.log('🏢 Getting All Asset Depreciation Cost Centers with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            UID: UID || '',
            RID: RID || '',
            StoreStatus: StoreStatus || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllAssetDepCostCenters?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Asset Depreciation Cost Centers Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Asset Depreciation Cost Centers API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Assets Depreciation Report
export const getAssetsDepreciation = async (params) => {
    try {
        const { CCCode, Fyear } = params;
        console.log('📊 Getting Assets Depreciation Report with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode || '',
            Type: '1',
            Fyear: Fyear || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetAssetsDepreciation?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Assets Depreciation Report Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Assets Depreciation Report API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};