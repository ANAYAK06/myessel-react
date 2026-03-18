import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// CMS PAY VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify CMS Pay Inbox (GET)
export const getVerifyCMSPay = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify CMS Pay Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            Roleid: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyCMSPay?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyCMSPay?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify CMS Pay Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify CMS Pay Inbox API Error:', error.response || error);
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

// 2. Get CMS Data by Transaction Number (POST)
export const getCMSDataByTransNo = async (params) => {
    try {
        console.log('📋 Getting CMS Data by Transaction Number for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.cmsTransactionNo) {
            console.error('❌ CMSTransactionNo is missing!');
            throw new Error('CMSTransactionNo is required');
        }
        
        const payload = {
            CMSTransactionNo: params.cmsTransactionNo.toString().trim(),
            ConsolidateNo: params.consolidateNo?.toString().trim() || '',
            TransactionRefno: params.transactionRefno?.toString().trim() || '',
            Month: params.month ? parseInt(params.month) : 0,
            Year: params.year ? parseInt(params.year) : 0
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetCMSDatatbyTransNo`); // DEBUG
        console.log('📦 Request Payload:', payload); // DEBUG
        
        const response = await axios.post(
            `${API_BASE_URL}/HR/GetCMSDatatbyTransNo`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ CMS Data by Transaction Number Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ CMS Data by Transaction Number API Error:', error.response || error);
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

// 3. Approve CMS Pay (PUT)
export const approveCMSPay = async (params) => {
    try {
        console.log('✅ Approving CMS Pay for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.cmsTransactionNo) {
            console.error('❌ CMSTransactionNo is missing!');
            throw new Error('CMSTransactionNo is required');
        }
        if (!params.roleId) {
            console.error('❌ RoleId is missing!');
            throw new Error('RoleId is required');
        }
        if (!params.action) {
            console.error('❌ Action is missing!');
            throw new Error('Action is required');
        }
        if (!params.createdBy) {
            console.error('❌ CreatedBy is missing!');
            throw new Error('CreatedBy is required');
        }
        
        const payload = {
            CMSTransactionNo: params.cmsTransactionNo.toString().trim(),
            TransactionRefno: params.transactionRefno?.toString().trim() || '',
            ConsolidateNo: params.consolidateNo?.toString().trim() || '',
            Roleid: parseInt(params.roleId),
            Action: params.action.toString().trim(),
            Note: params.note?.toString().trim() || '',
            CreatedBy: params.createdBy.toString().trim()
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveCMSPay`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveCMSPay`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve CMS Pay Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve CMS Pay API Error:', error.response || error);
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