import axios from "axios";
import { API_BASE_URL } from '../../config/apiConfig';

// ==============================================
// LABOUR CTC VERIFICATION RELATED APIs
// ==============================================

// 1. Get Verify New Labour CTC Inbox (GET)
export const getVerifyNewLabourCTC = async (params) => {
    try {
        const { roleId } = params;
        console.log('📊 Getting Verify New Labour CTC Inbox for RoleID:', roleId); // DEBUG
        
        // Validate required parameters
        if (!roleId) {
            console.error('❌ RoleID is missing!');
            throw new Error('RoleID is required');
        }
        
        const queryParams = new URLSearchParams({
            RoleId: roleId.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetVerifyNewLabourCTC?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetVerifyNewLabourCTC?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Verify New Labour CTC Inbox Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Verify New Labour CTC Inbox API Error:', error.response || error);
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

// 2. Get New Labour CTC by Reference Number (GET)
export const getNewLabourCTCbyRefno = async (params) => {
    try {
        const { transactionRefno } = params;
        console.log('📋 Getting New Labour CTC Details for TransactionRefno:', transactionRefno); // DEBUG
        
        // Validate required parameters
        if (!transactionRefno) {
            console.error('❌ TransactionRefno is missing!');
            throw new Error('TransactionRefno is required');
        }
        
        const queryParams = new URLSearchParams({
            TransactionRefno: transactionRefno.toString().trim()
        });
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/GetNewLabourCTCbyRefno?${queryParams.toString()}`); // DEBUG
        
        const response = await axios.get(
            `${API_BASE_URL}/HR/GetNewLabourCTCbyRefno?${queryParams}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ New Labour CTC Details Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ New Labour CTC Details API Error:', error.response || error);
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

// 3. Approve New Labour CTC (PUT)
export const approveNewLabourCTC = async (params) => {
    try {
        console.log('✅ Approving New Labour CTC for:', params); // DEBUG
        
        // Validate required parameters
        if (!params.LabourId) {
            console.error('❌ LabourId is missing!');
            throw new Error('LabourId is required');
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
            LabourId: params.LabourId.toString().trim(),
            Month: params.Month ? parseInt(params.Month) : 0,
            Year: params.Year ? parseInt(params.Year) : 0,
            TransactionRefno: params.TransactionRefno.toString().trim(),
            HeadsJsonString: params.HeadsJsonString?.toString().trim() || '',
            Roleid: parseInt(params.Roleid),
            CreatedBy: params.CreatedBy.toString().trim(),
            Action: params.Action.toString().trim(),
            Note: params.Note?.toString().trim() || ''
        };
        
        console.log('🔗 API URL:', `${API_BASE_URL}/HR/ApproveNewLabourCTC`); // DEBUG
        console.log('📦 Approval Payload:', payload); // DEBUG
        
        const response = await axios.put(
            `${API_BASE_URL}/HR/ApproveNewLabourCTC`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Approve New Labour CTC Response:', response.data); // DEBUG
        return response.data;
    } catch (error) {
        console.error('❌ Approve New Labour CTC API Error:', error.response || error);
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