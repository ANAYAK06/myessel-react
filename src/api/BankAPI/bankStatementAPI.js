import axios from "axios";

import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// BANK STATEMENT RELATED APIs
// ==============================================

// 1. Get All Bank Details
export const getAllBankDetails = async () => {
    try {
        console.log('🏦 Getting All Bank Details'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetAllBankDetails`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ All Bank Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ All Bank Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Transaction Types
export const getTransactionTypes = async () => {
    try {
        console.log('🔄 Getting Transaction Types'); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/GetTrans`,   
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Transaction Types Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Transaction Types API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. View Bank Statement Grid
export const viewBankStatementGrid = async (params) => {
    try {
        const { bankVal, fromDate, toDate, tranType } = params;
        console.log('📊 Getting Bank Statement Grid with params:', params); // DEBUG
        
        const queryParams = new URLSearchParams({
            BankVal: bankVal || '',
            FromDate: fromDate || '',
            ToDate: toDate || '',
            TranType: tranType || ''
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Purchase/ViewBankStatementGrid?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Bank Statement Grid Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Bank Statement Grid API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 4. Get Bank Transaction Details
export const getBankTranDetails = async (params) => {
    try {
        const { transId, typeId } = params;
        console.log('🔍 Getting Bank Transaction Details for:', { transId, typeId }); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBankTranDetails?TransId=${transId}&TypeId=${typeId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Bank Transaction Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Bank Transaction Details API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};