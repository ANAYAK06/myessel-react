import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// DIVIDEND BANK PAYMENT RELATED APIs
// ==============================================

// 1. Get Approved Distributions for Payment (GET)
export const getApprovedDistributionsForPayment = async () => {
    try {
        console.log('📊 Getting Approved Distributions for Payment');

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetApprovedDistributionsForPayment`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetApprovedDistributionsForPayment`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Approved Distributions Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Get Approved Distributions API Error:', error.response || error);
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

// 2. Insert Dividend Bank Payment (POST)
export const insertDividendBankPayment = async (params) => {
    try {
        console.log('💰 Inserting Dividend Bank Payment:', params);

        // Validate required parameters
        if (!params.distributionId) {
            throw new Error('Distribution ID is required');
        }
        if (!params.bankId) {
            throw new Error('Bank ID is required');
        }
        if (!params.paymentMode) {
            throw new Error('Payment Mode is required');
        }
        if (!params.paymentDate) {
            throw new Error('Payment Date is required');
        }
        if (!params.userId) {
            throw new Error('User ID is required');
        }
        if (!params.remarks) {
            throw new Error('Remarks are required');
        }

        // ✅ Use PascalCase to match C# model properties
        const payload = {
            DistributionId: parseInt(params.distributionId),              // Capital D, I
            BankId: parseInt(params.bankId),                              // Capital B, I
            PaymentMode: params.paymentMode.toString().trim(),            // Capital P, M
            ChequeNo: params.chequeNo?.toString().trim() || '',           // Capital C, N
            ChequeDate: params.chequeDate || null,                        // Capital C, D
            PaymentDate: params.paymentDate,                              // Capital P, D
            UserId: params.userId.toString().trim(), 
            RoleId: parseInt(params.roleId),                     // Capital U, I
            Remarks: params.remarks.toString().trim()                     // Capital R - NEW FIELD
        };

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/InsertDividendBankPayment`);
        console.log('📦 Insert Payment Payload (PascalCase):', payload);

        const response = await axios.post(
            `${API_BASE_URL}/Accounts/InsertDividendBankPayment`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Insert Dividend Bank Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Insert Dividend Bank Payment API Error:', error.response || error);
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

// 3. Approve/Verify/Reject Dividend Bank Payment (PUT)
export const approveDividendBankPayment = async (params) => {
    try {
        console.log('✅ Processing Dividend Bank Payment Action:', params);

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

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/ApproveDividendBankPayment`);
        console.log('📦 Approval Payload (PascalCase):', payload);

        const response = await axios.put(
            `${API_BASE_URL}/Accounts/ApproveDividendBankPayment`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Approve Dividend Bank Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Approve Dividend Bank Payment API Error:', error.response || error);
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

// 4. Get Verify Dividend Bank Payment Inbox (GET)
export const getVerifyDividendBankPayment = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Dividend Bank Payment Inbox for RoleID:', roleId);

        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetVerifyDividendBankPayment/${roleId}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetVerifyDividendBankPayment/${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Verify Dividend Bank Payment Inbox Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Verify Dividend Bank Payment Inbox API Error:', error.response || error);
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

// 5. Get Dividend Bank Payment by Reference Number (GET)
export const getDividendBankPaymentByRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting Dividend Bank Payment Details for RefNo:', transactionRefno);

        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ Transaction Reference Number is missing!');
            throw new Error('Transaction Reference Number is required');
        }

        console.log('🔗 API URL:', `${API_BASE_URL}/Accounts/GetDividendBankPaymentByRefno/${transactionRefno}`);

        const response = await axios.get(
            `${API_BASE_URL}/Accounts/GetDividendBankPaymentByRefno/${transactionRefno}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Dividend Bank Payment Details Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Dividend Bank Payment Details API Error:', error.response || error);
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