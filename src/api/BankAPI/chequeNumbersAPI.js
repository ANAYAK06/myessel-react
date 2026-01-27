import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// ACCOUNTS STATUS LIST RELATED APIs
// ==============================================

// 1. Get Status List for Account Operations
export const getStatusList = async (params) => {
    try {
        const { MOID, ROID, ChkAmt } = params;
        console.log('📋 Getting Status List with params:', params);
        
        const queryParams = new URLSearchParams({
            MOID: MOID || '',
            ROID: ROID || '',
            ChkAmt: ChkAmt || '0'
        });
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetStatuslist?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Status List Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Status List API Error:', error.response || error);
        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 2. Get Bank Details with Available Balance
export const getBankDetailsWithAvailableBalance = async () => {
    try {
        console.log('🏦 Getting Bank Details with Available Balance');

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetBankDetailsWithAvailableBalance`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetBankDetailsWithAvailableBalance`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Bank Details with Available Balance Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Bank Details with Available Balance API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};

// 3. Get Cheque Numbers by Bank Name
export const getChequeNos = async (params) => {
    try {
        const { bankname } = params;
        console.log('🔢 Getting Cheque Numbers for Bank:', bankname);

        // Validate required parameter
        if (!bankname) {
            console.error('❌ Bank Name is missing!');
            throw new Error('Bank Name is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetChequeNos?bankname=${encodeURIComponent(bankname)}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetChequeNos`,
            {
                params: {
                    bankname: bankname
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Cheque Numbers Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Cheque Numbers API Error:', error.response || error);
        console.error('❌ Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.data) {
            throw error.response.data;
        }
        throw error;
    }
};