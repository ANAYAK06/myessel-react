import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR PAY REVISION VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify Labour Pay Revision Inbox (GET)
export const getVerifyLBPayRevision = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify Labour Pay Revision Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyLBPayRevision?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyLBPayRevision?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify Labour Pay Revision Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify Labour Pay Revision Inbox API Error:', error.response || error);
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

// 2. Get Labour Pay Revision by Reference Number (GET)
export const getLBPayRevisionbyRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting Labour Pay Revision Details for TransactionRefno:', transactionRefno); // DEBUG
        
        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ TransactionRefno is missing!');
            throw new Error('TransactionRefno is required');
        }
        
        const queryParams = new URLSearchParams({
            TransactionRefno: transactionRefno.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetLBPayRevisionbyRefno?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetLBPayRevisionbyRefno?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Labour Pay Revision Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Labour Pay Revision Details API Error:', error.response || error);
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

// 3. Approve Labour Pay Revision (PUT)
export const approveLBPayRevision = async (params) => {
    try {
        console.log('✅ Approving Labour Pay Revision for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.LabourId) {
            console.error('❌ LabourId is missing!');
            throw new Error('LabourId is required');
        }
        if (!params.TransactionRefNo) {
            console.error('❌ TransactionRefNo is missing!');
            throw new Error('TransactionRefNo is required');
        }
        if (!params.Roleid) {
            console.error('❌ Roleid is missing!');
            throw new Error('Roleid is required');
        }
        if (!params.CreatedBy) {
            console.error('❌ CreatedBy is missing!');
            throw new Error('CreatedBy is required');
        }
        if (!params.Action) {
            console.error('❌ Action is missing!');
            throw new Error('Action is required');
        }
        
        const payload = {
            LabourId: params.LabourId.toString().trim(),
            Month: params.Month ? parseInt(params.Month) : 0,
            Year: params.Year ? parseInt(params.Year) : 0,
            TransactionRefNo: params.TransactionRefNo.toString().trim(),
            RevisionNo: params.RevisionNo ? parseInt(params.RevisionNo) : 0,
            HeadsJsonString: params.HeadsJsonString?.toString().trim() || '',
            Roleid: parseInt(params.Roleid),
            CreatedBy: params.CreatedBy.toString().trim(),
            Action: params.Action.toString().trim(),
            Note: params.Note?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveLBPayRevision`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveLBPayRevision`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve Labour Pay Revision Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve Labour Pay Revision API Error:', error.response || error);
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