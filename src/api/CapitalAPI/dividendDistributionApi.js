import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DIVIDEND DISTRIBUTION RELATED APIs
// ==============================================

// 1. Get Dividend Distribution Creation Data (POST)
export const getDividendDistributionCreationData = async (params) => {
    try {
        const { financialYear } = params;
        console.log('📊 Getting Dividend Distribution Creation Data for FY:', financialYear);

        // Validate required parameters
        if (!financialYear) {
            console.error('❌ Financial Year is missing!');
            throw new Error('Financial Year is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetDividendDistributionCreationData?financialYear=${financialYear}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDividendDistributionCreationData`,
            {
                params: {
                    financialYear: financialYear  // ✅ Sent as query parameter
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Dividend Distribution Creation Data Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Creation Data API Error:', error.response || error);
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

// 2. Insert Dividend Distribution (POST)
export const insertDividendDistribution = async (params) => {
    try {
        console.log('💰 Inserting Dividend Distribution:', params);

        // Validate required parameters
        if (!params.dividendDeclarationId) {
            throw new Error('Dividend Declaration ID is required');
        }
        if (!params.lotName) {
            throw new Error('Lot Name is required');
        }
        if (!params.tdsPercentage === undefined) {
            throw new Error('TDS Percentage is required');
        }
        if (!params.createdby) {
            throw new Error('Createdby is required');
        }
        if (!params.roleId) {
            throw new Error('RoleId is required');
        }

        // ✅ Use PascalCase to match C# model properties
        const payload = {
            DividendDeclarationId: parseInt(params.dividendDeclarationId),           // Capital D, D, I
            LotName: params.lotName.toString().trim(),                               // Capital L, N
            LotDescription: params.lotDescription?.toString().trim() || '',          // Capital L, D
            TDSPercentage: parseFloat(params.tdsPercentage),                        // Capital TDS, P
            ShareholderIdsPromoter: params.shareholderIdsPromoter?.toString().trim() || '',  // Capital S, I, P
            ShareholderIdsESOP: params.shareholderIdsESOP?.toString().trim() || '',
            TDSApplicablePromoters: params.tdsApplicablePromoters?.toString().trim() || '',
            TDSApplicableESOP: params.tdsApplicableESOP?.toString().trim() || '',         // Capital S, I, ESOP
            Remarks: params.remarks?.toString().trim() || '',                        // Capital R
            Createdby: params.createdby.toString().trim(),                          // Capital C
            RoleId: parseInt(params.roleId)                                         // Capital R, I
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/InsertDividendDistribution`);
        console.log('📦 Insert Payload (PascalCase):', payload);

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/InsertDividendDistribution`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Insert Dividend Distribution Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Insert Dividend Distribution API Error:', error.response || error);
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

// 3. Approve/Verify/Reject Dividend Distribution (PUT)
export const approveDividendDistribution = async (params) => {
    try {
        console.log('✅ Processing Dividend Distribution Action:', params);

        // Validate required parameters
        if (!params.transactionRefno) {
            throw new Error('Transaction Reference Number is required');
        }
        if (!params.roleid) {
            throw new Error('RoleId is required');
        }
        if (!params.action) {
            throw new Error('Action is required');
        }
        if (!params.createdby) {
            throw new Error('Createdby is required');
        }

        // ✅ Use PascalCase to match C# model
        const payload = {
            TransactionRefno: parseInt(params.transactionRefno),  // Capital T, R
            Roleid: parseInt(params.roleid),                      // Capital R
            Action: params.action.toString().trim(),              // Capital A
            Note: params.note?.toString().trim() || '',           // Capital N
            Createdby: params.createdby.toString().trim()         // Capital C
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/ApproveDividendDistribution`);
        console.log('📦 Approval Payload (PascalCase):', payload);

        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDividendDistribution`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Approve Dividend Distribution Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Dividend Distribution API Error:', error.response || error);
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

// 4. Get Verify Dividend Distribution Inbox (GET)
export const getVerifyDividendDistribution = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Dividend Distribution Inbox for RoleID:', roleId);

        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetVerifyDividendDistribution/${roleId}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDividendDistribution/${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Verify Dividend Distribution Inbox Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Verify Dividend Distribution Inbox API Error:', error.response || error);
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

// 5. Get Dividend Distribution by Reference Number (GET)
export const getDividendDistributionByRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting Dividend Distribution Details for RefNo:', transactionRefno);

        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ Transaction Reference Number is missing!');
            throw new Error('Transaction Reference Number is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetDividendDistributionByRefno/${transactionRefno}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDividendDistributionByRefno/${transactionRefno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Dividend Distribution Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Dividend Distribution Details API Error:', error.response || error);
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