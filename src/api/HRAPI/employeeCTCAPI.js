import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// STAFF CTC VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify New Emp CTC Inbox (GET)
export const getVerifyNewEmpCTC = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify New Emp CTC Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyNewEmpCTC?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyNewEmpCTC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify New Emp CTC Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify New Emp CTC Inbox API Error:', error.response || error);
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

// 2. Get New Emp CTC by Reference Number (GET)
export const getNewEmpCTCbyRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting New Emp CTC Details for TransactionRefno:', transactionRefno); // DEBUG
        
        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ TransactionRefno is missing!');
            throw new Error('TransactionRefno is required');
        }
        
        const queryParams = new URLSearchParams({
            TransactionRefno: transactionRefno.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetNewEmpCTCbyRefno?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetNewEmpCTCbyRefno?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ New Emp CTC Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ New Emp CTC Details API Error:', error.response || error);
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

// 3. Approve New Emp CTC (PUT)
export const approveNewEmpCTC = async (params) => {
    try {
        console.log('✅ Approving New Emp CTC for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.Emprefno) {
            console.error('❌ Emprefno is missing!');
            throw new Error('Emprefno is required');
        }
        if (!params.TransactionRefno) {
            console.error('❌ TransactionRefno is missing!');
            throw new Error('TransactionRefno is required');
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
            Emprefno: params.Emprefno.toString().trim(),
            Month: params.Month ? parseInt(params.Month) : 0,
            Year: params.Year ? parseInt(params.Year) : 0,
            TransactionRefno: params.TransactionRefno.toString().trim(),
            HeadsJsonString: params.HeadsJsonString?.toString().trim() || '',
            Roleid: parseInt(params.Roleid),
            CreatedBy: params.CreatedBy.toString().trim(),
            Action: params.Action.toString().trim(),
            Note: params.Note?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveNewEmpCTC`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveNewEmpCTC`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve New Emp CTC Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve New Emp CTC API Error:', error.response || error);
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