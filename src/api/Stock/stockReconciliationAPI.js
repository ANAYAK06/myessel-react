import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STOCK RECONCILIATION RELATED APIs
// ==============================================

// 1. Get Stock Reconciliation Data
export const getStockReconciliationData = async (params) => {
    try {
        const { CCCode, Type } = params;
        console.log('📊 Getting Stock Reconciliation Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode || !Type) {
            throw new Error('CCCode and Type are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode,
            Type: Type
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockReconcilationData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Reconciliation Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Reconciliation Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Stock Reconciliation Cost Center Codes
export const getStockRecCostCenterCodes = async (params) => {
    try {
        const { UID, RID, StoreStatus } = params;
        console.log('🏢 Getting Stock Rec Cost Center Codes with params:', params); // DEBUG
        
        // Validate required parameters
        if (!UID || !RID || StoreStatus === undefined || StoreStatus === null) {
            throw new Error('UID, RID, and StoreStatus are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            UID: UID,
            RID: RID,
            StoreStatus: StoreStatus
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetStockRecCostCenterCodes?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Rec Cost Center Codes Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Rec Cost Center Codes API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Stock Reconciliation Summary Data
export const getStockReconciliationSummaryData = async (params) => {
    try {
        const { CCCode, Type, For, ItemCode } = params;
        console.log('📈 Getting Stock Reconciliation Summary Data with params:', params); // DEBUG
        
        // Validate required parameters
        if (!CCCode || !Type || !For) {
            throw new Error('CCCode, Type, and For are required parameters');
        }
        
        const queryParams = new URLSearchParams({
            CCCode: CCCode,
            Type: Type,
            For: For
        });
        
        // ItemCode is optional, add only if provided
        if (ItemCode !== undefined && ItemCode !== null && ItemCode !== '') {
            queryParams.append('ItemCode', ItemCode);
        }
        
        const response = await axios.get(
            `${API_BASE_URL}/Reports/GetStockReconcilationSummaryData?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Stock Reconciliation Summary Data Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Stock Reconciliation Summary Data API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};