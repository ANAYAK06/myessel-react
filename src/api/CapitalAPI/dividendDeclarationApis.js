import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DIVIDEND DECLARATION RELATED APIs
// ==============================================

// 1. Insert Dividend Declaration (POST)
export const insertDividendDeclaration = async (params) => {
    try {
        console.log('💰 Inserting Dividend Declaration:', params);
        
        // Validate required parameters
        if (!params.financialYear) {
            throw new Error('Financial Year is required');
        }
        if (!params.declarationDate) {
            throw new Error('Declaration Date is required');
        }
        if (!params.netProfitAfterTax) {
            throw new Error('Net Profit After Tax is required');
        }
        if (!params.dividendPercentage) {
            throw new Error('Dividend Percentage is required');
        }
        if (!params.remarks) {
            throw new Error('Remarks are required');
        }
        if (!params.createdby) {
            throw new Error('Createdby is required');
        }
        if (!params.roleId) {
            throw new Error('RoleId is required');
        }
        
        // ✅ FIXED: Use PascalCase to match C# model properties
        const payload = {
            FinancialYear: params.financialYear.toString().trim(),           // Capital F
            DeclarationDate: params.declarationDate.toString().trim(),       // Capital D
            NetProfitAfterTax: parseFloat(params.netProfitAfterTax),        // Capital N, P, A, T
            DividendPercentage: parseFloat(params.dividendPercentage),       // Capital D, P
            Remarks: params.remarks.toString().trim(),                       // Capital R
            Createdby: params.createdby.toString().trim(),                   // Capital C
            RoleId: parseInt(params.roleId)                                  // Capital R, I
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/InsertDividendDeclaration`);
        console.log('📦 Insert Payload (PascalCase):', payload);
        
        const response = await axios.post(
            `${API_BASE_URL}/Accounts/InsertDividendDeclaration`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Insert Dividend Declaration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Insert Dividend Declaration API Error:', error.response || error);
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
// 2. Approve/Verify/Reject Dividend Declaration (PUT)
export const approveDividendDeclaration = async (params) => {
    try {
        console.log('✅ Processing Dividend Declaration Action:', params);
        
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
        
        // ✅ FIXED: Use PascalCase to match C# model
        const payload = {
            TransactionRefno: parseInt(params.transactionRefno),  // Capital T, R
            Roleid: parseInt(params.roleid),                      // Capital R
            Action: params.action.toString().trim(),              // Capital A
            Note: params.note?.toString().trim() || '',           // Capital N
            Createdby: params.createdby.toString().trim()         // Capital C
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/ApproveDividendDeclaration`);
        console.log('📦 Approval Payload (PascalCase):', payload);
        
        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDividendDeclaration`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve Dividend Declaration Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Dividend Declaration API Error:', error.response || error);
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

// 3. Get Verify Dividend Declaration Inbox (GET)
export const getVerifyDividendDeclaration = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Dividend Declaration Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetVerifyDividendDeclaration/${roleId}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDividendDeclaration/${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify Dividend Declaration Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify Dividend Declaration Inbox API Error:', error.response || error);
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

// 4. Get Dividend Declaration by Reference Number (GET)
export const getDividendDeclarationByRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting Dividend Declaration Details for RefNo:', transactionRefno); // DEBUG
        
        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ Transaction Reference Number is missing!');
            throw new Error('Transaction Reference Number is required');
        }
        
        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetDividendDeclarationByRefno/${transactionRefno}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDividendDeclarationByRefno/${transactionRefno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Dividend Declaration Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Dividend Declaration Details API Error:', error.response || error);
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

// 5. Get Dividend Declaration List with Filters (GET)
export const getDividendDeclarationList = async (params = {}) => {
    try {
        console.log('📋 Getting Dividend Declaration List with filters:', params); // DEBUG
        
        // Build query parameters (all are optional)
        const queryParams = new URLSearchParams();
        
        if (params.status) {
            queryParams.append('status', params.status.toString().trim());
        }
        if (params.financialYear) {
            queryParams.append('financialYear', params.financialYear.toString().trim());
        }
        if (params.fromDate) {
            queryParams.append('fromDate', params.fromDate.toString().trim());
        }
        if (params.toDate) {
            queryParams.append('toDate', params.toDate.toString().trim());
        }
        
        const url = queryParams.toString() 
            ? `${API_BASE_URL}/Accounts/GetDividendDeclarationList?${queryParams}` 
            : `${API_BASE_URL}/Accounts/GetDividendDeclarationList`;
        
        console.log('🔗 API URL:', url); // DEBUG
        
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Dividend Declaration List Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Dividend Declaration List API Error:', error.response || error);
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